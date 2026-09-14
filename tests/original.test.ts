import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { originalResponse } from '../server/original.ts';
import { openDatabase } from '../server/sqlite.ts';
import { initializeData } from '../server/database.ts';
import { createApp } from '../server/app.ts';
import manifest from '../seed/original-source.json' with { type: 'json' };

test('original style foundations retain exact source bytes', () => {
  assert.equal(manifest.length, 39);
  for (const item of manifest.filter(item => item.path.startsWith('css/'))) assert.equal(createHash('sha256').update(fs.readFileSync('public/' + item.path)).digest('hex'), item.sha256, item.path);
});

test('unchanged database produces byte-identical original HTML responses', async () => {
  const connection = openDatabase(':memory:');
  try {
    for (const pathname of ['/index.html', '/pages/conference-tier.html', '/pages/journal.html']) {
      const original = fs.readFileSync('public' + pathname);
      const response = await originalResponse(new Response(original), pathname, connection.db);
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), original, pathname);
    }
  } finally { connection.close(); }
});

test('edited catalog retains original render/filter code and safely serializes data', async () => {
  const connection = openDatabase(':memory:');
  try {
    await initializeData(connection.db);
    const existing = await connection.db.prepare("SELECT * FROM records WHERE kind='conferences' LIMIT 1").first();
    const payload = JSON.parse(existing!.payload);
    payload.name = '</script><img src=x onerror=alert(1)> $&';
    await connection.db.prepare("UPDATE records SET payload=?,revision=2 WHERE kind='conferences' AND id=?").bind(JSON.stringify(payload), existing!.id).run();
    const source = fs.readFileSync('public/pages/conference-tier.html', 'utf8');
    const response = await originalResponse(new Response(source), '/pages/conference-tier.html', connection.db);
    const html = await response.text();
    assert.ok(html.includes('function makeMultiSelect('));
    assert.ok(html.includes('escapeEditedHtml(c.name)'));
    assert.ok(!html.includes(payload.name));
    assert.ok(!html.includes('platform-pagination'));
    const code = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).find(s => s.includes('const CONFERENCES'))!;
    new vm.Script(code);
  } finally { connection.close(); }
});

test('home profile edits preserve markup and escape inserted HTML', async () => {
  const connection = openDatabase(':memory:');
  try {
    await initializeData(connection.db);
    for (const [kind, id] of [['profile', 'main'], ['news', 'news-1']]) {
      const row = await connection.db.prepare('SELECT payload FROM records WHERE kind=? AND id=?').bind(kind, id).first();
      const payload = JSON.parse(row!.payload); payload.name = 'Updated <script>unsafe</script> $&';
      await connection.db.prepare('UPDATE records SET payload=?,revision=2 WHERE kind=? AND id=?').bind(JSON.stringify(payload), kind, id).run();
    }
    const response = await originalResponse(new Response(fs.readFileSync('public/index.html')), '/index.html', connection.db);
    const html = await response.text();
    assert.ok(html.includes('Updated &lt;script&gt;unsafe&lt;/script&gt; $&amp;'));
    assert.ok(html.split('Updated &lt;script&gt;unsafe&lt;/script&gt; $&amp;').length >= 3, 'profile and news both update safely');
    assert.ok(!html.includes('<script>unsafe</script>'));
    assert.ok(html.includes('academic-intro')); assert.ok(html.includes('/assets/jaehwan-kim.jpg')); assert.ok(!html.includes('particleCanvas'));
  } finally { connection.close(); }
});

test('nested original menu URLs resolve through server compatibility aliases', async () => {
  const app = createApp();
  for (const [path, destination] of [['/pages/index.html', '/index.html'], ['/pages/pages/about.html', '/pages/about.html'], ['/pages/assets/favicon.png', '/assets/favicon.png']]) {
    const response = await app.request('http://localhost' + path);
    assert.equal(response.status, 302); assert.equal(response.headers.get('location'), destination);
  }
});
