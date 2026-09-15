import { DatabaseSync } from 'node:sqlite';
import { existsSync } from 'node:fs';
import { credentialKey, makeCredential, matchesPassword } from '../server/password.ts';

// Run only through an administrator's SSH access. Password data arrives on stdin,
// never in arguments, environment files, shell history, or command output.
let encoded = '';
for await (const chunk of process.stdin) {
  encoded += chunk.toString('utf8');
  if (encoded.length > 1024) throw new Error('Password input is too large');
}
encoded = encoded.trim();
if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encoded) || !encoded)
  throw new Error('Password input is invalid');
const password = new TextDecoder('utf-8', { fatal: true }).decode(Buffer.from(encoded, 'base64'));
encoded = '';
if (password.length < 8 || password.length > 128)
  throw new Error('Administrator password must be 8 to 128 characters');

const next = await makeCredential(password);
if (!(await matchesPassword(password, next))) throw new Error('Password hash verification failed');
const filename = process.env.DATABASE_PATH || '/var/lib/kimjaehwan-homepage/platform.sqlite';
if (!existsSync(filename)) throw new Error('Administrator database does not exist');
const database = new DatabaseSync(filename);
database.exec('PRAGMA busy_timeout=5000; BEGIN IMMEDIATE');
try {
  database.prepare('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value')
    .run(credentialKey, JSON.stringify(next));
  database.exec('COMMIT');
} catch (error) {
  database.exec('ROLLBACK');
  throw error;
} finally {
  database.close();
}
console.log('Administrator password reset; previous sessions are now invalid.');
