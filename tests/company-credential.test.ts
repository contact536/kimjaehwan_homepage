import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {initializeData} from '../server/database.ts';
import {openDatabase} from '../server/sqlite.ts';

test('seven official company credentials and filings are shown consistently across public and assistant data', () => {
  const home = fs.readFileSync('public/index.html', 'utf8');
  const cv = fs.readFileSync('public/pages/experience.html', 'utf8');
  const sources = fs.readFileSync('public/pages/sources.html', 'utf8');
  const records = JSON.parse(fs.readFileSync('seed/records.json', 'utf8')) as Array<{kind:string;id:string;data:{name?:string;url?:string;certificate?:string}}>;
  const credentials = records.filter(record => record.kind === 'news' && record.id.startsWith('credential-'));
  assert.equal(credentials.length, 7);
  for (const html of [home, cv]) {
    assert.match(html, /경기도 AI 멤버십 기업 선정/u);
    assert.match(html, /기술보호 선도기업 지정/u);
    assert.match(html, /연구개발전담부서 인정/u);
    assert.match(html, /제2026151302호|\/documents\/xaikorea-rnd-department-certificate-2026\.pdf/u);
    assert.match(html, /벤처기업 확인/u);
    assert.match(html, /2026\.02\.04-2029\.02\.03/u);
    assert.match(html, /XAIKOREA SAFEFLOW 위치기반서비스사업 신고/u);
    assert.match(html, /제1692호/u);
    assert.match(html, /XAIKOREA 소프트웨어사업자 일반현황 관리 확인/u);
    assert.match(html, /2026\.10\.21/u);
  }
  assert.equal((home.match(/연구개발전담부서 인정/gu) || []).length, 1);
  assert.equal((home.match(/벤처기업 확인/gu) || []).length, 1);
  assert.match(sources, /특허출원 관련 통지서 공개본 4건/u);
  const payload = credentials.map(record => JSON.stringify(record.data)).join('\n');
  assert.match(payload, /2026-AI-245/u);
  assert.match(payload, /제2026-015호/u);
  assert.match(payload, /제2026151302호/u);
  assert.match(payload, /제20260204030008호/u);
  assert.match(payload, /B26-341120-001/u);
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
    assert.equal(results.filter(row => String(row.id).startsWith('credential-')).length, 7);
    assert.ok(results.some(row => row.id === 'custom-admin'));
    const payload = results.map(row => String(row.payload)).join('\n');
    assert.match(payload, /2026151302/u);
    assert.match(payload, /20260204030008/u);
  } finally {
    connection.close();
  }
});

test('filing migration adds only the new record and preserves edited news across repeated startup', async () => {
  const connection = openDatabase(':memory:');
  try {
    await initializeData(connection.db);
    await connection.db.prepare("DELETE FROM records WHERE kind='news' AND id='credential-5'").run();
    await connection.db.prepare("DELETE FROM settings WHERE key='kim-company-filing-20261008'").run();
    await connection.db.prepare("UPDATE records SET name='관리자 수정 이력', payload='{\"name\":\"관리자 수정 이력\"}', revision=7 WHERE kind='news' AND id='credential-1'").run();
    await initializeData(connection.db);
    await initializeData(connection.db);
    const existing=await connection.db.prepare("SELECT name, revision FROM records WHERE kind='news' AND id='credential-1'").first();
    assert.equal(existing?.name,'관리자 수정 이력');
    assert.equal(existing?.revision,7);
    const added=await connection.db.prepare("SELECT payload, revision FROM records WHERE kind='news' AND id='credential-5'").first();
    assert.equal(added?.revision,1);
    assert.equal(JSON.parse(String(added?.payload)).certificate,'제1692호');
  } finally { connection.close(); }
});

test('software business confirmation migration preserves existing and edited records on repeated startup', async () => {
  const connection = openDatabase(':memory:');
  try {
    await initializeData(connection.db);
    await connection.db.prepare("DELETE FROM records WHERE kind='news' AND id='credential-6'").run();
    await connection.db.prepare("DELETE FROM settings WHERE key='kim-software-business-20261021'").run();
    await connection.db.prepare("UPDATE records SET name='관리자 수정 이력', revision=7 WHERE kind='news' AND id='credential-1'").run();
    await initializeData(connection.db);
    const added = await connection.db.prepare("SELECT payload,revision FROM records WHERE kind='news' AND id='credential-6'").first();
    assert.equal(added?.revision, 1);
    assert.equal(JSON.parse(String(added?.payload)).certificate, 'B26-341120-001');
    await connection.db.prepare("UPDATE records SET name='관리자가 수정한 확인 이력', revision=3 WHERE kind='news' AND id='credential-6'").run();
    await initializeData(connection.db);
    const original = await connection.db.prepare("SELECT name,revision FROM records WHERE kind='news' AND id='credential-1'").first();
    const updated = await connection.db.prepare("SELECT name,revision FROM records WHERE kind='news' AND id='credential-6'").first();
    assert.equal(original?.name, '관리자 수정 이력');
    assert.equal(original?.revision, 7);
    assert.equal(updated?.name, '관리자가 수정한 확인 이력');
    assert.equal(updated?.revision, 3);
    const count = await connection.db.prepare("SELECT count(*) AS count FROM records WHERE kind='news' AND id='credential-6'").first();
    assert.equal(count?.count, 1);
  } finally { connection.close(); }
});

test('procurement migration upgrades existing databases without overwriting administrator edits', async () => {
  const connection = openDatabase(':memory:');
  try {
    await initializeData(connection.db);
    await connection.db.prepare("DELETE FROM records WHERE kind='news' AND id='credential-7'").run();
    await connection.db.prepare("DELETE FROM settings WHERE key='kim-procurement-20261025'").run();
    await connection.db.prepare("UPDATE records SET name='기존 관리자 편집', revision=8 WHERE kind='news' AND id='credential-6'").run();
    await initializeData(connection.db);
    const added = await connection.db.prepare("SELECT payload,revision FROM records WHERE kind='news' AND id='credential-7'").first();
    const payload = JSON.parse(String(added?.payload));
    assert.equal(added?.revision, 1);
    assert.equal(payload.date, '2026.10.23');
    assert.equal(payload.url, '/pages/company-network.html#public-procurement-registration');
    assert.match(payload.name, /최초 등록일은 2026년 5월 11일/u);
    await connection.db.prepare("UPDATE records SET name='새 이력 관리자 편집', revision=4 WHERE kind='news' AND id='credential-7'").run();
    // A retry with the marker missing must also preserve the edited record.
    await connection.db.prepare("DELETE FROM settings WHERE key='kim-procurement-20261025'").run();
    await initializeData(connection.db);
    await initializeData(connection.db);
    const {results} = await connection.db.prepare("SELECT id,name,revision FROM records WHERE kind='news' AND id IN ('credential-6','credential-7') ORDER BY id").all();
    assert.deepEqual(results.map(row => [row.id, row.name, row.revision]), [
      ['credential-6', '기존 관리자 편집', 8],
      ['credential-7', '새 이력 관리자 편집', 4],
    ]);
  } finally { connection.close(); }
});
