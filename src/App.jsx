import { campaignPath } from "./data";
import { Analysis, Hypotheses, Quotes } from "./screens/middle";
import { Experiment, Learning, Results } from "./screens/late";
import { CampaignDetail, Dashboard, NewCampaign, Upload } from "./screens/early";
import { useCampaign, useStore } from "./store";
import { Banner, Drawer, StageBar } from "./ui";

function Screen() {
  const { route } = useStore();
  switch (route.name) {
    case "dashboard":
      return <Dashboard />;
    case "new":
      return <NewCampaign />;
    case "detail":
      return <CampaignDetail />;
    case "upload":
      return <Upload />;
    case "analysis":
      return <Analysis />;
    case "quotes":
      return <Quotes />;
    case "hypotheses":
      return <Hypotheses />;
    case "experiment":
      return <Experiment />;
    case "results":
      return <Results />;
    case "learning":
      return <Learning />;
    default:
      return <Dashboard />;
  }
}

const SCREEN_LABEL = {
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

export function App() {
  const { route, loading, banner, setBanner, toast, evidence } = useStore();
  const campaign = useCampaign();
  const showStage = Boolean(campaign) && route.name !== "new";
  const screenLabel = SCREEN_LABEL[route.name] || "대시보드";

  return (
    <div className="app">
      <aside className="sidebar">
        <a className="brand" href="#/">AI 광고 소재 실험 솔루션</a>
        <nav className="side-nav" aria-label="주요 이동">
          <a href="#/" aria-current={route.name === "dashboard" ? "page" : undefined}>모든 캠페인</a>
          {campaign ? (
            <a
              href={campaignPath(campaign.id)}
              aria-current={route.name !== "dashboard" && route.name !== "new" ? "page" : undefined}
            >
              {campaign.product}
            </a>
          ) : null}
        </nav>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <nav className="crumbs" aria-label="현재 위치">
            {route.name === "dashboard" ? (
              <span>대시보드</span>
            ) : (
              <a href="#/">모든 캠페인</a>
            )}
            {campaign ? (
              <>
                <span className="crumb-sep" aria-hidden="true">/</span>
                {route.name === "detail" ? (
                  <span>{campaign.product}</span>
                ) : (
                  <a href={campaignPath(campaign.id)}>{campaign.product}</a>
                )}
                {route.name !== "detail" ? (
                  <>
                    <span className="crumb-sep" aria-hidden="true">/</span>
                    <span>{screenLabel}</span>
                  </>
                ) : null}
              </>
            ) : route.name !== "dashboard" ? (
              <>
                <span className="crumb-sep" aria-hidden="true">/</span>
                <span>{screenLabel}</span>
              </>
            ) : null}
          </nav>
          <span className="sample-tag">샘플 데이터</span>
        </header>
        <main className="main">
        {showStage ? <StageBar /> : null}
        {banner ? (
          <Banner tone={banner.tone} onClose={() => setBanner(null)}>
            {banner.text}
          </Banner>
        ) : null}
        <div key={`${route.name}-${route.campaignId || "home"}`}>
          <Screen />
        </div>
        </main>
      </div>
      {evidence ? <Drawer /> : null}
      {loading ? (
        <div className="loading">
          <div className="loading-card" role="status" aria-live="polite">
            <p>{loading}</p>
            <div className="loading-track">
              <div className="loading-bar" />
            </div>
          </div>
        </div>
      ) : null}
      {toast ? (
        <div className="toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
