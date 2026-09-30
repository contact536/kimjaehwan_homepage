import fs from 'node:fs';
import profile from '../seed/researcher.json' with {type:'json'};
import activityData from '../seed/academic-activities.json' with {type:'json'};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const career=[...(profile.career??[]),...profile.milestones.filter(m=>m.title.includes('취임'))].sort((a,b)=>String(b.date).localeCompare(String(a.date),'ko'));
const academicMemberships=[...(profile.academicMemberships??[])].sort((a,b)=>String(b.date).localeCompare(String(a.date),'ko'));
const academicActivities=[...activityData.activities].sort((a,b)=>b.date.localeCompare(a.date)).map(item=>({id:item.id,date:item.date.replaceAll('-','.'),title:item.title,status:item.participation,description:item.summary,url:`/pages/research.html#activity-${item.id}`,linkLabel:'주요 내용 · 연구와의 연결',activityPressCount:item.articles?.length??0}));
const company=[...(profile.companyCredentials??[]),...profile.milestones.filter(m=>m.title.includes('특허'))].sort((a,b)=>String(b.date).localeCompare(String(a.date),'ko'));
function photoGallery(item) {
 const photos=item.photos??[];
 if(!photos.length)return '';
 const panelId=`cv-${item.id}-photos`;
 const figures=photos.map(photo=>`<figure class="cv-activity-photo"><img src="${esc(photo.src)}" alt="${esc(photo.alt)}" width="${esc(photo.width)}" height="${esc(photo.height)}" loading="lazy" decoding="async"><figcaption>${esc(photo.caption)}</figcaption></figure>`).join('');
 return `<details class="cv-photos"><summary aria-controls="${esc(panelId)}">행사 사진 보기 <span>${photos.length}장</span></summary><p class="cv-photo-hint"><span class="cv-photo-hover-hint">마우스를 올려 미리 보거나 눌러 펼쳐 두세요.</span><span class="cv-photo-touch-hint">눌러서 사진을 펼치거나 접을 수 있습니다.</span></p><div class="cv-photo-panel" id="${esc(panelId)}"><header><strong>위촉 행사 사진</strong><button class="cv-photo-close" type="button" hidden>닫기 ×</button></header><div class="cv-photo-gallery">${figures}</div></div></details>`;
}
function relatedPress(item) {
 if(item.activityPressCount)return `<p class="cv-links"><a href="/pages/research.html#activity-${esc(item.id)}-press">행사 관련 보도 ${item.activityPressCount}건 보기 →</a></p>`;
 const coverage=item.pressCoverage;
 if(!coverage?.articles?.length)return '';
 const id=`cv-${item.id}-press`;
 const articles=coverage.articles.map(article=>`<li><p class="cv-press-meta">${esc(article.publisher)} · 보도일 <time datetime="${esc(article.publishedAt)}">${esc(article.publishedAt.replaceAll('-','.'))}</time></p><a class="cv-press-title" href="${esc(article.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(article.title)} · ${esc(article.publisher)} 기사 읽기 (새 탭)">${esc(article.title)} ↗</a><p class="cv-press-summary">${esc(article.summary)}</p></li>`).join('');
 return `<section class="cv-related-press" id="${esc(id)}" aria-labelledby="${esc(id)}-heading"><h4 id="${esc(id)}-heading">행사 관련 언론보도</h4><p class="cv-press-intro">${esc(coverage.summary)}</p><ul>${articles}</ul></section>`;
}
function timeline(items,education=false){return `<ol class="cv-timeline">${items.map(item=>{const state=education?(item.date.includes('입학')?'과정 재학':'학위 취득'):item.status;const links=[item.url?`<a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">${esc(item.linkLabel??'공식 홈페이지')} ↗</a>`:'',item.email?`<a href="mailto:${esc(item.email)}">${esc(item.email)}</a>`:''].filter(Boolean).join('');return `<li${item.id?` id="cv-${esc(item.id)}" tabindex="-1"`:''}><div class="cv-date">${esc(item.date)}</div><div class="cv-event"><h3>${esc(item.title??item.organization)}</h3>${state?`<span class="cv-state">${esc(state)}</span>`:''}<p>${esc(item.description)}</p>${links?`<p class="cv-links">${links}</p>`:''}${relatedPress(item)}${photoGallery(item)}</div></li>`}).join('')}</ol>`}
const blocks=[
 {id:'career',title:'경력 · 대외활동',caption:'연구·경영과 전문위원 활동',content:timeline(career)},
 {id:'memberships',title:'학술단체 회원자격',caption:'Professional memberships',content:timeline(academicMemberships)},
 {id:'activities',title:'학술대회 · 포럼 참가',caption:'Conferences & forums',content:timeline(academicActivities)},
 {id:'education',title:'학력',caption:'경영에서 AI 융합으로',content:timeline(profile.education,true)},
 {id:'company',title:'기업 주요 이력',caption:'XAIKOREA',content:timeline(company)},
];
const body=`<div class="kim-page cv-page"><p class="kim-overline">JAEHWAN KIM / CURRICULUM VITAE</p><h1>학력 · 경력</h1><p class="kim-lead">경영과 도메인 전문성을 AI 연구개발에 연결합니다.</p><div class="cv-layout"><aside class="cv-overview"><p class="cv-name">${esc(profile.name)} <span>${esc(profile.englishName)}</span></p><p>${esc(profile.role)}</p><nav aria-label="CV 섹션">${blocks.map(b=>`<a href="#cv-${b.id}">${b.title} <span aria-hidden="true">↓</span></a>`).join('')}</nav><a class="cv-contact" href="mailto:${esc(profile.email)}">${esc(profile.email)}</a><a class="cv-source" href="/pages/sources.html">자료 기준 확인 →</a></aside><div class="cv-blocks">${blocks.map(b=>`<section class="cv-block" id="cv-${b.id}" aria-labelledby="cv-${b.id}-heading" tabindex="-1"><p class="cv-caption">${b.caption}</p><h2 id="cv-${b.id}-heading">${b.title}</h2>${b.content}</section>`).join('')}</div></div></div>`;
const file='public/pages/experience.html';
let html=fs.readFileSync(file,'utf8');
if(!html.includes('/css/cv-blocks.css'))html=html.replace('</head>','<link rel="stylesheet" href="/css/cv-blocks.css"></head>');
if(!html.includes('/js/cv-photos.js'))html=html.replace('</body>','<script src="/js/cv-photos.js" defer></script></body>');
html=html.replace(/(<main[^>]*>)[\s\S]*?(<\/main>)/,(_,open,close)=>open+body+close);
fs.writeFileSync(file,html);
console.log(`CV blocks generated: ${career.length} career, ${academicMemberships.length} academic memberships, ${profile.education.length} education, ${company.length} company milestones.`);
