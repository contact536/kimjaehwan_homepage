import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createApp } from "../server/app.ts";
import { openDatabase } from "../server/sqlite.ts";
import type { Bindings } from "../server/app.ts";
const password = "test-password-for-local-tests-only";
const secret = "test-session-secret-at-least-thirty-two-characters";
const json = async (response: Response): Promise<any> => response.json();
test("authentication, validation, conflict protection, filtering, and restart persistence", async () => {
  fs.mkdirSync("data", { recursive: true });
  const filename = `data/test-${crypto.randomUUID()}.sqlite`;
  let connection = openDatabase(filename);
  const env: Bindings = {
    DB: connection.db,
    ADMIN_PASSWORD: password,
    SESSION_SECRET: secret,
  };
  const app = createApp();
  const request = (
    path: string,
    method = "GET",
    body?: any,
    cookie = "",
    origin = "http://localhost",
  ) =>
    app.request(
      "http://localhost" + path,
      {
        method,
        headers: { origin, cookie, "content-type": "application/json" },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      },
      env,
    );
  try {
    let response = await request("/api/health");
    assert.equal(response.status, 200);
    assert.equal((await json(response)).records, 891);
    response = await request("/api/records/conferences?tier=B&q=MEMOCODE");
    let data = await json(response);
    assert.equal(data.total, 1);
    assert.ok(data.items[0].data.tiers.includes("C"));
    response = await request(
      "/api/records/journals?q=Data%20Mining%20and%20Knowledge%20Discovery",
    );
    assert.equal((await json(response)).total, 1);
    response = await request("/api/admin/records/news", "POST", { data: {} });
    assert.equal(response.status, 401);
    response = await request(
      "/api/auth/login",
      "POST",
      { password },
      "",
      "https://untrusted.example",
    );
    assert.equal(response.status, 403);
    response = await request("/api/auth/login", "POST", {
      password: "incorrect",
    });
    assert.equal(response.status, 401);
    response = await request("/api/auth/login", "POST", { password });
    assert.equal(response.status, 200);
    assert.match(response.headers.get("set-cookie") || "", /HttpOnly/i);
    assert.match(response.headers.get("set-cookie") || "", /SameSite=Strict/i);
    const cookie = response.headers.get("set-cookie")!.split(";")[0];
    response = await request(
      "/api/admin/records/news",
      "POST",
      {
        data: {
          name: "Invalid URL",
          date: "September 2026",
          url: "javascript:alert(1)",
        },
      },
      cookie,
    );
    assert.equal(response.status, 400);
    const news = {
      name: "Persistence test",
      date: "September 2026",
      url: "https://example.com/paper",
    };
    response = await request(
      "/api/admin/records/news",
      "POST",
      { data: news },
      cookie,
    );
    assert.equal(response.status, 201);
    const created = await json(response);
    response = await request(
      `/api/admin/records/news/${created.id}`,
      "PUT",
      { data: { ...news, name: "Updated research" }, revision: 1 },
      cookie,
    );
    assert.equal(response.status, 200);
    response = await request(
      `/api/admin/records/news/${created.id}`,
      "PUT",
      { data: news, revision: 1 },
      cookie,
    );
    assert.equal(response.status, 409);
    response = await request(`/api/records/news/${created.id}`);
    assert.equal((await json(response)).data.name, "Updated research");
    connection.close();
    connection = openDatabase(filename);
    env.DB = connection.db;
    response = await request(`/api/records/news/${created.id}`);
    data = await json(response);
    assert.equal(data.data.name, "Updated research");
    assert.equal(data.revision, 2);
    response = await request("/api/admin/export", "GET", undefined, cookie);
    assert.equal(response.status, 200);
    assert.ok(
      (await json(response)).items.some((row: any) => row.id === created.id),
    );
    response = await request(
      `/api/admin/records/news/${created.id}?revision=1`,
      "DELETE",
      undefined,
      cookie,
    );
    assert.equal(response.status, 409);
    response = await request(
      `/api/admin/records/news/${created.id}?revision=2`,
      "DELETE",
      undefined,
      cookie,
    );
    assert.equal(response.status, 200);
    response = await request(`/api/records/news/${created.id}`);
    assert.equal(response.status, 404);
    response = await request("/assets/not-in-source.png");
    assert.equal(response.status, 404);
    response = await request(
      "/api/admin/records/profile/main?revision=1",
      "DELETE",
      undefined,
      cookie,
    );
    assert.equal(response.status, 400);
    response = await request("/api/auth/logout", "POST", undefined, cookie);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("set-cookie") || "", /Max-Age=0/);
  } finally {
    connection.close();
  }
});
test("login throttling and unconfigured credentials fail closed", async () => {
  const { db, close } = openDatabase(":memory:");
  const app = createApp();
  const env = { DB: db, ADMIN_PASSWORD: password, SESSION_SECRET: secret };
  try {
    const login = (bindings: Bindings, clientIp = "203.0.113.10") =>
      app.request(
        "http://localhost/api/auth/login",
        {
          method: "POST",
          headers: {
            origin: "http://localhost",
            "content-type": "application/json",
            "x-client-ip": clientIp,
          },
          body: JSON.stringify({ password: "wrong" }),
        },
        bindings,
      );
    for (let i = 0; i < 10; i++) assert.equal((await login(env)).status, 401);
    assert.equal((await login(env)).status, 429);
    assert.equal((await login(env, "203.0.113.11")).status, 401);
    assert.equal((await login({ DB: db })).status, 503);
  } finally {
    close();
  }
});
test("a configured public origin preserves CSRF checks and secure cookies behind TLS proxy", async () => {
  const { db, close } = openDatabase(":memory:");
  const app = createApp();
  const env: Bindings = {
    DB: db,
    ADMIN_PASSWORD: password,
    SESSION_SECRET: secret,
    PUBLIC_ORIGIN: "https://kimjaehwan.com",
  };
  try {
    const response = await app.request(
      "http://127.0.0.1:4317/api/auth/login",
      {
        method: "POST",
        headers: { origin: "https://kimjaehwan.com", "content-type": "application/json" },
        body: JSON.stringify({ password }),
      },
      env,
    );
    assert.equal(response.status, 200);
    assert.match(response.headers.get("set-cookie") || "", /Secure/i);
    const rejected = await app.request(
      "http://127.0.0.1:4317/api/auth/login",
      {
        method: "POST",
        headers: { origin: "http://kimjaehwan.com", "content-type": "application/json" },
        body: JSON.stringify({ password }),
      },
      env,
    );
    assert.equal(rejected.status, 403);
  } finally {
    close();
  }
});
