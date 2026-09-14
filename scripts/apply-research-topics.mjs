import fs from 'node:fs';

// Editorial summaries of the existing researcher profile, not claims of results.
const topics = [
  {id:'cloa', title:'근거 기반 AI', name:'CLOA', question:'AI 응답의 근거를 어떻게 확인할 수 있을까요?', approach:'세법 근거와 응답을 연결하고, 인용과 응답 근거를 검증하는 구조를 연구합니다.'},
  {id:'taxia', title:'세무·회계 실무 AI', name:'TAXiA', question:'도메인 지식을 실제 업무에 어떻게 연결할까요?', approach:'세무·회계 특화 LLM과 RAG를 사무소의 업무에 연결하는 제품을 개발합니다.'},
  {id:'kortaxarena', title:'한국어 LLM 평가', name:'KorTaxArena', question:'세무 분야의 모델 성능을 어떻게 비교할까요?', approach:'한국어 세무 도메인의 LLM을 비교·평가하는 벤치마킹 연구를 진행합니다.'},
];
const start='<!-- research-topics:start -->', end='<!-- research-topics:end -->';
function navigation(home) {
  return `${start}<nav class="research-topics" aria-label="연구 질문별 탐색">${topics.map(t=>`<a class="research-topic" data-topic="${t.id}" href="#${home?'research-':''}${t.id}"><span class="topic-heading">${t.title}</span><span class="topic-label">핵심 질문</span><span class="topic-question">${t.question}</span><span class="topic-label">연구 접근</span><span class="topic-approach">${t.approach}</span><span class="topic-destination">${t.name} 보기 <span aria-hidden="true">↓</span></span></a>`).join('')}</nav>${end}`;
}
for(const file of ['public/index.html','public/pages/research.html']) {
  const home=file==='public/index.html';
  let html=fs.readFileSync(file,'utf8');
  html=html.replace(/<!-- research-topics:start -->[\s\S]*?<!-- research-topics:end -->/g,'');
  if(!html.includes('/css/research-topics.css')) html=html.replace('</head>','<link rel="stylesheet" href="/css/research-topics.css"></head>');
  if(home) {
    html=html.replace('<div class="kim-grid">',navigation(true)+'<div class="kim-grid">');
    html=html.replace(/<article class="research-entry" data-research="([^"]+)"[^>]*>/g,(_,id)=>`<article class="research-entry" data-research="${id}" id="research-${id}" tabindex="-1">`);
  } else {
    html=html.replace(/<nav class="academic-toc"[^>]*>[\s\S]*?<\/nav>/,'');
    html=html.replace('<h1>연구</h1>','<h1>연구</h1>'+navigation(false));
    html=html.replace(/<article class="kim-detail" id="([^"]+)"[^>]*>/g,(_,id)=>`<article class="kim-detail" id="${id}" data-topic="${id}" tabindex="-1">`);
  }
  fs.writeFileSync(file,html);
}
console.log('Applied question-led research navigation to home and research pages.');
