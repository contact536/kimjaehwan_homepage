import fs from 'node:fs/promises';
import path from 'node:path';
import { gunzipSync } from 'node:zlib';
import { Reader } from 'maxmind';

const destination = process.env.COUNTRY_DB_PATH || '/var/lib/kimjaehwan-homepage/geoip/dbip-country-lite.mmdb';
const now = new Date();
const release = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
const url = `https://download.db-ip.com/free/dbip-country-lite-${release}.mmdb.gz`;
const response = await fetch(url, { signal: AbortSignal.timeout(60000) });
if (!response.ok) throw new Error(`DB-IP download failed: HTTP ${response.status}`);
const zipped = Buffer.from(await response.arrayBuffer());
if (zipped.length > 24 * 1024 * 1024) throw new Error('Country database download exceeded size limit');
const database = gunzipSync(zipped);
if (database.length > 100 * 1024 * 1024) throw new Error('Country database exceeded size limit');
const reader = new Reader(database);
if (!reader.get('8.8.8.8')?.country?.iso_code) throw new Error('Downloaded country database did not pass lookup check');
await fs.mkdir(path.dirname(destination), { recursive: true, mode: 0o700 });
const temporary = `${destination}.${process.pid}.tmp`;
try {
  await fs.writeFile(temporary, database, { mode: 0o600 });
  await fs.rename(temporary, destination);
} finally {
  await fs.rm(temporary, { force: true });
}
console.log(`Updated DB-IP Country Lite ${release}: ${destination}`);
