import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('current AI Business Association board role is shown with official contact details', () => {
  const html = fs.readFileSync('public/pages/experience.html', 'utf8');
  assert.match(html, /2026\.02–현재/u);
  assert.match(html, /\(사\)AI경영학회 이사/u);
  assert.match(html, /AI경영학회 학술위원회 이사로 활동 중/u);
  assert.match(html, /<span class="cv-state">현<\/span>/u);
  assert.match(html, /https:\/\/aiba\.or\.kr\/member/u);
  assert.match(html, /mailto:aiba2023@naver\.com/u);
});

test('current association role is included in research assistant seed data', () => {
  const records = JSON.parse(fs.readFileSync('seed/records.json', 'utf8')) as Array<{kind:string;id:string;data:{name?:string;url?:string}}>;
  const role = records.find(record => record.kind === 'news' && record.id === 'career-1');
  assert.ok(role);
  assert.match(role.data.name ?? '', /\(사\)AI경영학회 이사/u);
  assert.equal(role.data.url, 'https://aiba.or.kr/member');
});
