import fs from 'node:fs';
import profile from '../seed/researcher.json' with {type: 'json'};

const esc = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[character]);
const patentId = (prefix, number) => `${prefix}-${number.replaceAll('-', '')}`;

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
const body = `<div class="kim-page reading-page patent-page"><p class="kim-overline">XAIKOREA / INTELLECTUAL PROPERTY</p><h1>지식재산</h1><p class="kim-lead">XAIKOREA가 공개한 특허결정 1건과 AI 추론 관련 특허 출원 4건을 공식 공개 자료 기준으로 정리합니다.</p><aside class="patent-notice"><strong>표기 기준</strong><p>아래 항목은 XAIKOREA의 회사 차원 지식재산 이력입니다. 특허결정과 설정등록은 서로 다른 절차로 구분해 표시하며, 개인 성과로 표시하지 않습니다. 공개본은 개인정보 가림본이며 민감정보도 가렸습니다.</p><a href="https://www.xaikorea.ai.kr/about#patent-applications" target="_blank" rel="noopener noreferrer">회사 공식 특허 자료 확인 ↗</a></aside><details class="reading-toc" open><summary>특허결정 1건 · 출원 4건 바로가기</summary><nav aria-label="지식재산 목차"><ol>${decisionToc}${applicationToc}</ol></nav></details><section class="patent-list" aria-label="특허결정서와 출원번호통지서">${decisions}${applications}</section></div>`;
const file = 'public/pages/patents.html';
let html = fs.readFileSync(file, 'utf8');
if (!html.includes('/css/patent-documents.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/css/patent-documents.css"></head>');
html = html.replace(/(<main[^>]*>)[\s\S]*?(<\/main>)/u, (_, open, close) => open + body + close);
fs.writeFileSync(file, html);
console.log(`Patent document page generated: ${(profile.patentDecisions ?? []).length} decision and ${profile.patents.length} applications.`);
