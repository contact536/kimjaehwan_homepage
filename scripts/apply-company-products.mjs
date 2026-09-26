import fs from 'node:fs';
import profile from '../seed/researcher.json' with {type: 'json'};

const file = 'public/pages/projects.html';
const start = '<!-- company-products:start -->';
const end = '<!-- company-products:end -->';
const officialWork = 'https://www.xaikorea.ai.kr/work';
const esc = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[character]);
const hoban = profile.companyNetwork.businessCollaborations.find(item => item.id === 'hoban-poc-agreement');
if (!hoban) throw new Error('Hoban PoC collaboration record is missing.');

const products = [
  { name: 'Evidence Finder', category: 'research', categoryLabel: 'RESEARCH', description: '연구 근거 탐색 및 출처 연결', result: '리서치 시간 85% 단축' },
  { name: 'Tax Navigator', category: 'tax', categoryLabel: 'TAX', description: '세무 규정·판례 질의 시스템', result: '답변 근거 추적률 100%' },
  { name: 'Policy Review', category: 'governance', categoryLabel: 'GOVERNANCE', description: '규정 문서 비교 및 변경점 검토', result: '검토 처리량 3.2배' },
  { name: 'Agent Harness', category: 'research', categoryLabel: 'RESEARCH', description: '에이전트 하네스 엔지니어링 교육·실험', result: 'AI 엔지니어링 체계화' },
  { name: 'Hoban AI Voice', category: 'governance', categoryLabel: 'GOVERNANCE', description: hoban.projectDescription, result: 'DECIVOX · 온디바이스·온프레미스', collaboration: hoban },
  { name: 'Edge AI Lab', category: 'research', categoryLabel: 'RESEARCH', description: 'Raspberry Pi 기반 엣지 AI 검증 환경', result: '현장형 프로토타입 구축' },
  { name: 'Secure Edge Gateway', category: 'governance', categoryLabel: 'GOVERNANCE', description: '로컬 데이터 보호를 위한 저장·연산 인프라', result: '데이터 통제 범위 강화' },
  { name: 'AI Governance Studio', category: 'governance', categoryLabel: 'GOVERNANCE', description: 'AI 전환 전략과 신뢰 운영 기준 연구', result: '산업 현장 인사이트 연결' },
  { name: 'Technology Protection', category: 'governance', categoryLabel: 'GOVERNANCE', description: '기술보호 선도기업 운영 체계', result: '기술·지식재산 보호 강화' },
  { name: 'On-Premise AI', category: 'research', categoryLabel: 'RESEARCH', description: '조직 내부에서 운영되는 AI 인프라 실증', result: '폐쇄망·로컬 환경 대응' },
  { name: 'Knowledge Engineering', category: 'research', categoryLabel: 'RESEARCH', description: '도메인 지식과 컴퓨팅 환경의 통합 검증', result: '현장 중심 검증 루프' },
  { name: 'Decision Room', category: 'tax', categoryLabel: 'TAX', description: '근거 중심 의사결정과 협업을 위한 공간', result: '판단 맥락 구조화' },
];

const cards = products.map((product, index) => {
  const collaboration = product.collaboration;
  const details = collaboration ? `<p class="company-product-subtitle">호반건설 PoC · 협업 사업화</p><details class="company-product-collaboration"><summary>지원사업 · 협약 정보</summary><dl class="company-product-facts">${collaboration.facts.filter(fact => ['지원사업', '주관기관', '지원기간'].includes(fact.label)).map(fact => `<div><dt>${esc(fact.label)}</dt><dd>${esc(fact.value)}</dd></div>`).join('')}</dl><a class="company-product-detail-link" href="/pages/company-network.html#${esc(collaboration.id)}">협약 내용 보기 ↗</a><a class="company-product-detail-link" href="${esc(collaboration.sourceUrl)}" target="_blank" rel="noopener noreferrer">회사 공식 프로젝트 보기 ↗</a></details>` : '';
  return `<article class="company-product-card"${collaboration ? ' id="hoban-voice-poc" tabindex="-1"' : ''} data-company-product data-category="${product.category}"><p class="company-product-index">${String(index + 1).padStart(2, '0')} · ${product.categoryLabel}</p><h3>${esc(product.name)}</h3><p class="company-product-description">${esc(product.description)}</p>${details}<p class="company-product-result"><span>${collaboration ? '개발 범위' : '공개 성과'}</span>${esc(product.result)}</p></article>`;
}).join('');

const section = `${start}<section class="company-products" aria-labelledby="company-products-title"><header><p class="kim-overline">XAIKOREA / SELECTED PROJECTS · 2023—2026</p><h2 id="company-products-title">회사 공개 제품·프로젝트</h2><p>회사 공식 홈페이지에서 공개한 12개 제품·실증·연구 프로젝트입니다. 기존 개인 연구 프로젝트와 구분해 회사 포트폴리오로 정리했습니다.</p></header><div class="company-product-filters" role="group" aria-label="제품 분야 필터"><button type="button" data-product-filter="all" aria-pressed="true">전체 <span>12</span></button><button type="button" data-product-filter="research" aria-pressed="false">연구 <span>5</span></button><button type="button" data-product-filter="tax" aria-pressed="false">세무 <span>2</span></button><button type="button" data-product-filter="governance" aria-pressed="false">거버넌스 <span>5</span></button></div><p class="company-product-count" aria-live="polite">12개 항목을 표시하고 있습니다.</p><div class="company-product-grid">${cards}</div><footer><p>자료 확인일: 2026.09.26 · 제품 설명과 성과 문구는 XAIKOREA 공식 홈페이지의 공개 내용을 그대로 요약한 회사 차원의 정보입니다. 김재환 개인의 단독 개발·성과를 뜻하지 않습니다.</p><a href="${officialWork}" target="_blank" rel="noopener noreferrer">회사 공식 프로젝트 페이지에서 확인 ↗</a></footer></section>${end}`;

let html = fs.readFileSync(file, 'utf8').replace(/<!-- company-products:start -->[\s\S]*?<!-- company-products:end -->/g, '');
html = html.replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="김재환의 CLOA, TAXiA, KorTaxArena 연구와 XAIKOREA의 공개 서비스, 내부 도구, 호반건설 PoC 협업 및 AI 프로젝트 포트폴리오.">');
html = html.replace('</div></main>', `${section}</div></main>`);
if (!html.includes('/css/company-products.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/css/company-products.css"></head>');
if (!html.includes('/js/company-products.js')) html = html.replace('</body>', '<script src="/js/company-products.js" defer></script></body>');
fs.writeFileSync(file, html);

console.log(`Company product portfolio generated: ${products.length} items.`);
