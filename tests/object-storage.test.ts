import assert from "node:assert/strict";
import test from "node:test";
import {
  resolveObjectStorageConfig,
  signedS3Request,
} from "../ops/nhn-object-storage.mjs";

test("Object Storage settings require a complete credential set", () => {
  assert.throws(
    () =>
      resolveObjectStorageConfig({
        NHN_OBJECT_STORAGE_BUCKET: "kimjaehwan-homepage-backups",
        NHN_OBJECT_STORAGE_ACCESS_KEY: "access",
      }),
    /NHN_OBJECT_STORAGE_BUCKET.*together/,
  );
});

test("S3 requests use the KR1 endpoint, path-style object key, and SigV4 headers", () => {
  const request = signedS3Request({
    method: "PUT",
    endpoint: "https://kr1-api-object-storage.nhncloudservice.com",
    region: "KR1",
    bucket: "kimjaehwan-homepage-backups",
    accessKey: "access",
    secretKey: "secret",
    key: "sqlite/platform.sqlite",
    body: Buffer.from("verified backup"),
    now: new Date("2026-09-15T04:00:00.000Z"),
  });

  assert.equal(
    request.url,
    "https://kr1-api-object-storage.nhncloudservice.com/kimjaehwan-homepage-backups/sqlite/platform.sqlite",
  );
  assert.equal(request.headers["x-amz-date"], "20260915T040000Z");
  assert.match(
    request.headers.Authorization,
    /^AWS4-HMAC-SHA256 Credential=access\/20260915\/KR1\/s3\/aws4_request, SignedHeaders=host;x-amz-content-sha256;x-amz-date, Signature=[a-f0-9]{64}$/,
  );
});
