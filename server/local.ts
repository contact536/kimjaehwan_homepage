import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { createApp } from "./app.ts";
import { openDatabase } from "./sqlite.ts";
import { initializeData } from "./database.ts";
import { originalResponse } from "./original.ts";
import { countryFromIp } from "./country.ts";
import { recordVisit } from "./analytics.ts";
const { db, close } = openDatabase(
  process.env.DATABASE_PATH || "./data/platform.sqlite",
);
await initializeData(db);
const app = new Hono();
app.use("*", async (c, next) => {
  c.env = {
    DB: db,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    SESSION_SECRET: process.env.SESSION_SECRET,
    PUBLIC_ORIGIN: process.env.PUBLIC_ORIGIN,
    OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL,
    OLLAMA_MODEL: process.env.OLLAMA_MODEL,
  };
  await next();
});
app.use("*", async (c, next) => {
  await next();
  try {
    const siteUrl = process.env.PUBLIC_ORIGIN || c.req.url;
    const country = countryFromIp(c.req.header("x-client-ip"), process.env.COUNTRY_DB_PATH || "/var/lib/kimjaehwan-homepage/geoip/dbip-country-lite.mmdb");
    c.res = await recordVisit(db, c.req.raw, c.res, country, siteUrl);
  } catch (error) {
    // Analytics must never prevent a public page from loading.
    console.error("Visitor analytics:", error);
  }
});
app.use("*", async (c, next) => {
  await next();
  c.res = await originalResponse(c.res, new URL(c.req.url).pathname, db);
});
app.use("*", serveStatic({ root: "./public" }));
app.route("/", createApp());
const server = serve(
  {
    fetch: app.fetch,
    hostname: process.env.HOST || "127.0.0.1",
    port: Number(process.env.PORT || 4173),
  },
  (info) =>
    console.log(
      `Local: http://${process.env.HOST || "127.0.0.1"}:${info.port}\nAdministrator: /admin/`,
    ),
);
for (const event of ["SIGINT", "SIGTERM"] as const)
  process.on(event, () =>
    server.close(() => {
      close();
      process.exit(0);
    }),
  );
