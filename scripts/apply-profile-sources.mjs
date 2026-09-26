import fs from 'node:fs';

const file = 'public/pages/sources.html';
let html = fs.readFileSync(file, 'utf8');
const start = '<!-- ai-membership-source:start -->';
const end = '<!-- ai-membership-source:end -->';
const item = `${start}<li><a href="/documents/xaikorea-ai-membership-2026.pdf" target="_blank" rel="noopener">경기도 AI 멤버십 기업 인증서</a>: 2026년 9월 1일</li><li><a href="/documents/xaikorea-technology-leading-company-2026.pdf" target="_blank" rel="noopener">기술보호 선도기업 지정서</a>: 2026년 6월 11일</li><li><a href="/documents/xaikorea-rnd-department-certificate-2026.pdf" target="_blank" rel="noopener">연구개발전담부서 인정서</a>: 2026년 2월 20일 · 제2026151302호</li><li><a href="/documents/xaikorea-venture-enterprise-certificate-2026.pdf" target="_blank" rel="noopener">벤처기업확인서</a>: 2026년 2월 4일 · 제20260204030008호</li><li><a href="/pages/patents.html">특허결정서 공개본 1건과 특허출원 관련 통지서 공개본 4건</a>: 2026년 2월 27일-7월 29일</li><li><a href="/pages/company-network.html">호반건설 PoC 협약 · 지식재산·데이터 연구 · 기술보호 지원사업 · 인재양성 협약 · 회사 회원자격 · 기술자료 임치</a>: XAIKOREA 공식 공개 자료</li><li><a href="/pages/company-network.html#academic-memberships">김재환 학술단체 회원자격 3건</a>: 사용자 제공 이력</li><li><a href="/pages/projects.html#internal-tools">회사 내부 연구·운영 도구 3종 화면</a>: 사용자 제공 내부 서비스 화면 · 2026.09.25</li><li><a href="/pages/research.html#company-press">연구·기업 활동 언론보도</a>: 회사 홈페이지 및 언론사 기사 공개 내용 · 보도일별 정리</li>${end}`;

html = html.replace(/<li><a href="\/documents\/xaikorea-(?:ai-membership|technology-leading-company)-2026\.pdf"[\s\S]*?<\/li>/gu, '');
if (html.includes(start)) html = html.replace(new RegExp(`${start}[\\s\\S]*?${end}`), item);
else html = html.replace('</ul>', item + '</ul>');
html = html.replace('증명서 원본은 공개하지 않습니다.', '학력·재직 증명서 원본은 공개하지 않으며, 공개 가능한 기업 인증서와 개인정보를 가린 특허출원 통지서는 논문·자료 및 지식재산 페이지에서 제공합니다.');
html = html.replace('공개 가능한 기업 인증서는 논문·자료 페이지에서 제공합니다.', '공개 가능한 기업 인증서와 개인정보를 가린 특허출원 통지서는 논문·자료 및 지식재산 페이지에서 제공합니다.');
fs.writeFileSync(file, html);
console.log('Profile source list updated with official company documents.');
