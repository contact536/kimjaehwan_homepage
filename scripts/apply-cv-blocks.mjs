import fs from 'node:fs';
import profile from '../seed/researcher.json' with {type:'json'};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const career=profile.milestones.filter(m=>m.title.includes('취임'));
const company=profile.milestones.filter(m=>/특허|인증|KOITA/.test(m.title));
function timeline(items,education=false){return `<ol class="cv-timeline">${items.map(item=>`<li><div class="cv-date">${esc(item.date)}</div><div class="cv-event"><h3>${esc(item.title)}</h3>${education?`<span class="cv-state">${item.date.includes('입학')?'과정 재학':'학위 취득'}</span>`:''}<p>${esc(item.description)}</p></div></li>`).join('')}</ol>`}
const blocks=[
 {id:'career',title:'경력',caption:'연구와 제품 개발',content:timeline(career)},
 {id:'education',title:'학력',caption:'경영에서 AI 융합으로',content:timeline(profile.education,true)},
 {id:'company',title:'기업 주요 이력',caption:'XAIKOREA',content:timeline(company)},
];
const body=`<div class="kim-page cv-page"><p class="kim-overline">JAEHWAN KIM / CURRICULUM VITAE</p><h1>학력 · 경력</h1><p class="kim-lead">경영과 도메인 전문성을 AI 연구개발에 연결합니다.</p><div class="cv-layout"><aside class="cv-overview"><p class="cv-name">${esc(profile.name)} <span>${esc(profile.englishName)}</span></p><p>${esc(profile.role)}</p><nav aria-label="CV 섹션">${blocks.map(b=>`<a href="#cv-${b.id}">${b.title} <span aria-hidden="true">↓</span></a>`).join('')}</nav><a class="cv-contact" href="mailto:${esc(profile.email)}">${esc(profile.email)}</a><a class="cv-source" href="/pages/sources.html">자료 기준 확인 →</a></aside><div class="cv-blocks">${blocks.map(b=>`<section class="cv-block" id="cv-${b.id}" aria-labelledby="cv-${b.id}-heading" tabindex="-1"><p class="cv-caption">${b.caption}</p><h2 id="cv-${b.id}-heading">${b.title}</h2>${b.content}</section>`).join('')}</div></div></div>`;
const file='public/pages/experience.html';
let html=fs.readFileSync(file,'utf8');
if(!html.includes('/css/cv-blocks.css'))html=html.replace('</head>','<link rel="stylesheet" href="/css/cv-blocks.css"></head>');
html=html.replace(/(<main[^>]*>)[\s\S]*?(<\/main>)/,(_,open,close)=>open+body+close);
fs.writeFileSync(file,html);
console.log(`CV blocks generated: ${career.length} career, ${profile.education.length} education, ${company.length} company milestones.`);
