import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
const root = path.resolve("public");
fs.mkdirSync("seed", { recursive: true });
const report = [];
const records = [];
for (const [page, variable, kind] of [
  ["conference-tier", "CONFERENCES", "conferences"],
  ["journal", "JOURNALS", "journals"],
]) {
  const file = path.join(root, "pages", page + ".html");
  let html = fs.readFileSync(file, "utf8");
  const script = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)]
    .map((x) => x[1])
    .find((x) => x.includes(`const ${variable}`));
  const start = script.indexOf(`const ${variable}`),
    end = script.indexOf("\n    ];", start) + 7;
  const data = vm.runInNewContext(
    script.slice(start, end) + `;${variable}`,
    {},
    { timeout: 1000 },
  );
  const unique = new Map();
  for (const item of data) {
    const key = item.name.trim().toLowerCase();
    const fields = item.field.split(/\s*[,/]\s*/).filter(Boolean);
    const tiers = item.tier.split("/").filter(Boolean);
    if (unique.has(key)) {
      const first = unique.get(key);
      report.push({ kind, name: item.name, kept: first, alternate: item });
      first.fields = [...new Set([...first.fields, ...fields])];
      first.tiers = [...new Set([...first.tiers, ...tiers])];
    } else unique.set(key, { ...item, fields, tiers });
  }
  for (const [i, item] of [...unique.values()].entries())
    records.push({
      kind,
      id: `${kind}-${String(i + 1).padStart(4, "0")}`,
      data: item,
    });
  html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, (block) =>
    block.includes(`const ${variable}`)
      ? `<script defer src="/js/catalog.js" data-kind="${kind}"></script>`
      : block,
  );
  fs.writeFileSync(file, html);
}
records.push({
  kind: "profile",
  id: "main",
  data: {
    name: "Sunjun Hwang",
    tagline: "AI & Quantum Computing Researcher",
    identity: "Building Robust AI Systems that Work in the Real World",
    email: "sunjun7559@gmail.com",
    publications: 10,
    projects: 10,
    presentations: 10,
    awards: 7,
  },
});
const home = fs.readFileSync(path.join(root, "index.html"), "utf8");
const plain = (s) =>
  s
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
let newsIndex = 0;
for (const match of home.matchAll(
  /<span class="timeline-date">([\s\S]*?)<\/span>\s*<p>([\s\S]*?)<\/p>/g,
)) {
  const url = match[2].match(/href="([^"]+)"/)?.[1] || "";
  records.push({
    kind: "news",
    id: `news-${++newsIndex}`,
    data: { name: plain(match[2]), date: plain(match[1]), url },
  });
}
fs.writeFileSync("seed/records.json", JSON.stringify(records, null, 2));
fs.writeFileSync("seed/import-conflicts.json", JSON.stringify(report, null, 2));
const files = fs
  .readdirSync(root, { recursive: true })
  .filter((f) => f.endsWith(".html"));
const pages = files.map((f) => ({
  path: "/" + f.replaceAll("\\", "/"),
  title: plain(
    fs
      .readFileSync(path.join(root, f), "utf8")
      .match(/<title>(.*?)<\/title>/)?.[1] || f,
  ),
}));
fs.writeFileSync("seed/pages.json", JSON.stringify(pages, null, 2));
console.log(
  `Imported ${records.length} records; ${report.length} duplicate conflicts retained in seed/import-conflicts.json.`,
);
