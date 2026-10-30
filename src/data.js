export const STEPS = ["분석", "제안", "실험", "학습"];

export const JUDGMENTS = ["개선 신호", "차이 없음", "악화 신호", "데이터 부족", "판단 보류"];

export const FLAG_FIELDS = [
  ["price", "가격 변경 여부"],
  ["product", "상품 변경 여부"],
  ["landing", "랜딩페이지 변경 여부"],
  ["target", "타깃 변경 여부"],
  ["budget", "예산 변경 여부"],
  ["season", "시즌 또는 재고 이슈"],
];

export const NEXT_SUGGESTION =
  "이전 실험에서 민감성·저자극 메시지의 반응이 높았습니다. 다음 캠페인에서는 해당 메시지를 유지하고, ‘무향’ 요소를 추가해 검증해보세요.";

export const CREAM_RESULT_SUMMARY =
  "AI 광고 소재 실험 솔루션 메시지 소재에서 클릭률과 구매 전환율이 함께 개선되었습니다.";

export const CREAM_RESULT_ROWS = [
  ["광고비", "500,000원", "500,000원"],
  ["클릭률", "1.8%", "2.3%"],
  ["구매 전환율", "2.1%", "2.8%"],
  ["전환 수", "42건", "56건"],
  ["CPA", "24,000원", "19,500원"],
];

export function emptyFlags() {
  return {
    price: "아니오",
    product: "아니오",
    landing: "아니오",
    target: "아니오",
    budget: "아니오",
    season: "아니오",
  };
}

export const ZONES = [
  {
    id: "reviews",
    label: "고객 리뷰 파일",
    accept: "CSV",
    sample: { name: "customer_reviews.csv", volume: "1,284건", status: "분석 완료" },
  },
  {
    id: "inquiries",
    label: "고객 문의 파일",
    accept: "CSV",
    sample: { name: "customer_inquiries.csv", volume: "326건", status: "분석 완료" },
  },
  {
    id: "product",
    label: "상품 설명 파일",
    accept: "PDF",
    sample: { name: "product_info.pdf", volume: "1건", status: "처리 완료" },
  },
  {
    id: "creatives",
    label: "기존 광고 소재",
    accept: "이미지, ZIP",
    sample: { name: "existing_creatives.zip", volume: "12개 소재", status: "처리 완료" },
  },
  {
    id: "performance",
    label: "기존 광고 성과",
    accept: "XLSX",
    sample: { name: "existing_ads.xlsx", volume: "3개 캠페인", status: "처리 완료" },
  },
];

function zoneFile(zoneId, id) {
  const zone = ZONES.find((item) => item.id === zoneId);
  return { id, zone: zoneId, label: zone.label, ...zone.sample };
}

export function standardFiles(prefix, { creatives = false } = {}) {
  const files = [
    zoneFile("reviews", `${prefix}-reviews`),
    zoneFile("inquiries", `${prefix}-inquiries`),
    zoneFile("product", `${prefix}-product`),
    zoneFile("performance", `${prefix}-performance`),
  ];
  if (creatives) files.push(zoneFile("creatives", `${prefix}-creatives`));
  return files;
}

export function buildCreamQuotes() {
  return [
    { id: "q1", group: "자극 걱정", text: "민감한 피부인데 따갑지 않아서 계속 쓰고 있어요.", source: "customer_reviews.csv", locator: "168건" },
    { id: "q2", group: "무향·편안함", text: "향이 없어서 얼굴에 부담 없이 바르기 좋아요.", source: "customer_reviews.csv", locator: "154건" },
    { id: "q3", group: "차별점 혼란", text: "성분은 좋은 것 같은데 다른 제품과 뭐가 다른지 모르겠어요.", source: "customer_inquiries.csv", locator: "78건" },
    { id: "q4", group: "자극 걱정", text: "피부가 예민할 때 사용할 제품을 찾고 있었어요.", source: "customer_reviews.csv", locator: "121건" },
    { id: "q5", group: "자극 걱정", text: "저자극이라고 해서 샀는데 따가우면 어쩌나 하루 종일 신경 쓰였어요.", source: "customer_reviews.csv", locator: "96건" },
    { id: "q6", group: "무향·편안함", text: "향료 때문에 트러블 났던 적이 있어서 무향만 써요.", source: "customer_inquiries.csv", locator: "64건" },
    { id: "q7", group: "보습·사용감", text: "수분크림은 오후만 되면 번들거려서 낮에는 잘 안 바르게 돼요.", source: "customer_reviews.csv", locator: "89건" },
    { id: "q8", group: "보습·사용감", text: "바르고 나면 촉촉한데 유분이 과하지 않아서 메이크업 전에 쓰기 좋아요.", source: "customer_reviews.csv", locator: "74건" },
    { id: "q9", group: "차별점 혼란", text: "세라마이드가 들어있다는데 제 피부 장벽에 정확히 어떤 도움인지 알고 싶어요.", source: "customer_inquiries.csv", locator: "51건" },
    { id: "q10", group: "자극 걱정", text: "환절기마다 얼굴이 당기는데 크림을 바르면 따가워서 결국 안 바르게 돼요.", source: "customer_reviews.csv", locator: "67건" },
    { id: "q11", group: "무향·편안함", text: "임산부라 향 있는 제품은 피하고 있어요. 무향인지 페이지에서 바로 안 보이더라고요.", source: "customer_inquiries.csv", locator: "42건" },
    { id: "q12", group: "보습·사용감", text: "무거운 크림은 모공이 막힐까 봐 걱정인데, 이 제품은 흡수가 빨라서 부담이 적었어요.", source: "customer_reviews.csv", locator: "58건" },
  ];
}

const creamProductEvidence = {
  scent: { id: "p-scent", text: "무향. 인공향료를 넣지 않음.", source: "product_info.pdf", locator: "2쪽" },
  test: { id: "p-test", text: "피부 자극 테스트 완료. 민감성 피부에도 사용할 수 있다고 안내.", source: "product_info.pdf", locator: "3쪽" },
  ceramide: { id: "p-ceramide", text: "세라마이드 함유. 피부 장벽 보습을 돕는 성분으로 표기.", source: "product_info.pdf", locator: "4쪽" },
  texture: { id: "p-texture", text: "끈적임이 적은 수분 제형. 메이크업 전 사용을 안내.", source: "product_info.pdf", locator: "5쪽" },
};

export function buildAnalysis() {
  return {
    summary:
      "민감성 피부 고객의 가장 큰 구매 장벽은 제품이 실제로 자극 없이 사용할 수 있는지에 대한 불안입니다.",
    highlights: ["자극 걱정", "무향·편안함", "보습력과 산뜻함의 균형"],
    needs: [
      "민감한 피부에도 부담 없는 사용감",
      "향이 없는 편안함",
      "피부가 예민할 때 사용할 수 있는 제품",
      "보습력과 산뜻함의 균형",
    ],
    barriers: [
      "저자극이라고 해도 실제로 따갑지 않을지 걱정",
      "보습크림이 무겁고 번들거릴 것이라는 우려",
      "다른 제품과 무엇이 다른지 이해하기 어려움",
    ],
    groups: [
      { name: "자극 걱정", share: 35 },
      { name: "무향·편안함", share: 25 },
      { name: "보습·사용감", share: 22 },
      { name: "차별점 혼란", share: 18 },
    ],
    usps: [
      { feature: "무향", link: "향에 대한 부담 감소", evidenceIds: ["p-scent", "q2", "q6"] },
      { feature: "저자극 테스트", link: "자극 걱정 완화 근거", evidenceIds: ["p-test", "q1", "q5"] },
      { feature: "세라마이드", link: "보습·장벽 관련 설명 가능", evidenceIds: ["p-ceramide", "q9"] },
    ],
    representativeIds: ["q1", "q2", "q3"],
    productEvidence: Object.values(creamProductEvidence),
  };
}

function hypothesis(fields) {
  return { reason: "", broughtFrom: "", ...fields };
}

export function buildCreamHypotheses() {
  return [
    hypothesis({
      id: "h1",
      title: "민감한 피부도 부담 없이 사용할 수 있다",
      strength: "높음",
      strengthScore: 3,
      need: "자극 걱정",
      status: "승인 대기",
      problem: "저자극 제품이라고 해도 실제로 따갑지 않을지 걱정한다.",
      message: "민감한 피부도 부담 없이 사용할 수 있는 수분크림",
      copy: "예민한 날에도 부담 없이",
      direction: "실제 사용 장면 중심의 편안한 피부 케어 이미지. 세안 직후 아침에 바르는 장면이 맞습니다. 붉은 피부를 확대한 비포·애프터나 “자극 0” 같은 단정은 피합니다.",
      situation: "환절기나 피부과 시술 뒤처럼 피부가 예민해져, 새 크림이 따갑지 않을지 망설이는 순간.",
      quoteIds: ["q1", "q4", "q5", "q10"],
      productEvidence: [creamProductEvidence.test, creamProductEvidence.scent],
      variable: "기존 성분 중심 메시지와 안심·사용감 중심 메시지의 광고 결과 비교",
      caution: "저자극 테스트는 모든 사람에게 자극이 없다는 뜻이 아닙니다. “자극 0”, “절대 안 따가움”처럼 단정하지 않습니다.",
    }),
    hypothesis({
      id: "h2",
      title: "향에 민감한 사람도 매일 편하게 사용할 수 있다",
      strength: "중간",
      strengthScore: 2,
      need: "무향·편안함",
      status: "승인 대기",
      problem: "향이 있는 크림은 예민한 날에 부담스럽고, 무향인지는 광고만 보고 알기 어렵습니다.",
      message: "향을 넣지 않아 매일 얼굴에 발라도 편한 수분크림",
      copy: "향 없이, 매일 발라도 되는",
      direction: "아침 세안 후 바로 바르는 장면. 향수나 꽃 이미지는 쓰지 않고, 무향임을 자막 한 줄로 보여 줍니다.",
      situation: "향료 트러블이 있었거나, 임신·편두통처럼 무향을 조건으로 제품을 고르는 사람.",
      quoteIds: ["q2", "q6", "q11"],
      productEvidence: [creamProductEvidence.scent],
      variable: "헤드라인에 ‘무향’을 넣은 소재와, 사용감만 말한 소재의 결과 비교",
      caution: "무향만 단독으로 말하면 클릭은 나와도 구매 이유가 약할 수 있습니다. 저자극 메시지와 함께 볼지 따로 볼지 정하고 집행합니다.",
    }),
    hypothesis({
      id: "h3",
      title: "보습력은 유지하면서 무겁지 않다",
      strength: "중간",
      strengthScore: 2,
      need: "보습·사용감",
      status: "승인 대기",
      problem: "수분크림은 촉촉하지만 번들거릴 것이라는 예상 때문에 낮 사용을 망설입니다.",
      message: "보습은 남기고 낮에 발라도 무겁지 않은 수분크림",
      copy: "촉촉한데, 낮에 발라도 무겁지 않은",
      direction: "바른 직후 피부 결이 보이는 가까운 장면. 메이크업 전 단계라는 점을 자막으로 보여 줍니다.",
      situation: "오후 번들거림 때문에 보습을 건너뛰거나, 메이크업 전에 크림이 무거울까 걱정하는 사람.",
      quoteIds: ["q7", "q8", "q12"],
      productEvidence: [creamProductEvidence.texture, creamProductEvidence.ceramide],
      variable: "보습·성분 메시지와 ‘무겁지 않음’ 메시지의 낮 시간대 결과 비교",
      caution: "가벼움만 강조하면 보습이 약해 보일 수 있습니다. 보습이 유지된다는 문장을 함께 둡니다.",
    }),
  ];
}


export function creamResultTemplate() {
  return {
    summary: CREAM_RESULT_SUMMARY,
    rows: CREAM_RESULT_ROWS.map((row) => [...row]),
    judgment: "",
    memo: "",
    flags: emptyFlags(),
  };
}

export function initialLearnings() {
  return [
    {
      id: "l1",
      title: "민감성·저자극 메시지",
      result: "개선 신호",
      basis: "클릭률·구매 전환율 동시 개선",
      caution: "",
      nextUse: "민감성 고객 대상 캠페인 우선 추천",
      when: "2026.09.18 사전 실험",
      reusable: true,
      featured: true,
    },
    {
      id: "l2",
      title: "무향 메시지",
      result: "차이 없음",
      basis: "",
      caution: "메시지 단독 효과 불분명",
      nextUse: "다른 메시지와 조합해 재검토",
      when: "2026.08.02 무향 단독 실험",
      reusable: true,
      featured: true,
    },
    {
      id: "l3",
      title: "여름철 산뜻함 메시지",
      result: "데이터 부족",
      basis: "",
      caution: "",
      nextUse: "추가 집행 후 재판정",
      when: "2026.07.20 선크림 시즌 실험",
      reusable: true,
      featured: true,
    },
    {
      id: "l4",
      title: "메이크업 전 가벼운 마무리",
      result: "개선 신호",
      basis: "오전 시간대 구매 전환율 상승",
      caution: "",
      nextUse: "아침 루틴 소재의 첫 문장으로 재사용",
      when: "2026.06.11",
      reusable: true,
      featured: false,
    },
    {
      id: "l5",
      title: "환절기 당김이 먼저인 사람",
      result: "개선 신호",
      basis: "당김을 먼저 말한 소재의 CPA 하락",
      caution: "",
      nextUse: "환절기 캠페인 첫 문장으로 재사용",
      when: "2026.03.28",
      reusable: true,
      featured: false,
    },
    {
      id: "l6",
      title: "피부과 시술 후 일주일",
      result: "차이 없음",
      basis: "타깃 규모가 작아 소재 차이가 드러나지 않음",
      caution: "단독 타깃으로는 표본이 부족",
      nextUse: "민감 메시지와 묶어 다시 봄",
      when: "2026.05.02",
      reusable: true,
      featured: false,
    },
    {
      id: "l7",
      title: "가족이 같이 쓰는 무향",
      result: "개선 신호",
      basis: "공용 사용 장면에서 저장 수가 늘었음",
      caution: "",
      nextUse: "가족 사용 장면에 재사용",
      when: "2026.04.16",
      reusable: true,
      featured: false,
    },
    {
      id: "l8",
      title: "첫 구매의 따가움 불안",
      result: "개선 신호",
      basis: "신규 고객 구매 전환율 개선",
      caution: "재구매 고객에게는 새 정보가 적음",
      nextUse: "신규 캠페인에 우선 추천",
      when: "2026.09.02",
      reusable: true,
      featured: false,
    },
  ];
}

export function createCampaigns() {
  const creamFiles = standardFiles("cream");

  return [
    {
      id: "cream",
      name: "민감성 수분크림 신규 캠페인",
      product: "민감성 수분크림",
      goal: "구매 전환 증가",
      status: "가설 검토 중",
      stage: "제안",
      target: "민감성 피부를 가진 20~40대 고객",
      updatedAt: "2026.10.29 14:32",
      linkedLearningId: "l1",
      fromSample: false,
      files: creamFiles,
      analysis: buildAnalysis(),
      quotes: buildCreamQuotes(),
      hypotheses: buildCreamHypotheses(),
      experiments: [],
    },
  ];
}

export function nextAction(campaign) {
  const waiting = campaign.experiments.some((item) => !item.judgment);
  const ready = campaign.hypotheses.some((item) => item.status === "실험 준비");
  const pending = campaign.hypotheses.some((item) => item.status === "승인 대기");
  if (!campaign.analysis && campaign.files.filter((file) => file.status !== "오류").length === 0) {
    return { label: "자료 등록", section: "upload" };
  }
  if (waiting) return { label: "결과 입력", section: "results" };
  if (campaign.stage === "학습") return { label: "학습 이력 보기", section: "learning" };
  if (ready) return { label: "실험 등록", section: "experiment" };
  if (pending || !campaign.analysis) return { label: campaign.analysis ? "가설 검토" : "자료 등록", section: campaign.analysis ? "hypotheses" : "upload" };
  return { label: "캠페인 보기", section: "detail" };
}

export function campaignPath(id, section, extra) {
  let path = `#/campaign/${id}`;
  if (section && section !== "detail") path += `/${section}`;
  if (extra) path += `/${extra}`;
  return path;
}

export function parseHash(hash) {
  const raw = (hash || "#/").replace(/^#/, "");
  const path = raw.split("?")[0];
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) return { name: "dashboard", campaignId: null, extra: null };
  if (parts[0] === "new") return { name: "new", campaignId: null, extra: null };
  if (parts[0] === "campaign" && parts[1]) {
    return { name: parts[2] || "detail", campaignId: parts[1], extra: parts[3] || null };
  }
  return { name: "dashboard", campaignId: null, extra: null };
}

export function quoteItems(campaign, ids) {
  const pool = [...(campaign.quotes || []), ...(campaign.analysis?.productEvidence || [])];
  campaign.hypotheses.forEach((item) => {
    (item.productEvidence || []).forEach((evidence) => pool.push(evidence));
  });
  return ids
    .map((id) => pool.find((item) => item.id === id))
    .filter(Boolean)
    .map((item) => ({ text: item.text, source: item.source, locator: item.locator }));
}

export function nextUseFor(judgment) {
  if (judgment === "개선 신호") return "같은 메시지를 다음 캠페인에서 우선 사용";
  if (judgment === "차이 없음") return "다른 메시지와 조합해 재검토";
  if (judgment === "악화 신호") return "이 메시지로는 추가 집행하지 않음";
  if (judgment === "데이터 부족") return "추가 집행 후 재판정";
  return "메모를 다시 보고 판정";
}

export const GOALS = ["구매 전환 증가", "CPA 개선", "재구매 증가"];
export const CHANNELS = ["Meta", "Google", "네이버", "카카오"];
export const CONVERSIONS = ["구매", "장바구니", "회원가입", "문의"];
