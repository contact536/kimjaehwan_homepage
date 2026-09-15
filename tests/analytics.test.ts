import test from 'node:test';
import assert from 'node:assert/strict';
import { openDatabase } from '../server/sqlite.ts';
import { analyticsReport, koreaDay, recordVisit } from '../server/analytics.ts';
import { broadRegion, countryFromIp, locationFromIp } from '../server/country.ts';
import { createApp } from '../server/app.ts';

test('anonymous page statistics count daily visitors, exclude admins and bots, and protect the report', async () => {
  const { db, close } = openDatabase(':memory:');
  const html = () => new Response('<h1>Research</h1>', { headers: { 'content-type': 'text/html; charset=utf-8' } });
  const visit = (path: string, cookie = '', agent = 'Mozilla/5.0', referer = '') =>
    new Request(`https://kimjaehwan.com${path}`, { headers: { cookie, 'user-agent': agent,
      referer, 'x-client-ip': '203.0.113.75' } });
  try {
    const oldDay = koreaDay(new Date(Date.now() - 92 * 86400000));
    await db.prepare("INSERT INTO analytics_visitors(day,visitor_hash,first_referrer,country) VALUES(?,?,?,?)").bind(oldDay, 'old-hash', '직접 방문', 'KR').run();
    await db.prepare("INSERT INTO analytics_daily(day,path,referrer,country,views) VALUES(?,?,?,?,1)").bind(oldDay, '/', '직접 방문', 'KR').run();
    const first = await recordVisit(db, visit('/index.html', '', 'Mozilla/5.0', 'https://search.example/query?q=private'), html(), { country: 'KR', region: '서울특별시' }, 'https://kimjaehwan.com');
    const cookie = first.headers.get('set-cookie')!.split(';')[0];
    assert.match(first.headers.get('set-cookie')!, /HttpOnly.*SameSite=Lax.*Secure/);
    await recordVisit(db, visit('/pages/research.html', cookie), html(), { country: 'KR', region: '부산광역시' }, 'https://kimjaehwan.com');
    await recordVisit(db, visit('/', cookie), html(), { country: 'KR', region: '부산광역시' }, 'https://kimjaehwan.com');
    await recordVisit(db, visit('/', '', 'Mozilla/5.0'), html(), { country: 'US', region: 'California' }, 'https://kimjaehwan.com');
    await recordVisit(db, visit('/', '', 'Googlebot'), html(), { country: 'KR', region: '서울특별시' }, 'https://kimjaehwan.com');
    await recordVisit(db, visit('/', 'research_session=fake'), html(), { country: 'KR', region: '서울특별시' }, 'https://kimjaehwan.com');
    await recordVisit(db, visit('/admin/', 'research_session=fake'), html(), { country: 'KR', region: '서울특별시' }, 'https://kimjaehwan.com');
    const report = await analyticsReport(db, 7);
    assert.equal(report.views, 4);
    assert.equal(report.visitors, 2);
    assert.equal(report.pages.find(row => row.path === '/')?.views, 3);
    assert.ok(report.referrers.some(row => row.referrer === 'search.example'));
    assert.ok(report.countries.some(row => row.country === 'KR'));
    assert.equal(report.regions.find(row => row.country === 'KR' && row.region === '서울특별시')?.visitors, 1);
    assert.equal(report.regions.find(row => row.country === 'US' && row.region === 'California')?.visitors, 1);
    assert.equal(report.regions.find(row => row.region === '부산광역시'), undefined);
    const text = JSON.stringify((await db.prepare('SELECT * FROM analytics_visitors').all()).results);
    assert.doesNotMatch(text, /203\.0\.113\.75|private|\/query|Mozilla/);
    assert.match(text, /visitor_hash/);
    assert.doesNotMatch(text, new RegExp(cookie.split('=')[1]));
    assert.equal((await db.prepare('SELECT COUNT(*) AS total FROM analytics_visitors WHERE day=?').bind(oldDay).first())?.total, 0);

    const app = createApp();
    const env = { DB: db, ADMIN_PASSWORD: 'test-admin-password', SESSION_SECRET: 'long-test-secret-at-least-32-characters' };
    const unauthenticated = await app.request('http://localhost/api/admin/analytics', {}, env);
    assert.equal(unauthenticated.status, 401);
    const login = await app.request('http://localhost/api/auth/login', { method: 'POST',
      headers: { origin: 'http://localhost', 'content-type': 'application/json' },
      body: JSON.stringify({ password: env.ADMIN_PASSWORD }) }, env);
    assert.equal(login.status, 200);
    const session = login.headers.get('set-cookie')!.split(';')[0];
    const authorized = await app.request('http://localhost/api/admin/analytics?days=7', { headers: { cookie: session } }, env);
    assert.equal(authorized.status, 200);
    assert.equal((await authorized.json() as any).visitors, 2);
    const invalid = await app.request('http://localhost/api/admin/analytics?days=1000', { headers: { cookie: session } }, env);
    assert.equal(invalid.status, 400);
    assert.equal(countryFromIp('not-an-ip', 'missing.mmdb'), '??');
    assert.deepEqual(locationFromIp('not-an-ip', 'missing.mmdb', 'missing.mmdb'), { country: '??', region: '' });
    assert.deepEqual(locationFromIp('8.8.8.8', 'missing.mmdb', 'missing.mmdb'), { country: '??', region: '' });
    assert.equal(broadRegion({ subdivisions: [
      { names: { ko: '서울특별시', en: 'Seoul' } },
      { names: { ko: '중구', en: 'Jung-gu' } },
    ] }), '서울특별시');
  } finally { close(); }
});
