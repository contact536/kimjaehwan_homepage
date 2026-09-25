import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('company documents show accessible previews linked to all six PDFs', () => {
  const html = fs.readFileSync('public/pages/publications.html', 'utf8');
  const covers = [...html.matchAll(/<img src="(\/assets\/documents\/[^"]+\.(?:png|webp))" alt="([^"]+)" width="(\d+)" height="(\d+)"/gu)];
  assert.equal(covers.length, 6);
  for (const [, source, alt, width, height] of covers) {
    assert.ok(fs.existsSync(`public${source}`), source);
    assert.ok(alt.includes('표지'), alt);
    assert.ok(Number(width) > 0 && Number(height) > 0);
  }
  assert.equal((html.match(/class="document-card"/gu) || []).length, 6);
  assert.match(html, /href="\/css\/company-documents\.css"/u);
  assert.match(html, /경기도 AI 멤버십 기업 인증서/u);
  assert.match(html, /2026-AI-245/u);
  assert.match(html, /기술보호 선도기업 지정서/u);
  assert.match(html, /제2026-015호/u);
  assert.match(html, /연구개발전담부서 인정서/u);
  assert.match(html, /제2026151302호/u);
  assert.match(html, /벤처기업확인서/u);
  assert.match(html, /제20260204030008호/u);
  for (const file of [
    'xaikorea-ai-membership-2026.pdf',
    'xaikorea-technology-leading-company-2026.pdf',
    'xaikorea-rnd-department-certificate-2026.pdf',
    'xaikorea-venture-enterprise-certificate-2026.pdf',
  ]) assert.ok(fs.existsSync(`public/documents/${file}`), file);
});
