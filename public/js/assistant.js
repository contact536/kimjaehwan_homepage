(() => {
 const $=id=>document.getElementById(id);let controller=null;
 fetch('/api/research/status').then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{$('agentConnection').textContent=data.agent.configured?'AI 모델 설정됨 · 실행 시 연결을 확인합니다.':'자료 검색 사용 가능 · AI 모델 미설정';}).catch(()=>{$('agentConnection').textContent='서버 설정을 확인하지 못했습니다.';});
 document.querySelectorAll('[data-question]').forEach(button=>button.addEventListener('click',()=>{$('question').value=button.dataset.question;$('question').focus();}));
 $('agentCancel').addEventListener('click',()=>controller?.abort());
 $('agentForm').addEventListener('submit',async event=>{
 event.preventDefault();if(controller)return;const question=$('question').value.trim();if(!question){$('question').focus();return;}
 controller=new AbortController();const timeout=setTimeout(()=>controller?.abort('timeout'),100000);
 $('agentSubmit').disabled=true;$('agentCancel').hidden=false;$('agentMode').disabled=true;
 $('agentStatus').textContent='자료를 확인하고 있습니다…';$('agentAnswer').replaceChildren();$('agentSources').replaceChildren();$('agentSources').hidden=true;$('agentTrace').hidden=true;$('agentTraceList').replaceChildren();const mode=$('agentMode').value;
 try{
 const res=await fetch(mode==='ollama'?'/api/admin/agent':'/api/research/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({question}),signal:controller.signal});const data=await res.json();if(!res.ok)throw Error(res.status===401?'관리자 로그인 후 다시 질문해 주세요.':data.error||'요청을 처리하지 못했습니다.');
 $('agentAnswer').textContent=data.answer;
 for(const source of data.sources||[]){if(typeof source.url!=='string'||!source.url.startsWith('/')||source.url.startsWith('//'))continue;const a=document.createElement('a');a.textContent=source.title+' →';a.href=source.url;$('agentSources').append(a);}
 $('agentSources').hidden=!$('agentSources').children.length;
 for(const step of data.trace||[]){const li=document.createElement('li');li.textContent=(step.tool==='search_research'?'연구 자료 검색':step.tool==='search_catalog'?'학회·저널 검색':step.tool)+' · '+step.query;$('agentTraceList').append(li);}
 $('agentTrace').hidden=!$('agentTraceList').children.length;$('agentStatus').textContent=mode==='ollama'?'AI 에이전트 응답 · 근거 자료를 확인하세요.':'등록 자료 검색 결과 · 생성형 AI 미사용';
 }catch(error){$('agentStatus').textContent=controller.signal.aborted?(controller.signal.reason==='timeout'?'응답 시간이 초과되었습니다.':'요청을 취소했습니다.'):error.message;}
 finally{clearTimeout(timeout);controller=null;$('agentSubmit').disabled=false;$('agentCancel').hidden=true;$('agentMode').disabled=false;}
 });
})();
