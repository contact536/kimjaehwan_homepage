import fs from 'node:fs';
import activityData from '../seed/academic-activities.json' with {type:'json'};

const esc = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[character]);
const activities = [...activityData.activities].sort((a, b) => b.date.localeCompare(a.date));
const cards = activities.map(item => `<article class="academic-activity" id="activity-${esc(item.id)}" tabindex="-1"><div class="activity-meta"><time datetime="${esc(item.date)}">${esc(item.date.replaceAll('-', '.'))}</time><span>${esc(item.participation)}</span></div><p class="activity-category">${esc(item.category)}</p><h3>${esc(item.title)}</h3><p class="activity-venue">장소 · ${esc(item.venue)}</p><p class="activity-summary">${esc(item.summary)}</p><div class="activity-insights"><div><h4>주요 내용</h4><ul>${item.highlights.map(highlight => `<li>${esc(highlight)}</li>`).join('')}</ul></div><aside aria-label="${esc(item.title)} 연구 연계"><h4>연구와의 연결</h4><p>${esc(item.researchConnection)}</p><a href="#taxia">TAXiA 연구 보기 →</a></aside></div></article>`).join('');
const start = '<!-- academic-activities:start -->';
const end = '<!-- academic-activities:end -->';
const section = `${start}<section class="academic-activities" id="academic-activities" aria-labelledby="academic-activities-heading"><header><p class="kim-overline">CONFERENCES &amp; FORUMS</p><h2 id="academic-activities-heading">학술대회 · 포럼 참가활동</h2><p>김재환의 참가·청강 활동에서 얻은 주요 내용과 세무·회계 AI 연구에 연결한 시사점을 정리합니다.</p></header><div class="academic-activity-list">${cards}</div></section>${end}`;
const file = 'public/pages/research.html';
let html = fs.readFileSync(file, 'utf8').replace(new RegExp(`${start}[\\s\\S]*?${end}`, 'gu'), '');
const anchor = '<!-- research-manuscripts:end -->';
if (!html.includes(anchor)) throw new Error('Generate journal manuscript status before academic activities.');
if (!html.includes('/css/academic-activities.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/css/academic-activities.css"></head>');
html = html.replace(anchor, anchor + section);
fs.writeFileSync(file, html);
console.log(`Published ${activities.length} conference and forum participation summaries.`);
