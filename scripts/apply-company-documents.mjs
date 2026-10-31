import fs from 'node:fs';
import profile from '../seed/researcher.json' with {type:'json'};
import {applyAuthorLayout} from './author-layout.mjs';

const section = `<!-- company-docs:start --><section class="reading-entry" id="company-documents" aria-labelledby="company-documents-title"><p class="reading-meta">XAIKOREA · 2026</p><h2 id="company-documents-title">회사 · 사업 자료</h2><!-- company-website:start --><p class="company-website"><a href="https://www.xaikorea.ai.kr/about#company-credentials" target="_blank" rel="noopener noreferrer">회사 공식 인증 자료 확인 ↗</a></p><!-- company-website:end --><p>회사의 기술과 제품, 사업 방향 및 공개 가능한 기업 인증 자료입니다.</p>
<article class="document-card"><a class="document-cover" href="/documents/xaikorea-company-profile-2026.pdf" target="_blank" rel="noopener" aria-label="XAIKOREA 회사소개서 PDF 보기"><img src="/assets/documents/xaikorea-company-profile-2026-cover.png" alt="XAIKOREA 회사소개서 2026 표지" width="720" height="1019" loading="lazy" decoding="async"></a><div class="document-copy"><p class="document-kind">COMPANY PROFILE · PDF</p><h3>회사소개서</h3><p>CLOA 아키텍처와 TAXiA, 회사의 기술·사업을 소개하는 비즈니스 매거진 형식의 자료입니다.</p><p class="reading-meta">12쪽 · 1.6 MB</p><div class="reading-links"><a href="/documents/xaikorea-company-profile-2026.pdf" target="_blank" rel="noopener">PDF 보기 ↗</a><a href="/documents/xaikorea-company-profile-2026.pdf" download="XAIKOREA_회사소개서_2026.pdf">다운로드 ↓</a></div></div></article>
<article class="document-card"><a class="document-cover document-cover-landscape" href="/documents/xaikorea-business-ir-2026.pdf" target="_blank" rel="noopener" aria-label="XAIKOREA 사업 IR PDF 보기"><img src="/assets/documents/xaikorea-business-ir-2026-cover.png" alt="XAIKOREA 사업 IR 2026 표지" width="720" height="405" loading="lazy" decoding="async"></a><div class="document-copy"><p class="document-kind">BUSINESS IR · PDF</p><h3>사업 IR · 공식 통계 보완본</h3><p>투자자와 전략적 파트너를 위한 사업 소개 및 시장 자료입니다.</p><p class="reading-meta">16쪽 · 2.4 MB</p><div class="reading-links"><a href="/documents/xaikorea-business-ir-2026.pdf" target="_blank" rel="noopener">PDF 보기 ↗</a><a href="/documents/xaikorea-business-ir-2026.pdf" download="XAIKOREA_사업_IR_2026.pdf">다운로드 ↓</a></div></div></article>
<article class="document-card"><a class="document-cover" href="/documents/xaikorea-ai-membership-2026.pdf" target="_blank" rel="noopener" aria-label="경기도 AI 멤버십 기업 인증서 PDF 보기"><img src="/assets/documents/xaikorea-ai-membership-2026-cover.png" alt="경기도 AI 멤버십 기업 인증서 표지" width="1323" height="1871" loading="lazy" decoding="async"></a><div class="document-copy"><p class="document-kind">AI MEMBERSHIP CERTIFICATE · PDF</p><h3>경기도 AI 멤버십 기업 인증서</h3><p>경기도경제과학진흥원이 XAIKOREA의 경기도 AI 멤버십 기업 선정을 확인한 인증서입니다. 멤버십 기간은 2026.09.01-2027.08.31입니다.</p><p class="reading-meta">1쪽 · 인증번호 2026-AI-245</p><div class="reading-links"><a href="/documents/xaikorea-ai-membership-2026.pdf" target="_blank" rel="noopener">인증서 보기 ↗</a><a href="/documents/xaikorea-ai-membership-2026.pdf" download="XAIKOREA_경기도_AI_멤버십_인증서_2026.pdf">다운로드 ↓</a></div></div></article>
<article class="document-card"><a class="document-cover" href="/documents/xaikorea-technology-leading-company-2026.pdf" target="_blank" rel="noopener" aria-label="기술보호 선도기업 지정서 PDF 보기"><img src="/assets/documents/xaikorea-technology-leading-company-2026-cover.png" alt="기술보호 선도기업 지정서 표지" width="1323" height="1871" loading="lazy" decoding="async"></a><div class="document-copy"><p class="document-kind">TECHNOLOGY PROTECTION · PDF</p><h3>기술보호 선도기업 지정서</h3><p>대·중소기업·농어업협력재단이 기술보호 수준확인 심사 결과 XAIKOREA를 기술보호 선도기업으로 지정한 문서입니다. 지정기간은 2026.06.11-2028.06.10입니다.</p><p class="reading-meta">1쪽 · 지정번호 제2026-015호</p><div class="reading-links"><a href="/documents/xaikorea-technology-leading-company-2026.pdf" target="_blank" rel="noopener">지정서 보기 ↗</a><a href="/documents/xaikorea-technology-leading-company-2026.pdf" download="XAIKOREA_기술보호_선도기업_지정서_2026.pdf">다운로드 ↓</a></div></div></article>
<article class="document-card"><a class="document-cover" href="/documents/xaikorea-rnd-department-certificate-2026.pdf" target="_blank" rel="noopener" aria-label="연구개발전담부서 인정서 PDF 보기"><img src="/assets/documents/rnd-department-2026.webp" alt="연구개발전담부서 인정서 표지" width="900" height="1273" loading="lazy" decoding="async"></a><div class="document-copy"><p class="document-kind">R&amp;D DEPARTMENT CERTIFICATE · PDF</p><h3>연구개발전담부서 인정서</h3><p>한국산업기술진흥협회가 XAIKOREA의 연구전담부서를 연구개발전담부서로 인정한 문서입니다. 신고일은 2026.01.21, 발급일은 2026.02.20입니다.</p><p class="reading-meta">1쪽 · 인정번호 제2026151302호</p><div class="reading-links"><a href="/documents/xaikorea-rnd-department-certificate-2026.pdf" target="_blank" rel="noopener">인정서 보기 ↗</a><a href="/documents/xaikorea-rnd-department-certificate-2026.pdf" download="XAIKOREA_연구개발전담부서_인정서_2026.pdf">다운로드 ↓</a></div></div></article>
<article class="document-card"><a class="document-cover" href="/documents/xaikorea-venture-enterprise-certificate-2026.pdf" target="_blank" rel="noopener" aria-label="벤처기업확인서 PDF 보기"><img src="/assets/documents/venture-enterprise-2026.webp" alt="벤처기업확인서 표지" width="900" height="1273" loading="lazy" decoding="async"></a><div class="document-copy"><p class="document-kind">VENTURE ENTERPRISE CERTIFICATE · PDF</p><h3>벤처기업확인서</h3><p>XAIKOREA가 혁신성장유형 벤처기업임을 확인한 문서입니다. 유효기간은 2026.02.04-2029.02.03입니다.</p><p class="reading-meta">1쪽 · 발급번호 제20260204030008호</p><div class="reading-links"><a href="/documents/xaikorea-venture-enterprise-certificate-2026.pdf" target="_blank" rel="noopener">확인서 보기 ↗</a><a href="/documents/xaikorea-venture-enterprise-certificate-2026.pdf" download="XAIKOREA_벤처기업확인서_2026.pdf">다운로드 ↓</a></div></div></article></section><!-- company-docs:end -->`;
const file = 'public/pages/publications.html';
let html = fs.readFileSync(file, 'utf8');
// Company documents live on their own page; retain the old fragment as a link
// in related reading so existing bookmarks still have a useful destination.
const related = '<a id="company-documents" href="/pages/company-documents.html"><strong>회사 · 사업 자료 <span aria-hidden="true">→</span></strong><span>회사소개서 · 사업 IR · 기업 인증 자료</span></a>';
html = html.replace(/<!-- company-docs:start -->[\s\S]*?<!-- company-docs:end -->/gu, '')
  .replace(/<link rel="stylesheet" href="\/css\/company-documents\.css">/gu, '')
  .replace(/<a href="#company-documents">[\s\S]*?<\/a>/gu, '')
  .replace(/<a id="company-documents"[\s\S]*?<\/a>/gu, '');
if (!html.includes('<h2>함께 볼 자료</h2>')) throw new Error('Missing related reading section');
html = html.replace('<h2>함께 볼 자료</h2>', '<h2>함께 볼 자료</h2>' + related);
fs.writeFileSync(file, html);

const description = 'XAIKOREA의 회사소개서, 사업 IR과 공개 가능한 기업 인증 자료를 모았습니다.';
const content = section.replace('<h2 id="company-documents-title">회사 · 사업 자료</h2>', '')
  .replace('<p>회사의 기술과 제품, 사업 방향 및 공개 가능한 기업 인증 자료입니다.</p>', '');
const body = `<div class="kim-page reading-page company-documents-page"><p class="kim-overline">XAIKOREA / COMPANY DOCUMENTS</p><h1 id="company-documents-title">회사 · 사업 자료</h1><p class="kim-lead">${description}</p><div class="reading-links"><a href="/pages/publications.html">← 논문 · 연구 자료로 돌아가기</a></div>${content}<nav class="reading-related" aria-label="관련 자료"><h2>함께 볼 자료</h2><a href="/pages/publications.html"><strong>논문 · 연구 자료 <span aria-hidden="true">→</span></strong><span>논문 원문 · 연구 원고 · 저서</span></a><a href="/pages/company-network.html"><strong>산학협력 · 회원 네트워크 <span aria-hidden="true">→</span></strong><span>기업 협업 · 인재양성 · 기술보호 활동</span></a></nav></div>`;
let company = html.replace(/(<main[^>]*>)[\s\S]*?(<\/main>)/u, (_,open,close) => open + body + close)
  .replace(/<title>[\s\S]*?<\/title>/u, '<title>회사 · 사업 자료 | 김재환 · Jaehwan Kim</title>')
  .replace(/<meta name="description" content="[^"]*">/u, `<meta name="description" content="${description}">`)
  .replace(/<link rel="stylesheet" href="\/css\/(?:book-publications|conference-publication|journal-manuscripts|sdg-manuscripts|paper-preview)\.css">/gu, '')
  .replace(/<script defer src="\/js\/paper-preview\.js"><\/script>/gu, '')
  .replace(/(<a href="\/pages\/publications\.html") aria-current="page"/gu, '$1');
company = company.replace('<link rel="stylesheet" href="/css/reading.css">', '<link rel="stylesheet" href="/css/reading.css"><link rel="stylesheet" href="/css/company-documents.css">');
fs.writeFileSync('public/pages/company-documents.html', applyAuthorLayout(company, profile));

const home = 'public/index.html';
html = fs.readFileSync(home, 'utf8');
html = html.replaceAll('/pages/publications.html#company-documents', '/pages/company-documents.html');
if (!html.includes('href="/pages/company-documents.html"')) html = html.replace('<div class="academic-links">', '<div class="academic-links"><a href="/pages/company-documents.html">회사 · 인증 자료 →</a>');
html = html.replace(/(<a href="\/pages\/company-documents\.html">)[^<]+(<\/a>)/u, '$1회사 · 인증 자료 →$2');
fs.writeFileSync(home, html);
const pagesFile = 'seed/pages.json';
const pages = JSON.parse(fs.readFileSync(pagesFile, 'utf8'));
const pagePath = '/pages/company-documents.html';
const entry = pages.find(page => page.path === pagePath);
if (entry) entry.title = '회사 · 사업 자료 | 김재환';
else pages.push({path:pagePath,title:'회사 · 사업 자료 | 김재환'});
fs.writeFileSync(pagesFile, JSON.stringify(pages,null,2)+'\n');
console.log('Company documents moved to a separate page with related reading links.');
