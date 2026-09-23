import fs from 'node:fs';

const file = 'public/pages/publications.html';
const start = '<!-- books:start -->';
const end = '<!-- books:end -->';
const section = `${start}<section class="book-publications" aria-labelledby="books-title"><header><p class="kim-overline">BOOKS · 2026</p><h2 id="books-title">서적</h2></header><article class="book-feature" id="agent-harness-book"><a class="book-cover" href="https://www.yes24.com/product/goods/195394388" target="_blank" rel="noopener noreferrer" aria-label="Agent Harness Engineering 예스24 상품 페이지"><img src="/assets/books/agent-harness-engineering.jpg" alt="Agent Harness Engineering - 에이전트 하네스 엔지니어링 공개 실습 핸드북 표지" width="1054" height="1493" loading="lazy" decoding="async"></a><div class="book-copy"><p class="book-format">EBOOK · IT 전문서</p><h3>Agent Harness Engineering</h3><p class="book-subtitle">에이전트 하네스 엔지니어링 공개 실습 핸드북</p><dl><div><dt>저자</dt><dd>김재환 · 윤재성</dd></div><div><dt>출판</dt><dd>작가와 · 2026.08.18</dd></div><div><dt>ISBN</dt><dd>9791143821027</dd></div><div><dt>형식</dt><dd>EPUB</dd></div></dl><p class="book-summary">Rule·Skill·MCP·TDD에서 Planner·Worker·Reviewer·Verifier 구조, 안전한 병렬 작업과 서비스 배포까지 연결하는 3주 공개 실습 과정입니다. 지침·도구·권한·절차·검증을 결합한 에이전트 하네스를 실제 저장소에 구현합니다.</p><nav aria-label="Agent Harness Engineering 서적 링크"><a href="https://www.yes24.com/product/goods/195394388" target="_blank" rel="noopener noreferrer">예스24에서 보기 ↗</a><a href="https://ridibooks.com/books/5273015231" target="_blank" rel="noopener noreferrer">리디에서 보기 ↗</a><a href="https://www.xaikorea.ai.kr/work" target="_blank" rel="noopener noreferrer">회사 프로젝트 보기 ↗</a></nav></div></article></section>${end}`;

let html = fs.readFileSync(file, 'utf8').replace(/<!-- books:start -->[\s\S]*?<!-- books:end -->/g, '');
html = html.replace('<article class="reading-entry" id="kortaxarena-note"', `${section}<article class="reading-entry" id="kortaxarena-note"`);
html = html.replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="김재환의 저서 Agent Harness Engineering, 연구 자료, 회사소개서와 사업 IR 자료.">');
if (!html.includes('/css/book-publications.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/css/book-publications.css"></head>');
fs.writeFileSync(file, html);

console.log('Book publication added: Agent Harness Engineering.');
