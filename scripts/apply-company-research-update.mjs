import fs from 'node:fs';
import profile from '../seed/researcher.json' with {type: 'json'};

const file = 'public/pages/research.html';
const start = '<!-- company-research-update:start -->';
const end = '<!-- company-research-update:end -->';
const official = 'https://www.xaikorea.ai.kr/';
const directions = [
  {
    category: 'EVIDENCE & DISCOVERY',
    title: '근거 연결형 지식 탐색',
    description: '질문을 원문·규정·판례·보고서와 연결하고, 답변의 출처와 맥락을 함께 제시하는 연구·제품 방향입니다.',
    projects: ['Evidence Finder · 연구 근거 탐색 및 출처 연결', 'Tax Navigator · 세무 규정·판례 질의 시스템', 'Decision Room · 근거 중심 의사결정과 협업 공간'],
  },
  {
    category: 'DOCUMENT & GOVERNANCE',
    title: '문서 지능과 신뢰 운영',
    description: '문서의 쟁점과 변경점을 비교하고 권한·출처·평가·승인 이력을 운영 체계에 포함합니다.',
    projects: ['Policy Review · 규정 문서 비교 및 변경점 검토', 'AI Governance Studio · AI 전환 전략과 신뢰 운영 기준 연구', 'Technology Protection · 기술보호 운영 체계'],
  },
  {
    category: 'AGENT ENGINEERING',
    title: '에이전트·지식 엔지니어링',
    description: '에이전트 실험과 교육, 도메인 지식과 컴퓨팅 환경의 통합 검증을 반복 가능한 엔지니어링 과정으로 다룹니다.',
    projects: ['Agent Harness · 에이전트 하네스 엔지니어링 교육·실험', 'Knowledge Engineering · 도메인 지식과 컴퓨팅 환경의 통합 검증'],
  },
  {
    category: 'PRIVATE & EDGE AI',
    title: '온프레미스·엣지 AI',
    description: '민감한 조직 데이터를 내부에서 처리하고 현장 환경에서 검증할 수 있는 로컬 AI 인프라를 연구합니다.',
    projects: ['DECIVOX · Hoban AI Voice · 호반건설 PoC 기반 온프레미스 AI 회의록', 'Secure Edge Gateway · 로컬 데이터 보호를 위한 저장·연산 인프라', 'On-Premise AI · 조직 내부 AI 인프라 실증', 'Edge AI Lab · Raspberry Pi 기반 엣지 AI 검증 환경'],
  },
];

const cards = directions.map(item => `<article class="company-research-card"><p class="company-research-category">${item.category}</p><h3>${item.title}</h3><p>${item.description}</p><ul>${item.projects.map(project => `<li>${project}</li>`).join('')}</ul></article>`).join('');
const esc = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[character]);
const network = profile.companyNetwork;
const escrowContractDate = network.technologyEscrow.facts.find(item => item.label === '계약 체결일').value;
const cooperationRecords = [
  ...network.businessCollaborations,
  ...network.technologyProtectionPrograms,
  {id: 'technology-escrow', date: escrowContractDate, title: '보안형 회의 AI 기술자료 임치계약 체결'},
].sort((a, b) => b.date.localeCompare(a.date));
const cooperation = `<section class="company-research-milestones" aria-labelledby="research-cooperation-heading"><h3 id="research-cooperation-heading">협업 · 기술보호 기반</h3><ol>${cooperationRecords.map(item => `<li><time datetime="${item.date.replaceAll('.', '-')}">${esc(item.date)}</time><a href="/pages/company-network.html#${esc(item.id)}">${esc(item.title)} ↗</a></li>`).join('')}</ol></section>`;
const section = `${start}<section class="company-research-update" aria-labelledby="company-research-title"><header><p class="kim-overline">COMPANY RESEARCH UPDATE · 2026.09.24</p><h2 id="company-research-title">회사 공개 연구·기술 동향</h2><p>XAIKOREA 공식 홈페이지에 새로 공개된 연구·프로젝트 방향을 정리했습니다. 기존 CLOA·TAXiA·KorTaxArena 연구와 연결되는 회사 차원의 기술 포트폴리오이며, 아래 항목을 김재환 개인의 단독 연구 실적으로 표기하지 않습니다.</p></header><div class="company-research-grid">${cards}</div><section class="company-research-milestones" aria-labelledby="company-research-milestones-title"><h3 id="company-research-milestones-title">최근 공개 이력</h3><ol><li><time datetime="2026-08-11">2026.08.11</time><span>온프레미스 AI 회의 인텔리전스 플랫폼 GUI·아이콘 디자인 화면집 v1.0 저작권 등록</span></li><li><time datetime="2026-08-03">2026.08.03</time><span>온프레미스 AI 회의 인텔리전스 플랫폼 v1.0 프로그램 저작권 등록</span></li><li><time datetime="2026-02-20">2026.02.20</time><span>연구개발전담부서 인정서 발급</span></li></ol></section><footer><p>자료 확인일: 2026.09.24 · 회사 홈페이지 공개 내용 기준. 프로젝트 명칭과 이력은 회사 차원의 공개 정보이며 개인 저자·발명자·담당 범위를 뜻하지 않습니다.</p><nav aria-label="XAIKOREA 공식 자료"><a href="${official}about" target="_blank" rel="noopener noreferrer">회사 소개에서 확인 ↗</a><a href="${official}work" target="_blank" rel="noopener noreferrer">공개 프로젝트 보기 ↗</a></nav></footer></section>${end}`;

let html = fs.readFileSync(file, 'utf8');
html = html.replace(new RegExp(`${start}[\\s\\S]*?${end}`, 'g'), '');
if (!html.includes('/css/company-research.css'))
  html = html.replace('</head>', '<link rel="stylesheet" href="/css/company-research.css"></head>');
html = html.replace('김재환 XAIKOREA 대표이사 겸 AI 연구원의 개인 연구자 플랫폼. CLOA, TAXiA, KorTaxArena와 세무회계 AI 연구.', '김재환의 CLOA, TAXiA, KorTaxArena 연구와 XAIKOREA의 근거 중심 AI·문서 지능·AI 거버넌스·온프레미스 연구 동향.');
const closing = html.lastIndexOf('</div></main>');
if (closing < 0) throw new Error('Research page closing marker was not found');
const updatedSection = section.replace('COMPANY RESEARCH UPDATE · 2026.09.24', 'COMPANY RESEARCH UPDATE · 2026.09.26').replace('자료 확인일: 2026.09.24', '자료 확인일: 2026.09.26').replace('<section class="company-research-milestones"', `${cooperation}<section class="company-research-milestones"`);
html = html.slice(0, closing) + updatedSection + html.slice(closing);
fs.writeFileSync(file, html);
console.log('Applied the official XAIKOREA research and technology update.');
