import { DatabaseSync } from "node:sqlite";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
} from "node:fs";
import path from "node:path";

const source = process.env.DATABASE_PATH;
if (!source || !path.isAbsolute(source))
  throw new Error("DATABASE_PATH must be an absolute path");

const backupDir = path.resolve(
  process.env.BACKUP_DIR || path.join(path.dirname(source), "backups"),
);
const retention = Number(process.env.BACKUP_RETENTION_DAYS || 30);
if (!Number.isInteger(retention) || retention < 1 || retention > 365)
  throw new Error("BACKUP_RETENTION_DAYS must be an integer between 1 and 365");

mkdirSync(backupDir, { recursive: true, mode: 0o700 });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const destination = path.join(backupDir, `platform-${stamp}.sqlite`);
const quote = (value) => `'${value.replaceAll("'", "''")}'`;

const database = new DatabaseSync(source);
try {
  database.exec("PRAGMA busy_timeout=5000");
  // VACUUM INTO produces a consistent standalone copy even while WAL is used.
  database.exec(`VACUUM INTO ${quote(destination)}`);
} finally {
  database.close();
}

const check = new DatabaseSync(destination, { readOnly: true });
try {
  const result = check.prepare("PRAGMA integrity_check").get();
  if (Object.values(result)[0] !== "ok")
    throw new Error("SQLite integrity check failed for backup");
} finally {
  check.close();
}

const cutoff = Date.now() - retention * 24 * 60 * 60 * 1000;
for (const file of readdirSync(backupDir)) {
  const candidate = path.join(backupDir, file);
  if (
    file.startsWith("platform-") &&
    file.endsWith(".sqlite") &&
    existsSync(candidate) &&
    statSync(candidate).mtimeMs < cutoff
  )
    rmSync(candidate, { force: true });
}

console.log(`Created verified SQLite backup: ${destination}`);
