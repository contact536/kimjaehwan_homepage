import fs from 'node:fs';
import profile from '../seed/researcher.json' with {type: 'json'};
import serviceDirectory from '../seed/company-services.json' with {type: 'json'};

const file = 'public/pages/research.html';
const start = '<!-- company-research-update:start -->';
const end = '<!-- company-research-update:end -->';
const official = 'https://www.xaikorea.ai.kr/';
const directions = [
  {
    category: 'EVIDENCE & DISCOVERY',
    title: '근거 연결형 지식 탐색',
    description: '질문과 관련된 원문·규정·판례·보고서를 탐색하고, 답변의 출처와 맥락을 함께 제시하는 연구·제품 방향입니다.',
    projects: ['Evidence Finder · 연구 근거 탐색 및 출처 연결', 'Tax Navigator · 세무 규정·판례 질의 시스템', 'Decision Room · 근거 중심 의사결정과 협업 공간'],
  },
  {
    category: 'DOCUMENT & GOVERNANCE',
    title: '문서 지능과 신뢰 운영',
    description: '문서의 쟁점과 변경점을 비교하고, 권한·출처·평가·승인 이력을 운영 체계에 반영합니다.',
    projects: ['Policy Review · 규정 문서 비교 및 변경점 검토', 'AI Governance Studio · AI 전환 전략과 신뢰 운영 기준 연구', 'Technology Protection · 기술보호 운영 체계'],
  },
  {
    category: 'AGENT ENGINEERING',
    title: '에이전트·지식 엔지니어링',
    description: '에이전트 실험·교육과 도메인 지식·컴퓨팅 환경의 통합 검증을 반복 가능한 엔지니어링 절차로 체계화합니다.',
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
const filing = profile.companyCredentials.find(item => item.id === 'location-based-services-filing');
const softwareBusiness = profile.companyCredentials.find(item => item.id === 'software-business-confirmation');
const procurement = profile.companyCredentials.find(item => item.id === 'public-procurement-registration');
const checkedAt = [serviceDirectory.checkedAt, network.checkedAt].sort().at(-1);
const patentUpdate = `<section class="research-service-update" aria-labelledby="research-patent-progress"><p class="kim-overline">INTELLECTUAL PROPERTY / RESEARCH PROGRESS</p><h3 id="research-patent-progress">AI 추론 · 보안형 회의 기술의 지식재산 이력</h3><div class="company-research-grid">${(profile.patentUpdates ?? []).map(item => `<article class="company-research-card"><p class="company-research-category">${esc(item.status)} · ${esc(item.date)}</p><h4>${esc(item.title)}</h4><p>${esc(item.description)}</p><a href="/pages/patents.html#${esc(item.id)}">출원·심사 이력 보기 →</a></article>`).join('')}</div></section>`;
const companyBasisUpdate = `<aside class="research-service-update" aria-labelledby="research-company-basis"><p class="kim-overline">COMPANY OPERATIONS &amp; STARTUP COMMUNITY</p><h3 id="research-company-basis">기업 운영 · 입주 기반</h3><p>${esc(softwareBusiness.description)} 발급일은 ${esc(softwareBusiness.date)}입니다.</p><p>SAFEFLOW의 작업자 위치·구역 확인 및 안전관리 서비스에 대한 위치기반서비스사업 신고를 완료했습니다. 배민스타트업스퀘어 공식 입주사 소개에는 핀테크 분야의 세무 증빙 AI 워크프로세스로 XAIKOREA가 등재되어 있습니다.</p><nav aria-label="회사 운영 및 입주 이력"><a href="${esc(softwareBusiness.url)}">소프트웨어사업자 확인 내용 →</a><a href="/pages/company-network.html#${esc(filing.id)}">위치기반서비스사업 신고 내용 →</a><a href="/pages/company-network.html#baemin-startup-square">배민스타트업스퀘어 입주 소개 →</a></nav></aside>`;
const decivox = serviceDirectory.services.find(service => service.id === 'decivox');
const shapfinchResearch = network.researchIpPrograms.filter(item => ['d-testbed-2026', 'credit-ai-learning-platform'].includes(item.id));
const dataResearchUpdate = `<section class="research-service-update" aria-labelledby="research-shapfinch-data"><p class="kim-overline">SHAPFINCH / FINANCIAL DATA RESEARCH</p><h3 id="research-shapfinch-data">금융데이터로 검증하는 SHAPFINCH 연구</h3><p>금융 분석을 고도화하기 위해 데이터의 활용 가능성과 예측 모델의 설명가능성·안정성을 검증하는 XAIKOREA의 연구 활동입니다.</p><div class="company-research-grid">${shapfinchResearch.map(item => `<article class="company-research-card"><h4>${esc(item.organization)}</h4><p>${esc(item.description)}</p><p>${item.id === 'd-testbed-2026' ? '계약기간: ' + esc(item.facts.find(fact => fact.label === '계약기간').value) : '계약·서약일: ' + esc(item.date)}</p><a href="/pages/company-network.html#${esc(item.id)}">참여 내용 · 데이터 원칙 보기 →</a></article>`).join('')}</div><nav aria-label="SHAPFINCH 연구 관련 링크"><a href="#research-d-testbed-plan">D-테스트베드 · 4개 예정 연구 →</a><a href="/pages/projects.html#service-shapfinch">SHAPFINCH 서비스 소개 →</a></nav></section>`;
const serviceUpdate = `<aside class="research-service-update" aria-labelledby="research-service-update-heading"><p class="kim-overline">RESEARCH INTO PRACTICE</p><h3 id="research-service-update-heading">DECIVOX · 보안형 AI 회의록</h3><p>${esc(decivox.description)}</p><nav aria-label="연구 관련 서비스"><a href="/pages/projects.html#service-decivox">DECIVOX 기능·화면 보기 →</a><a href="/pages/projects.html#company-services">운영·공개 서비스 ${serviceDirectory.services.length}개와 시연 영상 보기 →</a></nav></aside>`;
const developmentUpdates = serviceDirectory.developmentProjects.map(project => `<aside class="research-service-update" aria-labelledby="research-${esc(project.id)}"><p class="kim-overline">IN DEVELOPMENT</p><h3 id="research-${esc(project.id)}">${esc(project.title)}</h3><p>${esc(project.summary)}</p>${project.notice ? `<p>${esc(project.notice)}</p>` : ''}<nav aria-label="개발 중인 세무·회계 AI 프로젝트"><a href="/pages/projects.html#${esc(project.id)}">개발 버전 소개·화면 보기 →</a></nav></aside>`).join('');
const escrowContractDate = network.technologyEscrow.facts.find(item => item.label === '계약 체결일').value;
const cooperationRecords = [
  ...network.businessCollaborations,
  ...network.technologyProtectionPrograms,
  ...network.researchIpPrograms,
  {id: 'technology-escrow', date: escrowContractDate, title: '보안형 회의 AI 기술자료 임치계약 체결'},
].sort((a, b) => b.date.localeCompare(a.date));
const cooperation = `<section class="company-research-milestones" aria-labelledby="research-cooperation-heading"><h3 id="research-cooperation-heading">협업 · 지식재산 · 데이터 연구 기반</h3><ol>${cooperationRecords.map(item => `<li><time datetime="${item.date.replaceAll('.', '-')}">${esc(item.date)}</time><a href="/pages/company-network.html#${esc(item.id)}">${esc(item.title)} ↗</a></li>`).join('')}</ol></section>`;
const section = `${start}<section class="company-research-update" aria-labelledby="company-research-title"><header><p class="kim-overline">COMPANY RESEARCH UPDATE · 2026.09.24</p><h2 id="company-research-title">회사 공개 연구·기술 동향</h2><p>XAIKOREA 공식 홈페이지에 공개된 연구·프로젝트 방향을 소개합니다. CLOA·TAXiA·KorTaxArena와 관련된 회사 차원의 기술 포트폴리오이며, 김재환 개인의 단독 연구 실적과 구분합니다.</p></header><div class="company-research-grid">${cards}</div><section class="company-research-milestones" aria-labelledby="company-research-milestones-title"><h3 id="company-research-milestones-title">최근 공개 이력</h3><ol><li><time datetime="2026-08-11">2026.08.11</time><span>온프레미스 AI 회의 인텔리전스 플랫폼 GUI·아이콘 디자인 화면집 v1.0 저작권 등록</span></li><li><time datetime="2026-08-03">2026.08.03</time><span>온프레미스 AI 회의 인텔리전스 플랫폼 v1.0 프로그램 저작권 등록</span></li><li><time datetime="2026-02-20">2026.02.20</time><span>연구개발전담부서 인정서 발급</span></li></ol></section><footer><p>자료 확인일: 2026.09.24 · 회사 홈페이지 공개 내용 기준. 프로젝트 명칭과 이력은 회사 차원의 공개 정보이며 개인 저자·발명자·담당 범위를 뜻하지 않습니다.</p><nav aria-label="XAIKOREA 공식 자료"><a href="${official}about" target="_blank" rel="noopener noreferrer">회사 소개에서 확인 ↗</a><a href="${official}work" target="_blank" rel="noopener noreferrer">공개 프로젝트 보기 ↗</a></nav></footer></section>${end}`;

let html = fs.readFileSync(file, 'utf8');
html = html.replace(new RegExp(`${start}[\\s\\S]*?${end}`, 'g'), '');
if (!html.includes('/css/company-research.css'))
  html = html.replace('</head>', '<link rel="stylesheet" href="/css/company-research.css"></head>');
html = html.replace('김재환 XAIKOREA 대표이사 겸 AI 연구원의 개인 연구자 플랫폼. CLOA, TAXiA, KorTaxArena와 세무회계 AI 연구.', '김재환의 CLOA, TAXiA, KorTaxArena 연구와 XAIKOREA의 근거 중심 AI·문서 지능·AI 거버넌스·온프레미스 연구 동향.');
const closing = html.lastIndexOf(html.includes('<!-- research-directory:end -->') ? '</div></div><!-- research-directory:end --></main>' : '</div></main>');
if (closing < 0) throw new Error('Research page closing marker was not found');
const updatedSection = section.replace('COMPANY RESEARCH UPDATE · 2026.09.24', `COMPANY RESEARCH UPDATE · ${checkedAt}`).replace('자료 확인일: 2026.09.24', `자료 확인일: ${checkedAt}`).replace('<section class="company-research-milestones"', `${serviceUpdate}${developmentUpdates}${cooperation}<section class="company-research-milestones"`);
const aboutSection = updatedSection
  .replace(`${developmentUpdates}${cooperation}`, `${developmentUpdates}${dataResearchUpdate}${companyBasisUpdate}${cooperation}`)
  .replace('<h3 id="research-company-basis">기업 운영 · 입주 기반</h3>', `<h3 id="research-company-basis">기업 운영 · 입주 기반</h3><p>${esc(procurement.description)}</p>`)
  .replace('<nav aria-label="회사 운영 및 입주 이력">', `<nav aria-label="회사 운영 및 입주 이력"><a href="${esc(procurement.url)}">나라장터 공공조달 등록 내용 →</a>`)
  .replace('<h3 id="company-research-milestones-title">최근 공개 이력</h3><ol>', `<h3 id="company-research-milestones-title">최근 공개 이력</h3><ol><li><time datetime="${softwareBusiness.date.replaceAll('.', '-')}">${esc(softwareBusiness.date)}</time><a href="${esc(softwareBusiness.url)}">소프트웨어사업자 일반현황 관리확인서 발급 ↗</a></li><li><time datetime="2026-10-08">2026.10.08</time><a href="${esc(filing.url)}">SAFEFLOW 위치기반서비스사업 신고 확인서 발급 ↗</a></li>`);
const currentSection = aboutSection
  .replace(serviceUpdate, patentUpdate + serviceUpdate)
  .replace('<nav aria-label="XAIKOREA 공식 자료">', '<nav aria-label="XAIKOREA 공식 자료"><a href="/pages/projects.html#company-service-visuals">서비스 설명 도식 안내 →</a>')
  .replace('<h3 id="company-research-milestones-title">최근 공개 이력</h3><ol>', `<h3 id="company-research-milestones-title">최근 공개 이력</h3><ol><li><time datetime="${procurement.date.replaceAll('.', '-')}">${esc(procurement.date)}</time><a href="${esc(procurement.url)}">나라장터 경쟁입찰참가자격 등록 갱신 ↗</a></li>`);
html = html.slice(0, closing) + currentSection + html.slice(closing);
fs.writeFileSync(file, html);
console.log('Applied the official XAIKOREA research and technology update.');
