import { createHash, createHmac } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";

const defaultEndpoint = "https://kr1-api-object-storage.nhncloudservice.com";
const defaultRegion = "KR1";
const defaultPrefix = "sqlite";

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function hmac(key, value) {
  return createHmac("sha256", key).update(value).digest();
}

function encode(value) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (character) =>
    "%" + character.charCodeAt(0).toString(16).toUpperCase(),
  );
}

function canonicalPath(bucket, key = "") {
  const segments = [bucket, ...key.split("/").filter(Boolean)];
  return "/" + segments.map(encode).join("/");
}

function canonicalQuery(query = {}) {
  return Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => [encode(key), encode(String(value))])
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => key + "=" + value)
    .join("&");
}

function requestTime(now = new Date()) {
  const iso = now.toISOString();
  const date = iso.slice(0, 10).replaceAll("-", "");
  const timestamp = date + "T" + iso.slice(11, 19).replaceAll(":", "") + "Z";
  return { date, timestamp };
}

function responseError(response, operation) {
  return response.text().then((body) => {
    const detail = body.replaceAll(/[\r\n]+/g, " ").slice(0, 500);
    throw new Error(
      "NHN Object Storage " +
        operation +
        " failed with HTTP " +
        response.status +
        (detail ? ": " + detail : ""),
    );
  });
}

export function resolveObjectStorageConfig(environment = process.env) {
  const bucket = environment.NHN_OBJECT_STORAGE_BUCKET?.trim();
  const accessKey = environment.NHN_OBJECT_STORAGE_ACCESS_KEY?.trim();
  const secretKey = environment.NHN_OBJECT_STORAGE_SECRET_KEY?.trim();
  const endpoint = environment.NHN_OBJECT_STORAGE_ENDPOINT?.trim() || defaultEndpoint;
  const region = environment.NHN_OBJECT_STORAGE_REGION?.trim() || defaultRegion;
  const prefix = environment.NHN_OBJECT_STORAGE_PREFIX?.trim() || defaultPrefix;
  const retentionDays = Number(
    environment.NHN_OBJECT_STORAGE_RETENTION_DAYS || 90,
  );

  if (!bucket || !accessKey || !secretKey)
    throw new Error(
      "Set NHN_OBJECT_STORAGE_BUCKET, NHN_OBJECT_STORAGE_ACCESS_KEY, and NHN_OBJECT_STORAGE_SECRET_KEY together",
    );
  if (
    !/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(bucket) ||
    bucket.startsWith("xn--")
  )
    throw new Error("NHN_OBJECT_STORAGE_BUCKET is not a valid S3 bucket name");
  if (!/^[A-Za-z0-9][A-Za-z0-9/_-]*$/.test(prefix))
    throw new Error("NHN_OBJECT_STORAGE_PREFIX may contain only letters, numbers, '/', '_' and '-'");
  if (!Number.isInteger(retentionDays) || retentionDays < 7 || retentionDays > 3650)
    throw new Error("NHN_OBJECT_STORAGE_RETENTION_DAYS must be between 7 and 3650");

  const parsedEndpoint = new URL(endpoint);
  if (parsedEndpoint.protocol !== "https:")
    throw new Error("NHN_OBJECT_STORAGE_ENDPOINT must use HTTPS");

  return {
    bucket,
    accessKey,
    secretKey,
    endpoint: parsedEndpoint.origin,
    region,
    prefix: prefix.replace(/^\/+|\/+$/g, ""),
    retentionDays,
  };
}

export function signedS3Request({
  method,
  endpoint,
  region,
  bucket,
  accessKey,
  secretKey,
  key = "",
  query,
  body,
  now,
}) {
  const parsedEndpoint = new URL(endpoint);
  const payload = body ? Buffer.from(body) : Buffer.alloc(0);
  const payloadHash = hash(payload);
  const canonicalUri = canonicalPath(bucket, key);
  const canonicalQueryString = canonicalQuery(query);
  const { date, timestamp } = requestTime(now);
  const headers = {
    host: parsedEndpoint.host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": timestamp,
  };
  const signedHeaders = Object.keys(headers).sort();
  const canonicalHeaders = signedHeaders
    .map((name) => name + ":" + headers[name] + "\n")
    .join("");
  const credentialScope = date + "/" + region + "/s3/aws4_request";
  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders.join(";"),
    payloadHash,
  ].join("\n");
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    timestamp,
    credentialScope,
    hash(canonicalRequest),
  ].join("\n");
  const signingKey = hmac(
    hmac(hmac(hmac(Buffer.from("AWS4" + secretKey), date), region), "s3"),
    "aws4_request",
  );
  const signature = createHmac("sha256", signingKey)
    .update(stringToSign)
    .digest("hex");
  const authorization =
    "AWS4-HMAC-SHA256 Credential=" +
    accessKey +
    "/" +
    credentialScope +
    ", SignedHeaders=" +
    signedHeaders.join(";") +
    ", Signature=" +
    signature;

  return {
    body: payload,
    headers: {
      Authorization: authorization,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": timestamp,
    },
    url:
      parsedEndpoint.origin +
      canonicalUri +
      (canonicalQueryString ? "?" + canonicalQueryString : ""),
  };
}

async function send(config, operation, options) {
  const request = signedS3Request({
    ...options,
    endpoint: config.endpoint,
    region: config.region,
    bucket: config.bucket,
    accessKey: config.accessKey,
    secretKey: config.secretKey,
  });
  const response = await fetch(request.url, {
    method: options.method,
    headers: request.headers,
    body: options.method === "GET" || options.method === "HEAD" ? undefined : request.body,
  });
  if (!response.ok) await responseError(response, operation);
  return response;
}

function decodeXml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

function matchingTag(block, tag) {
  return block.match(new RegExp("<" + tag + ">([\\s\\S]*?)</" + tag + ">"))?.[1];
}

export async function uploadVerifiedBackup(config, backupPath) {
  const payload = readFileSync(backupPath);
  const key = config.prefix + "/" + path.basename(backupPath);
  await send(config, "upload", { method: "PUT", key, body: payload });

  const response = await send(config, "verification", { method: "HEAD", key });
  const remoteSize = Number(response.headers.get("content-length"));
  const localSize = statSync(backupPath).size;
  if (!Number.isInteger(remoteSize) || remoteSize !== localSize)
    throw new Error("NHN Object Storage verification returned an unexpected object size");

  return { key, size: localSize };
}

export async function pruneExpiredObjectBackups(config, now = Date.now()) {
  const response = await send(config, "list", {
    method: "GET",
    key: "",
    query: { prefix: config.prefix + "/" },
  });
  const document = await response.text();
  const cutoff = now - config.retentionDays * 24 * 60 * 60 * 1000;
  const entries = [...document.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)]
    .map((match) => {
      const key = matchingTag(match[1], "Key");
      const modified = matchingTag(match[1], "LastModified");
      return key && modified
        ? { key: decodeXml(key), modified: Date.parse(modified) }
        : null;
    })
    .filter(Boolean)
    .filter(
      (entry) =>
        entry.key.startsWith(config.prefix + "/platform-") &&
        entry.key.endsWith(".sqlite") &&
        Number.isFinite(entry.modified) &&
        entry.modified < cutoff,
    );

  for (const entry of entries)
    await send(config, "retention cleanup", { method: "DELETE", key: entry.key });

  return entries.length;
}
