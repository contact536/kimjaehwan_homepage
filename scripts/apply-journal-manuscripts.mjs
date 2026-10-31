import fs from 'node:fs';
import submissions from '../seed/journal-manuscripts.json' with {type:'json'};

const esc = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[character]);
const manuscripts = submissions.manuscripts.filter(item => ['under_review', 'review_completed'].includes(item.status));
const status = item => item.statusLabel;
const date = item => `<time datetime="${esc(item.statusAsOf)}">${esc(item.statusAsOf.replaceAll('-', '.'))}</time>`;
const fullText = item => {
  const editions = [
    {file:item.fullText, language:'ko', label:'국문판', view:'국문판 보기 ↗', download:'국문 PDF 다운로드 ↓'},
    {file:item.englishFullText, language:'en', label:'영문판', view:'영문판 보기 ↗', download:'영문 PDF 다운로드 ↓'}
  ].filter(edition => edition.file);
  if (!editions.length) return '';
  return `<div class="manuscript-editions">${editions.map(({file,language,label,view,download}) => `<div class="manuscript-full-text" data-manuscript-language="${language}"><h4>${label}</h4><p>${esc(file.label)} · PDF · ${file.pages}쪽 · ${(file.bytes / 1000000).toFixed(1)} MB</p><div class="manuscript-file-actions"><a href="${esc(file.url)}" target="_blank" rel="noopener" aria-label="${esc(item.title)} ${label} 원문 보기 (PDF, 새 탭)">${view}</a><a href="${esc(file.url)}" download="${esc(file.downloadName)}" aria-label="${esc(item.title)} ${label} PDF 다운로드">${download}</a></div></div>`).join('')}</div>`;
};
const preview = item => item.firstPage ? `<details class="manuscript-preview" id="${esc(item.id)}-first-page"><summary>첫 페이지 보기 <span>1장</span></summary><figure><a href="${esc(item.firstPage.image)}" target="_blank" rel="noopener" aria-label="${esc(item.title)} 첫 페이지 확대 보기"><img src="${esc(item.firstPage.image)}" alt="${esc(item.title)} · ${esc(item.firstPage.label)}" width="${item.firstPage.width}" height="${item.firstPage.height}" loading="lazy" decoding="async"></a><figcaption>${esc(item.firstPage.label)} · <a href="${esc(item.firstPage.image)}" target="_blank" rel="noopener">확대 보기</a></figcaption></figure></details>` : '';
const cards = manuscripts.map(item => `<article class="journal-manuscript" id="${esc(item.id)}" tabindex="-1"><p class="manuscript-status">${esc(status(item))}</p><h3>${esc(item.title)}</h3><p class="manuscript-title-en" lang="en">${esc(item.titleEn)}</p><dl><div><dt>투고 학술지</dt><dd>${esc(item.journal)}</dd></div><div><dt>직전 심사결과</dt><dd>${esc(item.previousDecision)}</dd></div><div><dt>상태 기준일</dt><dd>${date(item)}</dd></div></dl><p class="manuscript-summary">${esc(item.summary)}</p><p class="manuscript-summary">${esc(item.resultsSummary)}</p><ul class="manuscript-keywords" aria-label="논문 키워드">${item.keywords.map(keyword => `<li>${esc(keyword)}</li>`).join('')}</ul>${fullText(item)}${preview(item)}<a class="manuscript-permalink" href="#${esc(item.id)}" aria-label="${esc(item.title)} 항목 바로가기">항목 링크 #</a></article>`).join('');
const publicationSection = manuscripts.length ? `<section class="journal-manuscripts" id="journal-under-review" aria-labelledby="journal-under-review-heading"><header><p class="kim-overline">JOURNAL MANUSCRIPTS / REVIEW STATUS</p><h2 id="journal-under-review-heading">학술지 투고 · 심사 현황</h2></header><div class="journal-manuscript-list">${cards}</div></section>` : '';
const researchItems = manuscripts.map(item => `<article class="research-manuscript-item"><p class="manuscript-status">${esc(item.journal)} · ${esc(status(item))}</p><h3><a href="/pages/publications.html#${esc(item.id)}">${esc(item.title)} →</a></h3><p class="manuscript-summary">${esc(item.summary)}</p><p>${esc(item.previousDecision)} · 상태 기준일 ${date(item)}</p>${fullText(item)}</article>`).join('');
const researchSection = manuscripts.length ? `<section class="research-manuscripts" id="journal-under-review" aria-labelledby="research-manuscripts-heading"><p class="kim-overline">ONGOING RESEARCH</p><h2 id="research-manuscripts-heading">학술지 투고 · 심사 현황</h2>${researchItems}</section>` : '';

const css = '<link rel="stylesheet" href="/css/journal-manuscripts.css">';
function update(file, key, section, anchor, after = false) {
  const start = `<!-- ${key}:start -->`, end = `<!-- ${key}:end -->`;
  let html = fs.readFileSync(file, 'utf8');
  const existing = new RegExp(`${start}[\\s\\S]*?${end}`, 'gu');
  if (!html.includes('/css/journal-manuscripts.css')) html = html.replace('</head>', css + '</head>');
  const block = start + section + end;
  if (html.includes(start)) html = html.replace(existing, block);
  else {
    if (!html.includes(anchor)) throw new Error(`Missing manuscript insertion anchor in ${file}`);
    html = html.replace(anchor, after ? anchor + block : block + anchor);
  }
  fs.writeFileSync(file, html);
}
update('public/pages/publications.html', 'journal-manuscripts', publicationSection, '<p class="kim-lead">진행 중인 연구와 공개 자료를 정리합니다.</p>', true);
update('public/pages/research.html', 'research-manuscripts', researchSection, '<!-- company-research-update:start -->');
console.log(`Journal review status published: ${manuscripts.length} manuscript(s).`);
