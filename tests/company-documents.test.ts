import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('book-like documents show accessible cover images linked to their PDFs', () => {
  const html = fs.readFileSync('public/pages/publications.html', 'utf8');
  const covers = [...html.matchAll(/<img src="(\/assets\/documents\/[^"]+-cover\.png)" alt="([^"]+)" width="(\d+)" height="(\d+)"/gu)];

  assert.equal(covers.length, 4);
  for (const [, source, alt, width, height] of covers) {
    assert.ok(fs.existsSync(`public${source}`), source);
    assert.ok(alt.includes('표지'), alt);
    assert.ok(Number(width) > 0 && Number(height) > 0);
  }
  assert.equal((html.match(/class="document-card"/gu) || []).length, 4);
  assert.match(html, /href="\/css\/company-documents\.css"/u);
  assert.match(html, /loading="lazy" decoding="async"/u);
  assert.match(html, /경기도 AI 멤버십 기업 인증서/u);
  assert.match(html, /2026-AI-245/u);
  assert.match(html, /2026\.09\.01-2027\.08\.31/u);
  assert.ok(fs.existsSync('public/documents/xaikorea-ai-membership-2026.pdf'));
  assert.match(html, /기술보호 선도기업 지정서/u);
  assert.match(html, /제2026-015호/u);
  assert.match(html, /2026\.06\.11-2028\.06\.10/u);
  assert.ok(fs.existsSync('public/documents/xaikorea-technology-leading-company-2026.pdf'));
});
