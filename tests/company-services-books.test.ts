import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('all live company services are listed with official links and local logos', () => {
  const html = fs.readFileSync('public/pages/projects.html', 'utf8');
  const services = ['NH Open Business Hub', 'SHAPFINCH', '모두의 하동', '공록', 'BrandPilot', 'MARKSCOPE', 'SAFEFLOW', 'BizProof', 'Luma Inspect', 'DocMatch', 'TAXiA OPS'];
  assert.equal((html.match(/class="company-service-card"/gu) || []).length, 11);
  for (const service of services) assert.ok(html.includes(`>${service}<`), service);
  const logos = [...html.matchAll(/src="(\/assets\/company-services\/[^"]+-logo-v1\.webp)"/gu)];
  assert.equal(logos.length, 11);
  for (const [, source] of logos) assert.ok(fs.existsSync(`public${source}`), source);
  assert.match(html, /https:\/\/www\.xaikorea\.ai\.kr\/#demos/u);
  assert.match(html, /회사 포트폴리오이며 김재환 개인의 단독 개발 실적을 뜻하지 않습니다/u);
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
