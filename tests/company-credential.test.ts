import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {initializeData} from '../server/database.ts';
import {openDatabase} from '../server/sqlite.ts';

test('four official company credentials are shown consistently across public and assistant data', () => {
  const home = fs.readFileSync('public/index.html', 'utf8');
  const cv = fs.readFileSync('public/pages/experience.html', 'utf8');
  const sources = fs.readFileSync('public/pages/sources.html', 'utf8');
  const records = JSON.parse(fs.readFileSync('seed/records.json', 'utf8')) as Array<{kind:string;id:string;data:{name?:string;url?:string;certificate?:string}}>;
  const credentials = records.filter(record => record.kind === 'news' && record.id.startsWith('credential-'));
  assert.equal(credentials.length, 4);
  for (const html of [home, cv]) {
    assert.match(html, /경기도 AI 멤버십 기업 선정/u);
    assert.match(html, /기술보호 선도기업 지정/u);
    assert.match(html, /연구개발전담부서 인정/u);
    assert.match(html, /제2026151302호|\/documents\/xaikorea-rnd-department-certificate-2026\.pdf/u);
    assert.match(html, /벤처기업 확인/u);
    assert.match(html, /2026\.02\.04-2029\.02\.03/u);
  }
  assert.equal((home.match(/연구개발전담부서 인정/gu) || []).length, 1);
  assert.equal((home.match(/벤처기업 확인/gu) || []).length, 1);
  assert.match(sources, /특허출원 관련 통지서 공개본 4건/u);
  const payload = credentials.map(record => JSON.stringify(record.data)).join('\n');
  assert.match(payload, /2026-AI-245/u);
  assert.match(payload, /제2026-015호/u);
  assert.match(payload, /제2026151302호/u);
  assert.match(payload, /제20260204030008호/u);
});

test('versioned migration refreshes curated records while preserving administrator news', async () => {
  const connection = openDatabase(':memory:');
  try {
    await initializeData(connection.db);
    await connection.db.prepare("INSERT INTO records(kind,id,name,payload,revision,updated_at) VALUES('news','custom-admin','관리자 소식','{\"name\":\"관리자 소식\"}',1,'2026-09-26')").run();
    await connection.db.prepare("DELETE FROM records WHERE kind='news' AND id IN ('credential-3','credential-4')").run();
    await connection.db.prepare("DELETE FROM settings WHERE key='kim-curated-news-v2'").run();
    await initializeData(connection.db);
    const {results} = await connection.db.prepare("SELECT id,payload FROM records WHERE kind='news' AND (id LIKE 'credential-%' OR id='custom-admin') ORDER BY id").all();
    assert.equal(results.filter(row => String(row.id).startsWith('credential-')).length, 4);
    assert.ok(results.some(row => row.id === 'custom-admin'));
    const payload = results.map(row => String(row.payload)).join('\n');
    assert.match(payload, /2026151302/u);
    assert.match(payload, /20260204030008/u);
  } finally {
    connection.close();
  }
});
