export function createVerifiedBackup(environment?: NodeJS.ProcessEnv): {
  destination: string;
  backupDir: string;
  retention: number;
};
