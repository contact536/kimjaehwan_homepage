import fs from 'node:fs';
import profile from '../seed/researcher.json' with {type: 'json'};

const esc = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
})[character]);

const tools = profile.internalTools ?? [];
if (tools.length !== 3) throw new Error('Exactly three internal tools are required.');

const image = item => `<figure><a href="${esc(item.src)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(item.alt)} 원본 이미지 새 탭에서 보기"><img src="${esc(item.src)}" alt="${esc(item.alt)}" width="${item.width}" height="${item.height}" loading="lazy" decoding="async"></a><figcaption>${esc(item.caption)}</figcaption></figure>`;
const cards = tools.map((tool, index) => `<article class="internal-tool" id="internal-tool-${esc(tool.id)}" tabindex="-1"><header><p>${String(index + 1).padStart(2, '0')} · INTERNAL TOOL</p><span>${esc(tool.status)}</span><h3>${esc(tool.name)} <small>${esc(tool.koreanName)}</small></h3><strong>${esc(tool.category)}</strong></header><p class="internal-tool-summary">${esc(tool.summary)}</p><p class="internal-tool-description">${esc(tool.description)}</p><ul>${tool.features.map(feature => `<li>${esc(feature)}</li>`).join('')}</ul><div class="internal-tool-gallery internal-tool-gallery-${tool.images.length}" aria-label="${esc(tool.name)} 화면">${tool.images.map(image).join('')}</div></article>`).join('');
const projectStart = '<!-- internal-tools:start -->';
const projectEnd = '<!-- internal-tools:end -->';
const projectSection = `${projectStart}<section class="internal-tools" id="internal-tools" aria-labelledby="internal-tools-title"><header><div><p class="kim-overline">XAIKOREA / INTERNAL AI TOOLCHAIN · 2026</p><h2 id="internal-tools-title">회사 내부 연구·운영 도구</h2><p>온프레미스 RAG 구축, 서적 스캔 문서 재생성, 인식 모델 학습을 연결하는 XAIKOREA 내부 도구 3종입니다. 모두 사내 전용이며 외부 접속 주소가 없습니다.</p></div><p class="internal-tools-count"><strong>03</strong><span>internal tools</span></p></header><div class="internal-tool-list">${cards}</div><footer><p>화면 제공일: 2026.09.25 · 사용자 제공 내부 서비스 화면을 기준으로 작성했습니다. 세 도구는 회사 내부에서만 운영하며 외부 주소와 계정 정보는 공개하지 않습니다.</p></footer></section>${projectEnd}`;

const projectFile = 'public/pages/projects.html';
let projectHtml = fs.readFileSync(projectFile, 'utf8');
if (!projectHtml.includes('/css/internal-tools.css')) projectHtml = projectHtml.replace('</head>', '<link rel="stylesheet" href="/css/internal-tools.css"></head>');
if (projectHtml.includes(projectStart)) projectHtml = projectHtml.replace(new RegExp(`${projectStart}[\\s\\S]*?${projectEnd}`), projectSection);
else if (projectHtml.includes('<!-- company-services:start -->')) projectHtml = projectHtml.replace('<!-- company-services:start -->', `${projectSection}<!-- company-services:start -->`);
else projectHtml = projectHtml.replace('<!-- company-products:start -->', `${projectSection}<!-- company-products:start -->`);
projectHtml = projectHtml.replace(/<meta name="description" content="[^"]*">/u, '<meta name="description" content="김재환의 AI 연구 프로젝트와 XAIKOREA의 내부 연구·운영 도구 3종, 운영 서비스 및 공개 프로젝트.">');
fs.writeFileSync(projectFile, projectHtml);

const homeStart = '<!-- internal-tools-home:start -->';
const homeEnd = '<!-- internal-tools-home:end -->';
const homeCards = tools.map(tool => `<article><img src="${esc(tool.images.at(-1).src)}" alt="${esc(tool.name)} 대표 화면" width="${tool.images.at(-1).width}" height="${tool.images.at(-1).height}" loading="lazy" decoding="async"><div><p>${esc(tool.category)}</p><h3>${esc(tool.name)} <small>${esc(tool.koreanName)}</small></h3><span>${esc(tool.summary)}</span></div></article>`).join('');
const homeSection = `${homeStart}<section class="section internal-tools-home" aria-labelledby="internal-tools-home-title"><div class="container"><header><p class="kim-overline">INSIDE XAIKOREA</p><h2 id="internal-tools-home-title">연구를 실제 업무로 연결하는 내부 도구</h2><p>온프레미스 RAG, 서적 스캔 문서 재생성, 정확도 향상 모델 학습을 위한 세 가지 사내 전용 서비스입니다.</p></header><div class="internal-tools-home-grid">${homeCards}</div><a class="btn btn-outline" href="/pages/projects.html#internal-tools">내부 도구 상세 보기 ↗</a></div></section>${homeEnd}`;
const homeFile = 'public/index.html';
let homeHtml = fs.readFileSync(homeFile, 'utf8');
if (!homeHtml.includes('/css/internal-tools.css')) homeHtml = homeHtml.replace('</head>', '<link rel="stylesheet" href="/css/internal-tools.css"></head>');
if (homeHtml.includes(homeStart)) homeHtml = homeHtml.replace(new RegExp(`${homeStart}[\\s\\S]*?${homeEnd}`), homeSection);
else homeHtml = homeHtml.replace('<section class="section"><div class="container"><h2 class="section-title"><span class="section-number">03.</span> Journey</h2>', `${homeSection}<section class="section"><div class="container"><h2 class="section-title"><span class="section-number">03.</span> Journey</h2>`);
fs.writeFileSync(homeFile, homeHtml);

console.log(`Internal tools generated: ${tools.length} tools and ${tools.flatMap(tool => tool.images).length} screenshots.`);
