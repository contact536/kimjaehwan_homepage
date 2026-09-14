import { build } from "vite";
import { sites } from "@openai/sites-vite-plugin";
import fs from "node:fs";
import path from "node:path";
const outputDirectory = path.resolve('dist');
if (!outputDirectory.startsWith(path.resolve('.') + path.sep)) throw new Error('Build output must stay in the project');
fs.mkdirSync("dist/server", { recursive: true });
await build({
  configFile: false,
  publicDir: false,
  plugins: [sites()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    minify: false,
    target: "es2022",
    lib: {
      entry: "server/worker.ts",
      formats: ["es"],
      fileName: () => "server/index.js",
    },
  },
});
fs.cpSync("public", "dist/client", { recursive: true });
fs.mkdirSync("dist/.openai", { recursive: true });
fs.copyFileSync(".openai/hosting.json", "dist/.openai/hosting.json");
fs.cpSync("drizzle", "dist/.openai/drizzle", { recursive: true });
console.log(
  "Built Cloudflare-compatible Hono Worker, public frontend, and schema migrations.",
);
