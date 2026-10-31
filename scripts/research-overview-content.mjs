import overview from '../seed/research-overview.json' with {type:'json'};
import sdg from '../seed/sdg-manuscripts.json' with {type:'json'};
import kortax from '../seed/kortax-manuscript.json' with {type:'json'};
import vision from '../seed/vision-manuscript.json' with {type:'json'};
import manufacturing from '../seed/manufacturing-agent-manuscript.json' with {type:'json'};
import submissions from '../seed/journal-manuscripts.json' with {type:'json'};
import profile from '../seed/researcher.json' with {type:'json'};

export {overview};
export const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const manuscriptLinks = [
  ...submissions.manuscripts.map(p=>({href:'#'+p.id,label:'회의 인텔리전스 · '+p.statusLabel})),
  {href:'#sdg-manuscripts',label:`SDG · 연구 중 ${sdg.manuscripts.length}개 주제`},
  {href:'#'+kortax.id,label:'KorTaxArena · '+kortax.statusLabel},
  {href:'#'+vision.id,label:'Vision · '+vision.statusLabel},
  {href:'#'+manufacturing.id,label:'제조 AI 리뷰 · '+manufacturing.statusLabel},
  {href:'#ksci-2026-edge-ai-paper',label:'학술대회 논문'},
  {href:'#books-title',label:'저서'},
];
export function topicCards(home=false) {
  return `<!-- research-topics:start --><div class="research-topics" aria-label="연구 분야별 탐색">${overview.areas.map((area,i)=>`<article class="research-topic" data-topic="${area.id}">${home?area.links.filter(l=>['cloa','taxia','kortaxarena'].includes(l.anchor)).map(l=>`<span id="research-${l.anchor}" class="research-anchor"></span>`).join(''):''}<p class="topic-label">${String(i+1).padStart(2,'0')} / ${esc(area.label)}</p><h3 class="topic-heading">${esc(area.title)}</h3><p class="topic-approach">${esc(area.summary)}</p><nav class="topic-destination" aria-label="${esc(area.title)} 상세">${area.links.map(l=>`<a href="${home?'/pages/research.html':''}#${l.anchor}">${esc(l.label)} <span aria-hidden="true">→</span></a>`).join('')}</nav></article>`).join('')}</div><!-- research-topics:end -->`;
}
export function scopeLinks() {
  return overview.areas.map(area=>`<a href="/pages/research.html#${area.links[0].anchor}">${esc(area.title)} →</a>`).join('');
}

// Keep the administrator's editable research descriptions available on the home page.
export function researchDetails() {
  return `<details class="research-profile-details"><summary>연구개발 상세 · CLOA / TAXiA / KorTaxArena</summary>${profile.research.map(item=>`<article><h3><a href="/pages/research.html#${item.id}" data-cms-research="${item.id}:name">${esc(item.title)}</a></h3><p data-cms-research="${item.id}:body">${esc(item.description)}</p></article>`).join('')}</details>`;
}
