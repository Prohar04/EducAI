import { Request, Response, NextFunction } from 'express';
import aj from '#src/config/arcjet.ts';
import { slidingWindow, shield } from '@arcjet/node';

// Stricter Arcjet instance for auth routes
const authAj = aj.withRule(
  slidingWindow({
    mode: 'LIVE',
    interval: '15m',
    max: 10, // 10 attempts per 15 minutes per IP
  }),
);

const forgotPasswordAj = aj.withRule(
  slidingWindow({
    mode: 'LIVE',
    interval: '1h',
    max: 5, // 5 reset attempts per hour per IP
  }),
);

async function applyArcjet(
  instance: typeof aj,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const decision = await instance.protect(req);
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        res.status(429).json({
          message: 'Too many attempts. Please wait before trying again.',
          code: 'RATE_LIMIT_EXCEEDED',
        });
        return;
      }
      if (decision.reason.isBot()) {
        res.status(403).json({ message: 'Request blocked.', code: 'BOT_DETECTED' });
        return;
      }
      res.status(403).json({ message: 'Request blocked.', code: 'FORBIDDEN' });
      return;
    }
    next();
  } catch {
    // Never block requests due to Arcjet errors — fail open
    next();
  }
}

export function authRateLimit(req: Request, res: Response, next: NextFunction) {
  return applyArcjet(authAj, req, res, next);
}

export function forgotPasswordRateLimit(req: Request, res: Response, next: NextFunction) {
  return applyArcjet(forgotPasswordAj, req, res, next);
}
