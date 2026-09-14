import fs from 'node:fs';

const publication=`<div class="kim-page reading-page"><p class="kim-overline">JAEHWAN KIM / RESEARCH PLATFORM</p><h1>논문 · 연구 자료</h1><p class="kim-lead">진행 중인 연구와 공개 자료를 정리합니다.</p><article class="reading-entry" id="kortaxarena-note" tabindex="-1"><p class="reading-meta">연구 진행 중 · 한국어 LLM 평가</p><h2><a href="/pages/research.html#kortaxarena">KorTaxArena</a></h2><p class="reading-deck">한국어 세무 도메인에서 LLM을 비교·평가하는 벤치마킹 연구입니다.</p><p class="reading-status">공개 논문 · 데이터셋 · 코드 링크 미등록</p><p>현재 확인된 자료에는 공개 논문, DOI, 데이터셋 및 코드 저장소 링크가 없어 게재 실적을 등록하지 않았습니다.</p><div class="reading-links"><a href="/pages/research.html#kortaxarena">연구 내용 읽기 <span aria-hidden="true">→</span></a><a href="#kortaxarena-note" aria-label="KorTaxArena 항목 바로가기">항목 링크 #</a></div></article><nav class="reading-related" aria-label="관련 자료"><h2>함께 볼 자료</h2><a href="/pages/patents.html"><strong>지식재산 <span aria-hidden="true">→</span></strong><span>XAIKOREA의 AI 추론 관련 특허 출원 현황</span></a><a href="/pages/sources.html"><strong>프로필 자료 기준 <span aria-hidden="true">→</span></strong><span>학력·경력·연구 소개에 사용한 자료와 표기 기준</span></a></nav></div>`;
for(const name of ['publications','patents','sources']) {
 const file=`public/pages/${name}.html`;
 let html=fs.readFileSync(file,'utf8');
 if(!html.includes('/css/reading.css')) html=html.replace('</head>','<link rel="stylesheet" href="/css/reading.css"></head>');
 if(name==='publications') html=html.replace(/(<main[^>]*>)[\s\S]*?(<\/main>)/,(_,open,close)=>open+publication+close);
 else html=html.replace('class="kim-page"','class="kim-page reading-page"');
 if(name==='patents') {
   html=html.replace(/<!-- reading-toc:start -->[\s\S]*?<!-- reading-toc:end -->/,'');
   html=html.replace(/<a class="heading-anchor"[^>]*>[\s\S]*?<\/a>/g,'');
   const titles=[];
   let index=0;
   html=html.replace(/<article class="kim-row"[^>]*>([\s\S]*?)<\/article>/g,(_,body)=>{
     const id=`patent-${++index}`;
     const title=body.match(/<h3>(.*?)<\/h3>/)[1];
     titles.push({id,title});
     body=body.replace('</h3>',`<a class="heading-anchor" href="#${id}" aria-label="${title} 항목 바로가기">#</a></h3>`);
     return `<article class="kim-row" id="${id}" tabindex="-1">${body}</article>`;
   });
   const toc=`<!-- reading-toc:start --><details class="reading-toc" open><summary>이 페이지의 목차</summary><nav aria-label="특허 출원 목차"><ol>${titles.map(t=>`<li><a href="#${t.id}">${t.title}</a></li>`).join('')}</ol></nav></details><!-- reading-toc:end -->`;
   html=html.replace(/(<p class="kim-lead">[\s\S]*?<\/p>)/,`$1${toc}`);
 }
 fs.writeFileSync(file,html);
}
console.log('Applied reading layout, publication summary and native patent contents.');
