import fs from 'node:fs';
import activityData from '../seed/academic-activities.json' with {type:'json'};

const esc = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[character]);
const activities = [...activityData.activities].sort((a, b) => b.date.localeCompare(a.date));
function relatedPress(item) {
  if (!item.articles?.length) return '';
  const id = `activity-${item.id}-press`;
  const links = item.articles.map(article => `<li><p class="activity-press-meta">${esc(article.publisher)} · 보도일 <time datetime="${esc(article.publishedAt)}">${esc(article.publishedAt.replaceAll('-', '.'))}</time></p><a class="activity-press-title" href="${esc(article.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(article.title)} · ${esc(article.publisher)} 기사 읽기 (새 탭)">${esc(article.title)} <span aria-hidden="true">↗</span></a><p class="activity-press-summary">${esc(article.summary)}</p></li>`).join('');
  return `<section class="activity-press" id="${esc(id)}" aria-labelledby="${esc(id)}-heading"><h4 id="${esc(id)}-heading">행사 관련 보도 <span>${item.articles.length}건</span></h4><ul>${links}</ul></section>`;
}
const cards = activities.map(item => `<article class="academic-activity" id="activity-${esc(item.id)}" tabindex="-1"><div class="activity-meta"><time datetime="${esc(item.date)}">${esc(item.date.replaceAll('-', '.'))}</time><span>${esc(item.participation)}</span></div><p class="activity-category">${esc(item.category)}</p><h3>${esc(item.title)}</h3><p class="activity-venue">장소 · ${esc(item.venue)}</p><p class="activity-summary">${esc(item.summary)}</p><div class="activity-insights"><h4>주요 내용</h4><ul>${item.highlights.map(highlight => `<li>${esc(highlight)}</li>`).join('')}</ul></div>${relatedPress(item)}</article>`).join('');
const start = '<!-- academic-activities:start -->';
const end = '<!-- academic-activities:end -->';
const section = `${start}<section class="academic-activities" id="academic-activities" aria-labelledby="academic-activities-heading"><header><p class="kim-overline">CONFERENCES &amp; FORUMS</p><h2 id="academic-activities-heading">학술대회 · 포럼 참가활동</h2><p>김재환이 참가·청강한 학술대회와 포럼의 주요 주제, 논의 내용과 관련 보도를 정리합니다.</p></header><div class="academic-activity-list">${cards}</div></section>${end}`;
const file = 'public/pages/research.html';
let html = fs.readFileSync(file, 'utf8').replace(new RegExp(`${start}[\\s\\S]*?${end}`, 'gu'), '');
const anchor = '<!-- research-manuscripts:end -->';
if (!html.includes(anchor)) throw new Error('Generate journal manuscript status before academic activities.');
if (!html.includes('/css/academic-activities.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/css/academic-activities.css"></head>');
html = html.replace(anchor, anchor + section);
fs.writeFileSync(file, html);
console.log(`Published ${activities.length} conference and forum participation summaries.`);
