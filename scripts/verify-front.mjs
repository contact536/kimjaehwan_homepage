import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
const origin = process.env.TEST_ORIGIN || "http://127.0.0.1:4317";
const files = fs
  .readdirSync("public", { recursive: true })
  .filter((f) => f.endsWith(".html"));
let scripts = 0;
for (const file of files) {
  const url = origin + "/" + file.replaceAll("\\", "/");
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  const html = fs.readFileSync(path.join("public", file), "utf8");
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/src=/.test(match[1]) || !match[2].trim()) continue;
    const result = spawnSync(
      process.execPath,
      ["--check", "--input-type=commonjs"],
      { input: match[2], encoding: "utf8" },
    );
    if (result.status !== 0) throw new Error(`${file}: ${result.stderr}`);
    scripts++;
  }
}
for (const file of fs
  .readdirSync("public", { recursive: true })
  .filter((f) => f.endsWith(".js"))) {
  const result = spawnSync(
    process.execPath,
    ["--check", path.join("public", file)],
    { encoding: "utf8" },
  );
  if (result.status !== 0) throw new Error(result.stderr);
  scripts++;
}
const health = await (await fetch(origin + "/api/health")).json();
if (!health.ok) throw new Error("Database health check failed");
console.log(
  JSON.stringify(
    {
      htmlResponses: files.length,
      javascriptSyntaxChecks: scripts,
      database: health,
    },
    null,
    2,
  ),
);
