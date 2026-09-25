import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('KSCI 2026 conference paper is presented with verified metadata and source images', () => {
  const html = fs.readFileSync('public/pages/publications.html', 'utf8');
  assert.equal((html.match(/id="ksci-2026-edge-ai-paper"/gu) || []).length, 1);
  assert.match(html, /건설 기업을 위한 엣지 AI 기반 보안형 온프레미스 회의 인텔리전스 파이프라인/u);
  assert.match(html, /A Secure On-Premises Meeting Intelligence Pipeline Using Edge AI for Construction Enterprises/u);
  assert.match(html, /김재환<\/strong> \(제1저자·교신저자\)/u);
  assert.match(html, /한국컴퓨터정보학회 하계학술대회 논문집 · 제34권 제2호 · 2026\.07/u);
  assert.match(html, /제74차 2026 한국컴퓨터정보학회 하계학술대회/u);
  assert.match(html, /응용소프트웨어 III/u);
  assert.match(html, /2026\.07\.09–07\.11 · 제주대학교 아라캠퍼스/u);
  assert.match(html, /RTF 0\.160/u);
  assert.match(html, /최대 4\.25배/u);
  assert.doesNotMatch(html, /CER 최대 43%|DER 최대 62%|후속 과제/u);
  assert.match(html, /Qwen3-14B · vLLM/u);
  assert.match(html, /기업의 기밀 회의 데이터를 외부 클라우드로 전송하지 않고 내부 서버에서 안전하게 처리/u);
  assert.match(html, /회의 기록과 핵심 내용을 빠르게 생성합니다/u);
  assert.doesNotMatch(html, /첨부된 논문집 표지와 첫 페이지를 기준으로 등록|conference-source-note/u);
  assert.match(html, /https:\/\/conference\.ksci\.re\.kr\/2026-02\//u);
  assert.match(html, /VOIS00821838/u);
  const images = [
    'public/assets/publications/ksci-2026-summer-proceedings-cover.png',
    'public/assets/publications/secure-on-premises-meeting-intelligence-first-page.png',
  ];
  for (const image of images) assert.ok(fs.existsSync(image), image);
});
