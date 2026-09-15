import {credential,credentialKey,matchesPassword,makeCredential} from './password.ts';
import { Hono } from "hono";
import { isIP } from "node:net";
import { secureHeaders } from "hono/secure-headers";
import { bodyLimit } from "hono/body-limit";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { sign, verify } from "hono/jwt";
import { z } from "zod";
import { initializeData, unpack } from "./database.ts";
import type { Database } from "./database.ts";
import { kinds, schemas, writeSchema } from "./validation.ts";
import pages from "../seed/pages.json" with { type: "json" };
import { searchResearchFromDatabase, runAgent } from './agent.ts';
import { analyticsReport } from './analytics.ts';
export type Bindings = {
  DB: Database;
  ADMIN_PASSWORD?: string;
  SESSION_SECRET?: string;
  /**
   * The public origin when TLS is terminated by a trusted reverse proxy.
   * Keep this unset for local development.
   */
  PUBLIC_ORIGIN?: string;
  OLLAMA_BASE_URL?: string;
  OLLAMA_MODEL?: string;
  ASSETS?: { fetch(request: Request): Promise<Response> };
};
function publicOrigin(bindings: Bindings, requestUrl: string) {
  const value = bindings.PUBLIC_ORIGIN?.trim();
  if (!value) return new URL(requestUrl).origin;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.origin : null;
  } catch {
    return null;
  }
}
async function sameSecret(a: string, b: string) {
  const digest = async (v: string) =>
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v)),
    );
  const [left, right] = await Promise.all([digest(a), digest(b)]);
  let diff = 0;
  for (let i = 0; i < left.length; i++) diff |= left[i] ^ right[i];
  return diff === 0;
}
function clientAttemptKey(value?: string) {
  const address = value?.trim();
  return address && isIP(address) !== 0 ? address : "local";
}
export function createApp() {
  const app = new Hono<{ Bindings: Bindings }>();
  // Compatibility aliases for the unchanged source sidebar on nested pages.
  app.get('/pages/index.html', c => c.redirect('/index.html', 302));
  app.get('/pages/pages/:file', c => c.redirect('/pages/' + encodeURIComponent(c.req.param('file')), 302));
  app.get('/pages/assets/*', c => c.redirect(c.req.path.replace('/pages/assets/', '/assets/'), 302));
  app.use(
    "*",
    secureHeaders({
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: false,
    }),
  );
  app.use(
    "/api/*",
    bodyLimit({
      maxSize: 32768,
      onError: (c) => c.json({ error: "Request body too large" }, 413),
    }),
  );
  app.use("/api/*", async (c, next) => {
    c.header("Cache-Control", "no-store");
    if (!["GET", "HEAD", "OPTIONS"].includes(c.req.method)) {
      const origin = publicOrigin(c.env, c.req.url);
      if (!origin || c.req.header("origin") !== origin)
        return c.json({ error: "Same-origin request required" }, 403);
      if (c.req.header("sec-fetch-site") === "cross-site")
        return c.json({ error: "Cross-site request denied" }, 403);
    }
    await initializeData(c.env.DB);
    await next();
  });
  app.get("/api/health", async (c) => {
    const row = await c.env.DB.prepare(
      "SELECT COUNT(*) AS count FROM records",
    ).first();
    return c.json({ ok: true, database: "sqlite", records: row?.count });
  });
  app.get("/api/pages", (c) => c.json({ items: pages }));
  app.post("/api/auth/login", async (c) => {
    const password = c.env.ADMIN_PASSWORD,
      secret = c.env.SESSION_SECRET;
    const stored=await credential(c.env.DB);
    if ((!stored && (!password || password.length < 8)) || !secret || secret.length < 32)
      return c.json({ error: "Administrator login is not configured" }, 503);
    const parsed = z
      .object({ password: z.string().max(512) })
      .safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: "Password required" }, 400);
    const now = Date.now();
    // The app is bound to loopback only. Caddy replaces this header with the
    // TCP peer address before proxying, so a browser cannot choose its bucket.
    const key = clientAttemptKey(c.req.header("x-client-ip"));
    const attempt = await c.env.DB.prepare(
      "SELECT count,reset_at FROM auth_attempts WHERE key=?",
    )
      .bind(key)
      .first();
    if (attempt && attempt.reset_at > now && attempt.count >= 10)
      return c.json(
        { error: "Too many attempts. Try again in 15 minutes." },
        429,
      );
    if (!(await matchesPassword(parsed.data.password, stored, password))) {
      await c.env.DB.prepare(
        "INSERT INTO auth_attempts(key,count,reset_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN auth_attempts.reset_at<=? THEN 1 ELSE auth_attempts.count+1 END, reset_at=CASE WHEN auth_attempts.reset_at<=? THEN excluded.reset_at ELSE auth_attempts.reset_at END",
      )
        .bind(key, now + 900000, now, now)
        .run();
      return c.json({ error: "Invalid password" }, 401);
    }
    await c.env.DB.prepare("DELETE FROM auth_attempts WHERE key=?")
      .bind(key)
      .run();
    const token = await sign(
      { sub: "administrator", credentialVersion:stored?.version||"initial", exp: Math.floor(now / 1000) + 28800 },
      secret,
      "HS256",
    );
    const origin = publicOrigin(c.env, c.req.url);
    if (!origin) return c.json({ error: "Public origin is invalid" }, 503);
    setCookie(c, "research_session", token, {
      httpOnly: true,
      sameSite: "Strict",
      secure: new URL(origin).protocol === "https:",
      path: "/",
      maxAge: 28800,
    });
    return c.json({ ok: true });
  });
  app.post("/api/auth/logout", (c) => {
    deleteCookie(c, "research_session", { path: "/" });
    return c.json({ ok: true });
  });
  app.use("/api/admin/*", async (c, next) => {
    try {
      if (!c.env.SESSION_SECRET) throw new Error("No secret");
      const payload = await verify(
        getCookie(c, "research_session") || "",
        c.env.SESSION_SECRET,
        "HS256",
      );
      if (payload.sub !== "administrator") throw new Error("Invalid subject");
      const stored=await credential(c.env.DB);
      if((payload.credentialVersion||"initial")!==(stored?.version||"initial"))throw new Error("Session expired");
    } catch {
      return c.json({ error: "Sign in required" }, 401);
    }
    await next();
  });
  app.post('/api/admin/password', async c=>{
    const parsed=z.object({currentPassword:z.string().min(1).max(512),newPassword:z.string().min(8).max(128),confirmPassword:z.string().min(8).max(128)}).strict().safeParse(await c.req.json().catch(()=>null));
    if(!parsed.success)return c.json({error:'새 비밀번호는 8~128자로 입력해 주세요.'},400);
    const {currentPassword,newPassword,confirmPassword}=parsed.data;
    if(newPassword!==confirmPassword)return c.json({error:'새 비밀번호 확인이 일치하지 않습니다.'},400);
    if(currentPassword===newPassword)return c.json({error:'현재와 다른 비밀번호를 입력해 주세요.'},400);
    const now=Date.now(),key='password-change';
    const attempts=await c.env.DB.prepare('SELECT count,reset_at FROM auth_attempts WHERE key=?').bind(key).first();
    if(attempts&&attempts.reset_at>now&&attempts.count>=10)return c.json({error:'시도가 너무 많습니다. 15분 후 다시 시도해 주세요.'},429);
    const stored=await credential(c.env.DB);
    if(!await matchesPassword(currentPassword,stored,c.env.ADMIN_PASSWORD)){
      await c.env.DB.prepare('INSERT INTO auth_attempts(key,count,reset_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN auth_attempts.reset_at<=? THEN 1 ELSE auth_attempts.count+1 END, reset_at=CASE WHEN auth_attempts.reset_at<=? THEN excluded.reset_at ELSE auth_attempts.reset_at END').bind(key,now+900000,now,now).run();
      return c.json({error:'현재 비밀번호가 올바르지 않습니다.'},400);
    }
    const next=await makeCredential(newPassword);
    const result=await c.env.DB.prepare('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value WHERE settings.value=?').bind(credentialKey,JSON.stringify(next),stored?.raw||'').run();
    if(!result.meta.changes)return c.json({error:'비밀번호가 다른 곳에서 변경되었습니다. 다시 로그인해 주세요.'},409);
    await c.env.DB.prepare('DELETE FROM auth_attempts WHERE key=?').bind(key).run();
    deleteCookie(c,'research_session',{path:'/'});
    return c.json({ok:true});
  });
  app.get("/api/admin/session", (c) => c.json({ authenticated: true }));
  app.get("/api/admin/analytics", async (c) => {
    const days = Number(c.req.query("days") || 30);
    if (![7, 30, 90].includes(days)) return c.json({ error: "Choose 7, 30 or 90 days" }, 400);
    return c.json(await analyticsReport(c.env.DB, days));
  });
  app.get('/api/research/status', c => c.json({retrieval:true,agent:{configured:Boolean(c.env.OLLAMA_MODEL),requiresLogin:true,framework:'LangGraph'}}));
  app.post('/api/research/search', async c => {
    const input=z.object({question:z.string().trim().min(1).max(1000)}).strict().safeParse(await c.req.json().catch(()=>null));
    if(!input.success)return c.json({error:'질문은 1~1,000자로 입력해 주세요.'},400);
    return c.json(await searchResearchFromDatabase(input.data.question,c.env.DB));
  });
  app.post('/api/admin/agent', async c => {
    const input=z.object({question:z.string().trim().min(1).max(1000)}).strict().safeParse(await c.req.json().catch(()=>null));
    if(!input.success)return c.json({error:'질문은 1~1,000자로 입력해 주세요.'},400);
    if(!c.env.OLLAMA_MODEL)return c.json({error:'Ollama 모델이 설정되지 않았습니다. 서버의 OLLAMA_MODEL을 설정해 주세요.'},503);
    try{return c.json(await runAgent(input.data.question,c.env.DB,c.env))}
    catch{return c.json({error:'모델 응답을 완료하지 못했습니다. Ollama 연결과 도구 호출 지원 모델을 확인해 주세요.'},502)}
  });
  app.get("/api/records/:kind", async (c) => {
    const parsed = kinds.safeParse(c.req.param("kind"));
    if (!parsed.success) return c.json({ error: "Unknown collection" }, 404);
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM records WHERE kind=? ORDER BY name COLLATE NOCASE,id",
    )
      .bind(parsed.data)
      .all();
    const q = (c.req.query("q") || "").toLocaleLowerCase().trim().slice(0, 200);
    const tiers = c.req.queries("tier") || [],
      fields = c.req.queries("field") || [];
    const all = results.map(unpack);
    const filtered = all.filter((row) => {
      const d = row.data;
      return (
        (!q ||
          [d.name, d.abbr, d.publisher, d.host, d.strength, ...(d.fields || [])]
            .filter(Boolean)
            .join(" ")
            .toLocaleLowerCase()
            .includes(q)) &&
        (!tiers.length || tiers.some((t) => d.tiers?.includes(t))) &&
        (!fields.length || fields.some((f) => d.fields?.includes(f)))
      );
    });
    const number = (key: string, fallback: number, max: number) => {
      const n = Number(c.req.query(key) || fallback);
      return Number.isInteger(n) && n > 0 ? Math.min(n, max) : fallback;
    };
    const limit = number("limit", 50, 1000),
      page = number("page", 1, 100000);
    return c.json({
      items: filtered.slice((page - 1) * limit, page * limit),
      total: filtered.length,
      collectionTotal: all.length,
      page,
      limit,
      fields: [...new Set(all.flatMap((r) => r.data.fields || []))].sort(),
      tiers: [...new Set(all.flatMap((r) => r.data.tiers || []))].sort(),
    });
  });
  app.get("/api/records/:kind/:id", async (c) => {
    const row = await c.env.DB.prepare(
      "SELECT * FROM records WHERE kind=? AND id=?",
    )
      .bind(c.req.param("kind"), c.req.param("id"))
      .first();
    return row
      ? c.json(unpack(row))
      : c.json({ error: "Record not found" }, 404);
  });
  app.post("/api/admin/records/:kind", async (c) => {
    const kind = kinds.safeParse(c.req.param("kind"));
    if (!kind.success || ["profile","research"].includes(kind.data))
      return c.json({ error: "Invalid collection for creation" }, 400);
    const body = writeSchema.safeParse(await c.req.json().catch(() => null));
    const data = schemas[kind.data].safeParse(
      body.success ? body.data.data : null,
    );
    if (!data.success)
      return c.json(
        { error: "Invalid record", details: data.error.issues },
        400,
      );
    const id = crypto.randomUUID(),
      now = new Date().toISOString();
    await c.env.DB.prepare(
      "INSERT INTO records(kind,id,name,payload,revision,updated_at) VALUES(?,?,?,?,1,?)",
    )
      .bind(kind.data, id, data.data.name, JSON.stringify(data.data), now)
      .run();
    return c.json({ id, revision: 1, data: data.data }, 201);
  });
  app.put("/api/admin/records/:kind/:id", async (c) => {
    const kind = kinds.safeParse(c.req.param("kind"));
    if (!kind.success) return c.json({ error: "Unknown collection" }, 404);
    const body = writeSchema.safeParse(await c.req.json().catch(() => null));
    const data = schemas[kind.data].safeParse(
      body.success ? body.data.data : null,
    );
    if (!body.success || !body.data.revision || !data.success)
      return c.json({ error: "Valid data and revision required" }, 400);
    const result = await c.env.DB.prepare(
      "UPDATE records SET name=?,payload=?,revision=revision+1,updated_at=? WHERE kind=? AND id=? AND revision=?",
    )
      .bind(
        data.data.name,
        JSON.stringify(data.data),
        new Date().toISOString(),
        kind.data,
        c.req.param("id"),
        body.data.revision,
      )
      .run();
    if (!result.meta.changes)
      return c.json(
        { error: "Record changed or no longer exists. Reload before editing." },
        409,
      );
    return c.json({ ok: true, revision: body.data.revision + 1 });
  });
  app.delete("/api/admin/records/:kind/:id", async (c) => {
    if (["profile","research"].includes(c.req.param("kind")))
      return c.json({ error: "Profile cannot be deleted" }, 400);
    const revision = Number(c.req.query("revision"));
    if (!Number.isInteger(revision) || revision < 1)
      return c.json({ error: "Revision required" }, 400);
    const result = await c.env.DB.prepare(
      "DELETE FROM records WHERE kind=? AND id=? AND revision=?",
    )
      .bind(c.req.param("kind"), c.req.param("id"), revision)
      .run();
    return result.meta.changes
      ? c.json({ ok: true })
      : c.json({ error: "Record changed or no longer exists" }, 409);
  });
  app.get("/api/admin/export", async (c) => {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM records ORDER BY kind,id",
    ).all();
    c.header(
      "Content-Disposition",
      'attachment; filename="research-records.json"',
    );
    return c.json({
      exportedAt: new Date().toISOString(),
      items: results.map(unpack),
    });
  });
  // Personal assets are served locally; do not retrieve the previous owner's media.
  app.get('/assets/*', c => c.notFound());
  app.onError((error, c) => {
    console.error(error.message);
    return c.json({ error: "Server error. Please try again." }, 500);
  });
  return app;
}
