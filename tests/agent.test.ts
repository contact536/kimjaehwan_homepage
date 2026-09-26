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
 assert.match(searchResearch('AI경영학회 정회원').answer,/2026년 2월/);
 assert.match(searchResearch('한국컴퓨터정보학회 종신회원').answer,/2026\.03\.18/);
 assert.match(searchResearch('한국회계학회 종신회원').answer,/2026\.06\.20/);
 assert.match(searchResearch('특허결정').answer,/지식재산처/);
 assert.match(searchResearch('인재양성 협약').answer,/한국정보통신기술협회/);
 assert.match(searchResearch('XAIKOREA 회사 회원자격').answer,/한국인공지능협회/);
 assert.match(searchResearch('기술자료 임치').answer,/2026\.09\.09/);
 assert.match(searchResearch('임치 계약 체결일').answer,/계약 체결일 2026\.09\.08/);
 const hoban=searchResearch('DECIVOX 호반건설 PoC');
 assert.match(hoban.answer,/경기창조경제혁신센터/);
 assert.match(hoban.answer,/2026\.04\.30 - 2026\.11\.30/);
 assert.ok(hoban.sources.some(source=>source.url.endsWith('#hoban-poc-agreement')));
 assert.match(searchResearch('핵심기술 모니터링').answer,/한국특허기술진흥원.*2026\.07\.10/);
 assert.match(searchResearch('기술유출방지시스템').answer,/2026\.08\.13 - 2026\.11\.12/);
 const service=searchResearch('DECIVOX 설치형');
 assert.match(service.answer,/이용 및 도입은 별도 문의/);
 assert.ok(service.sources.some(source=>source.url.endsWith('#service-decivox')));
 assert.match(searchResearch('BrandPilot 소개 시연').answer,/57초 요약 0:57/);
 assert.equal(searchResearch('BrandPilot 소개 시연').sources[0].url,'/pages/projects.html#service-brandpilot');
 const testbed=searchResearch('D-테스트베드');
 assert.ok(testbed.sources.some(source=>source.url.endsWith('#d-testbed-2026')));
 assert.match(testbed.answer,/코스콤.*2026\.09\.21 – 2026\.12\.16.*재식별 금지/);
 assert.match(searchResearch('특허 바우처 협약').answer,/코어비즈벤처스/);
 const press=searchResearch('SaaS 개발환경 지원사업 언론보도');
 assert.ok(press.sources.some(source=>source.url.endsWith('#press-saas-development-2026')));
 assert.match(press.answer,/머니투데이 보도일 2026-08-03/);
 const manuscript=searchResearch('온프레미스 학술지 논문 심사');
 assert.ok(manuscript.sources.some(source=>source.url.endsWith('#jksci-meeting-pipeline-review')));
 assert.match(manuscript.answer,/한국컴퓨터정보학회논문지 학술지 투고 논문 2차 심사 중 상태 기준일 2026-09-26/);
 assert.match(manuscript.answer,/게재 확정 또는 출판된 논문이 아님/);
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
