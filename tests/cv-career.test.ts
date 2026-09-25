import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {initializeData} from '../server/database.ts';
import {openDatabase} from '../server/sqlite.ts';

test('current AI Business Association board role is shown with official contact details', () => {
  const html = fs.readFileSync('public/pages/experience.html', 'utf8');
  assert.match(html, /2026\.02–현재/u);
  assert.match(html, /\(사\)AI경영학회 이사/u);
  assert.match(html, /AI경영학회 학술위원회 이사로 활동 중/u);
  assert.match(html, /<span class="cv-state">현<\/span>/u);
  assert.match(html, /https:\/\/aiba\.or\.kr\/member/u);
  assert.match(html, /mailto:aiba2023@naver\.com/u);
});

test('home journey shows the current AI Business Association board role', () => {
  const html = fs.readFileSync('public/index.html', 'utf8');
  const journey = html.match(/<span class="section-number">03\.<\/span> Journey<\/h2>([\s\S]*?)<\/div><\/section>/u)?.[1] ?? '';
  assert.match(journey, /2026\.02–현재/u);
  assert.match(journey, /\(사\)AI경영학회 이사 \(현\)/u);
  assert.match(journey, /https:\/\/aiba\.or\.kr\/member/u);
});

test('current association role is included in research assistant seed data', () => {
  const records = JSON.parse(fs.readFileSync('seed/records.json', 'utf8')) as Array<{kind:string;id:string;data:{name?:string;url?:string}}>;
  const role = records.find(record => record.kind === 'news' && record.id === 'career-1');
  assert.ok(role);
  assert.match(role.data.name ?? '', /\(사\)AI경영학회 이사/u);
  assert.equal(role.data.url, 'https://aiba.or.kr/member');
});

test('current association role is added to an existing personal database', async () => {
  const connection = openDatabase(':memory:');
  try {
    await initializeData(connection.db);
    await connection.db.prepare("DELETE FROM records WHERE kind='news' AND id='career-1'").run();
    await connection.db.prepare("DELETE FROM settings WHERE key='kim-career-v1'").run();
    await initializeData(connection.db);
    const row = await connection.db.prepare("SELECT payload FROM records WHERE kind='news' AND id='career-1'").first();
    assert.ok(row);
    assert.match(String(row.payload), /AI경영학회/u);
  } finally {
    connection.close();
  }
});
