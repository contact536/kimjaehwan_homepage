import fs from 'node:fs';
import p from '../seed/researcher.json' with {type:'json'};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const panel=`<aside class="author-panel" aria-label="연구자 프로필"><a class="author-photo" href="/" aria-label="김재환 소개 페이지"><img src="/assets/jaehwan-kim.jpg" alt="김재환" width="1682" height="2528"></a><div class="author-info"><a class="author-name" href="/">${esc(p.name)}<span>${esc(p.englishName)}</span></a><p>${esc(p.role)}</p><nav aria-label="연구자 관련 링크"><a href="mailto:${esc(p.email)}">이메일 ↗</a><a href="/pages/experience.html">학력 · 경력 →</a><a href="/pages/research.html">연구 분야 →</a></nav></div></aside>`;
for(const name of ['publications','patents','sources','contact','company-network']){
 const file=`public/pages/${name}.html`;
 let html=fs.readFileSync(file,'utf8');
 html=html.replace(/<!-- author-layout:start -->[\s\S]*?<!-- author-layout:content -->/,'').replace('</div><!-- author-layout:end -->','');
 if(!html.includes('/css/author-panel.css'))html=html.replace('</head>','<link rel="stylesheet" href="/css/author-panel.css"></head>');
 html=html.replace(/(<main[^>]*>)([\s\S]*?)(<\/main>)/,(_,open,content,close)=>`${open}<!-- author-layout:start --><div class="author-layout">${panel}<!-- author-layout:content -->${content}</div><!-- author-layout:end -->${close}`);
 fs.writeFileSync(file,html);
}
console.log('Applied shared researcher panel to five supporting pages.');
