import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import researcher from '../seed/researcher.json' with {type:'json'};

test('four patent applications map exact numbers, titles, notices and previews', () => {
  const html = fs.readFileSync('public/pages/patents.html', 'utf8');
  assert.equal(researcher.patents.length, 4);
  assert.equal((html.match(/class="patent-document"/gu) || []).length, 4);
  assert.match(html, /개인정보 가림본/u);
  assert.match(html, /회사 차원 지식재산 이력/u);
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

test('patent decision is a separate verified record with a public redacted document', () => {
  const html = fs.readFileSync('public/pages/patents.html', 'utf8');
  assert.equal(researcher.patentDecisions.length, 1);
  assert.equal((html.match(/class="patent-document patent-decision"/gu) || []).length, 1);
  assert.match(html, /특허결정 1건 · 출원 4건/u);
  assert.match(html, /특허결정과 설정등록은 서로 다른 절차/u);
  for (const decision of researcher.patentDecisions) {
    assert.ok(html.includes(decision.number), decision.number);
    assert.ok(html.includes(decision.title), decision.title);
    assert.ok(html.includes(decision.issuer), decision.issuer);
    assert.ok(fs.existsSync(`public${decision.url}`), decision.url);
    assert.ok(fs.existsSync(`public${decision.preview}`), decision.preview);
  }
});
