import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {searchResearch} from '../server/agent.ts';

test('ABOUT additions retain company attribution, official sources, and dated filing status',()=>{
 const network=fs.readFileSync('public/pages/company-network.html','utf8');
 const filing=network.match(/<article class="network-card" id="location-based-services-filing"[\s\S]*?<\/article>/u)![0];
 const startup=network.match(/<article class="network-card" id="baemin-startup-square"[\s\S]*?<\/article>/u)![0];
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
 assert.doesNotMatch(filing+startup,/download=|\.pdf|<img/u);
 const project=fs.readFileSync('public/pages/projects.html','utf8').match(/<article class="company-service-card" id="service-safeflow"[\s\S]*?<\/article>/u)![0];
 assert.match(project,/href="\/pages\/company-network\.html#location-based-services-filing"/u);
 const research=fs.readFileSync('public/pages/research.html','utf8');
 for(const id of ['location-based-services-filing','baemin-startup-square'])assert.ok(research.includes('/pages/company-network.html#'+id));
 for(const [query,id] of [['위치기반서비스사업 신고','location-based-services-filing'],['배민스타트업스퀘어','baemin-startup-square']]) {
  const result=searchResearch(query);
  assert.ok(result.sources.some(item=>item.url==='/pages/company-network.html#'+id));
  assert.match(result.answer,/XAIKOREA/u);
 }
});
