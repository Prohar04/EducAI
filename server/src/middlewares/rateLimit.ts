import { Request, Response, NextFunction } from 'express';

// Skip Arcjet entirely in test/CI — the WASM analyzer requires a real HTTP runtime
// and crashes with `Cannot read properties of undefined (reading 'arrayBuffer')` in Jest.
const IS_TEST = process.env.NODE_ENV === 'test';

async function applyArcjet(
  ruleType: 'auth' | 'forgotPassword',
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (IS_TEST) return next();

  try {
    const { default: aj } = await import('#src/config/arcjet.ts');
    const { slidingWindow } = await import('@arcjet/node');

    const instance = ruleType === 'forgotPassword'
      ? aj.withRule(slidingWindow({ mode: 'LIVE', interval: '1h', max: 5 }))
      : aj.withRule(slidingWindow({ mode: 'LIVE', interval: '15m', max: 10 }));

    const decision = await instance.protect(req);
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        res.status(429).json({
          message: 'Too many attempts. Please wait before trying again.',
          code: 'RATE_LIMIT_EXCEEDED',
        });
        return;
      }
      res.status(403).json({ message: 'Request blocked.', code: 'FORBIDDEN' });
      return;
    }
    next();
  } catch {
    // Fail open — never block requests due to Arcjet errors
    next();
  }
}

export function authRateLimit(req: Request, res: Response, next: NextFunction) {
  return applyArcjet('auth', req, res, next);
}

export function forgotPasswordRateLimit(req: Request, res: Response, next: NextFunction) {
  return applyArcjet('forgotPassword', req, res, next);
}
