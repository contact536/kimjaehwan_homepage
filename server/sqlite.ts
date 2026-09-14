import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import type { Database, Statement, Result } from "./database.ts";
export function openDatabase(filename: string) {
  if (filename !== ":memory:")
    fs.mkdirSync(path.dirname(path.resolve(filename)), { recursive: true });
  const sqlite = new DatabaseSync(filename);
  sqlite.exec("PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;");
  sqlite.exec(
    "CREATE TABLE IF NOT EXISTS _local_migrations(name TEXT PRIMARY KEY)",
  );
  for (const file of fs
    .readdirSync("drizzle")
    .filter((f) => f.endsWith(".sql"))
    .sort()) {
    if (
      sqlite
        .prepare("SELECT name FROM _local_migrations WHERE name=?")
        .get(file)
    )
      continue;
    sqlite.exec("BEGIN");
    try {
      sqlite.exec(fs.readFileSync(path.join("drizzle", file), "utf8"));
      sqlite.prepare("INSERT INTO _local_migrations VALUES(?)").run(file);
      sqlite.exec("COMMIT");
    } catch (error) {
      sqlite.exec("ROLLBACK");
      throw error;
    }
  }
  const make = (sql: string, values: any[] = []): Statement => ({
    bind: (...args: any[]) => make(sql, args),
    async all() {
      return {
        results: sqlite.prepare(sql).all(...values),
        meta: {},
      } as Result;
    },
    async first() {
      return sqlite.prepare(sql).get(...values) || null;
    },
    async run() {
      const result = sqlite.prepare(sql).run(...values);
      return { results: [], meta: { changes: Number(result.changes) } };
    },
  });
  const db: Database = {
    prepare: (sql) => make(sql),
    async batch(statements) {
      sqlite.exec("BEGIN");
      try {
        const results = [];
        for (const statement of statements) results.push(await statement.run());
        sqlite.exec("COMMIT");
        return results;
      } catch (error) {
        sqlite.exec("ROLLBACK");
        throw error;
      }
    },
  };
  return { db, close: () => sqlite.close() };
}
