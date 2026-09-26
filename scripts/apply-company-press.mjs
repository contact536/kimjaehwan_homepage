import fs from 'node:fs';
import press from '../seed/company-press.json' with {type:'json'};

const esc = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[character]);
const articles = [...press.articles].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
const metadata = article => `<p class="company-press-meta">${esc(article.publisher)} · 보도일 <time datetime="${esc(article.publishedAt)}">${esc(article.publishedAt.replaceAll('-', '.'))}</time></p>`;
const links = article => `<div class="company-press-links"><a href="${esc(article.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(article.title)} · ${esc(article.publisher)} 기사 읽기">기사 읽기 ↗</a><a href="${esc(article.relatedUrl)}">${esc(article.relatedLabel)} →</a></div>`;
const cards = articles.map(article => `<article class="company-press-card" id="press-${esc(article.id)}"><p class="company-press-category">${esc(article.category)}</p>${metadata(article)}<h3>${esc(article.title)}</h3><p class="company-press-summary">${esc(article.summary)}</p>${links(article)}</article>`).join('');
const start = '<!-- company-press:start -->';
const end = '<!-- company-press:end -->';
const section = `${start}<section class="company-press" id="company-press" aria-labelledby="company-press-heading"><header><p class="kim-overline">IN THE PRESS</p><h2 id="company-press-heading">언론 속 연구 · 기업 활동</h2><p>보안형 AI 연구 발표부터 서비스 개발, 지식재산과 기업 운영까지. 언론에 소개된 XAIKOREA의 활동과 관련 연구를 함께 살펴봅니다.</p></header><div class="company-press-grid">${cards}</div><footer><a href="${esc(press.sourceUrl)}" target="_blank" rel="noopener noreferrer">회사 홈페이지 언론보도 모아보기 ↗</a></footer></section>${end}`;
const css = '<link rel="stylesheet" href="/css/company-press.css">';
const strip = (html, first, last) => html.replace(new RegExp(`${first}[\\s\\S]*?${last}`, 'gu'), '');

const researchFile = 'public/pages/research.html';
let research = strip(fs.readFileSync(researchFile, 'utf8'), start, end);
const anchor = '<!-- company-research-update:end -->';
if (!research.includes(anchor)) throw new Error('Generate the company research update before the press section.');
if (!research.includes('/css/company-press.css')) research = research.replace('</head>', css + '</head>');
research = research.replace(anchor, anchor + section);
fs.writeFileSync(researchFile, research);

const homeStart = '<!-- company-press-home:start -->';
const homeEnd = '<!-- company-press-home:end -->';
const recent = articles.slice(0, 3).map(article => `<li>${metadata(article)}<a href="/pages/research.html#press-${esc(article.id)}">${esc(article.title)} →</a></li>`).join('');
const homeBlock = `${homeStart}<section class="section company-press-home" aria-labelledby="home-press-heading"><div class="container"><p class="kim-overline">IN THE PRESS</p><h2 id="home-press-heading">언론 속 연구 · 기업 활동</h2><ul>${recent}</ul><a class="btn btn-outline" href="/pages/research.html#company-press">언론보도 ${articles.length}건과 관련 연구 보기 →</a></div></section>${homeEnd}`;
const homeFile = 'public/index.html';
let home = strip(fs.readFileSync(homeFile, 'utf8'), homeStart, homeEnd);
const homeAnchor = '<!-- company-network-home:start -->';
if (!home.includes(homeAnchor)) throw new Error('Home company network anchor was not found.');
if (!home.includes('/css/company-press.css')) home = home.replace('</head>', css + '</head>');
home = home.replace(homeAnchor, homeBlock + homeAnchor);
fs.writeFileSync(homeFile, home);
console.log(`Published ${articles.length} attributed press summaries and ${Math.min(3, articles.length)} home links.`);
