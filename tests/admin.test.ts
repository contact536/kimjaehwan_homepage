import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

test('admin selection updates immediately and collection changes reset search with empty state', async () => {
 class Element {
  children:any[]=[]; dataset:any={}; attributes:any={}; textContent=''; value=''; hidden=false; disabled=false; className='';
  classList={toggle:(name:string,on:boolean)=>{const names=new Set(this.className.split(' ').filter(Boolean));on?names.add(name):names.delete(name);this.className=[...names].join(' ');}};
  addEventListener(name:string,handler:any){(this as any)['on'+name]=handler;}
  append(...children:any[]){this.children.push(...children);}
  replaceChildren(...children:any[]){this.children=children;}
  setAttribute(name:string,value:string){this.attributes[name]=value;}
  querySelectorAll(selector:string){return this.children.filter(c=>selector==='button'||c.className.split(' ').includes(selector.slice(1)));}
 }
 const elements:any=new Map();
 const find=(node:any,id:string):any=>node.id===id?node:node.children.map((c:any)=>find(c,id)).find(Boolean);
 const get=(id:string)=>{for(const node of elements.values()){const found=find(node,id);if(found)return found;}if(!elements.has(id))elements.set(id,new Element());return elements.get(id);};
 const tabs=['conferences','journals','news','profile'].map(kind=>{const el=new Element();el.dataset.kind=kind;return el;});
 get('collections').children=tabs;
 const calls:string[]=[];
 let finishWrite:any;
 const events:any={};
 const context={addEventListener:(name:string,handler:any)=>events[name]=handler,document:{getElementById:get,createElement:()=>new Element()},AbortController,URLSearchParams,setTimeout,clearTimeout,confirm:()=>false,fetch:async(url:string)=>{
  calls.push(url);
  if(url.includes('/api/admin/records/')) return new Promise(resolve=>finishWrite=resolve);
  const data=url.includes('/session')?{}:url.includes('/conferences')?{total:2,items:[{id:'a',data:{name:'Alpha',fields:['AI']}},{id:'b',data:{name:'Beta',fields:['ML']}}]}:{total:0,items:[]};
  return {ok:true,json:async()=>data};
 }};
 vm.runInNewContext(fs.readFileSync('public/admin/admin.js','utf8'),context);
 const settle=()=>new Promise(resolve=>setImmediate(resolve));
 await settle();
 const [first,second]=get('records').children;
 first.onclick();second.onclick();
 assert.equal(first.attributes['aria-pressed'],'false');
 assert.equal(second.attributes['aria-pressed'],'true');
 assert.equal(get('editor-title').textContent,'Beta');

 get('field-name').value='<img src=x onerror=alert(1)>';
 get('editor').oninput();
 assert.equal(get('save').disabled,false);
 assert.equal(get('preview-card').children[0].textContent,'<img src=x onerror=alert(1)>');
 assert.equal(get('preview-card').children[0].children.length,0);
 get('collections').onclick({target:{closest:()=>tabs[1]}});
 assert.equal(get('editor-title').textContent,'Beta','cancelling navigation preserves edits');
 let prevented=false;events.beforeunload({preventDefault:()=>prevented=true});
 assert.equal(prevented,true);
 get('discard').onclick();
 assert.equal(get('field-name').value,'Beta');
 assert.equal(get('save').disabled,true);

 get('field-name').value='Unsaved';
 get('editor').oninput();
 const saving=get('editor').onsubmit({preventDefault(){},submitter:get('save')});
 assert.equal(get('save').disabled,true);
 first.onclick();
 assert.equal(get('editor-title').textContent,'Beta','saving blocks item switching');
 finishWrite({ok:false,status:409,json:async()=>({error:'Revision conflict'})});
 await saving;
 assert.equal(get('field-name').value,'Unsaved','failed save retains draft');
 assert.equal(get('save').disabled,false,'failed save permits retry');
 assert.equal(get('message').textContent,'Revision conflict');
 get('discard').onclick();
 get('search').value='old search';
 get('collections').onclick({target:{closest:()=>tabs[1]}});
 await settle();
 assert.equal(get('search').value,'');
 assert.equal(get('collection-title').textContent,'저널');
 assert.equal(get('collection-preview').href,'/pages/journal.html');
 assert.equal(get('editor').hidden,true);
 assert.equal(get('records').children[0].textContent,'등록된 항목이 없습니다.');
 assert.equal(get('records').attributes['aria-busy'],'false');
 assert.ok(calls.some(url=>url.includes('/journals?q=&page=1')));
});
