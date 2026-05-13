import type { Request, Response, NextFunction } from 'express';

/**
 * Constant-time string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Middleware to authenticate cron/scheduled jobs
 * Checks CRON_SECRET environment variable
 */
export function authenticateCron(req: Request, res: Response, next: NextFunction): void {
  const cronSecret = process.env.CRON_SECRET;

  // If CRON_SECRET is not configured, fail in production
  if (!cronSecret) {
    if (process.env.NODE_ENV !== 'production') {
      // Allow in development for testing
      console.warn('[cron-auth] CRON_SECRET not set - allowing in non-production');
      next();
      return;
    }
    console.error('[cron-auth] CRON_SECRET is not configured on the server');
    res.status(500).json({ error: 'Cron authentication is not configured' });
    return;
  }

  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authorization header missing' });
    return;
  }

  const token = authHeader.slice(7); // Remove 'Bearer ' prefix

  // Constant-time comparison to prevent timing attacks
  if (!timingSafeEqual(token, cronSecret)) {
    res.status(401).json({ error: 'Invalid authorization token' });
    return;
  }

  next();
}