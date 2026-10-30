import fs from 'node:fs';
import paper from '../seed/vision-manuscript.json' with {type:'json'};

const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tags = `<ul class="manuscript-keywords" aria-label="논문 키워드">${paper.keywords.map(tag => `<li>${esc(tag)}</li>`).join('')}</ul>`;
const preview = `<details class="manuscript-preview" id="vision-first-page"><summary>첫 페이지 보기 <span>1장</span></summary><figure><a href="${esc(paper.firstPage.image)}" target="_blank" rel="noopener" aria-label="Vision 연구 원고 첫 페이지 크게 보기 (새 탭)"><img src="${esc(paper.firstPage.image)}" alt="${esc(paper.title)} · ${esc(paper.firstPage.label)}" width="${paper.firstPage.width}" height="${paper.firstPage.height}" loading="lazy" decoding="async"></a><figcaption>${esc(paper.firstPage.label)} · <a href="${esc(paper.firstPage.image)}" target="_blank" rel="noopener">크게 보기 ↗</a></figcaption></figure></details>`;
const publication = `<article class="reading-entry" id="${esc(paper.id)}" tabindex="-1"><p class="reading-meta">WORK IN PROGRESS · ${esc(paper.version)}</p><h2>${esc(paper.project)}</h2><p class="reading-status">${esc(paper.statusLabel)}</p><h3 lang="en">${esc(paper.title)}</h3><p class="reading-deck">${esc(paper.titleKo)}</p><p>${esc(paper.summary)}</p><p>${esc(paper.approach)}</p>${tags}${preview}<p class="kim-small">연구 현황 기준 <time datetime="${esc(paper.updatedAt)}">${esc(paper.updatedAt.replaceAll('-', '.'))}</time></p><div class="reading-links"><a href="/pages/research.html#${esc(paper.researchId)}">연구 소개 →</a><a href="#${esc(paper.id)}" aria-label="Vision 논문 항목 바로가기">항목 링크 #</a></div></article>`;
const research = `<section class="research-manuscripts" id="${esc(paper.researchId)}" aria-labelledby="vision-research-heading"><p class="kim-overline">VISION / WORK IN PROGRESS</p><h2 id="vision-research-heading">${esc(paper.project)} 연구</h2><article class="research-manuscript-item"><p class="manuscript-status">${esc(paper.statusLabel)} · ${esc(paper.version)}</p><h3>${esc(paper.titleKo)}</h3><p class="manuscript-summary">${esc(paper.summary)}</p><p class="manuscript-summary">${esc(paper.approach)}</p>${tags}<a href="/pages/publications.html#${esc(paper.id)}">연구 원고 · 첫 페이지 보기 →</a></article></section>`;

function update(file, key, content, anchor, after = false) {
  const start = `<!-- ${key}:start -->`, end = `<!-- ${key}:end -->`;
  let html = fs.readFileSync(file, 'utf8').replace(new RegExp(`${start}[\\s\\S]*?${end}`, 'gu'), '');
  if (!anchor.test(html)) throw new Error(`Missing Vision insertion anchor in ${file}`);
  const block = start + content + end;
  html = html.replace(anchor, match => after ? match + block : block + match);
  fs.writeFileSync(file, html);
}
update('public/pages/publications.html', 'vision-manuscript', publication, /<article class="reading-entry" id="kortaxarena-note"[^>]*>[\s\S]*?<\/article>/u, true);
update('public/pages/research.html', 'vision-research', research, /<!-- research-manuscripts:start -->/u);
console.log('Vision working manuscript and first-page preview added.');
