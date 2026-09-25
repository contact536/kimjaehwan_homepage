import fs from 'node:fs';
import profile from '../seed/researcher.json' with {type: 'json'};

const esc = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
})[character]);

const dateOrder = entry => {
  const match = String(entry.date).match(/^(\d{4})\.(\d{2})(?:\.(\d{2}))?/u);
  return match ? Number(`${match[1]}${match[2]}${match[3] ?? '50'}`) : 0;
};
const entries = [...(profile.companyCredentials ?? []), ...(profile.career ?? []), ...(profile.milestones ?? [])]
  .sort((left, right) => dateOrder(right) - dateOrder(left));
if (!entries.length) throw new Error('No managed records are available for the home Journey.');

const start = '<!-- home-current-journey:start -->';
const end = '<!-- home-current-journey:end -->';
const items = entries.map(entry => {
  const opensNewWindow = entry.url && (!entry.url.startsWith('/') || entry.url.endsWith('.pdf'));
  const attributes = opensNewWindow ? ' target="_blank" rel="noopener noreferrer"' : '';
  const link = entry.url
    ? ` <a href="${esc(entry.url)}"${attributes}>${esc(entry.linkLabel ?? '공식 자료')} ↗</a>`
    : '';
  const isoDate = /^\d{4}\.\d{2}\.\d{2}$/u.test(entry.date) ? ` datetime="${entry.date.replaceAll('.', '-')}"` : '';
  return `<article class="kim-row"><time${isoDate}>${esc(entry.date)}</time><div><h3>${esc(entry.title)}${entry.status ? ` (${esc(entry.status)})` : ''}</h3><p>${esc(entry.description)}${link}</p></div></article>`;
}).join('');
const block = `${start}${items}${end}`;
const retiredTitles = ['AI 추론 관련 특허 4건 출원', 'XAIKOREA 벤처기업 인증', 'KOITA 연구전담부서 인정', 'aSSIST · SDG 박사과정 입학', '한국외국어대학교 MBA 취득'];
const rowTitles = [...entries.map(entry => entry.title), ...retiredTitles];
const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const removeManagedRows = source => rowTitles.reduce((current, title) => current.replace(
  new RegExp(`<article class="kim-row">(?:(?!<\\/article>)[\\s\\S])*?<h3>${escapeRegExp(title)}(?: \\([^<]+\\))?<\\/h3>(?:(?!<\\/article>)[\\s\\S])*?<\\/article>`, 'gu'),
  '',
), source);

const file = 'public/index.html';
const heading = '<h2 class="section-title"><span class="section-number">03.</span> Journey</h2>';
const introStart = '<!-- home-journey-intro:start -->';
const introEnd = '<!-- home-journey-intro:end -->';
const intro = `${introStart}<p class="kim-section-intro">학업과 연구, 경영 활동 및 XAIKOREA의 주요 기술·기업 이력을 시간순으로 정리했습니다.</p>${introEnd}`;
let html = removeManagedRows(fs.readFileSync(file, 'utf8'));
if (!html.includes(heading)) throw new Error('Home Journey heading was not found.');
if (html.includes(introStart)) html = html.replace(new RegExp(`${introStart}[\\s\\S]*?${introEnd}`), intro);
else html = html.replace(heading, heading + intro);
if (html.includes(start)) html = html.replace(new RegExp(`${start}[\\s\\S]*?${end}`), block);
else {
  html = html.replace(/<!-- home-career:start -->[\s\S]*?<!-- home-career:end -->/u, '');
  html = html.replace(introEnd, introEnd + block);
}
fs.writeFileSync(file, html);
console.log(`Home Journey generated: ${entries.length} chronological entries.`);
