import test from 'node:test';
import assert from 'node:assert/strict';
import { AIMessage } from '@langchain/core/messages';
import {searchResearch,runAgent} from '../server/agent.ts';
import {openDatabase} from '../server/sqlite.ts';
import {initializeData} from '../server/database.ts';
import {createApp} from '../server/app.ts';

test('research search uses curated profile, preserves degree/application distinctions, handles unknown queries',()=>{
 assert.match(searchResearch('김재환 학력').answer,/박사과정/);
 assert.match(searchResearch('CLOA').answer,/인용/);
 assert.match(searchResearch('특허').answer,/출원/);
 assert.match(searchResearch('경기도 AI 멤버십').answer,/2026-AI-245/);
 assert.match(searchResearch('기술보호 선도기업').answer,/제2026-015호/);
 assert.match(searchResearch('연구개발전담부서').answer,/2026151302/);
 assert.match(searchResearch('벤처기업').answer,/20260204030008/);
 assert.match(searchResearch('10-2026-0057344').answer,/하이브리드 검색 기반/);
 assert.match(searchResearch('AI경영학회 이사').answer,/학술위원회/);
 assert.match(searchResearch('특허결정').answer,/지식재산처/);
 assert.match(searchResearch('인재양성 협약').answer,/한국정보통신기술협회/);
 assert.match(searchResearch('회원자격').answer,/한국인공지능협회/);
 assert.match(searchResearch('기술자료 임치').answer,/2026\.09\.09/);
 assert.deepEqual(searchResearch('zzzxxyy9977').sources,[]);
 assert.ok(!JSON.stringify(searchResearch('연락처')).includes('010-'));
});
test('real LangGraph tool cycle searches profile and returns trace without writes',async()=>{
 const connection=openDatabase(':memory:');let calls=0;
 try{await initializeData(connection.db);const result=await runAgent('CLOA 연구 소개',connection.db,{}, {invoke:async messages=>{
  calls++;if(calls===1)return new AIMessage({content:'',tool_calls:[{id:'search-1',name:'search_research',args:{query:'CLOA'}}]});
  assert.ok(messages.some(m=>m.getType()==='tool'&&String(m.content).includes('CLOA')));
  return new AIMessage('CLOA는 근거와 응답을 연결하는 연구입니다.');
 }});assert.equal(calls,2);assert.equal(result.trace[0].tool,'search_research');assert.ok(result.sources.some(s=>s.url.endsWith('#cloa')));
 }finally{connection.close()}
});
test('agent loop is bounded and missing model fails explicitly',async()=>{
 const connection=openDatabase(':memory:');try{
 await assert.rejects(runAgent('test',connection.db,{}),/MODEL_NOT_CONFIGURED/);
 await assert.rejects(runAgent('CLOA',connection.db,{}, {invoke:async()=>new AIMessage({content:'',tool_calls:[{id:crypto.randomUUID(),name:'search_research',args:{query:'CLOA'}}]})}),/AGENT_LIMIT/);
 }finally{connection.close()}
});
test('HTTP retrieval works, agent is authenticated and unconfigured model reports 503',async()=>{
 const connection=openDatabase(':memory:');const app=createApp();const env={DB:connection.db,ADMIN_PASSWORD:'test-password-at-least-sixteen',SESSION_SECRET:'test-secret-at-least-thirty-two-characters'};
 const request=(url:string,body:any,cookie='')=>app.request('http://localhost'+url,{method:'POST',headers:{origin:'http://localhost','content-type':'application/json',cookie},body:JSON.stringify(body)},env);
 try{assert.equal((await request('/api/research/search',{question:'CLOA'})).status,200);assert.equal((await request('/api/research/search',{question:''})).status,400);assert.equal((await request('/api/admin/agent',{question:'CLOA'})).status,401);
 const login=await request('/api/auth/login',{password:env.ADMIN_PASSWORD});const cookie=login.headers.get('set-cookie')!.split(';')[0];assert.equal((await request('/api/admin/agent',{question:'CLOA'},cookie)).status,503);
 }finally{connection.close()}
});

test('public agent status exposes configuration without server addresses or credentials',async()=>{
 const connection=openDatabase(':memory:');const app=createApp();
 try{
  const response=await app.request('http://localhost/api/research/status',{}, {DB:connection.db,OLLAMA_MODEL:'private-model',OLLAMA_BASE_URL:'http://private-host:11434'});
  assert.equal(response.status,200);
  assert.deepEqual(await response.json(),{retrieval:true,agent:{configured:true,requiresLogin:true,framework:'LangGraph'}});
  const empty=await app.request('http://localhost/api/research/status',{}, {DB:connection.db});
  const state=await empty.json() as {agent:{configured:boolean}};
  assert.equal(state.agent.configured,false);
 }finally{connection.close();}
});
