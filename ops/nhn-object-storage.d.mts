export type ObjectStorageConfig = {
  bucket: string;
  accessKey: string;
  secretKey: string;
  endpoint: string;
  region: string;
  prefix: string;
  retentionDays: number;
};

export function resolveObjectStorageConfig(
  environment?: NodeJS.ProcessEnv,
): ObjectStorageConfig;

export function signedS3Request(input: {
  method: string;
  endpoint: string;
  region: string;
  bucket: string;
  accessKey: string;
  secretKey: string;
  key?: string;
  query?: Record<string, string | number | undefined | null>;
  body?: Uint8Array;
  now?: Date;
}): {
  body: Buffer;
  headers: Record<string, string>;
  url: string;
};

export function uploadVerifiedBackup(
  config: ObjectStorageConfig,
  backupPath: string,
): Promise<{ key: string; size: number }>;

export function pruneExpiredObjectBackups(
  config: ObjectStorageConfig,
  now?: number,
): Promise<number>;
