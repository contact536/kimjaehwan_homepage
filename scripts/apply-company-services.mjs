import fs from 'node:fs';

const file = 'public/pages/projects.html';
const start = '<!-- company-services:start -->';
const end = '<!-- company-services:end -->';

const services = [
  { id: 'nh-hub', name: 'NH Open Business Hub', category: '기업금융 업무', description: '상담 자료와 팀의 검토 이력을 하나로 연결하는 AI 업무 워크스페이스입니다.', features: ['상담 자료 연결', '팀 공동 검토', '검토 이력 관리'], access: '초대 계정 필요 · NH 오픈이노베이션 시연용', url: 'https://hub.kimjaehwan.com/', host: 'hub.kimjaehwan.com' },
  { id: 'shapfinch', name: 'SHAPFINCH', category: '주택구매 인텔리전스', description: '금융·소비 데이터에서 주택구매 신호를 탐색하고 준비된 분석 결과를 살펴보는 공개 서비스입니다.', features: ['금융·소비 데이터', '주택구매 신호', '분석 결과 탐색'], access: '가입 없이 서비스 이용', url: 'https://www.shapfinch.co.kr/login', host: 'www.shapfinch.co.kr' },
  { id: 'hadong', name: '모두의 하동', category: 'AI 배리어프리 관람', description: '관심사에 맞는 이야기, 음성·대본 해설과 사진 읽기로 하동의 차 문화를 만나는 관광 안내 서비스입니다.', features: ['맞춤형 문화 해설', '음성·대본 안내', '사진 읽기'], access: '공개 서비스 · 시연용 관람 콘텐츠', url: 'https://hadong.xaikorea.ai.kr/', host: 'hadong.xaikorea.ai.kr' },
  { id: 'gongrok', name: '공록', category: '공공위원회 회의 기록', description: '회의 준비와 음성 전사부터 근거 검토, 담당자 승인과 공개본 작성까지 연결하는 AI 작업실입니다.', features: ['회의 음성 전사', '근거 검토·승인', '공개본 작성'], access: '기관 계정 또는 초대 토큰 필요', url: 'https://gongrok.xaikorea.ai.kr/', host: 'gongrok.xaikorea.ai.kr' },
  { id: 'brandpilot', name: 'BrandPilot', category: '브랜드 운영', description: '브랜드 계약, 상품과 판매보고를 연결하고 계약 조건·마감·검토·승인을 관리하는 워크스페이스입니다.', features: ['브랜드 계약 관리', '상품·판매보고', '마감·승인 관리'], access: '고객 전용 계정 필요', url: 'https://brandpilot.xaikorea.ai.kr/', host: 'brandpilot.xaikorea.ai.kr' },
  { id: 'markscope', name: 'MARKSCOPE', category: '상표 검색·출원 준비', description: '상표 검색과 AI 예비진단부터 상품 선택, 출원 준비와 검토까지 연결하는 지식재산권 업무 지원 플랫폼입니다.', features: ['상표 검색', 'AI 예비진단', '출원 준비·검토'], access: '피앤케이 국제특허법률사무소 운영 · XAIKOREA 제작', url: 'https://www.markscope.co.kr/', host: 'www.markscope.co.kr' },
  { id: 'safeflow', name: 'SAFEFLOW', category: '작업자 안전관제', description: '작업 시작부터 안전한 복귀까지 위치 확인, 안전 응답과 담당자의 대응 기록을 하나의 흐름으로 연결합니다.', features: ['위치·작업 확인', '안전 응답·SOS', '관제 대응 기록'], access: '로그인 없이 모의 체험 · 관제는 발급 계정 필요', url: 'https://safety.xaikorea.ai.kr/', host: 'safety.xaikorea.ai.kr' },
  { id: 'bizproof', name: 'BizProof', category: '기업 자격 확인', description: '하나의 기업 자격으로 구매사 등록과 지원사업 조건을 확인하고 기관별 제출과 검증 결과를 연결합니다.', features: ['기업 자격 재사용', '기관별 조건 확인', '제출·검증 결과'], access: '회원가입 없이 체험 · 가상 기업·합성 데이터 사용', url: 'https://bizproof.xaikorea.ai.kr/', host: 'bizproof.xaikorea.ai.kr' },
  { id: 'luma-inspect', name: 'Luma Inspect', category: 'AI 외관검사', description: '소량의 정상 이미지를 기준으로 이상을 탐지하고 PCB 샘플의 검사 결과와 히트맵을 함께 살펴봅니다.', features: ['정상 이미지 기준 학습', '이상 영역 탐지', '결과·히트맵 비교'], access: '회원가입 없이 제공된 샘플로 검사 체험', url: 'https://inspect.xaikorea.ai.kr/', host: 'inspect.xaikorea.ai.kr' },
  { id: 'docmatch', name: 'DocMatch', category: 'AI 거래문서 검증', description: '송장과 포장명세서의 품목·수량을 추출·대조해 정정, 검토·승인과 보고서 저장까지 연결합니다.', features: ['PDF·OCR 추출', '품목·수량 대조', '검토·보고서 저장'], access: '합성 문서로 체험 · 하루 최대 3회', url: 'https://docmatch.xaikorea.ai.kr/', host: 'docmatch.xaikorea.ai.kr' },
  { id: 'taxia-ops', name: 'TAXiA OPS', category: '회계·세무 검토 업무', description: '업무 접수부터 외부 원장과 전자세금계산서 대사, 예외 검토와 근거 보관까지 연결하는 업무공간입니다.', features: ['업무 접수·검토자 지정', '원장·증빙 대사', '예외 검토·근거 보관'], access: '일부 공개 운영 · 등록된 업무 계정으로 로그인', url: 'https://taxia.xaikorea.ai.kr/', host: 'taxia.xaikorea.ai.kr' },
];

const cards = services.map((service, index) => `<article class="company-service-card" id="service-${service.id}"><header><img src="/assets/company-services/${service.id}-logo-v1.webp" alt="" width="256" height="256" loading="lazy" decoding="async"><div><p>${String(index + 1).padStart(2, '0')} · ${service.category}</p><h3>${service.name}</h3></div></header><p class="company-service-description">${service.description}</p><ul>${service.features.map(feature => `<li>${feature}</li>`).join('')}</ul><footer><p><span>이용 안내</span>${service.access}</p><a href="${service.url}" target="_blank" rel="noopener noreferrer" aria-label="${service.name} 서비스 새 탭에서 보기"><span>${service.host}</span>서비스 보기 ↗</a></footer></article>`).join('');

const section = `${start}<section class="company-services" aria-labelledby="company-services-title"><header><div><p class="kim-overline">XAIKOREA / LIVE SERVICES · 2026.09.24</p><h2 id="company-services-title">운영·공개 서비스</h2><p>회사 홈페이지에 새로 공개된 11개 서비스를 실제 이용 주소, 주요 기능, 접근 방법과 함께 정리했습니다.</p></div><p class="company-services-count"><strong>11</strong><span>services in practice</span></p></header><div class="company-service-grid">${cards}</div><footer><p>자료 확인일: 2026.09.24 · XAIKOREA 공식 홈페이지 공개 정보 기준. 서비스는 회사 포트폴리오이며 김재환 개인의 단독 개발 실적을 뜻하지 않습니다.</p><a href="https://www.xaikorea.ai.kr/#demos" target="_blank" rel="noopener noreferrer">회사 공식 서비스 목록에서 확인 ↗</a></footer></section>${end}`;

let html = fs.readFileSync(file, 'utf8').replace(/<!-- company-services:start -->[\s\S]*?<!-- company-services:end -->/g, '');
html = html.replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="김재환의 CLOA, TAXiA, KorTaxArena 연구와 XAIKOREA의 운영 서비스 11개 및 공개 프로젝트 12개.">');
const productMarker = '<!-- company-products:start -->';
html = html.includes(productMarker) ? html.replace(productMarker, `${section}${productMarker}`) : html.replace('</div></main>', `${section}</div></main>`);
if (!html.includes('/css/company-services.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/css/company-services.css"></head>');
fs.writeFileSync(file, html);

console.log(`Company service directory generated: ${services.length} services.`);
