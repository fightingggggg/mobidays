import { useEffect, useState } from "react";
import {
  campaignPath,
  CHANNELS,
  CONVERSIONS,
  emptyFlags,
  FLAG_FIELDS,
  JUDGMENTS,
} from "../data";
import { useCampaign, useStore } from "../store";
import { EmptyState, EvidenceButton, Field, MissingCampaign, PageHeader } from "../ui";

function seedForm(campaign, extra) {
  const hypothesis =
    campaign.hypotheses.find((item) => item.id === extra) ||
    campaign.hypotheses.find((item) => item.status === "실험 준비") ||
    campaign.hypotheses.find((item) => item.status === "실험 중");
  const existing =
    campaign.experiments.find((item) => item.id === extra) ||
    campaign.experiments.find((item) => item.hypothesisId === hypothesis?.id) ||
    (!extra ? campaign.experiments[0] : null);

  if (existing && (!hypothesis || existing.hypothesisId === hypothesis.id || existing.id === extra)) {
    return {
      id: existing.id,
      name: existing.name,
      hypothesisId: existing.hypothesisId,
      control: existing.control,
      treatment: existing.treatment,
      changed: existing.changed,
      same: existing.same,
      channel: existing.channel,
      period: existing.period,
      budget: existing.budget,
      goal: existing.goal,
    };
  }

  const creamLike = campaign.product.includes("수분") || campaign.product.includes("크림");
  return {
    id: "",
    name: hypothesis?.id === "h1" ? "안심 메시지와 성분 메시지 비교" : hypothesis ? `${hypothesis.copy} 비교` : "메시지 비교 실험",
    hypothesisId: hypothesis?.id || "",
    control: creamLike ? "세라마이드 함유 보습크림" : "기존에 집행 중인 소재",
    treatment: hypothesis?.copy || "예민한 날에도 부담 없이",
    changed: "헤드라인과 메인 메시지",
    same: "상품, 타깃, 광고 기간",
    channel: "Meta",
    period: "2026.10.13 – 2026.10.26",
    budget: creamLike ? "각 500,000원" : "각 500,000원",
    goal: "구매",
  };
}

export function Experiment() {
  const campaign = useCampaign();
  const { route, saveExperiment, navigate } = useStore();
  const [form, setForm] = useState(() => (campaign ? seedForm(campaign, route.extra) : null));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!campaign) return;
    setForm(seedForm(campaign, route.extra));
    setError("");
    // 가설을 고르거나 캠페인이 바뀌면 입력값을 다시 채웁니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaign?.id, route.extra, campaign?.experiments.length, campaign?.hypotheses.map((item) => item.status).join("|")]);

  if (!campaign) return <MissingCampaign />;

  const eligible = campaign.hypotheses.filter((item) => ["실험 준비", "실험 중", "실험 완료"].includes(item.status));
  if (!form) return null;
  if (eligible.length === 0 && campaign.experiments.length === 0) {
    return (
      <EmptyState
        title="승인된 가설이 없습니다"
        action={<a className="btn btn-primary" href={campaignPath(campaign.id, "hypotheses")}>메시지 가설 보기</a>}
      >
        메시지 가설에서 승인하면 이 화면에서 실험을 등록할 수 있습니다. 승인된 가설의 카피가 메시지 소재로 채워집니다.
      </EmptyState>
    );
  }

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const onHypothesis = (event) => {
    const hypothesisId = event.target.value;
    const hypothesis = campaign.hypotheses.find((item) => item.id === hypothesisId);
    setForm((prev) => ({
      ...prev,
      hypothesisId,
      treatment: hypothesis?.copy || prev.treatment,
    }));
  };

  const persist = () => {
    const missing = [];
    if (!form.name.trim()) missing.push("실험명");
    if (!form.hypothesisId) missing.push("연결 메시지 가설");
    if (!form.control.trim()) missing.push("기존 소재");
    if (!form.treatment.trim()) missing.push("메시지 소재");
    if (!form.changed.trim()) missing.push("무엇을 바꾸었는가");
    if (!form.same.trim()) missing.push("무엇은 동일하게 유지하는가");
    if (!form.period.trim()) missing.push("광고 기간");
    if (!form.budget.trim()) missing.push("광고 예산");
    if (missing.length) {
      setError(`입력하지 않은 항목: ${missing.join(", ")}`);
      return false;
    }
    const id = form.id || `exp-${Date.now()}`;
    saveExperiment(campaign.id, { ...form, id });
    setForm((prev) => ({ ...prev, id }));
    setError("");
    return true;
  };

  const hypothesis = campaign.hypotheses.find((item) => item.id === form.hypothesisId);

  return (
    <div>
      <PageHeader
        title="실험 등록"
        lede="승인한 메시지를 기존 소재와 나란히 집행할 실험으로 적습니다. 상품과 타깃은 그대로 두고, 말하는 내용만 바꿉니다."
      />
      {error ? <div className="banner banner-error" role="alert"><p>{error}</p></div> : null}
      <form
        className="form-grid"
        onSubmit={(event) => {
          event.preventDefault();
          persist();
        }}
      >
        <Field label="실험명">
          <input type="text" value={form.name} onChange={set("name")} />
        </Field>
        <Field label="연결 메시지 가설">
          <select value={form.hypothesisId} onChange={onHypothesis}>
            <option value="">가설 선택</option>
            {(eligible.length ? eligible : campaign.hypotheses.filter((item) => item.id === form.hypothesisId)).map((item) => (
              <option key={item.id} value={item.id}>{item.title}</option>
            ))}
          </select>
        </Field>
        <Field label="기존 소재">
          <input type="text" value={form.control} onChange={set("control")} />
        </Field>
        <Field label="AI 광고 소재 실험 솔루션 메시지 소재">
          <input type="text" value={form.treatment} onChange={set("treatment")} />
        </Field>
        <Field label="무엇을 바꾸었는가">
          <input type="text" value={form.changed} onChange={set("changed")} />
        </Field>
        <Field label="무엇은 동일하게 유지하는가">
          <input type="text" value={form.same} onChange={set("same")} />
        </Field>
        <Field label="광고 채널">
          <select value={form.channel} onChange={set("channel")}>
            {CHANNELS.map((item) => <option key={item}>{item}</option>)}
          </select>
        </Field>
        <Field label="광고 기간">
          <input type="text" value={form.period} onChange={set("period")} />
        </Field>
        <Field label="광고 예산">
          <input type="text" value={form.budget} onChange={set("budget")} />
        </Field>
        <Field label="목표 전환">
          <select value={form.goal} onChange={set("goal")}>
            {CONVERSIONS.map((item) => <option key={item}>{item}</option>)}
          </select>
        </Field>
        <div className="span-2 btn-row">
          <button className="btn btn-primary" type="submit">실험 저장</button>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={() => {
              if (persist()) navigate(campaignPath(campaign.id, "results"));
            }}
          >
            결과 입력으로 이동
          </button>
        </div>
      </form>

      <section className="section">
        <h2>소재 비교</h2>
        <div className="ad-pair" style={{ marginTop: 12 }}>
          <article className="ad-sheet">
            <div className="ad-kicker">기존 소재</div>
            <strong>{form.control}</strong>
            <p>지금까지 써 온 문장입니다. 상품과 타깃은 메시지 소재와 같습니다.</p>
          </article>
          <article className="ad-sheet is-test">
            <div className="ad-kicker">AI 광고 소재 실험 솔루션 메시지 소재</div>
            <strong>{form.treatment}</strong>
            <p>{hypothesis ? hypothesis.message : "승인한 가설의 문장입니다."}</p>
          </article>
        </div>
        <dl className="defs">
          <div><dt>바꾼 것</dt><dd>{form.changed}</dd></div>
          <div><dt>그대로 둔 것</dt><dd>{form.same}</dd></div>
        </dl>
      </section>
    </div>
  );
}

export function Results() {
  const campaign = useCampaign();
  const { saveResults, navigate, pushToast } = useStore();
  const [expId, setExpId] = useState("");
  const [judgment, setJudgment] = useState("");
  const [memo, setMemo] = useState("");
  const [flags, setFlags] = useState(emptyFlags);
  const [error, setError] = useState("");

  const experiments = campaign?.experiments || [];
  const current = experiments.find((item) => item.id === expId) || experiments[0];

  useEffect(() => {
    if (!current) return;
    setExpId(current.id);
    setJudgment(current.judgment || "");
    setMemo(current.memo || "");
    setFlags(current.flags || emptyFlags());
    setError("");
  }, [current?.id]);

  if (!campaign) return <MissingCampaign />;
  if (!current) {
    return (
      <EmptyState
        title="등록된 실험이 없습니다"
        action={<a className="btn btn-primary" href={campaignPath(campaign.id, "experiment")}>실험 등록</a>}
      >
        가설을 승인한 뒤 실험을 저장하면, 기존 소재와 메시지 소재의 결과를 여기서 비교합니다.
      </EmptyState>
    );
  }

  const commit = (goNext) => {
    const ok = saveResults(campaign.id, current.id, { judgment, memo, flags });
    if (!ok) {
      setError("판정을 선택하세요. 결과를 학습으로 넘기려면 다섯 가지 중 하나를 고릅니다.");
      return;
    }
    setError("");
    pushToast(goNext ? "결과를 학습 이력에 반영했습니다." : "결과를 저장했습니다.");
    if (goNext) navigate(campaignPath(campaign.id, "learning"));
  };

  return (
    <div>
      <PageHeader
        title="실험 결과"
        lede={current.summary}
        actions={<a className="btn btn-secondary" href={campaignPath(campaign.id, "experiment", current.hypothesisId)}>실험 설정</a>}
      />
      {experiments.length > 1 ? (
        <div className="switcher" role="group" aria-label="실험 선택">
          {experiments.map((item) => (
            <button
              type="button"
              key={item.id}
              className="btn btn-secondary"
              aria-pressed={item.id === current.id}
              onClick={() => setExpId(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>
      ) : null}
      <p className="muted" style={{ marginBottom: 12 }}>아래 수치는 같은 조건으로 나눈 샘플 결과입니다. 판정과 메모는 이 화면에 저장됩니다.</p>
      <dl className="info-grid" style={{ marginBottom: 16 }}>
        <div><dt>기존 소재</dt><dd>{current.control}</dd></div>
        <div><dt>메시지 소재</dt><dd>{current.treatment}</dd></div>
        <div><dt>바꾼 것</dt><dd>{current.changed}</dd></div>
        <div><dt>그대로 둔 것</dt><dd>{current.same}</dd></div>
        <div><dt>채널</dt><dd>{current.channel}</dd></div>
        <div><dt>기간</dt><dd>{current.period}</dd></div>
      </dl>
      <div className="table-wrap">
        <table className="wide">
          <caption className="sr-only">기존 소재와 메시지 소재 비교</caption>
          <thead>
            <tr>
              <th>항목</th>
              <th className="num">기존 소재</th>
              <th className="num col-test">AI 광고 소재 실험 솔루션 메시지 소재</th>
            </tr>
          </thead>
          <tbody>
            {current.rows.map((row) => (
              <tr key={row[0]}>
                <td>{row[0]}</td>
                <td className="num">{row[1]}</td>
                <td className="num col-test">{row[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {error ? <div className="banner banner-error" role="alert" style={{ marginTop: 16 }}><p>{error}</p></div> : null}

      <fieldset className="section">
        <legend>판정</legend>
        <div className="choices">
          {JUDGMENTS.map((item) => (
            <label className="choice" key={item}>
              <input
                type="radio"
                name="judgment"
                value={item}
                checked={judgment === item}
                onChange={() => setJudgment(item)}
              />
              {item}
            </label>
          ))}
        </div>
      </fieldset>

      <Field label="마케터 판단 메모">
        <textarea
          value={memo}
          onChange={(event) => setMemo(event.target.value)}
          placeholder="예: 주말 프로모션은 없었고, 소재 문구만 바꿨습니다."
        />
      </Field>

      <fieldset className="section">
        <legend>이 기간에 바뀐 것이 있나요</legend>
        {FLAG_FIELDS.map(([key, label]) => (
          <div className="flag-row" key={key}>
            <span>{label}</span>
            <div className="flag-options">
              {["예", "아니오"].map((value) => (
                <label className="choice" key={value}>
                  <input
                    type="radio"
                    name={key}
                    value={value}
                    checked={flags[key] === value}
                    onChange={() => setFlags((prev) => ({ ...prev, [key]: value }))}
                  />
                  {value}
                </label>
              ))}
            </div>
          </div>
        ))}
      </fieldset>

      <div className="btn-row section">
        <button type="button" className="btn btn-secondary" onClick={() => commit(false)}>결과 저장</button>
        <button type="button" className="btn btn-primary" onClick={() => commit(true)}>다음 가설에 활용</button>
      </div>
    </div>
  );
}

export function Learning() {
  const campaign = useCampaign();
  const { learnings } = useStore();
  if (!campaign) return <MissingCampaign />;

  if (learnings.length === 0) {
    return (
      <EmptyState title="아직 학습 이력이 없습니다">
        실험 결과를 저장하면 여기에 쌓입니다.
      </EmptyState>
    );
  }

  const stories = learnings.filter((item) => item.featured || item.fresh);
  const rest = learnings.filter((item) => !item.featured && !item.fresh);
  const fresh = learnings.find((item) => item.fresh);

  return (
    <div>
      <PageHeader
        title="다음 광고 가설에 활용할 학습 이력"
        lede={`${campaign.product} 캠페인에서 저장한 실험 기록입니다.`}
      />
      {fresh ? <div className="banner" role="status"><p>방금 저장한 실험을 학습 이력 맨 위에 넣었습니다.</p></div> : null}

      <div>
        {stories.map((item) => (
          <article className="panel learn-card" key={item.id}>
            <header>
              <h2>{item.title}</h2>
              <span className={item.result === "개선 신호" ? "status-wait" : undefined}>{item.result}</span>
            </header>
            {item.fresh ? <p className="muted">이번 실험에서 저장</p> : <p className="muted">{item.when}</p>}
            {item.basis ? <p>근거 {item.basis}</p> : null}
            {item.caution ? <p>주의 {item.caution}</p> : null}
            <p>다음 활용 {item.nextUse}</p>
            <div className="btn-row" style={{ marginTop: 10 }}>
              <EvidenceButton
                title={`${item.title} 근거`}
                groups={[
                  {
                    label: "실험 기록",
                    items: [
                      {
                        text: item.basis || item.caution || item.nextUse,
                        source: item.when || "학습 이력",
                        locator: item.result,
                      },
                    ],
                  },
                ]}
              />
            </div>
          </article>
        ))}
      </div>

      {rest.length > 0 ? (
        <section className="section">
          <h2>다른 재사용 메시지</h2>
          <div className="table-wrap" style={{ marginTop: 12 }}>
            <table>
              <thead>
                <tr>
                  <th>메시지</th>
                  <th>결과</th>
                  <th>다음 활용</th>
                </tr>
              </thead>
              <tbody>
                {rest.map((item) => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{item.result}</td>
                    <td>{item.nextUse}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
