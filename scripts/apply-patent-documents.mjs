import fs from 'node:fs';
import profile from '../seed/researcher.json' with {type: 'json'};

const esc = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[character]);
const cards = profile.patents.map((patent, index) => {
  const id = `patent-${patent.number.replaceAll('-', '')}`;
  const filename = `XAIKOREA_출원번호통지서_${patent.number}_공개용.pdf`;
  return `<article class="patent-document" id="${id}" tabindex="-1"><a class="patent-preview" href="${esc(patent.url)}" target="_blank" rel="noopener" aria-label="${esc(patent.number)} 출원번호통지서 공개본 보기"><img src="${esc(patent.preview)}" alt="${esc(patent.number)} 출원번호통지서 공개본 미리보기" width="900" height="1273" loading="lazy" decoding="async"></a><div class="patent-copy"><p class="patent-sequence">PATENT APPLICATION ${String(index + 1).padStart(2, '0')}</p><h2>${esc(patent.title)}</h2><dl><div><dt>출원번호</dt><dd>${esc(patent.number)}</dd></div><div><dt>출원일</dt><dd>${esc(patent.date)}</dd></div><div><dt>상태</dt><dd>${esc(patent.status)}</dd></div><div><dt>공개본</dt><dd>${esc(patent.pages)}쪽 · 개인정보 가림 처리</dd></div></dl><div class="reading-links"><a href="${esc(patent.url)}" target="_blank" rel="noopener">통지서 보기 ↗</a><a href="${esc(patent.url)}" download="${filename}">다운로드 ↓</a><a href="#${id}" aria-label="${esc(patent.number)} 항목 바로가기">항목 링크 #</a></div></div></article>`;
}).join('');
const toc = profile.patents.map(patent => `<li><a href="#patent-${patent.number.replaceAll('-', '')}"><span>${esc(patent.number)}</span>${esc(patent.title)}</a></li>`).join('');
const body = `<div class="kim-page reading-page patent-page"><p class="kim-overline">XAIKOREA / INTELLECTUAL PROPERTY</p><h1>지식재산</h1><p class="kim-lead">XAIKOREA가 공개한 AI 추론 관련 특허 출원 4건을 출원번호통지서 기준으로 정리합니다.</p><aside class="patent-notice"><strong>표기 기준</strong><p>아래 항목은 회사 차원의 특허 출원 현황입니다. 개인의 등록 특허로 표시하지 않으며, 공개본은 회사 홈페이지가 제공한 개인정보 가림본입니다.</p><a href="https://www.xaikorea.ai.kr/about#patent-applications" target="_blank" rel="noopener noreferrer">회사 공식 특허 자료 확인 ↗</a></aside><details class="reading-toc" open><summary>출원 4건 바로가기</summary><nav aria-label="특허 출원 목차"><ol>${toc}</ol></nav></details><section class="patent-list" aria-label="특허 출원번호통지서">${cards}</section></div>`;
const file = 'public/pages/patents.html';
let html = fs.readFileSync(file, 'utf8');
if (!html.includes('/css/patent-documents.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/css/patent-documents.css"></head>');
html = html.replace(/(<main[^>]*>)[\s\S]*?(<\/main>)/u, (_, open, close) => open + body + close);
fs.writeFileSync(file, html);
console.log(`Patent document page generated: ${profile.patents.length} applications.`);
