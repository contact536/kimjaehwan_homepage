import fs from 'node:fs';
import directory from '../seed/company-services.json' with {type: 'json'};

const file = 'public/pages/projects.html';
const start = '<!-- company-services:start -->';
const end = '<!-- company-services:end -->';
const {services, checkedAt, sourceUrl, developmentProjects = []} = directory;
const videoCount = services.reduce((count, service) => count + service.videos.length, 0);
const esc = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[character]);

function previews(service) {
  if (!service.screens?.length) return '';
  return `<div class="company-service-previews"><details class="internal-tool-screens company-service-screens"><summary aria-controls="${esc(service.id)}-screens">화면 미리보기 <span>${service.screens.length}장</span></summary><div class="internal-tool-panel" id="${esc(service.id)}-screens"><header><strong>${esc(service.name)} 화면</strong><button type="button" class="internal-tool-close" aria-label="${esc(service.name)} 화면 미리보기 닫기" hidden>닫기 ×</button></header><div class="internal-tool-gallery" aria-label="${esc(service.name)} 화면">${service.screens.map(screen => `<figure><a class="internal-tool-preview company-service-screen${service.id === 'decivox' ? ' company-service-screen--desktop' : ''}" href="${esc(screen.src)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(screen.alt)} 크게 보기 (새 탭)"><img src="${esc(screen.src)}" alt="${esc(screen.alt)}" width="${screen.width}" height="${screen.height}" loading="lazy" decoding="async"><span aria-hidden="true">크게 보기 ↗</span></a><figcaption>${esc(screen.caption)}</figcaption></figure>`).join('')}</div></div></details></div>`;
}

function renderCard(service, index) {
  const videos = service.videos.length ? `<nav class="company-service-videos" aria-label="${esc(service.name)} 소개·시연 영상">${service.videos.map(video => `<a href="${esc(video.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(service.name)} ${esc(video.label)} ${esc(video.duration)} · 회사 홈페이지에서 보기"><span aria-hidden="true">▶</span> ${esc(video.label)} <span>${esc(video.duration)}</span> ↗</a>`).join('')}</nav>` : '';
  const logo = service.logoViewport ? `<svg class="company-service-logo" viewBox="${esc(service.logoViewport.viewBox)}" width="48" height="48" aria-hidden="true" focusable="false"><image href="${esc(service.logo)}" width="${service.logoViewport.width}" height="${service.logoViewport.height}"/></svg>` : `<img src="${esc(service.logo)}" alt="" width="256" height="256" loading="lazy" decoding="async">`;
  const design = service.design ? `<p class="company-service-design">${esc(service.design)}</p>` : '';
  const record = service.recordLink ? `<aside class="company-service-record"><p>${esc(service.recordLink.summary)}</p><a href="${esc(service.recordLink.url)}">${esc(service.recordLink.label)}</a></aside>` : '';
  return `<article class="company-service-card" id="service-${esc(service.id)}"><header>${logo}<div><p>${String(index + 1).padStart(2, '0')} · ${esc(service.category)}</p><h3>${esc(service.name)}</h3><span class="company-service-status">${esc(service.status)}</span></div></header>${design}<p class="company-service-description">${esc(service.description)}</p><ul>${service.features.map(feature => `<li>${esc(feature)}</li>`).join('')}</ul>${videos}${record}<footer><p><span>이용 안내</span>${esc(service.access)}</p><a href="${esc(service.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(service.name)} ${esc(service.action)} (새 탭)"><span>${esc(service.host)}</span>${esc(service.action)} ↗</a></footer>${previews(service)}</article>`;
}
const cards = services.map(renderCard).join('');
const developmentSections = developmentProjects.map(project => `<section class="company-services company-development" id="${esc(project.id)}" aria-labelledby="${esc(project.id)}-title"><header><div><p class="kim-overline">XAIKOREA / 개발 중인 프로젝트</p><h2 id="${esc(project.id)}-title">${esc(project.title)}</h2><p>${esc(project.summary)}</p></div></header><div class="company-service-grid">${project.versions.map(renderCard).join('')}</div><footer><p>자료 확인일: ${esc(checkedAt)} · 개발 중인 화면 예시로, 기능 제공 범위는 달라질 수 있습니다.</p><a href="${esc(project.sourceUrl)}" target="_blank" rel="noopener noreferrer">회사 WORK에서 확인 ↗</a></footer></section>`).join('');

const section = `${start}<section class="company-services" id="company-services" aria-labelledby="company-services-title"><header><div><p class="kim-overline">XAIKOREA / SERVICES IN PRACTICE · ${esc(checkedAt)}</p><h2 id="company-services-title">운영·공개 서비스</h2><p>회사 공식 홈페이지의 웹 서비스와 설치형 AI 제품 ${services.length}개를 주요 기능, 이용 방법과 함께 정리했습니다. 소개·시연 영상 ${videoCount}편은 각 카드에서 확인할 수 있습니다.</p></div><p class="company-services-count"><strong>${services.length}</strong><span>services in practice</span></p></header><div class="company-service-grid">${cards}</div><footer><p>자료 확인일: ${esc(checkedAt)} · XAIKOREA 공식 홈페이지 공개 정보 기준. 서비스는 회사 포트폴리오이며 김재환 개인의 단독 개발 실적을 뜻하지 않습니다.</p><a href="${esc(sourceUrl)}" target="_blank" rel="noopener noreferrer">회사 공식 서비스 목록에서 확인 ↗</a></footer></section>${end}`;

let html = fs.readFileSync(file, 'utf8');
html = html.replace(/<meta name="description" content="[^"]*">/u, `<meta name="description" content="김재환의 AI 연구 프로젝트와 XAIKOREA의 내부 도구, 웹 서비스·설치형 AI 제품 ${services.length}개 및 소개·시연 영상 ${videoCount}편.">`);
const completeSection = section.replace(end, developmentSections + end);
if (html.includes(start)) html = html.replace(new RegExp(`${start}[\\s\\S]*?${end}`, 'u'), completeSection);
else {
  const productMarker = '<!-- company-products:start -->';
  html = html.includes(productMarker) ? html.replace(productMarker, `${completeSection}${productMarker}`) : html.replace('</div></main>', `${completeSection}</div></main>`);
}
html = html.replace(/<link\b[^>]*href="\/css\/company-services\.css(?:\?[^"]*)?"[^>]*>/gu, '');
html = html.replace('</head>', '<link rel="stylesheet" href="/css/company-services.css?v=20261008-2"></head>');
if (!html.includes('/css/internal-tools.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/css/internal-tools.css?v=20260926-3"></head>');
if (!html.includes('/js/internal-tools.js')) html = html.replace('</body>', '<script src="/js/internal-tools.js?v=20260926-3" defer></script></body>');
fs.writeFileSync(file, html);
console.log(`Company service directory generated: ${services.length} services and ${videoCount} video links.`);
