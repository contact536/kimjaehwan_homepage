import fs from 'node:fs';
import data from '../seed/sdg-manuscripts.json' with {type:'json'};

const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const groupTitle = item => data.groups.find(group => group.id === item.group).title;
const tags = item => `<ul class="sdg-keywords" aria-label="연구 키워드">${item.keywords.map(tag => `<li>${esc(tag)}</li>`).join('')}</ul>`;
const preview = item => `<details class="sdg-preview"><summary>첫 페이지 보기 <span>${item.firstPages.length}장</span></summary><div class="sdg-first-pages">${item.firstPages.map(page => `<figure><a href="${esc(page.image)}" target="_blank" rel="noopener" aria-label="${esc(page.title)} · ${esc(page.label)} 확대 보기"><img src="${esc(page.image)}" alt="${esc(page.title)} · ${esc(page.label)}" width="${page.width}" height="${page.height}" loading="lazy" decoding="async"></a><figcaption>${esc(page.label)} · <a href="${esc(page.image)}" target="_blank" rel="noopener">확대 보기</a></figcaption></figure>`).join('')}</div></details>`;
const paperCards = data.manuscripts.map(item => `<article class="sdg-paper" id="${esc(item.id)}" tabindex="-1"><div class="sdg-paper-meta"><span class="sdg-status">${esc(data.statusLabel)}</span><span>${esc(groupTitle(item))}</span></div><h3>${esc(item.title)}</h3>${item.subtitle ? `<p class="sdg-subtitle">${esc(item.subtitle)}</p>` : ''}<p class="sdg-summary">${esc(item.summary)}</p><p class="sdg-approach"><strong>연구 접근</strong> ${esc(item.approach)}</p>${tags(item)}${preview(item)}<a class="sdg-permalink" href="#${esc(item.id)}">항목 링크 #</a></article>`).join('');
const publicationSection = `<section class="sdg-manuscripts" id="sdg-manuscripts" aria-labelledby="sdg-manuscripts-heading"><header><p class="kim-overline">SDG / WORK IN PROGRESS</p><h2 id="sdg-manuscripts-heading">연구 중인 SDG 논문</h2><p>환경혁신, 에너지·탄소와 AI 기술 측정을 다루는 7개 연구입니다. 연구별 개요와 원고의 첫 페이지를 소개합니다.</p><p class="sdg-update">연구 현황 기준 <time datetime="${esc(data.updatedAt)}">${esc(data.updatedAt.replaceAll('-', '.'))}</time> · <a href="/pages/research.html#sdg-research">주제별 연구 소개 →</a></p></header><nav class="sdg-paper-index" aria-label="SDG 연구 원고 바로가기">${data.manuscripts.map(item => `<a href="#${esc(item.id)}">${esc(item.shortTitle)}</a>`).join('')}</nav><div class="sdg-paper-list">${paperCards}</div></section>`;
const groups = data.groups.map(group => `<section class="sdg-research-group" aria-labelledby="sdg-group-${esc(group.id)}"><h3 id="sdg-group-${esc(group.id)}">${esc(group.title)}</h3><div class="sdg-research-grid">${data.manuscripts.filter(item => item.group === group.id).map(item => `<article class="sdg-research-card"><span class="sdg-status">${esc(data.statusLabel)}</span><h4>${esc(item.shortTitle)}</h4><p>${esc(item.summary)}</p><a href="/pages/publications.html#${esc(item.id)}">연구 원고 · 첫 페이지 보기 →</a></article>`).join('')}</div></section>`).join('');
const researchSection = `<section class="sdg-research" id="sdg-research" aria-labelledby="sdg-research-heading"><header><p class="kim-overline">SDG / ONGOING RESEARCH</p><h2 id="sdg-research-heading">SDG 연구 · 환경혁신과 지속가능한 전환</h2><p>기업의 환경혁신과 에너지 관리행태, 에너지·탄소 통계, 설비 전환과 AI 기술 측정을 연구합니다. 공개자료와 조사자료의 비교 조건, 분석 결과의 해석 범위를 검토하며 7개 원고를 작성하고 있습니다.</p><a href="/pages/publications.html#sdg-manuscripts">연구 중인 논문 · 첫 페이지 모아보기 →</a></header>${groups}</section>`;

function update(file, key, section, anchor) {
  let html = fs.readFileSync(file, 'utf8');
  const start = `<!-- ${key}:start -->`, end = `<!-- ${key}:end -->`;
  html = html.replace(new RegExp(`${start}[\\s\\S]*?${end}`, 'gu'), '');
  if (!html.includes(anchor)) throw new Error(`Missing SDG insertion anchor in ${file}`);
  html = html.replace(anchor, anchor + start + section + end);
  if (!html.includes('/css/sdg-manuscripts.css')) html = html.replace('</head>', '<link rel="stylesheet" href="/css/sdg-manuscripts.css"></head>');
  fs.writeFileSync(file, html);
}
update('public/pages/publications.html', 'sdg-manuscripts', publicationSection, '<!-- journal-manuscripts:end -->');
update('public/pages/research.html', 'sdg-research', researchSection, '<!-- research-manuscripts:end -->');
console.log(`SDG research published: ${data.manuscripts.length} studies, ${data.manuscripts.reduce((n,item) => n + item.firstPages.length, 0)} first-page previews.`);
