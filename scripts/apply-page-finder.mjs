import fs from 'node:fs';
import path from 'node:path';
const pages=[
 ['/', '소개 · 김재환', '프로필 XAIKOREA 대표 AI 연구원 Jaehwan Kim'],
 ['/pages/research.html#cloa','CLOA · 근거 기반 AI','인용 RAG 검색 Citation-Linked Output Architecture'],
 ['/pages/research.html#taxia','TAXiA · 세무회계 AI','세금 세무 회계 LLM SaaS'],
 ['/pages/research.html#kortaxarena','KorTaxArena · 한국어 모델 평가','벤치마크 세무 LLM benchmark'],
 ['/pages/projects.html','프로젝트','연구 개발 과제'],
 ['/pages/publications.html','논문 · 자료','출판 연구 기록 publications'],
 ['/pages/experience.html','CV · 학력과 경력','이력 박사 MBA education career'],
 ['/pages/conference-tier.html','학회 탐색','컨퍼런스 conference 등급 NeurIPS ICML'],
 ['/pages/journal.html','저널 탐색','학술지 journal 등급'],
 ['/pages/patents.html','지식재산','특허 출원 patent'],
 ['/pages/contact.html','연락 · 연구 협업','이메일 email contact 문의']
];
const finder='<details class="page-finder"><summary>페이지 찾기</summary><div class="finder-panel"><label for="page-finder-query">연구 주제 또는 페이지 이름</label><input id="page-finder-query" type="search" placeholder="예: CLOA, 세무, CV" autocomplete="off"><p class="finder-count" role="status" aria-live="polite">'+pages.length+'개 바로가기</p><div class="finder-results">'+pages.map(([href,title,terms])=>'<a href="'+href+'" data-keywords="'+terms+'">'+title+'<small>'+terms+'</small></a>').join('')+'</div><p class="finder-empty" hidden>찾는 페이지가 없습니다. 다른 검색어를 입력해 주세요.</p></div></details>';
for(const file of fs.readdirSync('public',{recursive:true}).filter(f=>f.endsWith('.html')&&!f.startsWith('admin'))){
 const dest=path.join('public',file);let html=fs.readFileSync(dest,'utf8');
 html=html.replace(/<details class="page-finder">[\s\S]*?<\/details>/g,'');
 html=html.replace('</nav></div></header>',finder+'</nav></div></header>');
 if(!html.includes('/js/page-finder.js')) html=html.replace('</head>','<script defer src="/js/page-finder.js"></script><link rel="stylesheet" href="/css/page-finder.css"></head>');
 fs.writeFileSync(dest,html);
}
