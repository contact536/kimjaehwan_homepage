import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('company product catalog exposes every official project with filtering and attribution', () => {
  const html = fs.readFileSync('public/pages/projects.html', 'utf8');
  const names = ['Evidence Finder', 'Tax Navigator', 'Policy Review', 'Agent Harness', 'Hoban AI Voice', 'Edge AI Lab', 'Secure Edge Gateway', 'AI Governance Studio', 'Technology Protection', 'On-Premise AI', 'Knowledge Engineering', 'Decision Room'];

  assert.equal((html.match(/data-company-product(?:\s|>)/g) || []).length, 12);
  for (const name of names) assert.match(html, new RegExp(`>${name}<`, 'u'));
  assert.match(html, /data-product-filter="research"/u);
  assert.match(html, /data-product-filter="tax"/u);
  assert.match(html, /data-product-filter="governance"/u);
  assert.match(html, /href="https:\/\/www\.xaikorea\.ai\.kr\/work"/u);
  assert.match(html, /김재환 개인의 단독 개발·성과를 뜻하지 않습니다/u);
  assert.match(html, /href="\/css\/company-products\.css"/u);
  assert.match(html, /src="\/js\/company-products\.js"/u);
});
