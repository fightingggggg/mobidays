import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  buildAnalysis,
  buildCreamHypotheses,
  buildCreamQuotes,
  campaignPath,
  creamResultTemplate,
  createCampaigns,
  emptyFlags,
  initialLearnings,
  nextUseFor,
  parseHash,
  ZONES,
} from "./data";

const StoreContext = createContext(null);

function nowLabel() {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function StoreProvider({ children }) {
  const [campaigns, setCampaigns] = useState(createCampaigns);
  const [learnings, setLearnings] = useState(initialLearnings);
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  const [loading, setLoading] = useState("");
  const [banner, setBanner] = useState(null);
  const [toast, setToast] = useState("");
  const [evidence, setEvidence] = useState(null);
  const campaignsRef = useRef(campaigns);
  const busyRef = useRef(false);
  const toastTimer = useRef(null);
  campaignsRef.current = campaigns;

  useEffect(() => {
    const onHash = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", onHash);
    if (!window.location.hash) window.location.hash = "#/";
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    setEvidence(null);
    setBanner(null);
  }, [route.name, route.campaignId]);

  useEffect(() => {
    const titles = {
      dashboard: "대시보드",
      new: "새 캠페인",
      detail: "캠페인",
      upload: "자료 업로드",
      analysis: "고객 반응 분석 결과",
      hypotheses: "메시지 가설",
      experiment: "실험 등록",
      results: "실험 결과",
      learning: "학습 이력",
      quotes: "고객 원문",
    };
    document.title = `${titles[route.name] || "대시보드"} · AI 광고 소재 실험 솔루션`;
  }, [route.name]);

  const navigate = (path) => {
    const next = path.startsWith("#") ? path : `#${path}`;
    if (window.location.hash === next) {
      setRoute(parseHash(next));
      return;
    }
    window.location.hash = next;
  };

  const pushToast = (text) => {
    setToast(text);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2800);
  };

  const updateCampaign = (id, updater) => {
    setCampaigns((prev) => prev.map((campaign) => (campaign.id === id ? updater(campaign) : campaign)));
  };

  const registerZone = (campaignId, zoneId) => {
    const zone = ZONES.find((item) => item.id === zoneId);
    if (!zone) return;
    updateCampaign(campaignId, (campaign) => {
      if (campaign.files.some((file) => file.zone === zoneId)) return campaign;
      return {
        ...campaign,
        updatedAt: nowLabel(),
        files: [
          ...campaign.files,
          { id: `${campaignId}-${zoneId}`, zone: zoneId, label: zone.label, ...zone.sample },
        ],
      };
    });
    pushToast("샘플 자료를 등록했습니다.");
  };

  const retryFile = (campaignId, fileId) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setLoading("파일 형식을 다시 읽고 있습니다");
    window.setTimeout(() => {
      updateCampaign(campaignId, (campaign) => ({
        ...campaign,
        updatedAt: nowLabel(),
        files: campaign.files.map((file) =>
          file.id === fileId ? { ...file, status: "처리 완료", volume: "48건", error: "" } : file,
        ),
      }));
      busyRef.current = false;
      setLoading("");
      pushToast("파일을 다시 읽었습니다.");
    }, 1000);
  };

  const startAnalysis = (campaignId) => {
    if (busyRef.current) return;
    const campaign = campaignsRef.current.find((item) => item.id === campaignId);
    const usable = (campaign?.files || []).filter((file) => file.status !== "오류");
    if (usable.length === 0) {
      setBanner({
        tone: "error",
        text: "분석할 자료가 없습니다. 파일 영역을 눌러 샘플 자료를 등록한 뒤 다시 시작하세요.",
      });
      return;
    }
    setBanner(null);
    busyRef.current = true;
    setLoading("고객 리뷰와 문의를 읽고 있습니다");
    window.setTimeout(() => {
      updateCampaign(campaignId, (current) => {
        if (current.analysis) return { ...current, updatedAt: nowLabel() };
        return {
          ...current,
          analysis: buildAnalysis(),
          hypotheses: buildCreamHypotheses(),
          quotes: buildCreamQuotes(),
          stage: "제안",
          status: "가설 검토 중",
          fromSample: true,
          updatedAt: nowLabel(),
        };
      });
      busyRef.current = false;
      setLoading("");
      navigate(campaignPath(campaignId, "analysis"));
    }, 1000);
  };

  const updateAnalysis = (campaignId, patch) => {
    updateCampaign(campaignId, (campaign) => ({
      ...campaign,
      updatedAt: nowLabel(),
      analysis: { ...campaign.analysis, ...patch },
    }));
    pushToast("분석 결과를 수정했습니다.");
  };

  const updateHypothesis = (campaignId, hypothesisId, patch) => {
    updateCampaign(campaignId, (campaign) => ({
      ...campaign,
      updatedAt: nowLabel(),
      hypotheses: campaign.hypotheses.map((item) => (item.id === hypothesisId ? { ...item, ...patch } : item)),
    }));
    pushToast("가설을 수정했습니다.");
  };

  const setHypothesisStatus = (campaignId, hypothesisId, status, reason = "") => {
    updateCampaign(campaignId, (campaign) => ({
      ...campaign,
      updatedAt: nowLabel(),
      hypotheses: campaign.hypotheses.map((item) =>
        item.id === hypothesisId ? { ...item, status, reason: reason || item.reason } : item,
      ),
    }));
    const labels = { 보류: "가설을 보류했습니다.", 거부: "가설을 거부했습니다.", "승인 대기": "가설을 다시 검토 상태로 돌렸습니다." };
    pushToast(labels[status] || "상태를 바꿨습니다.");
  };

  const approveHypothesis = (campaignId, hypothesisId) => {
    updateCampaign(campaignId, (campaign) => ({
      ...campaign,
      updatedAt: nowLabel(),
      hypotheses: campaign.hypotheses.map((item) =>
        item.id === hypothesisId ? { ...item, status: "실험 준비", reason: "" } : item,
      ),
    }));
    pushToast("가설을 승인했습니다. 실험 등록으로 이동합니다.");
    navigate(campaignPath(campaignId, "experiment", hypothesisId));
  };

  const saveExperiment = (campaignId, draft) => {
    updateCampaign(campaignId, (campaign) => {
      const existing = campaign.experiments.find((item) => item.id === draft.id);
      const template = creamResultTemplate();
      const next = existing
        ? { ...existing, ...draft, rows: existing.rows, summary: existing.summary, judgment: existing.judgment, memo: existing.memo, flags: existing.flags }
        : { id: draft.id || `exp-${Date.now()}`, ...template, ...draft, judgment: "", memo: "", flags: emptyFlags() };
      const experiments = existing
        ? campaign.experiments.map((item) => (item.id === next.id ? next : item))
        : [...campaign.experiments, next];
      return {
        ...campaign,
        experiments,
        stage: "실험",
        status: next.judgment ? campaign.status : "실험 결과 입력 대기",
        updatedAt: nowLabel(),
        hypotheses: campaign.hypotheses.map((item) =>
          item.id === next.hypothesisId && item.status === "실험 준비" ? { ...item, status: "실험 중" } : item,
        ),
      };
    });
    pushToast("실험을 저장했습니다.");
  };

  const saveResults = (campaignId, experimentId, payload) => {
    if (!payload.judgment) return false;
    const campaign = campaignsRef.current.find((item) => item.id === campaignId);
    const current = campaign?.experiments.find((item) => item.id === experimentId);
    if (!current) return false;
    const experimentName = current.name || "이번 실험";
    const channel = current.channel || "";
    const period = current.period || "";
    updateCampaign(campaignId, (item) => ({
      ...item,
      stage: "학습",
      status: payload.judgment === "판단 보류" ? "판단 보류" : "학습 반영",
      updatedAt: nowLabel(),
      experiments: item.experiments.map((experiment) =>
        experiment.id === experimentId
          ? { ...experiment, judgment: payload.judgment, memo: payload.memo, flags: payload.flags }
          : experiment,
      ),
      hypotheses: item.hypotheses.map((hypothesis) =>
        hypothesis.id === current.hypothesisId ? { ...hypothesis, status: "실험 완료" } : hypothesis,
      ),
    }));
    setLearnings((prev) => {
      const rest = prev.filter((item) => item.experimentId !== experimentId);
      const entry = {
        id: `learn-${experimentId}`,
        experimentId,
        title: experimentName,
        result: payload.judgment,
        basis:
          payload.memo.trim() ||
          (payload.judgment === "개선 신호"
            ? "클릭률과 구매 전환율이 함께 개선"
            : `${channel} ${period}`.trim()),
        caution: payload.judgment === "차이 없음" ? "메시지 단독 효과는 다시 확인이 필요합니다." : "",
        nextUse: nextUseFor(payload.judgment),
        when: nowLabel(),
        reusable: payload.judgment === "개선 신호" || payload.judgment === "차이 없음" || payload.judgment === "데이터 부족",
        featured: true,
        fresh: true,
      };
      return [entry, ...rest.map((item) => ({ ...item, fresh: false }))];
    });
    return true;
  };

  const createCampaign = (form) => {
    const id = `c-${Date.now()}`;
    const campaign = {
      id,
      name: form.name.trim() || `${form.product.trim()} 캠페인`,
      product: form.product.trim(),
      goal: form.goal,
      status: "자료 대기",
      stage: "분석",
      target: form.target.trim() || "타깃 미입력",
      updatedAt: nowLabel(),
      linkedLearningId: "",
      fromSample: false,
      files: [],
      analysis: null,
      quotes: [],
      hypotheses: [],
      experiments: [],
    };
    setCampaigns((prev) => [campaign, ...prev]);
    pushToast("캠페인을 만들었습니다.");
    navigate(campaignPath(id));
  };

  const createFromLearning = () => {
    const id = `c-${Date.now()}`;
    const campaign = {
      id,
      name: "민감성 수분크림 후속 캠페인",
      product: "민감성 수분크림",
      goal: "구매 전환 증가",
      status: "가설 초안",
      stage: "제안",
      target: "민감성 피부를 가진 20~40대 고객",
      updatedAt: nowLabel(),
      linkedLearningId: "l1",
      fromSample: false,
      files: [],
      analysis: null,
      quotes: buildCreamQuotes(),
      hypotheses: [
        {
          id: "h-next",
          title: "민감성·저자극 메시지를 유지하고 무향을 함께 검증한다",
          strength: "높음",
          strengthScore: 3,
          need: "자극 걱정",
          status: "승인 대기",
          reason: "",
          broughtFrom: "이전 학습 이력",
          problem: "저자극 메시지는 반응이 있었으나, 무향을 같이 말해도 구매가 유지되는지는 아직 모릅니다.",
          message: "민감한 피부도 부담 없고, 향 없이도 매일 쓸 수 있다",
          copy: "예민한 날에도, 향 없이",
          direction: "지난 실험의 안심 장면을 유지하고, 무향임을 자막 한 줄로만 추가합니다.",
          situation: "안심 메시지에 반응한 사람과 향에 민감한 사람이 겹치는 구간.",
          quoteIds: ["q1", "q2"],
          productEvidence: [
            { id: "p-test", text: "피부 자극 테스트 완료. 민감성 피부에도 사용할 수 있다고 안내.", source: "product_info.pdf", locator: "3쪽" },
            { id: "p-scent", text: "무향. 인공향료를 넣지 않음.", source: "product_info.pdf", locator: "2쪽" },
          ],
          variable: "안심 메시지 단독과, 안심 메시지에 무향을 더한 소재의 결과 비교",
          caution: "무향만 단독으로 말하면 지난 실험에서 차이가 없었습니다. 저자극 메시지와 함께 검증합니다.",
        },
      ],
      experiments: [],
    };
    setCampaigns((prev) => [campaign, ...prev]);
    pushToast("학습 이력의 제안으로 캠페인을 만들었습니다.");
    navigate(campaignPath(id, "hypotheses", "h-next"));
  };

  const value = {
    campaigns,
    learnings,
    route,
    loading,
    banner,
    setBanner,
    toast,
    evidence,
    navigate,
    pushToast,
    openEvidence: setEvidence,
    closeEvidence: () => setEvidence(null),
    registerZone,
    retryFile,
    startAnalysis,
    updateAnalysis,
    updateHypothesis,
    setHypothesisStatus,
    approveHypothesis,
    saveExperiment,
    saveResults,
    createCampaign,
    createFromLearning,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("StoreProvider가 필요합니다.");
  return value;
}

export function useCampaign() {
  const { campaigns, route } = useStore();
  return campaigns.find((campaign) => campaign.id === route.campaignId) || null;
}
