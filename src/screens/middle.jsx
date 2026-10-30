import { useEffect, useState } from "react";
import { campaignPath, quoteItems } from "../data";
import { useCampaign, useStore } from "../store";
import { EmptyState, EvidenceButton, Field, MissingCampaign, PageHeader, QuoteList, SourceTag, Strength } from "../ui";

function itemsOf(campaign, ids) {
  return quoteItems(campaign, ids);
}

export function Analysis() {
  const campaign = useCampaign();
  const { updateAnalysis } = useStore();
  const [editing, setEditing] = useState(false);
  const [summary, setSummary] = useState("");
  const [needsText, setNeedsText] = useState("");

  useEffect(() => {
    if (!campaign?.analysis) return;
    setSummary(campaign.analysis.summary);
    setNeedsText(campaign.analysis.needs.join("\n"));
    setEditing(false);
  }, [campaign?.id, campaign?.analysis]);

  if (!campaign) return <MissingCampaign />;
  if (!campaign.analysis) {
    return (
      <EmptyState
        title="아직 분석 결과가 없습니다"
        action={<a className="btn btn-primary" href={campaignPath(campaign.id, "upload")}>자료 업로드로 이동</a>}
      >
        리뷰와 문의를 등록한 뒤 분석을 시작하면 고객 니즈와 구매 장벽이 여기에 정리됩니다.
      </EmptyState>
    );
  }

  const analysis = campaign.analysis;
  const representative = itemsOf(campaign, analysis.representativeIds);
  const allQuotes = campaign.quotes.map((quote) => ({ text: quote.text, source: quote.source, locator: quote.locator }));

  const save = (event) => {
    event.preventDefault();
    const needs = needsText.split("\n").map((line) => line.trim()).filter(Boolean);
    if (!summary.trim() || needs.length === 0) return;
    updateAnalysis(campaign.id, { summary: summary.trim(), needs });
    setEditing(false);
  };

  return (
    <div>
      <PageHeader
        title="고객 반응 분석 결과"
        actions={
          <div className="btn-row">
            <a className="btn btn-primary" href={campaignPath(campaign.id, "hypotheses")}>메시지 가설 만들기</a>
            <button type="button" className="btn btn-secondary" onClick={() => setEditing((value) => !value)}>
              분석 결과 수정
            </button>
            <a className="btn btn-secondary" href={campaignPath(campaign.id, "quotes")}>원문 전체 보기</a>
          </div>
        }
      />
      {campaign.fromSample ? (
        <p className="muted" style={{ marginBottom: 12 }}>
          샘플 파일인 민감성 수분크림 리뷰를 기준으로 정리한 결과입니다.
        </p>
      ) : null}

      {editing ? (
        <form className="panel" onSubmit={save}>
          <Field label="요약 문장">
            <textarea value={summary} onChange={(event) => setSummary(event.target.value)} />
          </Field>
          <div style={{ height: 12 }} />
          <Field label="주요 고객 니즈" hint="한 줄에 하나씩 적습니다.">
            <textarea value={needsText} onChange={(event) => setNeedsText(event.target.value)} />
          </Field>
          <div className="btn-row" style={{ marginTop: 12 }}>
            <button className="btn btn-primary" type="submit">수정 반영</button>
            <button className="btn btn-secondary" type="button" onClick={() => setEditing(false)}>취소</button>
          </div>
        </form>
      ) : (
        <div>
          <p className="insight">{analysis.summary}</p>
          <EvidenceButton title="요약의 근거 원문" groups={[{ label: "고객 원문", items: allQuotes }]} />
        </div>
      )}

      <section className="section">
        <div className="section-head">
          <h2>A. 주요 고객 니즈</h2>
          <EvidenceButton
            title="주요 고객 니즈의 근거"
            groups={[{ label: "고객 원문", items: allQuotes }]}
          />
        </div>
        <div className="statement-list panel">
          {analysis.needs.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>B. 주요 구매 장벽</h2>
          <EvidenceButton
            title="구매 장벽의 근거"
            groups={[{ label: "고객 원문", items: itemsOf(campaign, ["q5", "q7", "q3", "q9", "sq1", "sq2", "hq1"].filter((id) => campaign.quotes.some((quote) => quote.id === id))) }]}
          />
        </div>
        <div className="statement-list panel">
          {analysis.barriers.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>C. 고객 반응 그룹</h2>
          <EvidenceButton
            title="반응 그룹의 근거"
            groups={analysis.groups.map((group) => ({
              label: group.name,
              items: campaign.quotes
                .filter((quote) => quote.group === group.name)
                .map((quote) => ({ text: quote.text, source: quote.source, locator: quote.locator })),
            }))}
          />
        </div>
        <div className="panel">
          {analysis.groups.map((group) => (
            <div className="group-row" key={group.name}>
              <span>{group.name}</span>
              <span className="meter" aria-hidden="true">
                <span className="meter-fill" style={{ width: `${group.share}%` }} />
              </span>
              <span>{group.share}%</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>D. 상품 USP 연결</h2>
          <EvidenceButton
            title="상품 특성과 연결된 근거"
            groups={analysis.usps.map((item) => ({
              label: item.feature,
              items: itemsOf(campaign, item.evidenceIds || []),
            }))}
          />
        </div>
        <div className="table-wrap stack">
          <table>
            <thead>
              <tr>
                <th>상품 특성</th>
                <th>메시지에 쓰는 이유</th>
              </tr>
            </thead>
            <tbody>
              {analysis.usps.map((item) => (
                <tr key={item.feature}>
                  <td>{item.feature}</td>
                  <td>{item.link}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>E. 대표 고객 원문</h2>
          <EvidenceButton title="대표 원문과 같은 결의 문장" groups={[{ label: "고객 원문", items: allQuotes }]} />
        </div>
        <div className="panel">
          <QuoteList quotes={representative} />
        </div>
      </section>
    </div>
  );
}

export function Quotes() {
  const campaign = useCampaign();
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("전체");
  if (!campaign) return <MissingCampaign />;

  const groups = ["전체", ...Array.from(new Set(campaign.quotes.map((quote) => quote.group)))];
  const filtered = campaign.quotes.filter((quote) => {
    const matchesGroup = group === "전체" || quote.group === group;
    const matchesQuery = quote.text.includes(query.trim());
    return matchesGroup && matchesQuery;
  });

  return (
    <div>
      <PageHeader title="고객 원문" lede="분석에 쓰인 리뷰와 문의 문장입니다. 파일 이름과 비슷한 언급 건수로 출처를 확인할 수 있습니다." />
      {campaign.quotes.length === 0 ? (
        <EmptyState title="등록된 원문이 없습니다" action={<a className="btn btn-primary" href={campaignPath(campaign.id, "upload")}>자료 업로드</a>}>
          분석을 마치면 고객 문장이 여기에 모입니다.
        </EmptyState>
      ) : (
        <>
          <Field label="원문 검색">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="따갑, 무향, 번들"
            />
          </Field>
          <div className="filters" role="group" aria-label="반응 그룹">
            {groups.map((name) => (
              <button
                type="button"
                key={name}
                className="btn btn-secondary"
                aria-pressed={group === name}
                onClick={() => setGroup(name)}
              >
                {name}
              </button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <EmptyState title="해당하는 원문이 없습니다">다른 단어로 다시 찾아보세요. 그룹을 전체로 두면 더 넓게 볼 수 있습니다.</EmptyState>
          ) : (
            <div className="panel" style={{ marginTop: 8 }}>
              {filtered.map((quote) => (
                <blockquote className="quote" key={quote.id}>
                  <p>“{quote.text}”</p>
                  <SourceTag source={quote.source} locator={quote.locator} />
                  <div className="muted">{quote.group}</div>
                </blockquote>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function Hypotheses() {
  const campaign = useCampaign();
  const { route, updateHypothesis, setHypothesisStatus, approveHypothesis } = useStore();
  const [panel, setPanel] = useState(null);
  const [draft, setDraft] = useState({ title: "", message: "", copy: "" });
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const selectedId = route.extra || campaign?.hypotheses[0]?.id;
  const selected = campaign?.hypotheses.find((item) => item.id === selectedId) || campaign?.hypotheses[0];

  useEffect(() => {
    setPanel(null);
    setReason("");
    setError("");
  }, [selected?.id]);

  if (!campaign) return <MissingCampaign />;
  if (campaign.hypotheses.length === 0) {
    return (
      <EmptyState
        title="아직 제안된 가설이 없습니다"
        action={<a className="btn btn-primary" href={campaignPath(campaign.id, campaign.analysis ? "analysis" : "upload")}>{campaign.analysis ? "리뷰 분석 결과 보기" : "자료 업로드"}</a>}
      >
        리뷰 분석을 마치면 검증할 메시지 가설이 여기에 제안됩니다.
      </EmptyState>
    );
  }

  const openEdit = () => {
    setDraft({ title: selected.title, message: selected.message, copy: selected.copy });
    setPanel("edit");
    setError("");
  };

  const saveEdit = (event) => {
    event.preventDefault();
    if (!draft.title.trim() || !draft.message.trim() || !draft.copy.trim()) {
      setError("제목, 핵심 메시지, 추천 카피를 모두 입력하세요.");
      return;
    }
    updateHypothesis(campaign.id, selected.id, {
      title: draft.title.trim(),
      message: draft.message.trim(),
      copy: draft.copy.trim(),
    });
    setPanel(null);
  };

  const saveReason = (status) => {
    if (!reason.trim()) {
      setError(status === "보류" ? "보류 사유를 입력하세요." : "거부 사유를 입력하세요.");
      return;
    }
    setHypothesisStatus(campaign.id, selected.id, status, reason.trim());
    setPanel(null);
  };

  return (
    <div>
      <PageHeader title="메시지 가설" lede="분석에서 나온 문장을 광고로 검증할지 정합니다. 승인하면 실험 등록으로 이동합니다." />
      <div className="hypo-layout">
        <div className="stack" role="list">
          {campaign.hypotheses.map((item, index) => (
            <a
              key={item.id}
              href={campaignPath(campaign.id, "hypotheses", item.id)}
              className={item.id === selected.id ? "hypo-card is-selected" : "hypo-card"}
              aria-current={item.id === selected.id ? "true" : undefined}
            >
              <div className="index-label">가설 {index + 1}</div>
              <strong>{item.title}</strong>
              <div><Strength score={item.strengthScore} label={item.strength} /></div>
              <div>연결 고객 니즈 {item.need}</div>
              <div className={item.status === "승인 대기" ? "status-wait" : undefined}>{item.status}</div>
            </a>
          ))}
        </div>
        <article className="panel" id="hypothesis-detail">
          <h2>{selected.title}</h2>
          <p style={{ margin: "8px 0" }}>
            <Strength score={selected.strengthScore} label={selected.strength} />
          </p>
          {selected.broughtFrom ? <p className="muted">가져온 곳 {selected.broughtFrom}</p> : null}
          <dl className="defs">
            <div><dt>고객 문제</dt><dd>{selected.problem}</dd></div>
            <div><dt>핵심 메시지</dt><dd>{selected.message}</dd></div>
            <div><dt>추천 광고 카피</dt><dd>{selected.copy}</dd></div>
            <div><dt>추천 소재 방향</dt><dd>{selected.direction}</dd></div>
            <div><dt>타깃 상황</dt><dd>{selected.situation}</dd></div>
            <div>
              <dt>고객 원문 근거</dt>
              <dd>
                <QuoteList quotes={itemsOf(campaign, selected.quoteIds)} />
              </dd>
            </div>
            <div>
              <dt>상품 정보 근거</dt>
              <dd>
                <QuoteList quotes={(selected.productEvidence || []).map((item) => ({ text: item.text, source: item.source, locator: item.locator }))} />
              </dd>
            </div>
            <div><dt>검증할 변수</dt><dd>{selected.variable}</dd></div>
            <div><dt>주의사항</dt><dd>{selected.caution}</dd></div>
            {selected.reason ? <div><dt>사유</dt><dd>{selected.reason}</dd></div> : null}
          </dl>
          <div className="btn-row" style={{ marginTop: 16 }}>
            <EvidenceButton
              title="이 가설의 근거"
              groups={[
                { label: "고객 원문", items: itemsOf(campaign, selected.quoteIds) },
                {
                  label: "상품 정보",
                  items: (selected.productEvidence || []).map((item) => ({ text: item.text, source: item.source, locator: item.locator })),
                },
              ]}
            />
          </div>
          {error ? <div className="banner banner-error" role="alert" style={{ marginTop: 16 }}><p>{error}</p></div> : null}
          {panel === "edit" ? (
            <form onSubmit={saveEdit} style={{ marginTop: 16 }}>
              <Field label="가설 제목"><input type="text" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} /></Field>
              <div style={{ height: 10 }} />
              <Field label="핵심 메시지"><textarea value={draft.message} onChange={(event) => setDraft({ ...draft, message: event.target.value })} /></Field>
              <div style={{ height: 10 }} />
              <Field label="추천 광고 카피"><input type="text" value={draft.copy} onChange={(event) => setDraft({ ...draft, copy: event.target.value })} /></Field>
              <div className="btn-row" style={{ marginTop: 12 }}>
                <button className="btn btn-primary" type="submit">수정 반영</button>
                <button className="btn btn-secondary" type="button" onClick={() => setPanel(null)}>취소</button>
              </div>
            </form>
          ) : null}
          {panel === "hold" || panel === "reject" ? (
            <form
              style={{ marginTop: 16 }}
              onSubmit={(event) => {
                event.preventDefault();
                saveReason(panel === "hold" ? "보류" : "거부");
              }}
            >
              <Field label={panel === "hold" ? "보류 사유" : "거부 사유"}>
                <textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder={panel === "hold" ? "예: 다음 주 시즌 소재와 겹쳐서 순서를 미룸" : "예: 자극이 없다는 단정에 가까워 집행할 수 없음"} />
              </Field>
              <div className="btn-row" style={{ marginTop: 12 }}>
                <button className="btn btn-primary" type="submit">{panel === "hold" ? "보류로 저장" : "거부로 저장"}</button>
                <button className="btn btn-secondary" type="button" onClick={() => setPanel(null)}>취소</button>
              </div>
            </form>
          ) : null}
          <div className="btn-row" style={{ marginTop: 16 }}>
            {selected.status === "승인 대기" ? (
              <button type="button" className="btn btn-primary" onClick={() => approveHypothesis(campaign.id, selected.id)}>승인</button>
            ) : null}
            {selected.status === "실험 준비" ? (
              <a className="btn btn-primary" href={campaignPath(campaign.id, "experiment", selected.id)}>실험 등록으로 이동</a>
            ) : null}
            {selected.status === "실험 중" ? (
              <a className="btn btn-primary" href={campaignPath(campaign.id, "results")}>결과 입력으로 이동</a>
            ) : null}
            {selected.status === "실험 완료" ? (
              <a className="btn btn-primary" href={campaignPath(campaign.id, "learning")}>학습 이력 보기</a>
            ) : null}
            {(selected.status === "보류" || selected.status === "거부") ? (
              <button type="button" className="btn btn-primary" onClick={() => setHypothesisStatus(campaign.id, selected.id, "승인 대기", "")}>다시 검토</button>
            ) : null}
            <button type="button" className="btn btn-secondary" onClick={openEdit}>수정</button>
            <button type="button" className="btn btn-secondary" onClick={() => { setPanel("hold"); setError(""); }}>보류</button>
            <button type="button" className="btn btn-danger" onClick={() => { setPanel("reject"); setError(""); }}>거부</button>
          </div>
        </article>
      </div>
    </div>
  );
}
