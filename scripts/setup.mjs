import fs from "node:fs";
import crypto from "node:crypto";
if (!fs.existsSync(".env")) {
  fs.writeFileSync(
    ".env",
    `HOST=127.0.0.1\nPORT=4317\nDATABASE_PATH=./data/platform.sqlite\nADMIN_PASSWORD=${crypto.randomBytes(24).toString("base64url")}\nSESSION_SECRET=${crypto.randomBytes(48).toString("base64url")}\n`,
    { mode: 0o600 },
  );
  console.log(
    "Created .env with random administrator password and session secret. Open .env locally to retrieve the password.",
  );
} else console.log("Existing .env preserved.");
