import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {AIMessage} from '@langchain/core/messages';
import {openDatabase} from '../server/sqlite.ts';
import {initializeData} from '../server/database.ts';
import {createApp} from '../server/app.ts';
import {originalResponse} from '../server/original.ts';
import {searchResearchFromDatabase,runAgent} from '../server/agent.ts';

test('research CMS preserves revisions, renders safe live text and supplies latest agent evidence',async()=>{
 const connection=openDatabase(':memory:');const app=createApp();const env={DB:connection.db,ADMIN_PASSWORD:'test-password-at-least-sixteen',SESSION_SECRET:'test-secret-at-least-thirty-two-characters'};
 const req=(path:string,method='GET',body?:unknown,cookie='')=>app.request('http://localhost'+path,{method,headers:{origin:'http://localhost','content-type':'application/json',cookie},...(body?{body:JSON.stringify(body)}:{})},env);
 try{
  await initializeData(connection.db);
  const login=await req('/api/auth/login','POST',{password:env.ADMIN_PASSWORD});const cookie=login.headers.get('set-cookie')!.split(';')[0];
  const record=await (await req('/api/records/research/cloa')).json() as any;
  const data={...record.data,name:'CLOA updated',summary:'검증키워드902 요약',body:'검증키워드902 <img src=x onerror=alert(1)>\n수정한 연구 본문'};
  const path='/api/admin/records/research/cloa';
  assert.equal((await req(path,'PUT',{data,revision:record.revision})).status,401);
  assert.equal((await req(path,'PUT',{data:{...data,body:''},revision:1},cookie)).status,400);
  assert.equal((await req(path,'PUT',{data,revision:1},cookie)).status,200);
  assert.equal((await req(path,'PUT',{data,revision:1},cookie)).status,409);
  assert.equal((await req('/api/admin/records/research','POST',{data},cookie)).status,400);
  assert.equal((await req(path+'?revision=2','DELETE',undefined,cookie)).status,400);
  await initializeData(connection.db);
  for(const pathname of ['/index.html','/pages/projects.html','/pages/about.html','/pages/research.html']){
   const source=fs.readFileSync('public'+pathname,'utf8');
   const response=await originalResponse(new Response(source),pathname,connection.db);const html=await response.text();
   assert.ok(html.includes('CLOA updated'),pathname);assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'),pathname);assert.ok(!html.includes('<img src=x onerror=alert(1)>'));
  }
  assert.match((await searchResearchFromDatabase('검증키워드902',connection.db)).answer,/수정한 연구 본문/);
  const retrieval=await (await req('/api/research/search','POST',{question:'검증키워드902'})).json() as any;assert.match(retrieval.answer,/수정한 연구 본문/);
  let calls=0;
  await runAgent('검증키워드902',connection.db,{}, {invoke:async(messages)=>{if(!calls++)return new AIMessage({content:'',tool_calls:[{id:'cms',name:'search_research',args:{query:'검증키워드902'}}]});assert.ok(messages.some(m=>m.getType()==='tool'&&String(m.content).includes('수정한 연구 본문')));return new AIMessage('검증 완료');}});
 }finally{connection.close();}
});
