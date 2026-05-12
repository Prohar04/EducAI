import os from 'node:os';
import path from 'node:path';

export function getGapFixUploadDir(): string {
  const envDir = process.env.GAPFIX_UPLOAD_DIR || process.env.UPLOAD_DIR;
  if (envDir) return envDir;
  if (process.env.NODE_ENV === 'production') {
    return path.join(os.tmpdir(), 'educai', 'uploads', 'gap-fix');
  }
  return path.join(process.cwd(), 'uploads', 'gap-fix');
}

export function getLogDir(): string {
  return process.env.LOG_DIR || path.join(os.tmpdir(), 'educai', 'logs');
}
