import fs from 'node:fs';
import p from '../seed/researcher.json' with {type:'json'};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const presentation={
 cloa:{category:'근거 기반 AI',summary:'세법 조문·예규·판례의 근거를 AI 응답에 연결하는 인용 연계 출력 구조를 연구합니다.',role:'CLOA 엔진 연구 및 기술개발 총괄',related:'/pages/patents.html',label:'관련 특허 출원',concepts:['법령 근거','인용 연결','응답 검증']},
 taxia:{category:'도메인 특화 제품',summary:'세무·회계 특화 LLM과 RAG를 세무사·회계사 사무소의 업무에 연결하는 B2B SaaS입니다.',role:'제품 기획 및 연구개발 방향 총괄',related:'/pages/contact.html',label:'협업 문의',concepts:['세무 · 회계','LLM · RAG','B2B SaaS']},
 kortaxarena:{category:'LLM 평가 연구',summary:'한국어 세무 도메인에서 LLM을 비교·평가하는 벤치마킹 연구를 진행합니다.',role:null,related:'/pages/publications.html',label:'공개 자료 현황',concepts:['한국어','세무 도메인','모델 평가']}
};
function row(r){const v=presentation[r.id];const docs=r.documentation;return `<article class="research-entry" data-research="${esc(r.id)}"><aside class="research-preview" aria-label="${esc(r.title)} 연구 분야"><span>${esc(v.category)}</span><strong>${esc(r.title)}</strong><ul>${v.concepts.map(c=>`<li>${esc(c)}</li>`).join('')}</ul></aside><div class="research-copy"><h3><a href="/pages/research.html#${esc(r.id)}">${esc(r.title)} <span>— ${esc(r.subtitle)}</span></a></h3><p class="research-meta">XAIKOREA <span aria-hidden="true">·</span> <span class="research-status">${esc(r.status)}</span></p>${v.role?`<p class="research-role">김재환 · ${esc(v.role)}</p>`:''}<nav class="research-resources" aria-label="${esc(r.title)} 자료 링크"><a href="/pages/research.html#${esc(r.id)}">연구 상세</a>${docs?`<span aria-hidden="true">/</span><a id="${esc(r.id)}-documentation" href="${esc(docs.url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(docs.title)} (새 탭)">공식 문서 ↗</a>`:''}<span aria-hidden="true">/</span><a href="${v.related}">${v.label}</a></nav><p class="research-summary">${esc(v.summary)}</p><details class="research-expand"><summary>${esc(r.title)} 상세 설명</summary><p>${esc(r.description)}</p><p class="research-source">자료 기준: ${esc(r.source)}</p></details></div></article>`}
for(const file of ['public/index.html','public/pages/projects.html','public/pages/about.html']){
 let html=fs.readFileSync(file,'utf8');
 if(!html.includes('/css/research-rows.css'))html=html.replace('</head>','<link rel="stylesheet" href="/css/research-rows.css"></head>');
 html=html.replace(/<a class="research-card kim-card" href="\/pages\/research.html#([^"]+)"[^>]*>[\s\S]*?<\/a>/g,(match,id)=>{const r=p.research.find(r=>r.id===id);return r?row(r):match});
 html=html.replace(/<article class="research-entry" data-research="([^"]+)"[^>]*>[\s\S]*?<\/article>/g,(match,id)=>{const r=p.research.find(r=>r.id===id);return r?row(r):match});
 html=html.replace('Selected research','Research & projects');
 fs.writeFileSync(file,html);
}
console.log('Applied research previews, direct resource links and native expandable descriptions.');
