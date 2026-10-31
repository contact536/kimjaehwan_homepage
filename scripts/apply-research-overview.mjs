import fs from 'node:fs';
import submissions from '../seed/journal-manuscripts.json' with {type:'json'};
import {overview,esc,topicCards,scopeLinks,manuscriptLinks,researchDetails} from './research-overview-content.mjs';
import {plannedResearchSection} from './d-testbed-research-plan-content.mjs';
import {educationRows,doctoralIdentity} from './education-content.mjs';

const date=overview.updatedAt.replaceAll('-','.');
const meetingManuscript=submissions.manuscripts.find(item=>item.id==='jksci-meeting-pipeline-review');
const summary='AI의 근거와 검증을 중심으로 소프트웨어, 산업 응용, 금융데이터 분석과 지속가능한 전환을 연구합니다.';
const sectionLinks=[
  ['#research-overview','연구 분야 한눈에'],
  ['#cloa','CLOA · TAXiA'],
  ['#kortaxarena','LLM 테스트'],
  ['#vision-research','산업용 Vision'],
  ['#manufacturing-agent-research','제조 AI 리뷰'],
  ['#journal-under-review','회의 AI · 심사 현황'],
  ['#sdg-research','SDG · 환경·에너지'],
  ['#research-d-testbed-plan','D-테스트베드 · 예정 연구'],
  ['#research-shapfinch-data','금융데이터 연구'],
  ['#academic-activities','학술대회 · 포럼'],
  ['#company-research-title','회사 연구·기술 동향'],
  ['#company-press','관련 언론보도'],
];
const descriptions={
  'index':'김재환의 AI·SDG 연구. 근거 기반 AI, LLM 테스트, 온프레미스 회의 AI, 산업용 Vision·제조 AI, 금융데이터 및 환경·에너지 연구를 소개합니다.',
  'about':'김재환 XAIKOREA 대표이사·AI 연구원 소개. aSSIST AI융합·SDG 복수학위 박사과정과 AI 검증·산업 응용·환경·에너지 연구 분야.',
  'research':'김재환의 연구 분야와 진행 현황. CLOA·TAXiA, KorTaxArena, 회의 인텔리전스, Vision·제조 AI 리뷰, SHAPFINCH, SDG 연구.',
  'projects':'XAIKOREA의 연구개발 프로젝트, 사내 연구·운영 도구, 공개 서비스와 개발 중인 AI 제품을 소개합니다.',
  'publications':'김재환의 연구 중인 SDG·KorTaxArena·Vision·제조 AI 리뷰 원고, 회의 인텔리전스 논문 심사 현황, 학술대회 논문과 저서. 회의 인텔리전스 논문 원문 PDF와 연구 중인 원고의 첫 페이지를 제공합니다.',
  'experience':'김재환의 연구 관심 분야, 학력·경력, 학술단체 회원자격, 학술대회 참가와 XAIKOREA 주요 이력.',
  'contact':'김재환 연구 협업 연락처. AI 근거·검증, 온프레미스 AI, 산업용 Vision·제조 AI, 금융데이터, SDG·환경·에너지 연구.',
  'assistant':'등록된 자료를 바탕으로 김재환의 AI·SDG 연구 분야, 진행 중인 원고와 심사 현황, 경력 및 XAIKOREA 프로젝트를 검색합니다.',
  'sources':'김재환의 학력·경력, 최신 AI·SDG 연구 원고와 회사 공개 자료에 대한 소개 기준.',
};
for(const [name,description] of Object.entries(descriptions)) {
  const file=name==='index'?'public/index.html':`public/pages/${name}.html`;
  let html=fs.readFileSync(file,'utf8');
  html=html.replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${esc(description)}">`);
  html=html.replace(/<!-- research-scope:start -->[\s\S]*?<!-- research-scope:end -->/g,'');
  if(name==='index') {
    html=html.replace(/<title>[\s\S]*?<\/title>/,'<title>김재환 | 연구·경력 소개</title>');
    html=html.replace(/<p class="hero-identity">[\s\S]*?<\/p>/,doctoralIdentity());
    let paragraph=0;
    html=html.replace(/<p class="academic-bio">[\s\S]*?<\/p>/g,match=>++paragraph<=2?`<p class="academic-bio">${esc(paragraph===1?overview.intro:overview.practice)}</p>`:match);
    html=html.replace(/<section class="section" id="research">[\s\S]*?<\/section>/,`<section class="section" id="research"><div class="container"><h2 class="section-title"><span class="section-number">02.</span> Research</h2><p class="kim-section-intro">${summary}</p>${topicCards(true)}${researchDetails()}<nav class="research-follow-links" aria-label="연구 자료와 프로젝트"><a href="/pages/publications.html">연구 원고 · 논문 현황 →</a><a href="/pages/projects.html">회사 프로젝트 · 내부 도구 →</a></nav></div></section>`);
    html=html.replace('근거 기반 AI, 세무·회계 도메인 연구 및 산학 협력을 제안해 주세요.',esc(overview.collaboration));
  }
  if(name==='about') {
    html=html.replace(/(<h2 class="kim-heading">학력<\/h2>)[\s\S]*?(?=<h2 class="kim-heading">)/,(_,heading)=>heading+educationRows());
    html=html.replace(/(<p class="kim-subtitle">[^<]*<\/p>)<p>[\s\S]*?<\/p>/,`$1<p>${esc(overview.intro)}</p>`);
    html=html.replace('<h2 class="kim-heading">학력</h2>',`<!-- research-scope:start --><section class="research-scope" aria-labelledby="about-research-heading"><h2 id="about-research-heading">연구 관심 분야</h2><p>${esc(overview.practice)}</p><nav class="research-scope-links" aria-label="연구 분야 바로가기">${scopeLinks()}</nav></section><!-- research-scope:end --><h2 class="kim-heading">학력</h2>`);
    html=html.replace('>연구와 실무</h2>','>연구개발 · 제품 경험</h2>');
  }
  if(name==='research') {
    html=html.replace(/<!-- d-testbed-research-plan:start -->[\s\S]*?<!-- d-testbed-research-plan:end -->/g,'');
    const planAnchor='<!-- academic-activities:start -->';
    if(!html.includes(planAnchor)) throw new Error('Missing planned research insertion anchor');
    html=html.replace(planAnchor,plannedResearchSection()+planAnchor);
    html=html.replace(/<!-- research-topics:start -->[\s\S]*?<!-- research-topics:end -->/g,'');
    html=html.replace(/<nav class="academic-toc"[^>]*>[\s\S]*?<\/nav>/,'');
    html=html.replace('<h1>연구</h1>',`<h1>연구</h1><!-- research-scope:start --><section class="research-overview" id="research-overview" aria-labelledby="research-overview-heading"><h2 id="research-overview-heading">연구 분야 한눈에</h2><p class="kim-lead">${esc(overview.intro)}</p><p class="research-scope-date">연구 현황 기준 <time datetime="${overview.updatedAt}">${date}</time></p>${topicCards()}<nav class="research-follow-links" aria-label="논문과 프로젝트"><a href="/pages/publications.html">논문 원문 · 연구 원고 →</a><a href="/pages/projects.html">회사 프로젝트 · 내부 도구 →</a></nav></section><!-- research-scope:end -->`);
    html=html.replace(/<!-- research-directory:start -->[\s\S]*?<!-- research-directory:content -->/,'').replace('</div><!-- research-directory:end -->','');
    const sidebar=`<aside class="research-sidebar" aria-label="연구 페이지 목차"><p>연구 탐색</p><nav>${sectionLinks.map(([href,label])=>`<a href="${href}">${label}</a>`).join('')}</nav><a class="research-sidebar-all" href="/pages/publications.html">논문 · 자료 →</a></aside>`;
    html=html.replace(/(<main[^>]*>)([\s\S]*?)(<\/main>)/,(_,open,body,close)=>`${open}<!-- research-directory:start --><div class="research-directory-layout">${sidebar}<!-- research-directory:content -->${body}</div><!-- research-directory:end -->${close}`);
  }
  if(name==='publications') {
    if(!html.includes('/css/paper-preview.css')) html=html.replace('</head>','<link rel="stylesheet" href="/css/paper-preview.css"></head>');
    if(!html.includes('/js/paper-preview.js')) html=html.replace('</head>','<script defer src="/js/paper-preview.js"></script></head>');
    html=html.replace(/<p class="kim-lead">[\s\S]*?<\/p>/,`<p class="kim-lead">진행 중인 연구 원고와 학술지 심사 현황, 학술대회 논문 및 저서를 소개합니다.</p><!-- research-scope:start --><nav class="manuscript-index" aria-label="논문과 자료 주제별 바로가기">${manuscriptLinks.map(l=>`<a href="${l.href}">${esc(l.label)}</a>`).join('')}</nav><!-- research-scope:end -->`);
  }
  if(name==='projects') html=html.replace(/<p class="kim-lead">[\s\S]*?<\/p>/,'<p class="kim-lead">연구 성과의 실무 적용을 위한 XAIKOREA의 프로젝트, 사내 도구와 서비스·제품을 소개합니다.</p><!-- research-scope:start --><nav class="research-follow-links" aria-label="프로젝트 탐색"><a href="#internal-tools">회사 내부 연구·운영 도구 ↓</a><a href="#company-services">운영·공개 서비스 ↓</a><a href="/pages/research.html">연구 분야 · 논문 연구 →</a></nav><!-- research-scope:end -->');
  if(name==='contact') html=html.replace(/(<h2>연구와 협업을 제안해 주세요\.<\/h2>)<p>[\s\S]*?<\/p>/,`$1<p>${esc(overview.collaboration)}</p>`);
  if(name==='sources') html=html.replace('<h1>프로필 자료 기준</h1>',`<h1>프로필 자료 기준</h1><!-- research-scope:start --><section class="research-scope" aria-labelledby="research-source-heading"><h2 id="research-source-heading">최신 연구 소개 기준</h2><p>2026년 10월 31일까지 제공된 SDG 7개 주제의 원고, KorTaxArena 영문 개정 49안, Vision 영문 원고 v26, 제조 AI 리뷰 P21, 회의 인텔리전스 논문 원고와 심사 현황을 반영했습니다.</p><p>진행 중인 원고는 ‘연구 중’으로, 회의 인텔리전스 논문은 ‘${esc(meetingManuscript.statusLabel)}’으로 표시합니다. 회의 인텔리전스 논문은 저자 포함 원고 전체 PDF를 열람·다운로드할 수 있으며, 다른 연구 중인 원고는 첫 페이지를 제공합니다.</p><a href="/pages/publications.html">연구 개요 · 원문 및 미리보기 →</a></section><!-- research-scope:end -->`);
  if(!html.includes('/css/research-overview.css')) html=html.replace('</head>','<link rel="stylesheet" href="/css/research-overview.css"></head>');
  fs.writeFileSync(file,html);
}
// Legacy supporting pages inherit the current profile description as well.
for(const name of fs.readdirSync('public/pages',{recursive:true}).filter(n=>n.endsWith('.html'))) {
  const file='public/pages/'+name;
  let html=fs.readFileSync(file,'utf8').replace('김재환 XAIKOREA 대표이사 겸 AI 연구원의 개인 연구자 플랫폼. CLOA, TAXiA, KorTaxArena와 세무회계 AI 연구.',descriptions.index);
  // Older template URLs are retained as a current research guide, not stale copies of three projects.
  if(html.includes('<h1>연구 플랫폼</h1>')||html.includes('<!-- research-legacy-guide:start -->')) {
    html=html.replace(/<title>[\s\S]*?<\/title>/,'<title>연구 안내 | 김재환 · Jaehwan Kim</title>');
    html=html.replace(/(<main[^>]*>)[\s\S]*?(<\/main>)/,(_,open,close)=>`${open}<!-- research-legacy-guide:start --><div class="kim-page"><p class="kim-overline">JAEHWAN KIM / RESEARCH</p><h1>연구 안내</h1><p class="kim-lead">${esc(overview.intro)}</p>${topicCards(true)}<nav class="research-follow-links" aria-label="주요 페이지"><a href="/pages/research.html">전체 연구 소개 →</a><a href="/pages/publications.html">논문 · 자료 →</a><a href="/pages/experience.html">학력 · 경력 →</a></nav></div><!-- research-legacy-guide:end -->${close}`);
    for(const css of ['research-topics','research-overview'])if(!html.includes(`/css/${css}.css`))html=html.replace('</head>',`<link rel="stylesheet" href="/css/${css}.css"></head>`);
  }
  fs.writeFileSync(file,html);
}
console.log('Aligned biography, research navigation, manuscript index and page descriptions.');
