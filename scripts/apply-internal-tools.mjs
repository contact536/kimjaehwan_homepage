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

const image = item => `<figure><a class="internal-tool-preview" href="${esc(item.src)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(item.alt)} 크게 보기 (새 탭)"><img src="${esc(item.src)}" alt="${esc(item.alt)}" width="${item.width}" height="${item.height}" loading="lazy" decoding="async"><span aria-hidden="true">크게 보기 ↗</span></a><figcaption>${esc(item.caption)}</figcaption></figure>`;
const cards = tools.map((tool, index) => {
  const primary = tool.images.find(item => item.src.includes('workspace')) ?? tool.images[0];
  const additional = tool.images.filter(item => item !== primary);
  return `<article class="internal-tool" id="internal-tool-${esc(tool.id)}" tabindex="-1"><header><p>${String(index + 1).padStart(2, '0')} · INTERNAL TOOL</p><span>${esc(tool.status)}</span><h3>${esc(tool.name)} <small>${esc(tool.koreanName)}</small></h3><strong>${esc(tool.category)}</strong></header><p class="internal-tool-summary">${esc(tool.summary)}</p><p class="internal-tool-description">${esc(tool.description)}</p><ul>${tool.features.map(feature => `<li>${esc(feature)}</li>`).join('')}</ul><div class="internal-tool-gallery internal-tool-gallery-primary" aria-label="${esc(tool.name)} 작업 화면">${image(primary)}</div><details class="internal-tool-more"><summary>${esc(tool.name)} 추가 화면 ${additional.length}장 보기</summary><div class="internal-tool-gallery" aria-label="${esc(tool.name)} 추가 화면">${additional.map(image).join('')}</div></details></article>`;
}).join('');
const projectStart = '<!-- internal-tools:start -->';
const projectEnd = '<!-- internal-tools:end -->';
const projectSection = `${projectStart}<section class="internal-tools" id="internal-tools" aria-labelledby="internal-tools-title"><header><div><p class="kim-overline">XAIKOREA / INTERNAL AI TOOLCHAIN · 2026</p><h2 id="internal-tools-title">회사 내부 연구·운영 도구</h2><p>온프레미스 RAG 구축, 서적 스캔 문서 재생성, 인식 모델 학습을 연결하는 XAIKOREA 내부 도구 3종입니다. 모두 사내 전용이며 외부 접속 주소가 없습니다.</p></div><p class="internal-tools-count"><strong>03</strong><span>internal tools</span></p></header><nav class="internal-tool-nav" aria-label="내부 도구 바로가기">${tools.map(tool => `<a href="#internal-tool-${esc(tool.id)}">${esc(tool.name)}</a>`).join('')}</nav><div class="internal-tool-list">${cards}</div><footer><p>화면 제공일: 2026.09.25 · XAIKOREA 내부 서비스</p></footer></section>${projectEnd}`;

const projectFile = 'public/pages/projects.html';
let projectHtml = fs.readFileSync(projectFile, 'utf8');
projectHtml = projectHtml.replace(/<link\b[^>]*href="\/css\/internal-tools\.css(?:\?[^"]*)?"[^>]*>/gu, '');
projectHtml = projectHtml.replace('</head>', '<link rel="stylesheet" href="/css/internal-tools.css?v=20260926-2"></head>');
if (projectHtml.includes(projectStart)) projectHtml = projectHtml.replace(new RegExp(`${projectStart}[\\s\\S]*?${projectEnd}`), projectSection);
else if (projectHtml.includes('<!-- company-services:start -->')) projectHtml = projectHtml.replace('<!-- company-services:start -->', `${projectSection}<!-- company-services:start -->`);
else projectHtml = projectHtml.replace('<!-- company-products:start -->', `${projectSection}<!-- company-products:start -->`);
projectHtml = projectHtml.replace(/<meta name="description" content="[^"]*">/u, '<meta name="description" content="김재환의 AI 연구 프로젝트와 XAIKOREA의 내부 연구·운영 도구 3종, 운영 서비스 및 공개 프로젝트.">');
fs.writeFileSync(projectFile, projectHtml);

const homeStart = '<!-- internal-tools-home:start -->';
const homeEnd = '<!-- internal-tools-home:end -->';
const homeFile = 'public/index.html';
let homeHtml = fs.readFileSync(homeFile, 'utf8');
// Internal service descriptions belong to Projects, including on regeneration.
homeHtml = homeHtml.replace(new RegExp(`${homeStart}[\\s\\S]*?${homeEnd}`), '');
homeHtml = homeHtml.replace(/<link\b[^>]*href="\/css\/internal-tools\.css(?:\?[^"]*)?"[^>]*>/gu, '');
fs.writeFileSync(homeFile, homeHtml);

console.log(`Internal tools generated: ${tools.length} tools and ${tools.flatMap(tool => tool.images).length} screenshots.`);
