import { createVerifiedBackup } from "./backup.mjs";
import {
  pruneExpiredObjectBackups,
  resolveObjectStorageConfig,
  uploadVerifiedBackup,
} from "./nhn-object-storage.mjs";

const requiredObjectStorageVariables = [
  "NHN_OBJECT_STORAGE_BUCKET",
  "NHN_OBJECT_STORAGE_ACCESS_KEY",
  "NHN_OBJECT_STORAGE_SECRET_KEY",
];

const configuredVariables = requiredObjectStorageVariables.filter(
  (name) => Boolean(process.env[name]?.trim()),
);

const backup = createVerifiedBackup();
console.log("Created verified SQLite backup: " + backup.destination);

if (configuredVariables.length === 0) {
  console.log("NHN Object Storage is not configured; kept the verified local backup.");
  process.exit(0);
}

if (configuredVariables.length !== requiredObjectStorageVariables.length)
  throw new Error(
    "NHN Object Storage configuration is incomplete; set bucket, access key, and secret key together",
  );

const storage = resolveObjectStorageConfig();
const uploaded = await uploadVerifiedBackup(storage, backup.destination);
const removed = await pruneExpiredObjectBackups(storage);
console.log(
  "Verified offsite backup: " +
    uploaded.key +
    " (" +
    uploaded.size +
    " bytes); removed " +
    removed +
    " expired remote backups.",
);
