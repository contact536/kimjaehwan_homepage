import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { mkdtempSync, rmSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { createVerifiedBackup } from "../ops/backup.mjs";

test("SQLite backup is standalone and passes an integrity check", () => {
  const directory = mkdtempSync(path.join(process.cwd(), ".backup-test-"));
  const source = path.join(directory, "platform.sqlite");
  const backupDir = path.join(directory, "backups");

  try {
    const database = new DatabaseSync(source);
    try {
      database.exec("CREATE TABLE research (title TEXT NOT NULL)");
      database.prepare("INSERT INTO research (title) VALUES (?)").run("XAI 연구");
    } finally {
      database.close();
    }

    const backup = createVerifiedBackup({
      DATABASE_PATH: source,
      BACKUP_DIR: backupDir,
      BACKUP_RETENTION_DAYS: "30",
    });
    const copy = new DatabaseSync(backup.destination, { readOnly: true });
    try {
      const integrity = copy.prepare("PRAGMA integrity_check").get() as
        | { integrity_check: string }
        | undefined;
      const record = copy.prepare("SELECT title FROM research").get() as
        | { title: string }
        | undefined;
      assert.ok(integrity);
      assert.ok(record);
      assert.equal(integrity.integrity_check, "ok");
      assert.equal(record.title, "XAI 연구");
    } finally {
      copy.close();
    }
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});
