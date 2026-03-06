import { Request, Response } from 'express';
import crypto from 'crypto';
import passport from 'passport';
import '../config/google.config.ts';
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserPassword,
  incrementFailedLogin,
  resetFailedLogin,
} from '#src/services/user.service.ts';

import { ReturnUserDto } from '#src/services/dto/createUser.dto.ts';
import {
  clearTokens,
  generateTokens,
  hashTokenCrypto,
  saveToCookie,
  verifyRefreshToken,
} from '#src/utils/jwt/tokens.ts';
import {
  deleteRefreshToken,
  deleteUserRefreshTokens,
  findRefreshToken,
  saveRefreshToken,
} from '#src/services/token.service.ts';
import {
  createPasswordResetToken,
  findPasswordResetToken,
  markPasswordResetTokenUsed,
} from '#src/services/passwordReset.service.ts';
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from '#src/services/email.service.ts';
import {
  createEmailVerificationToken,
  findEmailVerificationToken,
  markEmailVerificationTokenUsed,
} from '#src/services/emailVerification.service.ts';
import { saveUserSession } from '#src/services/session.service.ts';
import { hashing, verifyHash } from '#src/utils/auth/hash.ts';
import { AuthRequest } from '#src/types/authRequest.type.ts';
import prisma from '#src/config/database.ts';

// ── One-time code store for Google OAuth cross-origin handoff ──────
const oauthCodeStore = new Map<string, { accessToken: string; refreshToken: string; expiry: number }>();
setInterval(() => {
  const now = Date.now();
  for (const [code, val] of oauthCodeStore) {
    if (val.expiry < now) oauthCodeStore.delete(code);
  }
}, 60_000);

// ── helpers ────────────────────────────────────────────────────────

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_MS = 10 * 60 * 1000; // 10 minutes
const DEFAULT_REFRESH_TTL_DAYS = 15;
const REMEMBER_ME_TTL_DAYS = 30;

async function sendVerification(userId: string, email: string) {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashTokenCrypto(rawToken);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await createEmailVerificationToken(userId, tokenHash, expiresAt);

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const verifyUrl = `${frontendUrl}/auth/verify-email?token=${rawToken}`;

  await sendVerificationEmail(email, verifyUrl);
}

// ── REFRESH ────────────────────────────────────────────────────────

export const refresh = async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return res.status(401).json({ message: 'Refresh token missing' });
  }

  const userId: string | null = await verifyRefreshToken(token);
  if (!userId) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }

  const hashRT = hashTokenCrypto(token);
  const storedToken = await findRefreshToken(hashRT);

  if (!storedToken) {
    return res.status(401).json({ message: 'Refresh token not found' });
  }

  if (new Date() > storedToken.expiresAt) {
    await deleteRefreshToken(hashRT);
    return res.status(401).json({ message: 'Refresh token expired' });
  }

  // Preserve remember-me TTL on rotation
  const ttlDays = storedToken.ttlDays || DEFAULT_REFRESH_TTL_DAYS;

  await deleteRefreshToken(hashRT);

  const { accessToken, refreshToken: newRefreshToken } =
    await generateTokens(userId, { refreshTtlDays: ttlDays });

  const hashedRefreshToken = hashTokenCrypto(newRefreshToken);
  await saveRefreshToken(userId, hashedRefreshToken, ttlDays);

  await saveToCookie(res, newRefreshToken, accessToken);

  res
    .status(200)
    .json({ accessToken, refreshToken: newRefreshToken, message: 'Token refreshed' });
};

// ── SIGNUP ─────────────────────────────────────────────────────────

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, name, avatarUrl } = req.body;

    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ message: 'Email, password and name are required' });
    }

    // Validate password strength (same rules as resetPassword)
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(422).json({ message: 'Password must be at least 8 characters long' });
    }
    if (!/[a-zA-Z]/.test(password)) {
      return res.status(422).json({ message: 'Password must contain at least one letter' });
    }
    if (!/[0-9]/.test(password)) {
      return res.status(422).json({ message: 'Password must contain at least one number' });
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      return res.status(422).json({ message: 'Password must contain at least one special character' });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      if (existingUser.emailVerified) {
        return res.status(409).json({ message: 'Email already in use' });
      }
      // Unverified — resend verification (email failure must not block the response)
      sendVerification(existingUser.id, existingUser.email).catch((e) =>
        console.error('Resend verification email failed:', e),
      );
      return res
        .status(200)
        .json({ message: 'Account created. Please check your email to verify.' });
    }

    const hashedPassword = await hashing(password);

    const newUser: ReturnUserDto = await createUser({
      email,
      name,
      avatarUrl,
      passwordHash: hashedPassword,
    });

    // Fire-and-forget: email failures must not roll back account creation
    sendVerification(newUser.id, newUser.email).catch((e) =>
      console.error('Signup verification email failed (account created):', e),
    );

    res
      .status(201)
      .json({ message: 'Account created. Please check your email to verify.' });
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({ message: 'User creation failed' });
  }
};

// ── VERIFY EMAIL ───────────────────────────────────────────────────

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const tokenHash = hashTokenCrypto(token);
    const record = await findEmailVerificationToken(tokenHash);

    if (!record || record.usedAt || new Date() > record.expiresAt) {
      return res.status(400).json({ message: 'Invalid or expired verification link' });
    }

    // Mark user as verified
    await prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: true, isActive: true },
    });

    await markEmailVerificationTokenUsed(record.id);

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error in verifyEmail:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── RESEND VERIFICATION ────────────────────────────────────────────

export const resendVerification = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Always return 200 generic regardless
    const genericMessage =
      'If an account exists, we sent a verification email.';

    if (!email || typeof email !== 'string') {
      return res.status(200).json({ message: genericMessage });
    }

    const user = await findUserByEmail(email);
    if (user && !user.emailVerified) {
      await sendVerification(user.id, user.email);
    }

    // TODO: rate limit per IP/email
    res.status(200).json({ message: genericMessage });
  } catch (error) {
    console.error('Error in resendVerification:', error);
    res.status(200).json({ message: 'If an account exists, we sent a verification email.' });
  }
};

// ── SIGNIN (with lockout + email-verified check + remember me) ─────

export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe } = req.body;
    const user = await findUserByEmail(email);

    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check lockout
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      const retryAfterSeconds = Math.ceil(
        (user.lockoutUntil.getTime() - Date.now()) / 1000
      );
      return res.status(423).json({
        code: 'ACCOUNT_LOCKED',
        message: 'Too many failed attempts. Try again later.',
        retryAfterSeconds,
      });
    }

    const isPasswordValid = await verifyHash(user.passwordHash, password);
    if (!isPasswordValid) {
      await incrementFailedLogin(user.id);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check email verified
    if (!user.emailVerified) {
      return res.status(403).json({
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email before signing in.',
      });
    }

    // Reset failed login counters on success
    await resetFailedLogin(user.id);

    const ttlDays = rememberMe ? REMEMBER_ME_TTL_DAYS : DEFAULT_REFRESH_TTL_DAYS;

    const { accessToken, refreshToken } = await generateTokens(user.id, {
      refreshTtlDays: ttlDays,
    });
    const hashedRefreshToken = hashTokenCrypto(refreshToken);
    await saveRefreshToken(user.id, hashedRefreshToken, ttlDays);

    await saveToCookie(res, refreshToken, accessToken);

    const secureUser: ReturnUserDto = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatarUrl || undefined,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
    };

    res.status(200).json({
      message: 'Signin successful',
      user: secureUser,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Error in signin:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── ME (current user profile) ──────────────────────────────────────

export const me = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = await findUserById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl || undefined,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
    });
  } catch (error) {
    console.error('Error in me:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── SIGNOUT ────────────────────────────────────────────────────────

export const signout = async (req: AuthRequest, res: Response) => {
  const { userId } = req;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await deleteUserRefreshTokens(userId);
  await clearTokens(res);

  if (typeof req.logout === 'function') {
    req.logout(err => {
      if (err) console.error('Logout error:', err);
    });
  }
  if (req.session) {
    req.session.destroy(() => {});
  }

  res.status(200).json({ message: 'Signed out' });
};

// ── GOOGLE OAUTH ───────────────────────────────────────────────────

export const googleAuth = passport.authenticate('google', {
  scope: ['email', 'profile'],
});

export const googleAuthCallback = [
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/failure`,
  }),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as ReturnUserDto;

      if (!user) {
        return res.status(401).json({ message: 'Authentication failed' });
      }

      const { accessToken, refreshToken } = await generateTokens(user.id);

      const hashedRefreshToken = hashTokenCrypto(refreshToken);
      await saveRefreshToken(user.id, hashedRefreshToken);

      // Store tokens in a short-lived one-time code to hand off across origins.
      // Cookies set here (localhost:8000) are not readable by the frontend (localhost:3000).
      const oauthCode = crypto.randomBytes(32).toString('hex');
      oauthCodeStore.set(oauthCode, { accessToken, refreshToken, expiry: Date.now() + 60_000 });

      const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';

      return res.redirect(`${frontend}/api/auth/google/callback?code=${oauthCode}`);
    } catch (error) {
      console.error('Error in Google auth callback:', error);
      const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontend}/auth/failure`);
    }
  },
];

// ── GOOGLE EXCHANGE (one-time code → tokens) ──────────────────────
export const googleExchange = async (req: Request, res: Response) => {
  const { code } = req.query;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ message: 'Missing code' });
  }
  const entry = oauthCodeStore.get(code);
  if (!entry || entry.expiry < Date.now()) {
    oauthCodeStore.delete(code);
    return res.status(401).json({ message: 'Invalid or expired code' });
  }
  oauthCodeStore.delete(code); // single-use
  return res.status(200).json({ accessToken: entry.accessToken, refreshToken: entry.refreshToken });
};

export const googleAuthFailure = async (req: Request, res: Response) => {
  const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
  res.redirect(`${frontend}/auth/failure`);
};

// ── FORGOT PASSWORD ────────────────────────────────────────────────

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(422).json({ message: 'Email is required' });
    }

    const genericMessage =
      'If an account exists for this email, a password reset link has been sent.';

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(200).json({ message: genericMessage });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashTokenCrypto(rawToken);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await createPasswordResetToken(user.id, tokenHash, expiresAt);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${rawToken}`;

    await sendPasswordResetEmail(email, resetUrl);

    // TODO: rate limit per IP/email
    res.status(200).json({ message: genericMessage });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── RESET PASSWORD ─────────────────────────────────────────────────

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: 'Reset token is required' });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return res
        .status(422)
        .json({ message: 'Password must be at least 8 characters long' });
    }

    if (!/[a-zA-Z]/.test(password)) {
      return res
        .status(422)
        .json({ message: 'Password must contain at least one letter' });
    }
    if (!/[0-9]/.test(password)) {
      return res
        .status(422)
        .json({ message: 'Password must contain at least one number' });
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      return res.status(422).json({
        message: 'Password must contain at least one special character',
      });
    }

    const tokenHash = hashTokenCrypto(token);
    const resetToken = await findPasswordResetToken(tokenHash);

    if (!resetToken) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    if (resetToken.usedAt) {
      return res
        .status(400)
        .json({ message: 'This reset link has already been used' });
    }

    if (new Date() > resetToken.expiresAt) {
      return res.status(400).json({ message: 'Reset token has expired' });
    }

    const hashedPassword = await hashing(password);
    await updateUserPassword(resetToken.userId, hashedPassword);

    await markPasswordResetTokenUsed(resetToken.id);

    await deleteUserRefreshTokens(resetToken.userId);

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
