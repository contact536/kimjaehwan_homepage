import fs from 'node:fs';
import paper from '../seed/kortax-manuscript.json' with {type:'json'};

const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tags = `<ul class="manuscript-keywords" aria-label="논문 키워드">${paper.keywords.map(tag => `<li>${esc(tag)}</li>`).join('')}</ul>`;
const preview = `<details class="manuscript-preview" id="kortaxarena-first-page"><summary>첫 페이지 보기 <span>1장</span></summary><figure><a href="${esc(paper.firstPage.image)}" target="_blank" rel="noopener" aria-label="KorTaxArena 연구 원고 첫 페이지 확대 보기"><img src="${esc(paper.firstPage.image)}" alt="${esc(paper.title)} · ${esc(paper.firstPage.label)}" width="${paper.firstPage.width}" height="${paper.firstPage.height}" loading="lazy" decoding="async"></a><figcaption>${esc(paper.firstPage.label)} · <a href="${esc(paper.firstPage.image)}" target="_blank" rel="noopener">확대 보기</a></figcaption></figure></details>`;
const publication = `<article class="reading-entry" id="${esc(paper.id)}" tabindex="-1"><p class="reading-meta">WORK IN PROGRESS · ${esc(paper.version)}</p><h2><a href="/pages/research.html#kortaxarena">${esc(paper.project)}</a></h2><p class="reading-status">${esc(paper.statusLabel)}</p><h3 lang="en">${esc(paper.title)}</h3><p class="reading-deck">${esc(paper.titleKo)}</p><p>${esc(paper.summary)}</p><p>${esc(paper.approach)}</p>${tags}${preview}<p class="kim-small">연구 현황 기준 <time datetime="${esc(paper.updatedAt)}">${esc(paper.updatedAt.replaceAll('-', '.'))}</time></p><div class="reading-links"><a href="/pages/research.html#kortaxarena">연구 소개 →</a><a href="#${esc(paper.id)}" aria-label="KorTaxArena 항목 바로가기">항목 링크 #</a></div></article>`;
let publications = fs.readFileSync('public/pages/publications.html', 'utf8');
const paperPattern = /<article class="reading-entry" id="kortaxarena-note"[^>]*>[\s\S]*?<\/article>/u;
if (!paperPattern.test(publications)) throw new Error('Missing KorTaxArena publication entry');
publications = publications.replace(paperPattern, publication);
fs.writeFileSync('public/pages/publications.html', publications);

let research = fs.readFileSync('public/pages/research.html', 'utf8');
const researchPattern = /(<article class="kim-detail" id="kortaxarena"[^>]*>)([\s\S]*?)(<!-- research-actions:start -->[\s\S]*?<\/article>)/u;
if (!researchPattern.test(research)) throw new Error('Missing KorTaxArena research entry');
research = research.replace(researchPattern, (_, open, body, actions) => `${open}<span class="kim-overline">${esc(paper.statusLabel)} · ${esc(paper.version)}</span><h2>KorTaxArena</h2><h3>LLM 생성 프로그램의 테스트 선택 연구</h3><p>${esc(paper.summary)}</p><p>${esc(paper.approach)}</p><p class="kim-small" lang="en">${esc(paper.title)}</p>${tags}${actions}`);
research = research.replace('논문·데이터셋·코드 링크의 등록 상태', '연구 중인 영문 개정 49안 · 첫 페이지 미리보기');
research = research.replace('공개 자료 현황 <span aria-hidden="true">→</span>', '연구 원고 · 첫 페이지 보기 <span aria-hidden="true">→</span>');
fs.writeFileSync('public/pages/research.html', research);
console.log('KorTaxArena working manuscript and first-page preview updated.');
