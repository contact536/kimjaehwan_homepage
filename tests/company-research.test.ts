import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('company links use the official www host and research updates keep attribution clear', () => {
  for (const file of ['public/index.html', 'public/pages/contact.html', 'public/pages/projects.html', 'public/pages/publications.html']) {
    const html = fs.readFileSync(file, 'utf8');
    assert.match(html, /href="https:\/\/www\.xaikorea\.ai\.kr\/"/u, file);
    assert.match(html, />회사 홈페이지 · www\.xaikorea\.ai\.kr ↗<\/a>/u, file);
    assert.doesNotMatch(html, /https:\/\/xaikorea\.ai\.kr\//u, file);
  }

  const research = fs.readFileSync('public/pages/research.html', 'utf8');
  assert.equal((research.match(/company-research-update:start/g) || []).length, 1);
  for (const text of ['Evidence Finder', 'Policy Review', 'Agent Harness', 'On-Premise AI', 'Decision Room', '2026.08.11'])
    assert.ok(research.includes(text), text);
  assert.match(research, /회사 차원의 공개 정보이며 개인 저자·발명자·담당 범위를 뜻하지 않습니다/u);
  assert.match(research, /href="https:\/\/www\.xaikorea\.ai\.kr\/(?:about|work)"/u);
  assert.match(research, /href="\/css\/company-research\.css"/u);
});
