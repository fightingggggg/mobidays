import { useState } from "react";
import { campaignPath, GOALS, nextAction, STEPS, ZONES } from "../data";
import { useCampaign, useStore } from "../store";
import { EmptyState, Field, MissingCampaign, PageHeader } from "../ui";

function Metric({ href, value, label }) {
  const body = (
    <>
      <b>{value}</b>
      <span>{label}</span>
    </>
  );
  if (!href) return <div className="metric">{body}</div>;
  return <a className="metric" href={href}>{body}</a>;
}

export function Dashboard() {
  const { campaigns, metrics } = useStore();
  return (
    <div>
      <div className="page-head">
        <div>
          <h1>대시보드</h1>
          <p className="lede">고객 반응을 메시지 가설과 광고 실험으로 연결합니다.</p>
        </div>
        <a className="btn btn-primary" href="#/new">새 캠페인 만들기</a>
      </div>
      <section className="metrics" aria-label="요약 지표">
        <Metric href={metrics.analyzedId ? campaignPath(metrics.analyzedId, "analysis") : ""} value={metrics.analyzed} label="데이터 분석 완료 캠페인" />
        <Metric href={metrics.proposedId ? campaignPath(metrics.proposedId, "hypotheses") : ""} value={metrics.proposed} label="가설 제안 캠페인" />
        <Metric href={metrics.activeId ? campaignPath(metrics.activeId) : ""} value={metrics.active} label="진행 중 캠페인" />
        <Metric href={metrics.doneId ? campaignPath(metrics.doneId, "learning") : ""} value={metrics.done} label="완료 캠페인" />
      </section>
      <h2>캠페인</h2>
      <div className="stack" style={{ marginTop: 12 }}>
        {campaigns.map((campaign) => {
          const action = nextAction(campaign);
          const stageIndex = STEPS.indexOf(campaign.stage);
          return (
            <article className="campaign-row" key={campaign.id}>
              <a className="campaign-hit" href={campaignPath(campaign.id)}>
                <h2>{campaign.name}</h2>
                <dl className="meta-grid">
                  <dt>상품명</dt>
                  <dd>{campaign.product}</dd>
                  <dt>캠페인 목표</dt>
                  <dd>{campaign.goal}</dd>
                  <dt>현재 단계</dt>
                  <dd className={campaign.status.includes("대기") ? "status-wait" : undefined}>{campaign.status}</dd>
                  <dt>최근 업데이트</dt>
                  <dd>{campaign.updatedAt}</dd>
                </dl>
              </a>
              <div className="campaign-side">
                <ol className="mini-stage" aria-label={`흐름 ${campaign.stage}`}>
                  {STEPS.map((step, index) => (
                    <li
                      key={step}
                      className={step === campaign.stage ? "is-current" : index < stageIndex ? "is-done" : undefined}
                    >
                      {step}
                    </li>
                  ))}
                </ol>
                <a className="btn btn-primary" href={campaignPath(campaign.id, action.section)}>
                  {action.label}
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export function NewCampaign() {
  const { createCampaign } = useStore();
  const [form, setForm] = useState({
    name: "",
    product: "",
    goal: GOALS[0],
    target: "",
  });
  const [error, setError] = useState("");

  const set = (key) => (event) => setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = (event) => {
    event.preventDefault();
    if (!form.product.trim()) {
      setError("상품명을 입력하세요. 자료를 올리기 전에 어떤 상품의 캠페인인지 정합니다.");
      return;
    }
    createCampaign(form);
  };

  return (
    <div>
      <PageHeader
        title="새 캠페인"
        lede="상품과 목표만 정하면 자료 등록으로 이어집니다. 로그인이나 광고 계정 연결은 하지 않습니다."
      />
      {error ? <div className="banner banner-error" role="alert"><p>{error}</p></div> : null}
      <form className="form-grid panel" onSubmit={submit}>
        <Field label="캠페인 이름" hint="비워 두면 상품명으로 만듭니다.">
          <input type="text" value={form.name} onChange={set("name")} placeholder="민감성 수분크림 신규 캠페인" />
        </Field>
        <Field label="상품명">
          <input type="text" value={form.product} onChange={set("product")} placeholder="민감성 수분크림" />
        </Field>
        <Field label="캠페인 목표">
          <select value={form.goal} onChange={set("goal")}>
            {GOALS.map((goal) => (
              <option key={goal}>{goal}</option>
            ))}
          </select>
        </Field>
        <Field label="타깃">
          <input type="text" value={form.target} onChange={set("target")} placeholder="민감성 피부를 가진 20~40대 고객" />
        </Field>
        <div className="span-2 btn-row">
          <button className="btn btn-primary" type="submit">캠페인 만들기</button>
          <a className="btn btn-secondary" href="#/">취소</a>
        </div>
      </form>
    </div>
  );
}

export function CampaignDetail() {
  const campaign = useCampaign();
  const { learnings, retryFile } = useStore();
  if (!campaign) return <MissingCampaign />;
  const linked = learnings.find((item) => item.id === campaign.linkedLearningId);
  const pending = campaign.hypotheses.filter((item) => item.status === "승인 대기");
  const highlights = campaign.analysis?.highlights || [];

  return (
    <div>
      <PageHeader title={campaign.name} lede={campaign.analysis?.summary} />
      <dl className="info-grid">
        <div><dt>상품명</dt><dd>{campaign.product}</dd></div>
        <div><dt>목표</dt><dd>{campaign.goal}</dd></div>
        <div><dt>상태</dt><dd>{campaign.status}</dd></div>
        <div><dt>최근 업데이트</dt><dd>{campaign.updatedAt}</dd></div>
        <div className="span-2"><dt>타깃</dt><dd>{campaign.target}</dd></div>
      </dl>

      <section className="section">
        <div className="section-head">
          <h2>업로드 자료</h2>
          <a className="btn btn-quiet" href={campaignPath(campaign.id, "upload")}>자료 업로드</a>
        </div>
        {campaign.files.length === 0 ? (
          <EmptyState title="아직 업로드된 자료가 없습니다" action={<a className="btn btn-primary" href={campaignPath(campaign.id, "upload")}>자료 등록</a>}>
            리뷰, 문의, 상품 정보, 기존 광고 결과를 등록하면 메시지 가설을 만들 수 있습니다.
          </EmptyState>
        ) : (
          <div className="table-wrap stack">
            <table>
              <thead>
                <tr>
                  <th>자료</th>
                  <th>파일</th>
                  <th>규모</th>
                  <th>상태</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {campaign.files.map((file) => (
                  <tr key={file.id}>
                    <td>{file.label}</td>
                    <td>{file.name}</td>
                    <td>{file.volume}</td>
                    <td className={file.status === "오류" ? "status-bad" : undefined}>
                      {file.status}
                      {file.error ? <div>{file.error}</div> : null}
                    </td>
                    <td>
                      {file.status === "오류" ? (
                        <button type="button" className="btn btn-secondary" onClick={() => retryFile(campaign.id, file.id)}>
                          다시 시도
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="section">
        <h2>현재 핵심 고객 니즈</h2>
        {highlights.length === 0 ? (
          <p className="muted" style={{ marginTop: 8 }}>분석을 마치면 고객 니즈가 여기에 표시됩니다.</p>
        ) : (
          <ul className="plain-list panel" style={{ marginTop: 12 }}>
            {highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </section>

      {linked ? (
        <section className="section">
          <div className="section-head">
            <h2>이전 실험에서 가져온 학습</h2>
            <a className="btn btn-quiet" href={campaignPath(campaign.id, "learning")}>학습 이력 보기</a>
          </div>
          <div className="panel">
            <p>
              {linked.title}: {linked.result}. {linked.basis || linked.caution} {linked.nextUse}
            </p>
          </div>
        </section>
      ) : null}

      <section className="section">
        <div className="section-head">
          <h2>승인 대기 메시지 가설</h2>
          <a className="btn btn-quiet" href={campaignPath(campaign.id, "hypotheses")}>메시지 가설 보기</a>
        </div>
        {pending.length === 0 ? (
          <p className="muted">승인 대기인 가설이 없습니다.</p>
        ) : (
          <div className="stack" style={{ marginTop: 12 }}>
            {pending.map((item, index) => (
              <a className="stack-item campaign-hit" key={item.id} href={campaignPath(campaign.id, "hypotheses", item.id)}>
                <p className="muted">가설 {index + 1}</p>
                <h3>{item.title}</h3>
                <p>근거 강도 {item.strength}</p>
                <p>연결 고객 니즈 {item.need}</p>
                <p className="status-wait">{item.status}</p>
              </a>
            ))}
          </div>
        )}
      </section>

      <div className="btn-row section">
        <a className="btn btn-primary" href={campaignPath(campaign.id, "analysis")}>리뷰 분석 결과 보기</a>
        <a className="btn btn-secondary" href={campaignPath(campaign.id, "hypotheses")}>메시지 가설 보기</a>
        <a className="btn btn-secondary" href={campaignPath(campaign.id, "upload")}>자료 업로드</a>
      </div>
    </div>
  );
}

export function Upload() {
  const campaign = useCampaign();
  const { registerZone, retryFile, startAnalysis, pushToast, loading } = useStore();
  if (!campaign) return <MissingCampaign />;

  const fileFor = (zoneId) => campaign.files.find((file) => file.zone === zoneId);

  const onZone = (zone) => {
    if (fileFor(zone.id)) {
      pushToast("이미 등록된 자료입니다.");
      return;
    }
    registerZone(campaign.id, zone.id);
  };

  const addNext = () => {
    const next = ZONES.find((zone) => !fileFor(zone.id));
    if (!next) {
      pushToast("더 넣을 샘플 자료가 없습니다.");
      return;
    }
    registerZone(campaign.id, next.id);
  };

  return (
    <div>
      <PageHeader
        title="자료 업로드"
        lede="파일 영역을 누르면 샘플 자료가 등록됩니다. 실제 파일은 올라가지 않습니다."
      />
      <div className="zone-list">
        {ZONES.map((zone) => {
          const file = fileFor(zone.id);
          return (
            <button
              type="button"
              key={zone.id}
              className={file ? "zone is-filled" : "zone"}
              onClick={() => onZone(zone)}
            >
              <span>
                <strong>{zone.label}</strong>
                <small>{zone.accept}</small>
              </span>
              {file ? (
                <span className="zone-meta">
                  <span>{file.name}</span>
                  <span>{file.volume}</span>
                  <span>{file.status}</span>
                </span>
              ) : (
                <span className="muted">눌러서 샘플 파일 등록</span>
              )}
            </button>
          );
        })}
      </div>

      <section className="section">
        <h2>등록된 자료</h2>
        {campaign.files.length === 0 ? (
          <EmptyState title="등록된 파일이 없습니다" >
            위의 영역을 누르거나 자료 추가를 누르면 샘플 파일이 채워집니다.
          </EmptyState>
        ) : (
          <div className="table-wrap stack" style={{ marginTop: 12 }}>
            <table>
              <thead>
                <tr>
                  <th>파일</th>
                  <th>규모</th>
                  <th>상태</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {campaign.files.map((file) => (
                  <tr key={file.id}>
                    <td>
                      {file.name}
                      {file.error ? <div className="status-bad">{file.error}</div> : null}
                    </td>
                    <td>{file.volume}</td>
                    <td className={file.status === "오류" ? "status-bad" : undefined}>{file.status}</td>
                    <td>
                      {file.status === "오류" ? (
                        <button type="button" className="btn btn-secondary" onClick={() => retryFile(campaign.id, file.id)}>
                          다시 시도
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="btn-row section">
        <button type="button" className="btn btn-secondary" onClick={addNext}>자료 추가</button>
        <button type="button" className="btn btn-primary" onClick={() => startAnalysis(campaign.id)} disabled={Boolean(loading)}>
          분석 시작
        </button>
        <a className="btn btn-secondary" href={campaignPath(campaign.id, "analysis")}>분석 결과 보기</a>
      </div>
    </div>
  );
}
