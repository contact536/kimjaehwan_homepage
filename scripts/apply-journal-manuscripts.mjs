import fs from 'node:fs';
import submissions from '../seed/journal-manuscripts.json' with {type:'json'};

const esc = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[character]);
const manuscripts = submissions.manuscripts.filter(item => item.status === 'under_review');
const status = item => `${item.reviewRound}차 심사 중`;
const date = item => `<time datetime="${esc(item.statusAsOf)}">${esc(item.statusAsOf.replaceAll('-', '.'))}</time>`;
const cards = manuscripts.map(item => `<article class="journal-manuscript" id="${esc(item.id)}" tabindex="-1"><p class="manuscript-status">${esc(status(item))}</p><h3>${esc(item.title)}</h3><dl><div><dt>투고 학술지</dt><dd>${esc(item.journal)}</dd></div><div><dt>상태 기준일</dt><dd>${date(item)}</dd></div></dl><p class="manuscript-summary">${esc(item.summary)}</p><a class="manuscript-permalink" href="#${esc(item.id)}" aria-label="${esc(item.title)} 항목 바로가기">항목 링크 #</a></article>`).join('');
const publicationSection = manuscripts.length ? `<section class="journal-manuscripts" id="journal-under-review" aria-labelledby="journal-under-review-heading"><header><p class="kim-overline">JOURNAL MANUSCRIPTS / UNDER REVIEW</p><h2 id="journal-under-review-heading">심사 중인 학술지 논문</h2></header><div class="journal-manuscript-list">${cards}</div></section>` : '';
const researchItems = manuscripts.map(item => `<article class="research-manuscript-item"><p class="manuscript-status">${esc(item.journal)} · ${esc(status(item))}</p><h3><a href="/pages/publications.html#${esc(item.id)}">${esc(item.title)} →</a></h3><p>상태 기준일 ${date(item)}</p></article>`).join('');
const researchSection = manuscripts.length ? `<section class="research-manuscripts" id="journal-under-review" aria-labelledby="research-manuscripts-heading"><p class="kim-overline">ONGOING RESEARCH</p><h2 id="research-manuscripts-heading">학술지 투고 · 심사 현황</h2>${researchItems}</section>` : '';

const css = '<link rel="stylesheet" href="/css/journal-manuscripts.css">';
function update(file, key, section, anchor, after = false) {
  const start = `<!-- ${key}:start -->`, end = `<!-- ${key}:end -->`;
  let html = fs.readFileSync(file, 'utf8').replace(new RegExp(`${start}[\\s\\S]*?${end}`, 'gu'), '');
  if (!html.includes(anchor)) throw new Error(`Missing manuscript insertion anchor in ${file}`);
  if (!html.includes('/css/journal-manuscripts.css')) html = html.replace('</head>', css + '</head>');
  const block = start + section + end;
  html = html.replace(anchor, after ? anchor + block : block + anchor);
  fs.writeFileSync(file, html);
}
update('public/pages/publications.html', 'journal-manuscripts', publicationSection, '<p class="kim-lead">진행 중인 연구와 공개 자료를 정리합니다.</p>', true);
update('public/pages/research.html', 'research-manuscripts', researchSection, '<!-- company-research-update:start -->');
console.log(`Journal review status published: ${manuscripts.length} manuscript(s).`);
