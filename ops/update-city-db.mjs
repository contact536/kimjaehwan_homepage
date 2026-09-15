import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createReadStream, createWriteStream } from 'node:fs';
import { createGunzip } from 'node:zlib';
import { pipeline } from 'node:stream/promises';
import { open } from 'maxmind';

const destination = process.env.CITY_DB_PATH || '/var/lib/kimjaehwan-homepage/geoip/dbip-city-lite.mmdb';
const now = new Date();
const release = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
const url = `https://download.db-ip.com/free/dbip-city-lite-${release}.mmdb.gz`;
await fs.mkdir(path.dirname(destination), { recursive: true, mode: 0o700 });
const compressed = `${destination}.${process.pid}.gz.tmp`;
const temporary = `${destination}.${process.pid}.tmp`;
try {
  // Download to disk because City Lite is too large to buffer in the updater process.
  execFileSync('curl', ['--fail', '--location', '--silent', '--show-error',
    '--retry', '2', '--retry-all-errors', '--max-time', '300', '--output', compressed, url],
    { timeout: 310000, maxBuffer: 1024 * 1024 });
  const zippedSize = (await fs.stat(compressed)).size;
  if (zippedSize < 1024 * 1024 || zippedSize > 100 * 1024 * 1024)
    throw new Error('City database download has an unexpected size');
  await pipeline(createReadStream(compressed), createGunzip(),
    createWriteStream(temporary, { mode: 0o600 }));
  const size = (await fs.stat(temporary)).size;
  if (size < 10 * 1024 * 1024 || size > 200 * 1024 * 1024)
    throw new Error('City database has an unexpected size');
  const reader = await open(temporary);
  if (!reader.get('8.8.8.8')?.country?.iso_code)
    throw new Error('Downloaded city database did not pass lookup check');
  await fs.rename(temporary, destination);
  console.log(`Updated DB-IP City Lite ${release}: ${destination}`);
} finally {
  await fs.rm(compressed, { force: true });
  await fs.rm(temporary, { force: true });
}
