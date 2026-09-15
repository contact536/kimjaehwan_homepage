import fs from "node:fs";
import { isIP } from "node:net";
import { Reader } from "maxmind";
import type { CountryResponse } from "maxmind";

let reader: Reader<CountryResponse> | undefined;
let readerPath = "";
let readerMtime = -1;

export function countryFromIp(ip: string | undefined, databasePath: string | undefined) {
  if (!ip || !isIP(ip) || !databasePath) return "??";
  try {
    const mtime = fs.statSync(databasePath).mtimeMs;
    if (!reader || readerPath !== databasePath || readerMtime !== mtime) {
      reader = new Reader<CountryResponse>(fs.readFileSync(databasePath));
      readerPath = databasePath;
      readerMtime = mtime;
    }
    const code = reader.get(ip)?.country?.iso_code;
    return code && /^[A-Z]{2}$/.test(code) ? code : "??";
  } catch {
    return "??";
  }
}
