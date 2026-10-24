import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {searchResearch} from '../server/agent.ts';

test('ABOUT additions retain company attribution, official sources, and dated filing status',()=>{
 const network=fs.readFileSync('public/pages/company-network.html','utf8');
 const filing=network.match(/<article class="network-card" id="location-based-services-filing"[\s\S]*?<\/article>/u)![0];
 const startup=network.match(/<article class="network-card" id="baemin-startup-square"[\s\S]*?<\/article>/u)![0];
 const software=network.match(/<article class="network-card" id="software-business-confirmation"[\s\S]*?<\/article>/u)![0];
 assert.match(software,/XAIKOREA · 사업자 확인/u);
 assert.match(software,/한국인공지능소프트웨어산업협회/u);
 assert.match(software,/발급번호<\/dt><dd>B26-341120-001/u);
 assert.match(software,/발급일<\/dt><dd>2026\.10\.21/u);
 assert.match(software,/확인일자<\/dt><dd>2026\.10\.20/u);
 assert.match(software,/조달청 입찰참가용/u);
 for(const field of ['컴퓨터관련 서비스사업','패키지소프트웨어 개발·공급사업','디지털콘텐츠 개발서비스사업','데이터베이스 제작 및 검색서비스사업'])assert.ok(software.includes(field));
 assert.match(software,/href="https:\/\/www\.xaikorea\.ai\.kr\/about#company-credentials"/u);
 assert.match(network,/기업 운영·입주 기반 4건/u);
 assert.match(filing,/XAIKOREA · 사업 신고/u);
 assert.match(filing,/방송미디어통신위원회/u);
 assert.match(filing,/신고번호<\/dt><dd>제1692호/u);
 assert.match(filing,/발급일<\/dt><dd>2026\.10\.08/u);
 assert.match(filing,/href="https:\/\/www\.xaikorea\.ai\.kr\/about#company-credentials"/u);
 assert.match(startup,/XAIKOREA · 입주기업/u);
 assert.match(startup,/공식 소개 분야<\/dt><dd>핀테크/u);
 assert.match(startup,/자료 확인일<\/dt><dd>2026\.10\.08/u);
 assert.match(startup,/href="https:\/\/startup\.woowahan\.com\/about\/startups\/0\/20" target="_blank" rel="noopener noreferrer"/u);
 assert.doesNotMatch(startup,/입주일|입주기간|협약일/u);
 assert.doesNotMatch(filing+startup+software,/download=|\.pdf|<img/u);
 const project=fs.readFileSync('public/pages/projects.html','utf8').match(/<article class="company-service-card" id="service-safeflow"[\s\S]*?<\/article>/u)![0];
 assert.match(project,/href="\/pages\/company-network\.html#location-based-services-filing"/u);
 const research=fs.readFileSync('public/pages/research.html','utf8');
 for(const id of ['location-based-services-filing','baemin-startup-square','software-business-confirmation'])assert.ok(research.includes('/pages/company-network.html#'+id));
 for(const [query,id] of [['위치기반서비스사업 신고','location-based-services-filing'],['배민스타트업스퀘어','baemin-startup-square'],['소프트웨어사업자','software-business-confirmation']]) {
  const result=searchResearch(query);
  assert.ok(result.sources.some(item=>item.url==='/pages/company-network.html#'+id));
  assert.match(result.answer,/XAIKOREA/u);
 }
});
