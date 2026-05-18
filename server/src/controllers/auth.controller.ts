import { Request, Response, NextFunction } from 'express';
import { toUSD } from '#src/utils/exchangeRates.ts';
import crypto from 'crypto';
import passport from 'passport';
import { GOOGLE_OAUTH_ENABLED } from '../config/google.config.ts';
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
  sendWelcomeEmail,
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
import logger from '#src/config/logger.ts';

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

  logger.info(`[auth] Sending verification email to ${email} | tokenId: ${rawToken.slice(0, 8)}...`);

  const result = await sendVerificationEmail(email, verifyUrl);

  if (result.success) {
    logger.info(`[auth] Verification email sent to ${email}`, { provider: result.provider, messageId: result.messageId });
  } else {
    logger.error(`[auth] Failed to send verification email to ${email}`, { provider: result.provider, error: result.error });
    throw new Error(`Email delivery failed: ${result.error}`);
  }
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
  const t0 = Date.now();
  try {
    const { email, password, name, avatarUrl, profile } = req.body;

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

    const tValidation = Date.now();
    logger.info(`[signup] validation done in ${tValidation - t0}ms`);

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      if (existingUser.emailVerified) {
        return res.status(409).json({ message: 'Email already in use' });
      }
      // Unverified — resend verification (email failure must not block the response)
      sendVerification(existingUser.id, existingUser.email).catch((e) =>
        logger.error('Resend verification email failed:', e),
      );
      return res
        .status(200)
        .json({ message: 'Account created. Please check your email to verify.' });
    }

    const tDbLookup = Date.now();
    logger.info(`[signup] db lookup done in ${tDbLookup - tValidation}ms`);

    const hashedPassword = await hashing(password);
    const tHash = Date.now();
    logger.info(`[signup] password hashing done in ${tHash - tDbLookup}ms`);

    const newUser: ReturnUserDto = await createUser({
      email: email.toLowerCase(),
      name,
      avatarUrl,
      passwordHash: hashedPassword,
    });

    // If profile data provided at signup, create UserProfile in one go
    // NOTE: onboardingDone is kept false so the wizard still runs for completeness
    if (profile && typeof profile === 'object') {
      await prisma.userProfile.upsert({
        where: { userId: newUser.id },
        update: {
          currentStage: profile.currentStage ?? undefined,
          targetIntake: profile.targetIntake ?? undefined,
          targetCountries: profile.targetCountries ?? undefined,
          intendedLevel: profile.intendedLevel ?? undefined,
          intendedMajor: profile.intendedMajor ?? undefined,
          gpa: profile.gpa ?? undefined,
          gpaScale: profile.gpaScale ?? undefined,
          englishTestType: profile.englishTestType ?? undefined,
          englishScore: profile.englishScore ?? undefined,
          budgetMax: profile.budgetMax ?? undefined,
          budgetCurrency: profile.budgetCurrency ?? 'USD',
          budgetAmountUSD: (profile.budgetMax != null && profile.budgetCurrency != null)
            ? (toUSD(profile.budgetMax, profile.budgetCurrency) ?? undefined)
            : undefined,
          workExperienceMonths: profile.workExperienceMonths ?? undefined,
          onboardingDone: false,
        },
        create: {
          userId: newUser.id,
          currentStage: profile.currentStage ?? undefined,
          targetIntake: profile.targetIntake ?? undefined,
          targetCountries: profile.targetCountries ?? undefined,
          intendedLevel: profile.intendedLevel ?? undefined,
          intendedMajor: profile.intendedMajor ?? undefined,
          gpa: profile.gpa ?? undefined,
          gpaScale: profile.gpaScale ?? undefined,
          englishTestType: profile.englishTestType ?? undefined,
          englishScore: profile.englishScore ?? undefined,
          budgetMax: profile.budgetMax ?? undefined,
          budgetCurrency: profile.budgetCurrency ?? 'USD',
          budgetAmountUSD: (profile.budgetMax != null && profile.budgetCurrency != null)
            ? (toUSD(profile.budgetMax, profile.budgetCurrency) ?? undefined)
            : undefined,
          workExperienceMonths: profile.workExperienceMonths ?? undefined,
          onboardingDone: false,
        },
      }).catch((e) => logger.error('Profile creation at signup failed (non-fatal):', e));
    }

    const tUserCreate = Date.now();
    logger.info(`[signup] user created in ${tUserCreate - tHash}ms | userId=${newUser.id}`);

    // Fire-and-forget: email failures must roll back account creation
    try {
      await sendVerification(newUser.id, newUser.email);
      const tEmail = Date.now();
      logger.info(`[signup] email sent in ${tEmail - tUserCreate}ms | total=${tEmail - t0}ms`);
    } catch (emailError) {
      // Roll back the user creation since email verification is required
      await prisma.user.delete({ where: { id: newUser.id } });
      logger.error('[auth] Signup failed — rolled back user creation. Email error:', (emailError as Error).message);
      return res.status(503).json({
        message: 'Account creation failed. Email service is unavailable. Please try again later.',
        code: 'EMAIL_SERVICE_UNAVAILABLE',
      });
    }

    res
      .status(201)
      .json({ message: 'Account created. Please check your email to verify.' });
  } catch (error) {
    logger.error('Error in signup:', error);
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
    const verifiedUser = await prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: true, isActive: true },
      select: { email: true, name: true },
    });

    await markEmailVerificationTokenUsed(record.id);

    // Fire-and-forget welcome email
    const appUrl = process.env.FRONTEND_URL ?? 'https://educai-web.vercel.app';
    sendWelcomeEmail(verifiedUser.email, verifiedUser.name ?? 'there', appUrl).catch((e) =>
      logger.error('[auth] Welcome email failed (non-fatal):', e),
    );

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    logger.error('Error in verifyEmail:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── RESEND VERIFICATION ────────────────────────────────────────────

export const resendVerification = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const genericMessage =
      'If an account exists, we sent a verification email.';

    if (!email || typeof email !== 'string') {
      return res.status(200).json({ message: genericMessage });
    }

    const user = await findUserByEmail(email);
    if (user && !user.emailVerified) {
      try {
        await sendVerification(user.id, user.email);
      } catch (emailError) {
        logger.error('[auth] Resend verification failed:', (emailError as Error).message);
        return res.status(503).json({
          message: 'Email service unavailable. Please try again later.',
          code: 'EMAIL_SERVICE_UNAVAILABLE',
        });
      }
    }

    // TODO: rate limit per IP/email
    res.status(200).json({ message: genericMessage });
  } catch (error) {
    logger.error('Error in resendVerification:', error);
    res.status(200).json({ message: 'If an account exists, we sent a verification email.' });
  }
};

// ── SIGNIN (with lockout + email-verified check + remember me) ─────

export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe } = req.body;
    const user = await findUserByEmail(email?.toLowerCase());

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
    logger.error('Error in signin:', error);
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
    logger.error('Error in me:', error);
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
      if (err) logger.error('Logout error:', err);
    });
  }
  if (req.session) {
    req.session.destroy(() => {});
  }

  res.status(200).json({ message: 'Signed out' });
};

// ── GOOGLE OAUTH ───────────────────────────────────────────────────

const _googleAuthDisabled = (_req: Request, res: Response) =>
  res.status(503).json({ message: 'Google OAuth is not configured on this server.' });

export const googleAuth = GOOGLE_OAUTH_ENABLED
  ? passport.authenticate('google', { scope: ['email', 'profile'] })
  : _googleAuthDisabled;

export const googleAuthCallback = GOOGLE_OAUTH_ENABLED
  ? [
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('google', { session: false }, (err: any, user: any, info: any) => {
      if (err) {
        logger.error('[google callback] passport error:', err);
      }
      if (!user) {
        logger.warn('[google callback] no user returned, info:', info);
        const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
        return res.redirect(`${frontend}/auth/signin?error=oauth_failed`);
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  async (req: Request, res: Response) => {
    try {
      const user = req.user as ReturnUserDto;

      if (!user) {
        return res.status(401).json({ message: 'Authentication failed' });
      }

      const { accessToken, refreshToken } = await generateTokens(user.id);

      const hashedRefreshToken = hashTokenCrypto(refreshToken);
      await saveRefreshToken(user.id, hashedRefreshToken);

      // Store tokens as a short-lived one-time code in DB (survives restarts, works in multi-instance).
      // Cookies set here (localhost:8000) are not readable by the frontend (localhost:3000).
      const rawCode = crypto.randomBytes(32).toString('hex');
      const codeHash = hashTokenCrypto(rawCode);
      const expiresAt = new Date(Date.now() + 120_000); // 2 minutes

      await prisma.oAuthCode.create({
        data: { codeHash, userId: user.id, accessToken, refreshToken, expiresAt },
      });

      const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
      logger.info(`[google callback] code issued for user ${user.id}, expires ${expiresAt.toISOString()}`);

      return res.redirect(`${frontend}/api/auth/google/callback?code=${rawCode}`);
    } catch (error) {
      logger.error('Error in Google auth callback:', error);
      const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontend}/auth/signin?error=oauth_failed`);
    }
  },
]
  : [_googleAuthDisabled];

// ── GOOGLE EXCHANGE (one-time code → tokens) ──────────────────────
export const googleExchange = async (req: Request, res: Response) => {
  const { code } = req.query;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ message: 'Missing code' });
  }

  const codeHash = hashTokenCrypto(code);
  const entry = await prisma.oAuthCode.findUnique({ where: { codeHash } });

  if (!entry) {
    logger.warn(`[google exchange] code not found (hash: ${codeHash.slice(0, 8)}...)`);
    return res.status(401).json({ message: 'Invalid or expired code' });
  }

  if (entry.expiresAt < new Date()) {
    await prisma.oAuthCode.delete({ where: { codeHash } });
    logger.warn(`[google exchange] code expired for user ${entry.userId}`);
    return res.status(401).json({ message: 'Invalid or expired code' });
  }

  // Single-use: delete immediately
  await prisma.oAuthCode.delete({ where: { codeHash } });

  const user = await findUserById(entry.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  logger.info(`[google exchange] tokens issued for user ${user.id} (${user.email})`);

  return res.status(200).json({
    accessToken: entry.accessToken,
    refreshToken: entry.refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl ?? null,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
    },
  });
};

export const googleAuthFailure = async (req: Request, res: Response) => {
  const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
  res.redirect(`${frontend}/auth/signin?error=oauth_failed`);
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
    logger.error('Error in forgotPassword:', error);
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
    logger.error('Error in resetPassword:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── DELETE ACCOUNT ─────────────────────────────────────────────────────────────

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorised' });

    // Cascade delete via Prisma relations — all user data is removed
    await prisma.user.delete({ where: { id: userId } });

    // Clear auth cookies
    const cookieOpts = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const };
    res.clearCookie('accessToken', cookieOpts);
    res.clearCookie('refreshToken', cookieOpts);

    res.status(200).json({ message: 'Account permanently deleted' });
  } catch (error) {
    logger.error('Error in deleteAccount:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// ── GDPR DATA EXPORT ──────────────────────────────────────────────────────────

export const exportUserData = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorised' });

    const [user, profile, savedPrograms, matchRuns, roadmaps, strategies, gapFix, jobSearches] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, email: true, name: true, createdAt: true, emailVerified: true, oauthProvider: true },
        }),
        prisma.userProfile.findUnique({ where: { userId } }),
        prisma.savedProgram.findMany({ where: { userId }, include: { program: { select: { title: true } } } }),
        prisma.matchRun.findMany({ where: { userId }, select: { id: true, status: true, createdAt: true } }),
        prisma.userRoadmap.findMany({ where: { userId }, select: { id: true, countryCode: true, intake: true, createdAt: true } }),
        prisma.strategyReport.findMany({ where: { userId }, select: { id: true, countryCode: true, createdAt: true } }),
        prisma.gapFixSession.findMany({ where: { userId }, select: { id: true, createdAt: true } }),
        prisma.jobSearch.findMany({ where: { userId }, select: { id: true, countryCode: true, city: true, field: true, createdAt: true } }),
      ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      account: user,
      profile,
      savedPrograms: savedPrograms.map((s) => ({ savedAt: s.createdAt, program: s.program?.title })),
      matchRuns,
      roadmaps,
      strategies,
      gapFixSessions: gapFix,
      jobSearches,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="educai-data-export-${userId}.json"`);
    res.status(200).json(exportData);
  } catch (error) {
    logger.error('Error in exportUserData:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
