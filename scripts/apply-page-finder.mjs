import fs from 'node:fs';
import path from 'node:path';
import overview from '../seed/research-overview.json' with {type:'json'};
const pages=[
 ['/', '소개 · 김재환', '프로필 XAIKOREA 대표 AI 연구원 Jaehwan Kim'],
 ['/pages/research.html#cloa','CLOA · 근거 기반 AI','인용 RAG 검색 Citation-Linked Output Architecture'],
 ['/pages/research.html#taxia','TAXiA · 세무회계 AI','세금 세무 회계 LLM SaaS'],
 ['/pages/research.html#kortaxarena','KorTaxArena · LLM 생성 코드 평가','테스트 선택 생성 프로그램 정답 판정 software testing'],
 ['/pages/research.html#research-overview','연구 분야 한눈에','AI 산업 금융 SDG 연구 범위 주제'],
 ...overview.areas.flatMap(area=>area.links.filter(link=>!['cloa','taxia','kortaxarena'].includes(link.anchor)).map(link=>['/pages/research.html#'+link.anchor,link.label,area.title+' '+area.label+' '+area.summary])),
 ['/pages/projects.html#internal-tools','회사 내부 연구·운영 도구','MONKRAG Raptomate OwlMate GitHub Analyzer ONDAM PRIVIA'],
 ['/pages/projects.html#company-services','운영·공개 서비스','XAIKOREA TAXiA DECIVOX SHAPFINCH'],
 ['/pages/projects.html','프로젝트','연구 개발 과제'],
 ['/pages/publications.html','논문 · 자료','출판 연구 기록 publications'],
 ['/pages/experience.html','CV · 학력과 경력','이력 박사 MBA education career'],
 ['/pages/conference-tier.html','학회 탐색','컨퍼런스 conference 등급 NeurIPS ICML'],
 ['/pages/journal.html','저널 탐색','학술지 journal 등급'],
 ['/pages/patents.html','지식재산','특허 출원 patent'],
 ['/pages/company-network.html','산학협력 · 회원 네트워크','인재양성 협약 회원자격 기술자료 임치 company network'],
 ['/pages/contact.html','연락 · 연구 협업','이메일 email contact 문의']
];
const finder='<details class="page-finder"><summary>페이지 찾기</summary><div class="finder-panel"><label for="page-finder-query">연구 주제 또는 페이지 이름</label><input id="page-finder-query" type="search" placeholder="예: SDG, Vision, 테스트, CV" autocomplete="off"><p class="finder-count" role="status" aria-live="polite">'+pages.length+'개 바로가기</p><div class="finder-results">'+pages.map(([href,title,terms])=>'<a href="'+href+'" data-keywords="'+terms+'">'+title+'<small>'+terms+'</small></a>').join('')+'</div><p class="finder-empty" hidden>찾는 페이지가 없습니다. 다른 검색어를 입력해 주세요.</p></div></details>';
for(const file of fs.readdirSync('public',{recursive:true}).filter(f=>f.endsWith('.html')&&!f.startsWith('admin'))){
 const dest=path.join('public',file);let html=fs.readFileSync(dest,'utf8');
 html=html.replace(/<details class="page-finder">[\s\S]*?<\/details>/g,'');
 html=html.replace('</nav></div></header>',finder+'</nav></div></header>');
 if(!html.includes('/js/page-finder.js')) html=html.replace('</head>','<script defer src="/js/page-finder.js"></script><link rel="stylesheet" href="/css/page-finder.css"></head>');
 fs.writeFileSync(dest,html);
}
