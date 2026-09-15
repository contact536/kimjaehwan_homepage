import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createApp } from '../server/app.ts';
import { openDatabase } from '../server/sqlite.ts';

test('SSH recovery changes the stored hash and invalidates prior sessions without printing the password', async () => {
  const filename = `data/admin-recovery-test-${crypto.randomUUID()}.sqlite`;
  const { db, close } = openDatabase(filename);
  const app = createApp();
  const oldPassword = 'initial-password8';
  const newPassword = 'new-recovery-password8';
  const env = { DB: db, ADMIN_PASSWORD: oldPassword,
    SESSION_SECRET: 'test-session-secret-at-least-32-characters' };
  const login = (password: string) => app.request('http://localhost/api/auth/login', {
    method: 'POST', headers: { origin: 'http://localhost', 'content-type': 'application/json' },
    body: JSON.stringify({ password }) }, env);
  const reset = (password: string) => spawnSync(process.execPath,
    ['--experimental-strip-types', 'ops/reset-admin-password.mjs'], {
      input: Buffer.from(password, 'utf8').toString('base64'), encoding: 'utf8',
      env: { ...process.env, DATABASE_PATH: filename },
    });
  try {
    const initial = await login(oldPassword);
    assert.equal(initial.status, 200);
    const session = initial.headers.get('set-cookie')!.split(';')[0];
    assert.notEqual(reset('short').status, 0);
    assert.equal((await login(oldPassword)).status, 200);
    const result = reset(newPassword);
    assert.equal(result.status, 0, result.stderr);
    assert.ok(!result.stdout.includes(newPassword));
    assert.equal((await app.request('http://localhost/api/admin/session',
      { headers: { cookie: session } }, env)).status, 401);
    assert.equal((await login(oldPassword)).status, 401);
    assert.equal((await login(newPassword)).status, 200);
    const stored = await db.prepare("SELECT value FROM settings WHERE key='administrator-credential-v1'").first();
    assert.ok(stored);
    assert.ok(!String(stored.value).includes(newPassword));
  } finally { close(); }
});
