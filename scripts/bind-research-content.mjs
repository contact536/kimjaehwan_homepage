import fs from 'node:fs';
const mark=(id,key)=>`data-cms-research="${id}:${key}"`;
for(const name of ['index.html','pages/about.html','pages/projects.html','pages/research.html','pages/publications.html']){
 const file='public/'+name;let html=fs.readFileSync(file,'utf8');
 html=html.replace(/ data-cms-research="[^"]+"/g,'');
 html=html.replaceAll('— <span>','<span>— ').replaceAll('<p class="cms-body">','<p>');
 // Unwrap only the name spans introduced by this transform.
 html=html.replace(/<span class="cms-name">([^<]*)<\/span>/g,'$1');
 html=html.replace(/(<article class="research-entry" data-research="([^"]+)"[^>]*>)([\s\S]*?)(<\/article>)/g,(_,open,id,body,close)=>{
  body=body.replace('<strong>',`<strong ${mark(id,'name')}>`).replace(/(<h3><a[^>]*>)([^<]*)(<span>)/,(_,a,title,b)=>`${a}<span class="cms-name" ${mark(id,'name')}>${title.trim()}</span> ${b}`).replace('<span>— ',`— <span ${mark(id,'subtitle')}>`).replace('<p class="research-summary">',`<p class="research-summary" ${mark(id,'summary')}>`).replace(/(<summary>[\s\S]*?<\/summary>)<p>/,`$1<p ${mark(id,'body')}>`);
  return open+body+close;
 });
 html=html.replace(/(<article class="kim-detail" id="([^"]+)"[^>]*>)([\s\S]*?)(<\/article>)/g,(_,open,id,body,close)=>open+body.replace('<h2>',`<h2 ${mark(id,'name')}>`).replace('<h3>',`<h3 ${mark(id,'subtitle')}>`).replace('<p>',`<p class="cms-body" ${mark(id,'body')}>`)+close);
 if(name==='pages/publications.html')html=html.replace('<a href="/pages/research.html#kortaxarena">KorTaxArena</a>',`<a href="/pages/research.html#kortaxarena" ${mark('kortaxarena','name')}>KorTaxArena</a>`).replace('<p class="reading-deck">',`<p class="reading-deck" ${mark('kortaxarena','summary')}>`);
 fs.writeFileSync(file,html);
}
console.log('Research field bindings added to five public pages.');
