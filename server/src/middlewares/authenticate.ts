import { verifyAccessToken } from '#src/utils/jwt/tokens.ts';
import { Response, NextFunction } from 'express';
import { AuthRequest } from '#src/types/authRequest.type.ts';
import { findUserById } from '#src/services/user.service.ts';

// ── Authentication Middleware ──────────────────────────────────────────────────
/**
 * Middleware: authMiddleware
 *
 * Protects routes by validating JWT access tokens and user status.
 * Extracts user ID from token and attaches it to req.userId for downstream handlers.
 *
 * @param req - Express request with optional Authorization header (Bearer <token>)
 * @param res - Express response
 * @param next - Express next function (calls next middleware/handler if authenticated)
 *
 * Expected Header:
 *   Authorization: Bearer <JWT_access_token>
 *
 * Validates:
 *   1. Authorization header is present and Bearer format
 *   2. JWT token is valid and not expired
 *   3. User ID extracted from token payload is valid
 *   4. User exists in database and is active
 *
 * Response Codes:
 *   - 401: Unauthorized (missing token, invalid format, invalid token, expired token, user not found/inactive)
 *   - Calls next() on success with req.userId set
 */
export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    // Check for Bearer token format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Extract token from "Bearer <token>" header
    const token = authHeader.split(' ')[1];

    // Verify JWT token and extract user ID
    const userid = await verifyAccessToken(token);

    if (!userid || typeof userid !== 'string') {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    // Fetch user and verify active status
    const user = await findUserById(userid);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or deactivated' });
    }

    // Attach user ID to request for downstream handlers
    req.userId = userid;

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
