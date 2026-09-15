import { DatabaseSync } from "node:sqlite";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
} from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

function absoluteDatabasePath(value = process.env.DATABASE_PATH) {
  if (!value || !path.isAbsolute(value))
    throw new Error("DATABASE_PATH must be an absolute path");
  return value;
}

function configuredRetention(value = process.env.BACKUP_RETENTION_DAYS || 30) {
  const retention = Number(value);
  if (!Number.isInteger(retention) || retention < 1 || retention > 365)
    throw new Error("BACKUP_RETENTION_DAYS must be an integer between 1 and 365");
  return retention;
}

const quote = (value) => "'" + value.replaceAll("'", "''") + "'";

export function createVerifiedBackup(environment = process.env) {
  const source = absoluteDatabasePath(environment.DATABASE_PATH);
  const backupDir = path.resolve(
    environment.BACKUP_DIR || path.join(path.dirname(source), "backups"),
  );
  const retention = configuredRetention(environment.BACKUP_RETENTION_DAYS || 30);

  mkdirSync(backupDir, { recursive: true, mode: 0o700 });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const destination = path.join(backupDir, "platform-" + stamp + ".sqlite");

  const database = new DatabaseSync(source);
  try {
    database.exec("PRAGMA busy_timeout=5000");
    // VACUUM INTO produces a consistent standalone copy even while WAL is used.
    database.exec("VACUUM INTO " + quote(destination));
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

  return { destination, backupDir, retention };
}

function invokedDirectly() {
  return process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
}

if (invokedDirectly()) {
  const backup = createVerifiedBackup();
  console.log("Created verified SQLite backup: " + backup.destination);
}
