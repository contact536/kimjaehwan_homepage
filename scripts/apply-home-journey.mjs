import fs from 'node:fs';
import profile from '../seed/researcher.json' with {type: 'json'};

const esc = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
})[character]);

const entries = [...(profile.companyCredentials ?? []), ...(profile.career ?? [])];
if (!entries.length) throw new Error('No managed records are available for the home Journey.');

const start = '<!-- home-current-journey:start -->';
const end = '<!-- home-current-journey:end -->';
const items = entries.map(entry => {
  const link = entry.url
    ? ` <a href="${esc(entry.url)}" target="_blank" rel="noopener noreferrer">${esc(entry.linkLabel ?? '공식 자료')} ↗</a>`
    : '';
  const isoDate = /^\d{4}\.\d{2}\.\d{2}$/u.test(entry.date) ? ` datetime="${entry.date.replaceAll('.', '-')}"` : '';
  return `<article class="kim-row"><time${isoDate}>${esc(entry.date)}</time><div><h3>${esc(entry.title)}${entry.status ? ` (${esc(entry.status)})` : ''}</h3><p>${esc(entry.description)}${link}</p></div></article>`;
}).join('');
const block = `${start}${items}${end}`;
const rowTitles = [...entries.map(entry => entry.title), 'XAIKOREA 벤처기업 인증', 'KOITA 연구전담부서 인정'];
const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const removeManagedRows = source => rowTitles.reduce((current, title) => current.replace(
  new RegExp(`<article class="kim-row">(?:(?!<\\/article>)[\\s\\S])*?<h3>${escapeRegExp(title)}(?: \\([^<]+\\))?<\\/h3>(?:(?!<\\/article>)[\\s\\S])*?<\\/article>`, 'gu'),
  '',
), source);

const file = 'public/index.html';
let html = removeManagedRows(fs.readFileSync(file, 'utf8'));
if (html.includes(start)) {
  html = html.replace(new RegExp(`${start}[\\s\\S]*?${end}`), block);
} else {
  html = html.replace(/<!-- home-career:start -->[\s\S]*?<!-- home-career:end -->/u, '');
  const heading = '<h2 class="section-title"><span class="section-number">03.</span> Journey</h2>';
  if (!html.includes(heading)) throw new Error('Home Journey heading was not found.');
  html = html.replace(heading, heading + block);
}
fs.writeFileSync(file, html);
console.log('Home Journey career item applied.');
