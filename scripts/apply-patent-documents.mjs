import fs from 'node:fs';
import profile from '../seed/researcher.json' with {type: 'json'};

const esc = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[character]);
const patentId = (prefix, number) => `${prefix}-${number.replaceAll('-', '')}`;
const updates = profile.patentUpdates ?? [];
function processHistory(item) {
  if (!item.processSteps?.length) return '';
  return `<section class="patent-process" aria-labelledby="${esc(item.id)}-process"><h3 id="${esc(item.id)}-process">출원·심사 진행</h3><ol>${item.processSteps.map(step => `<li><time datetime="${esc(step.date.replaceAll('.', '-'))}">${esc(step.date)}</time><a href="${esc(step.sourceUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(step.title)} · 회사 공개 이력 보기 (새 탭)">${esc(step.title)} ↗</a></li>`).join('')}</ol></section>`;
}
const updateCards = updates.map(item => `<article class="patent-document patent-update" id="${esc(item.id)}" tabindex="-1"><div class="patent-copy"><p class="patent-sequence">XAIKOREA · ${esc(item.status)}</p><h2>${esc(item.title)}</h2><p>${esc(item.description)}</p><dl><div><dt>${esc(item.dateLabel)}</dt><dd>${esc(item.date)}</dd></div>${item.facts.map(fact => `<div><dt>${esc(fact.label)}</dt><dd>${esc(fact.value)}</dd></div>`).join('')}</dl>${processHistory(item)}<p class="patent-status-note">${esc(item.statusNote)}</p><div class="reading-links"><a href="${esc(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">회사 공개 이력 보기 ↗</a><a href="#${esc(item.id)}">항목 링크 #</a></div></div></article>`).join('');
const updateToc = updates.map(item => `<li><a href="#${esc(item.id)}"><span>${esc(item.date)} · ${esc(item.status)}</span>${esc(item.title)}</a></li>`).join('');

const decisions = (profile.patentDecisions ?? []).map((decision, index) => {
  const id = patentId('patent-decision', decision.number);
  const filename = `XAIKOREA_특허결정서_${decision.number}_공개용.pdf`;
  return `<article class="patent-document patent-decision" id="${id}" tabindex="-1"><a class="patent-preview" href="${esc(decision.url)}" target="_blank" rel="noopener" aria-label="${esc(decision.number)} 특허결정서 공개본 보기"><img src="${esc(decision.preview)}" alt="${esc(decision.number)} 특허결정서 공개본 미리보기" width="900" height="1273" loading="eager" decoding="async"></a><div class="patent-copy"><p class="patent-sequence">PATENT DECISION ${String(index + 1).padStart(2, '0')}</p><h2>${esc(decision.title)}</h2><dl><div><dt>출원번호</dt><dd>${esc(decision.number)}</dd></div><div><dt>결정일</dt><dd>${esc(decision.date)}</dd></div><div><dt>발급기관</dt><dd>${esc(decision.issuer)}</dd></div><div><dt>상태</dt><dd>${esc(decision.status)} · 설정등록 절차와 구분</dd></div><div><dt>공개본</dt><dd>${esc(decision.pages)}쪽 · 개인정보 및 민감정보 가림</dd></div></dl><div class="reading-links"><a href="${esc(decision.url)}" target="_blank" rel="noopener">결정서 보기 ↗</a><a href="${esc(decision.url)}" download="${filename}">다운로드 ↓</a><a href="#${id}" aria-label="${esc(decision.number)} 특허결정 항목 바로가기">항목 링크 #</a></div></div></article>`;
}).join('');

const applications = profile.patents.map((patent, index) => {
  const id = patentId('patent', patent.number);
  const filename = `XAIKOREA_출원번호통지서_${patent.number}_공개용.pdf`;
  return `<article class="patent-document" id="${id}" tabindex="-1"><a class="patent-preview" href="${esc(patent.url)}" target="_blank" rel="noopener" aria-label="${esc(patent.number)} 출원번호통지서 공개본 보기"><img src="${esc(patent.preview)}" alt="${esc(patent.number)} 출원번호통지서 공개본 미리보기" width="900" height="1273" loading="lazy" decoding="async"></a><div class="patent-copy"><p class="patent-sequence">PATENT APPLICATION ${String(index + 1).padStart(2, '0')}</p><h2>${esc(patent.title)}</h2><dl><div><dt>출원번호</dt><dd>${esc(patent.number)}</dd></div><div><dt>출원일</dt><dd>${esc(patent.date)}</dd></div><div><dt>상태</dt><dd>${esc(patent.status)}</dd></div><div><dt>공개본</dt><dd>${esc(patent.pages)}쪽 · 개인정보 가림 처리</dd></div></dl><div class="reading-links"><a href="${esc(patent.url)}" target="_blank" rel="noopener">통지서 보기 ↗</a><a href="${esc(patent.url)}" download="${filename}">다운로드 ↓</a><a href="#${id}" aria-label="${esc(patent.number)} 항목 바로가기">항목 링크 #</a></div></div></article>`;
}).join('');

const decisionToc = (profile.patentDecisions ?? []).map(decision => `<li><a href="#${patentId('patent-decision', decision.number)}"><span>${esc(decision.number)}</span>${esc(decision.title)} · 특허결정</a></li>`).join('');
const applicationToc = profile.patents.map(patent => `<li><a href="#${patentId('patent', patent.number)}"><span>${esc(patent.number)}</span>${esc(patent.title)} · 출원</a></li>`).join('');
const body = `<div class="kim-page reading-page patent-page"><p class="kim-overline">XAIKOREA / INTELLECTUAL PROPERTY</p><h1>지식재산</h1><p class="kim-lead">XAIKOREA의 AI 추론과 보안형 회의 음성 처리에 관한 특허 출원·심사·결정 이력을 정리합니다.</p><aside class="patent-notice"><strong>표기 기준</strong><p>XAIKOREA의 지식재산 이력을 소개합니다. 우선심사 진행 결정, 특허결정과 설정등록은 각각 구분해 표시합니다. 회사 차원의 이력이며 개인의 성과를 의미하지 않습니다. 공개 문서의 개인정보와 민감정보는 가림 처리했습니다.</p><a href="https://www.xaikorea.ai.kr/about#patent-applications" target="_blank" rel="noopener noreferrer">회사 공식 특허 자료 확인 ↗</a></aside><details class="reading-toc" open><summary>최근 출원·심사 ${updates.length}건 · 기존 특허결정 1건 · 출원 4건 바로가기</summary><nav aria-label="지식재산 목차"><ol>${updateToc}${decisionToc}${applicationToc}</ol></nav></details><section class="patent-list" aria-label="최근 출원·심사 이력과 기존 공개 자료">${updateCards}${decisions}${applications}</section></div>`;
const file = 'public/pages/patents.html';
let html = fs.readFileSync(file, 'utf8');
html = html.replace(/<link\b[^>]*href="\/css\/patent-documents\.css(?:\?[^"]*)?"[^>]*>/gu, '');
html = html.replace('</head>', '<link rel="stylesheet" href="/css/patent-documents.css?v=20261030-2"></head>');
html = html.replace(/(<main[^>]*>)[\s\S]*?(<\/main>)/u, (_, open, close) => open + body + close);
fs.writeFileSync(file, html);
console.log(`Patent document page generated: ${(profile.patentDecisions ?? []).length} decision and ${profile.patents.length} applications.`);
