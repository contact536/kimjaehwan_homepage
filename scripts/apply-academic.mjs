import fs from 'node:fs';
import path from 'node:path';
import p from '../seed/researcher.json' with {type:'json'};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const links=[['/','소개'],['/pages/research.html','연구'],['/pages/projects.html','프로젝트'],['/pages/publications.html','논문 · 자료'],['/pages/experience.html','CV'],['/pages/contact.html','연락']];
function header(file){const current=file==='index.html'?'/':'/'+file.replaceAll('\\','/');return `<header class="academic-header"><div class="academic-nav"><a class="academic-brand" href="/">김재환 <span>Jaehwan Kim</span></a><button class="academic-menu-toggle" aria-expanded="false" aria-controls="academicMenu">메뉴</button><nav id="academicMenu" aria-label="주 메뉴">${links.map(([url,label])=>`<a href="${url}"${url===current?' aria-current="page"':''}>${label}</a>`).join('')}<details class="academic-tools"><summary>연구 도구</summary><div><a href="/pages/conference-tier.html">학회 탐색</a><a href="/pages/journal.html">저널 탐색</a><a href="/pages/patents.html">지식재산</a><a href="/pages/assistant.html">연구 도우미</a></div></details></nav></div></header>`}
const hero=`<section class="hero kim-hero academic-intro" id="hero"><div class="hero-content"><p class="academic-eyebrow">RESEARCHER / XAIKOREA</p><h1 class="hero-name"><span class="gradient-text">김재환</span> <span class="kim-english">Jaehwan Kim</span></h1><p class="hero-tagline">${esc(p.role)}</p><p class="hero-identity">aSSIST AI융합 · SDG 복수학위 박사과정</p><p class="academic-bio">${esc(p.intro)}</p><p class="academic-bio">근거 기반 응답, 세무·회계 도메인 LLM, 한국어 모델 평가를 중심으로 연구합니다.</p><div class="academic-links"><a href="mailto:${esc(p.email)}">이메일 ↗</a><a href="/pages/experience.html">학력 · 경력 →</a><a href="/pages/research.html">연구 보기 →</a></div></div><figure class="academic-portrait"><img src="/assets/jaehwan-kim.jpg" alt="김재환 대표 프로필" width="1682" height="2528"><figcaption>XAIKOREA · 성남, 대한민국</figcaption></figure></section>`;
for(const file of fs.readdirSync('public',{recursive:true}).filter(f=>f.endsWith('.html')&&!f.startsWith('admin'))){
 const dest=path.join('public',file);let html=fs.readFileSync(dest,'utf8');
 if(!html.includes('/css/academic.css'))html=html.replace('</head>','<link rel="stylesheet" href="/css/academic.css"><script src="/js/academic.js" defer></script></head>');
 html=html.replace(/<script\b[^>]*src=["'][^"']*\/(?:sidebar|kim)\.js["'][^>]*><\/script>/g,'');
 html=html.replace(/<header class="kim-top">[\s\S]*?<\/header>/,'').replace(/<header class="academic-header">[\s\S]*?<\/header>/,'');
 html=html.replace(/<body>/,'<body>'+header(file));
 if(file==='index.html'){
  html=html.replace(/<div class="intro" id="intro">[\s\S]*?<\/svg><\/div><\/div>/,'');
  html=html.replace(/<section class="hero[^>]*id="hero">[\s\S]*?<\/section>/,()=>hero);
  html=html.replace(/<section class="section" id="about">[\s\S]*?<\/section>/,'');
  html=html.replace('Research & Projects','Selected research').replace('근거 기반 응답, 도메인 특화 AI, 그리고 모델 평가.','현재 진행 중인 연구와 제품 개발을 소개합니다.');
 }
 if(file.replaceAll('\\','/')==='pages/research.html'&&!html.includes('academic-toc'))html=html.replace(/(<article class="kim-detail" id="cloa">)/,`<nav class="academic-toc" aria-label="연구 바로가기">${p.research.map(r=>`<a href="#${r.id}">${r.title}</a>`).join('')}</nav>$1`);
 html=html.replace('data-theme="dark"','data-theme="light"');
 fs.writeFileSync(dest,html);
}
let theme=fs.readFileSync('public/js/theme.js','utf8').replace("saved||'dark'","saved||'light'");fs.writeFileSync('public/js/theme.js',theme);
console.log('Applied academic navigation, compact biography, research reading layout and light-first theme.');
