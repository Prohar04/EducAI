import { Request, Response, NextFunction } from 'express';

// Skip Arcjet entirely in test/CI — the WASM analyzer requires a real HTTP runtime
// and crashes with `Cannot read properties of undefined (reading 'arrayBuffer')` in Jest.
const IS_TEST = process.env.NODE_ENV === 'test';

async function applyArcjet(
  ruleType: 'auth' | 'forgotPassword' | 'ai',
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (IS_TEST) return next();

  try {
    const { default: aj } = await import('#src/config/arcjet.ts');
    const { slidingWindow } = await import('@arcjet/node');

    const rule =
      ruleType === 'forgotPassword'
        ? slidingWindow({ mode: 'LIVE', interval: '1h', max: 5 })
        : ruleType === 'ai'
          // Generation endpoints call paid models. 20/hour is well above genuine
          // use (a user writes one SOP, not twenty) and well below what a script
          // needs to be expensive.
          ? slidingWindow({ mode: 'LIVE', interval: '1h', max: 20 })
          : slidingWindow({ mode: 'LIVE', interval: '15m', max: 10 });

    const instance = aj.withRule(rule);

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

/**
 * Per-caller quota for endpoints that spend model credits (SOP, CV, resume,
 * strategy, chat, gap analysis, career, immigration, professor search).
 * Without it a single authenticated account can drain the AI budget in a loop.
 */
export function aiRateLimit(req: Request, res: Response, next: NextFunction) {
  // Generation is always a POST. Reading back an already-generated SOP or CV
  // costs nothing, so GETs must not consume the caller's quota.
  if (req.method !== 'POST') return next();
  return applyArcjet('ai', req, res, next);
}
