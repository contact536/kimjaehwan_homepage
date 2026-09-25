import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {initializeData} from '../server/database.ts';
import {openDatabase} from '../server/sqlite.ts';

test('Gyeonggi AI membership is shown in the home Journey, CV, sources and assistant seed', () => {
  const home = fs.readFileSync('public/index.html', 'utf8');
  const cv = fs.readFileSync('public/pages/experience.html', 'utf8');
  const sources = fs.readFileSync('public/pages/sources.html', 'utf8');
  const records = JSON.parse(fs.readFileSync('seed/records.json', 'utf8')) as Array<{kind:string;id:string;data:{name?:string;url?:string;certificate?:string}}>;
  const aiMembership = records.find(record => record.kind === 'news' && record.id === 'credential-1');
  const technologyProtection = records.find(record => record.kind === 'news' && record.id === 'credential-2');

  for (const html of [home, cv]) {
    assert.match(html, /경기도 AI 멤버십 기업 선정/u);
    assert.match(html, /2026\.09\.01-2027\.08\.31/u);
    assert.match(html, /\/documents\/xaikorea-ai-membership-2026\.pdf/u);
    assert.match(html, /기술보호 선도기업 지정/u);
    assert.match(html, /2026\.06\.11-2028\.06\.10/u);
    assert.match(html, /\/documents\/xaikorea-technology-leading-company-2026\.pdf/u);
  }
  assert.match(sources, /경기도 AI 멤버십 기업 인증서/u);
  assert.match(sources, /기술보호 선도기업 지정서/u);
  assert.ok(aiMembership);
  assert.ok(technologyProtection);
  assert.equal(aiMembership.data.certificate, '2026-AI-245');
  assert.equal(technologyProtection.data.certificate, '제2026-015호');
});

test('Gyeonggi AI membership is added to an existing personal database', async () => {
  const connection = openDatabase(':memory:');
  try {
    await initializeData(connection.db);
    await connection.db.prepare("DELETE FROM records WHERE kind='news' AND id='credential-1'").run();
    await connection.db.prepare("DELETE FROM records WHERE kind='news' AND id='credential-2'").run();
    await connection.db.prepare("DELETE FROM settings WHERE key='kim-company-credentials-v1'").run();
    await initializeData(connection.db);
    const {results} = await connection.db.prepare("SELECT payload FROM records WHERE kind='news' AND id LIKE 'credential-%' ORDER BY id").all();
    assert.equal(results.length, 2);
    const payload = results.map(row => String(row.payload)).join('\n');
    assert.match(payload, /2026-AI-245/u);
    assert.match(payload, /제2026-015호/u);
  } finally {
    connection.close();
  }
});
