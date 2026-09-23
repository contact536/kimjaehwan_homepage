import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('book-like documents show accessible cover images linked to their PDFs', () => {
  const html = fs.readFileSync('public/pages/publications.html', 'utf8');
  const covers = [...html.matchAll(/<img src="(\/assets\/documents\/[^"]+-cover\.png)" alt="([^"]+)" width="(\d+)" height="(\d+)"/gu)];

  assert.equal(covers.length, 2);
  for (const [, source, alt, width, height] of covers) {
    assert.ok(fs.existsSync(`public${source}`), source);
    assert.ok(alt.includes('표지'), alt);
    assert.ok(Number(width) > 0 && Number(height) > 0);
  }
  assert.equal((html.match(/class="document-card"/gu) || []).length, 2);
  assert.match(html, /href="\/css\/company-documents\.css"/u);
  assert.match(html, /loading="lazy" decoding="async"/u);
});
