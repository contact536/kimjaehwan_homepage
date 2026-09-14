import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';

test('assistant renders answer as text, shows sources and tool trace, and restores controls',async()=>{
 const elements:any=new Map();
 const get=(id:string)=>{if(!elements.has(id))elements.set(id,{value:'',hidden:false,disabled:false,textContent:'',children:[],events:{},addEventListener(name:string,fn:any){this.events[name]=fn;},append(child:any){this.children.push(child);},replaceChildren(){this.children=[];this.textContent='';},focus(){}});return elements.get(id);};
 const calls:string[]=[];
 vm.runInNewContext(fs.readFileSync('public/js/assistant.js','utf8'),{document:{getElementById:get,querySelectorAll:()=>[],createElement:()=>({})},AbortController,setTimeout,clearTimeout,fetch:async(url:string)=>{calls.push(url);return {ok:true,json:async()=>url.endsWith('/status')?{agent:{configured:true}}:{answer:'<script>untrusted</script>',sources:[{title:'CLOA',url:'/pages/research.html#cloa'},{title:'bad',url:'javascript:alert(1)'}],trace:[{tool:'search_research',query:'CLOA'}]}};}});
 get('question').value='CLOA';get('agentMode').value='ollama';
 await get('agentForm').events.submit({preventDefault(){}});
 assert.ok(calls.includes('/api/admin/agent'));
 assert.equal(get('agentAnswer').textContent,'<script>untrusted</script>');
 assert.equal(get('agentSources').children.length,1);
 assert.equal(get('agentSources').children[0].href,'/pages/research.html#cloa');
 assert.equal(get('agentTrace').hidden,false);
 assert.equal(get('agentTraceList').children[0].textContent,'연구 자료 검색 · CLOA');
 assert.equal(get('agentSubmit').disabled,false);
 assert.equal(get('agentCancel').hidden,true);
});
