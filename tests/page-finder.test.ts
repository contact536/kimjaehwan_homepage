import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
test('page finder filters multiple terms, handles empty results and Escape focus',()=>{
 const make=(textContent='')=>({textContent,hidden:false,handlers:{} as any,focused:false,addEventListener(name:string,fn:any){this.handlers[name]=fn},focus(){this.focused=true}});
 const links=[make('CLOA 근거 RAG'),make('TAXiA 세무 회계')];
 const input=Object.assign(make(),{value:''}),summary=make(),count=make(),empty=make();
 const finder=Object.assign(make(),{open:true,contains:()=>false,querySelector:(q:string)=>({'input':input,'summary':summary,'.finder-count':count,'.finder-empty':empty}[q]),querySelectorAll:()=>links});
 vm.runInNewContext(fs.readFileSync('public/js/page-finder.js','utf8'),{document:{querySelector:()=>finder,addEventListener(){}}});
 input.value='cloa RAG';input.handlers.input();
 assert.equal(links[0].hidden,false);assert.equal(links[1].hidden,true);
 input.value='없는단어';input.handlers.input();assert.equal(empty.hidden,false);
 input.value='';input.handlers.input();assert.equal(count.textContent,'2개 바로가기');
 finder.handlers.keydown({key:'Escape',stopPropagation(){}});assert.equal(finder.open,false);assert.equal(summary.focused,true);
});
test('public finder links resolve to existing pages and section anchors',()=>{
 const html=fs.readFileSync('public/index.html','utf8');
 const finder=html.match(/<details class="page-finder">[\s\S]*?<\/details>/)![0];
 const links=[...finder.matchAll(/href="([^"]+)"/g)];
 assert.equal(links.length,12);
 for(const [,href] of links){
  const [pathname,hash]=href.split('#');
  const page=fs.readFileSync('public'+(pathname==='/'?'/index.html':pathname),'utf8');
  if(hash)assert.ok(page.includes('id="'+hash+'"'),href);
 }
});
