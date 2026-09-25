import fs from 'node:fs';
import profile from '../seed/researcher.json' with {type: 'json'};

const esc = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
})[character]);

const career = profile.career?.[0];
if (!career) throw new Error('No career record is available for the home Journey.');

const start = '<!-- home-career:start -->';
const end = '<!-- home-career:end -->';
const link = career.url
  ? ` <a href="${esc(career.url)}" target="_blank" rel="noopener noreferrer">${esc(career.linkLabel ?? '공식 자료')} ↗</a>`
  : '';
const block = `${start}<article class="kim-row"><time datetime="2026-02">${esc(career.date)}</time><div><h3>${esc(career.title)}${career.status ? ` (${esc(career.status)})` : ''}</h3><p>${esc(career.description)}${link}</p></div></article>${end}`;

const file = 'public/index.html';
let html = fs.readFileSync(file, 'utf8');
if (html.includes(start)) {
  html = html.replace(new RegExp(`${start}[\\s\\S]*?${end}`), block);
} else {
  const heading = '<h2 class="section-title"><span class="section-number">03.</span> Journey</h2>';
  if (!html.includes(heading)) throw new Error('Home Journey heading was not found.');
  html = html.replace(heading, heading + block);
}
fs.writeFileSync(file, html);
console.log('Home Journey career item applied.');
