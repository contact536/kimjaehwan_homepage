import type { Database } from "./database.ts";

const dateParts = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit",
});
const cookieName = "research_visit";
let lastPrunedDay = "";

export function koreaDay(date = new Date()) {
  const parts = Object.fromEntries(dateParts.formatToParts(date).map(part => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function referrerHost(referer: string | null, siteUrl: string) {
  if (!referer) return "직접 방문";
  try {
    const source = new URL(referer);
    const site = new URL(siteUrl);
    if (!['http:', 'https:'].includes(source.protocol)) return "직접 방문";
    if (source.hostname === site.hostname || source.hostname === `www.${site.hostname}`)
      return "사이트 내부";
    return source.hostname.toLowerCase().slice(0, 120);
  } catch { return "직접 방문"; }
}

export function shouldTrack(request: Request, response: Response) {
  const path = new URL(request.url).pathname;
  if (request.method !== "GET" || response.status !== 200 ||
      !response.headers.get("content-type")?.toLowerCase().includes("text/html") ||
      path.startsWith("/admin") || path.startsWith("/api/") ||
      /(?:^|;\s*)research_session=/.test(request.headers.get("cookie") || "")) return false;
  const agent = request.headers.get("user-agent") || "";
  return !/(?:bot|crawler|spider|slurp|headless|lighthouse|preview|curl|wget|python-requests|uptimerobot)/i.test(agent);
}

export async function recordVisit(db: Database, request: Request, response: Response,
                                  country = "??", siteUrl = request.url) {
  if (!shouldTrack(request, response)) return response;
  const day = koreaDay();
  const old = (request.headers.get("cookie") || "").match(/(?:^|;\s*)research_visit=([a-f0-9]{32})(?:;|$)/)?.[1];
  const token = old || Array.from(crypto.getRandomValues(new Uint8Array(16)), x => x.toString(16).padStart(2, "0")).join("");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${day}:${token}`));
  const hash = Array.from(new Uint8Array(digest), x => x.toString(16).padStart(2, "0")).join("");
  const path = new URL(request.url).pathname.replace(/\/index\.html$/, "/") || "/";
  const referrer = referrerHost(request.headers.get("referer"), siteUrl);
  const code = /^[A-Z]{2}$/.test(country) ? country : "??";
  await db.batch([
    db.prepare("INSERT OR IGNORE INTO analytics_visitors(day,visitor_hash,first_referrer,country) VALUES(?,?,?,?)").bind(day, hash, referrer, code),
    db.prepare("INSERT INTO analytics_daily(day,path,referrer,country,views) VALUES(?,?,?,?,1) ON CONFLICT(day,path,referrer,country) DO UPDATE SET views=views+1").bind(day, path, referrer, code),
  ]);
  if (lastPrunedDay !== day) {
    const cutoff = koreaDay(new Date(Date.now() - 90 * 86400000));
    await db.batch([
      db.prepare("DELETE FROM analytics_visitors WHERE day<?").bind(cutoff),
      db.prepare("DELETE FROM analytics_daily WHERE day<?").bind(cutoff),
    ]);
    lastPrunedDay = day;
  }
  if (old) return response;
  const headers = new Headers(response.headers);
  const secure = new URL(siteUrl).protocol === "https:" ? "; Secure" : "";
  headers.append("Set-Cookie", `${cookieName}=${token}; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax${secure}`);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export async function analyticsReport(db: Database, days: number) {
  const from = koreaDay(new Date(Date.now() - (days - 1) * 86400000));
  const to = koreaDay();
  const views = await db.prepare("SELECT COALESCE(SUM(views),0) AS total FROM analytics_daily WHERE day>=?").bind(from).first();
  const visitors = await db.prepare("SELECT COUNT(*) AS total FROM analytics_visitors WHERE day>=?").bind(from).first();
  const series = await db.prepare("SELECT day,SUM(views) AS views FROM analytics_daily WHERE day>=? GROUP BY day ORDER BY day").bind(from).all();
  const pages = await db.prepare("SELECT path,SUM(views) AS views FROM analytics_daily WHERE day>=? GROUP BY path ORDER BY views DESC,path LIMIT 10").bind(from).all();
  const referrers = await db.prepare("SELECT first_referrer AS referrer,COUNT(*) AS visitors FROM analytics_visitors WHERE day>=? GROUP BY first_referrer ORDER BY visitors DESC,referrer LIMIT 10").bind(from).all();
  const countries = await db.prepare("SELECT country,COUNT(*) AS visitors FROM analytics_visitors WHERE day>=? GROUP BY country ORDER BY visitors DESC,country LIMIT 10").bind(from).all();
  const dailyVisitors = await db.prepare("SELECT day,COUNT(*) AS visitors FROM analytics_visitors WHERE day>=? GROUP BY day ORDER BY day").bind(from).all();
  return { from, to, days, views: views?.total || 0, visitors: visitors?.total || 0,
    daily: series.results.map(row => ({ day: row.day, views: row.views,
      visitors: dailyVisitors.results.find(v => v.day === row.day)?.visitors || 0 })),
    pages: pages.results, referrers: referrers.results, countries: countries.results };
}
