import fs from "node:fs";
import { isIP } from "node:net";
import { Reader } from "maxmind";
import type { CityResponse, CountryResponse } from "maxmind";

type CachedReader<T extends CountryResponse> = { reader?: Reader<T>; path: string; mtime: number };
const countryCache: CachedReader<CountryResponse> = { path: "", mtime: -1 };
const cityCache: CachedReader<CityResponse> = { path: "", mtime: -1 };

export type ApproxLocation = { country: string; region: string };

function readDatabase<T extends CountryResponse>(databasePath: string | undefined, cache: CachedReader<T>) {
  if (!databasePath) return undefined;
  try {
    const mtime = fs.statSync(databasePath).mtimeMs;
    if (!cache.reader || cache.path !== databasePath || cache.mtime !== mtime) {
      cache.reader = new Reader<T>(fs.readFileSync(databasePath));
      cache.path = databasePath;
      cache.mtime = mtime;
    }
    return cache.reader;
  } catch { return undefined; }
}

function validCountry(code: string | undefined) {
  return code && /^[A-Z]{2}$/.test(code) ? code : "??";
}

// Only the broadest administrative subdivision is retained; city and coordinates are discarded.
// DB-IP includes Korean names; the maxmind package's generic Names type omits that locale.
export function broadRegion(record: { subdivisions?: readonly { names?: { ko?: string; en?: string } }[] } | null | undefined) {
  const name = record?.subdivisions?.[0]?.names?.ko || record?.subdivisions?.[0]?.names?.en || "";
  return name.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 80);
}

export function countryFromIp(ip: string | undefined, databasePath: string | undefined) {
  if (!ip || !isIP(ip) || !databasePath) return "??";
  try {
    return validCountry(readDatabase(databasePath, countryCache)?.get(ip)?.country?.iso_code);
  } catch { return "??"; }
}

export function locationFromIp(ip: string | undefined, cityPath: string | undefined,
                               countryPath: string | undefined): ApproxLocation {
  if (!ip || !isIP(ip)) return { country: "??", region: "" };
  try {
    const record = readDatabase(cityPath, cityCache)?.get(ip);
    const country = validCountry(record?.country?.iso_code);
    if (country !== "??") return { country, region: broadRegion(record) };
  } catch { /* Fall back to the smaller country-only database. */ }
  return { country: countryFromIp(ip, countryPath), region: "" };
}
