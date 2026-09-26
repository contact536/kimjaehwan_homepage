import fs from 'node:fs';
import p from '../seed/researcher.json' with {type:'json'};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const resources={
 cloa:{href:'/pages/patents.html',label:'관련 특허 출원',note:'XAIKOREA의 검색·응답 생성·근거 검증 관련 출원 현황'},
 taxia:{href:'/pages/experience.html#cv-career',label:'담당 역할과 경력',note:'제품 기획 및 연구개발 방향을 총괄하는 김재환 대표의 경력'},
 kortaxarena:{href:'/pages/publications.html#kortaxarena-note',label:'공개 자료 현황',note:'논문·데이터셋·코드 링크의 등록 상태'},
};
const file='public/pages/research.html';
let html=fs.readFileSync(file,'utf8').replace(/<!-- research-actions:start -->[\s\S]*?<!-- research-actions:end -->/g,'');
if(!html.includes('/css/research-actions.css'))html=html.replace('</head>','<link rel="stylesheet" href="/css/research-actions.css"></head>');
html=html.replace(/(<article class="kim-detail" id="([^"]+)"[^>]*>)([\s\S]*?)(<\/article>)/g,(match,open,id,body,close)=>{
 const r=p.research.find(r=>r.id===id);
 const v=r?.documentation?{href:r.documentation.url,label:r.documentation.title,note:r.documentation.description,external:true}:resources[id];
 if(!r||!v)return match;
 const mail=`mailto:${p.email}?subject=${encodeURIComponent(`[연구 협업] ${r.title} 문의`)}`;
 return `${open}${body}<!-- research-actions:start --><div class="research-actions"><nav aria-label="${esc(r.title)} 관련 자료와 문의"><a class="research-resource-link" href="${esc(v.href)}"${v.external?' target="_blank" rel="noopener noreferrer"':''}><strong>${esc(v.label)} <span aria-hidden="true">${v.external?'↗':'→'}</span></strong><span>${esc(v.note)}</span></a><a class="research-inquiry" href="${esc(mail)}">${esc(r.title)} 협업 문의 <span aria-hidden="true">↗</span></a></nav><p>협업 문의는 이메일 앱에서 열립니다. <a href="/pages/contact.html">연락처 보기</a></p></div><!-- research-actions:end -->${close}`;
});
fs.writeFileSync(file,html);
console.log('Added contextual resources and email inquiry links to three research entries.');
