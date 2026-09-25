import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {initializeData} from '../server/database.ts';
import {openDatabase} from '../server/sqlite.ts';

test('Journey separates the three initial patent filings from the later fourth filing', () => {
  const home = fs.readFileSync('public/index.html', 'utf8');
  const cv = fs.readFileSync('public/pages/experience.html', 'utf8');
  for (const html of [home, cv]) {
    assert.match(html, /2026\.02\.27/u);
    assert.match(html, /AI 추론 관련 특허 3건 출원/u);
    assert.match(html, /10-2026-0036482~0036484/u);
    assert.match(html, /2026\.03\.30/u);
    assert.match(html, /AI 추론 관련 특허 1건 추가 출원/u);
    assert.match(html, /10-2026-0057344/u);
    assert.match(html, /2026\.07\.29/u);
    assert.match(html, /하이브리드 검색 기반 AI 추론 시스템 특허결정/u);
    assert.match(html, /설정등록 절차와 구분/u);
    assert.doesNotMatch(html, /개인 발명자 여부와 등록 여부/u);
    assert.doesNotMatch(html, /AI 추론 관련 특허 4건 출원<\/h3>/u);
  }
});

test('versioned migration publishes the patent decision and technology escrow milestones', async () => {
  const connection = openDatabase(':memory:');
  try {
    await initializeData(connection.db);
    await connection.db.prepare("DELETE FROM records WHERE kind='news' AND id LIKE 'news-%'").run();
    await connection.db.prepare("DELETE FROM settings WHERE key='kim-curated-news-v4'").run();
    await initializeData(connection.db);
    const {results} = await connection.db.prepare("SELECT name,payload FROM records WHERE kind='news' AND id LIKE 'news-%'").all();
    const content = results.map(row => `${row.name}\n${row.payload}`).join('\n');
    assert.match(content, /하이브리드 검색 기반 AI 추론 시스템 특허결정/u);
    assert.match(content, /보안형 회의 AI 기술자료 임치/u);
  } finally {
    connection.close();
  }
});

test('versioned migration replaces the old aggregate patent milestone', async () => {
  const connection = openDatabase(':memory:');
  try {
    await initializeData(connection.db);
    await connection.db.prepare("UPDATE records SET name='AI 추론 관련 특허 4건 출원', payload='{\"name\":\"AI 추론 관련 특허 4건 출원\"}' WHERE kind='news' AND id='news-1'").run();
    await connection.db.prepare("DELETE FROM settings WHERE key='kim-curated-news-v3'").run();
    await initializeData(connection.db);
    const {results} = await connection.db.prepare("SELECT name,payload FROM records WHERE kind='news' AND id LIKE 'news-%' ORDER BY id").all();
    const content = results.map(row => `${row.name}\n${row.payload}`).join('\n');
    assert.match(content, /AI 추론 관련 특허 1건 추가 출원/u);
    assert.match(content, /AI 추론 관련 특허 3건 출원/u);
    assert.doesNotMatch(content, /AI 추론 관련 특허 4건 출원/u);
  } finally {
    connection.close();
  }
});
