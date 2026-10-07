import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import directory from '../seed/company-services.json' with {type:'json'};
import {searchResearch} from '../server/agent.ts';

test('all live company services are listed with official links and local logos', () => {
  const html = fs.readFileSync('public/pages/projects.html', 'utf8');
  const services = ['NH Open Business Hub', 'SHAPFINCH', '모두의 하동', '공록', 'BrandPilot', 'MARKSCOPE', 'SAFEFLOW', 'BizProof', 'Luma Inspect', 'DocMatch', 'TAXiA OPS', 'DECIVOX'];
  const operating = html.match(/<section class="company-services" id="company-services"[\s\S]*?<\/section>/u)![0];
  assert.equal((operating.match(/class="company-service-card"/gu) || []).length, 12);
  assert.equal((html.match(/class="company-service-card"/gu) || []).length, 14);
  for (const service of services) assert.ok(html.includes(`>${service}<`), service);
  const logos = [...html.matchAll(/src="(\/assets\/company-services\/[^"]+-logo-(?:v1\.webp|20260926\.svg))"/gu)];
  assert.equal(logos.length, 12);
  for (const [, source] of logos) assert.ok(fs.existsSync(`public${source}`), source);
  assert.match(html, /https:\/\/www\.xaikorea\.ai\.kr\/work#demos/u);
  assert.equal((html.match(/href="https:\/\/www\.xaikorea\.ai\.kr\/work#video-[^"]+"/gu) || []).length, 12);
  const decivox = html.match(/<article class="company-service-card" id="service-decivox">[\s\S]*?<\/article>/u)![0];
  assert.match(decivox, /설치형 AI/u);
  assert.match(decivox, /도입 문의/u);
  assert.doesNotMatch(decivox, /서비스 보기|서비스 운영 중/u);
  assert.match(decivox, /href="https:\/\/www\.xaikorea\.ai\.kr\/contact"/u);
  assert.equal((decivox.match(/<img src="\/assets\/company-services\/decivox-(?:login|summary)-20260926\.png"/gu) || []).length, 2);
  const research = fs.readFileSync('public/pages/research.html', 'utf8');
  assert.match(research, /href="\/pages\/projects\.html#service-decivox"/u);
  assert.match(research, /href="\/pages\/projects\.html#company-services"/u);
  assert.match(html, /회사 포트폴리오이며 김재환 개인의 단독 개발 실적을 뜻하지 않습니다/u);
  const development = html.match(/<section class="company-services company-development" id="taxia-desk-flow"[\s\S]*?<\/section>/u)![0];
  assert.match(development, /같은 세무·회계 AI 워크스페이스 프로젝트/u);
  assert.match(development, /서로 다른 디자인/u);
  assert.doesNotMatch(development, /서비스 운영 중/u);
  assert.equal(directory.developmentProjects.length, 1);
  assert.equal(directory.developmentProjects[0].versions.length, 2);
  for (const version of directory.developmentProjects[0].versions) {
    const card = development.match(new RegExp(`<article class="company-service-card" id="service-${version.id}">[\\s\\S]*?</article>`, 'u'))![0];
    assert.match(card, /개발 중/u);
    assert.ok(card.includes(version.url));
    assert.ok(card.includes(version.access));
    assert.equal((card.match(/<figure>/gu) ?? []).length, 2);
    assert.ok(fs.existsSync(`public${version.logo}`));
    for (const screen of version.screens) assert.ok(fs.existsSync(`public${screen.src}`));
    const answer = searchResearch(version.name);
    assert.match(answer.answer, /개발 중/u);
    assert.match(answer.answer, /같은 세무·회계 AI 워크스페이스 프로젝트/u);
    assert.ok(answer.sources.some(source=>source.url.endsWith('#service-'+version.id)));
  }
  assert.match(research, /href="\/pages\/projects\.html#taxia-desk-flow"/u);
});

test('Agent Harness Engineering is presented as a book with cover and verified metadata', () => {
  const html = fs.readFileSync('public/pages/publications.html', 'utf8');
  assert.match(html, /id="agent-harness-book"/u);
  assert.match(html, /김재환 · 윤재성/u);
  assert.match(html, /작가와 · 2026\.08\.18/u);
  assert.match(html, /9791143821027/u);
  assert.match(html, /https:\/\/www\.yes24\.com\/product\/goods\/195394388/u);
  assert.match(html, /https:\/\/ridibooks\.com\/books\/5273015231/u);
  assert.match(html, /src="\/assets\/books\/agent-harness-engineering\.jpg"/u);
  assert.ok(fs.existsSync('public/assets/books/agent-harness-engineering.jpg'));
});
