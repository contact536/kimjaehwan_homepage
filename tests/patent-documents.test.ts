import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import researcher from '../seed/researcher.json' with {type:'json'};

test('four patent applications map exact numbers, titles, notices and previews', () => {
  const html = fs.readFileSync('public/pages/patents.html', 'utf8');
  assert.equal(researcher.patents.length, 4);
  assert.equal((html.match(/class="patent-document"/gu) || []).length, 4);
  assert.match(html, /개인정보 가림본/u);
  assert.match(html, /회사 차원의 특허 출원 현황/u);
  for (const patent of researcher.patents) {
    assert.ok(html.includes(patent.number), patent.number);
    assert.ok(html.includes(patent.title), patent.title);
    assert.ok(html.includes(patent.url), patent.url);
    assert.ok(html.includes(patent.preview), patent.preview);
    assert.ok(fs.existsSync(`public${patent.url}`), patent.url);
    assert.ok(fs.existsSync(`public${patent.preview}`), patent.preview);
  }
  assert.doesNotMatch(html, /개별 제목과 번호의 대응/u);
});
