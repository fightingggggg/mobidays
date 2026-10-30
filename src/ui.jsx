import { useEffect } from "react";
import { campaignPath, STEPS } from "./data";
import { useCampaign, useStore } from "./store";

const NAV_STEPS = ["캠페인 설정", ...STEPS];

const SCREEN_STAGE = {
  detail: "캠페인 설정",
  upload: "분석",
  analysis: "분석",
  quotes: "분석",
  hypotheses: "제안",
  experiment: "실험",
  results: "실험",
  learning: "학습",
};

export function StageBar() {
  const campaign = useCampaign();
  const { route } = useStore();
  if (!campaign) return null;
  const screenStep = SCREEN_STAGE[route.name] || "캠페인 설정";
  const campaignIndex = STEPS.indexOf(campaign.stage);

  const hrefFor = (step) => {
    if (step === "캠페인 설정") return campaignPath(campaign.id);
    if (step === "분석") return campaignPath(campaign.id, campaign.analysis ? "analysis" : "upload");
    if (step === "제안") return campaignPath(campaign.id, "hypotheses");
    if (step === "실험") return campaignPath(campaign.id, campaign.experiments.length ? "results" : "experiment");
    return campaignPath(campaign.id, "learning");
  };

  return (
    <div className="stage-wrap">
      <p className="where">
        <span>지금 보는 단계 <strong>{screenStep}</strong></span>
        <span>캠페인 상태 {campaign.status}</span>
      </p>
      <nav className="stage" aria-label="캠페인 진행 단계">
        {NAV_STEPS.map((step, index) => {
          const current = step === screenStep;
          const reached = STEPS.indexOf(step);
          const done = !current && (step === "캠페인 설정" || (reached >= 0 && reached <= campaignIndex));
          return (
            <a
              key={step}
              href={hrefFor(step)}
              className={current ? "is-current" : done ? "is-done" : undefined}
              aria-current={current ? "step" : undefined}
            >
              <span className="stage-index">{index}</span>
              {step}
            </a>
          );
        })}
      </nav>
    </div>
  );
}

export function PageHeader({ title, lede, actions }) {
  return (
    <header className="page-head">
      <div>
        <h1>{title}</h1>
        {lede ? <p className="lede">{lede}</p> : null}
      </div>
      {actions ? <div className="page-actions">{actions}</div> : null}
    </header>
  );
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="empty">
      <h2>{title}</h2>
      <p>{children}</p>
      {action}
    </div>
  );
}

export function MissingCampaign() {
  return (
    <EmptyState title="캠페인을 찾을 수 없습니다" action={<a className="btn btn-primary" href="#/">대시보드로 돌아가기</a>}>
      주소에 해당하는 캠페인이 없습니다. 새로고침하면 샘플 캠페인만 남습니다.
    </EmptyState>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

export function EvidenceButton({ title, groups }) {
  const { openEvidence } = useStore();
  return (
    <button type="button" className="btn btn-quiet" onClick={() => openEvidence({ title, groups })}>
      근거 원문 보기
    </button>
  );
}

export function SourceTag({ source, locator }) {
  return (
    <span className="source-tag">
      {source} / {locator}
    </span>
  );
}

export function QuoteList({ quotes }) {
  if (!quotes?.length) return <p className="muted">연결된 원문이 없습니다.</p>;
  return (
    <div>
      {quotes.map((quote) => (
        <blockquote className="quote" key={`${quote.source}-${quote.locator}-${quote.text}`}>
          <p>“{quote.text}”</p>
          <SourceTag source={quote.source} locator={quote.locator} />
        </blockquote>
      ))}
    </div>
  );
}

export function Drawer() {
  const { evidence, closeEvidence } = useStore();
  useEffect(() => {
    if (!evidence) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") closeEvidence();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [evidence, closeEvidence]);

  if (!evidence) return null;
  return (
    <div className="drawer-back" onClick={closeEvidence}>
      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label={evidence.title}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="drawer-head">
          <h2>{evidence.title}</h2>
          <button type="button" className="btn btn-secondary" onClick={closeEvidence}>
            닫기
          </button>
        </div>
        {evidence.groups.map((group) => (
          <section key={group.label} className="drawer-group">
            <h3>{group.label}</h3>
            <QuoteList quotes={group.items} />
          </section>
        ))}
      </aside>
    </div>
  );
}

export function Strength({ score, label }) {
  return (
    <span className="strength" aria-label={`근거 강도 ${label}`}>
      근거 강도 {label}
      <span className="strength-bars" aria-hidden="true">
        {[1, 2, 3].map((mark) => (
          <span key={mark} className={mark <= score ? "on" : undefined} />
        ))}
      </span>
    </span>
  );
}

export function Banner({ tone = "error", children, onClose }) {
  return (
    <div className={`banner banner-${tone}`} role="alert">
      <p>{children}</p>
      {onClose ? (
        <button type="button" className="btn btn-quiet" onClick={onClose}>
          닫기
        </button>
      ) : null}
    </div>
  );
}
