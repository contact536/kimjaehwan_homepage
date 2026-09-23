import fs from 'node:fs';
const link='<a href="https://www.xaikorea.ai.kr/" target="_blank" rel="noopener noreferrer">회사 홈페이지 · www.xaikorea.ai.kr ↗</a>';
for(const file of ['public/index.html','public/pages/contact.html','public/pages/projects.html','public/pages/publications.html']){
 let html=fs.readFileSync(file,'utf8');
 html=html.replace(/<!-- company-website:start -->[\s\S]*?<!-- company-website:end -->/g,'');
 const inline='<!-- company-website:start -->'+link+'<!-- company-website:end -->';
 const block='<!-- company-website:start --><p class="company-website">'+link+'</p><!-- company-website:end -->';
 if(file==='public/index.html')html=html.replace('<div class="academic-links">','<div class="academic-links">'+inline);
 else if(file.endsWith('contact.html'))html=html.replace('<p class="kim-small">XAIKOREA · 경기도 성남시</p>','<p class="kim-small">XAIKOREA · 경기도 성남시</p>'+block);
 else if(file.endsWith('publications.html'))html=html.replace('<h2 id="company-documents-title">회사 · 사업 자료</h2>','<h2 id="company-documents-title">회사 · 사업 자료</h2>'+block);
 else html=html.replace(/(<h1[^>]*>[\s\S]*?<\/h1>)/,'$1'+block);
 fs.writeFileSync(file,html);
}
