import { Request, Response } from 'express';
import crypto from 'crypto';
import passport from 'passport';
import '../config/google.config.ts';
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserPassword,
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
import { sendPasswordResetEmail } from '#src/services/email.service.ts';
// todo: implement session management and session store
import { saveUserSession } from '#src/services/session.service.ts';
import { hashing, verifyHash } from '#src/utils/auth/hash.ts';
import { AuthRequest } from '#src/types/authRequest.type.ts';

export const refresh = async (req: Request, res: Response) => {
  // Accept refresh token from body (POST) or cookie (GET fallback)
  const token = req.body?.refresh || req.cookies?.refreshToken;

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

  // Check expiry from DB
  if (new Date() > storedToken.expiresAt) {
    await deleteRefreshToken(hashRT);
    return res.status(401).json({ message: 'Refresh token expired' });
  }

  // Delete old token (rotation)
  await deleteRefreshToken(hashRT);

  const { accessToken, refreshToken: newRefreshToken } =
    await generateTokens(userId);

  const hashedRefreshToken = hashTokenCrypto(newRefreshToken);
  await saveRefreshToken(userId, hashedRefreshToken);

  // Also set cookies for backward compat
  await saveToCookie(res, newRefreshToken, accessToken);

  // Return JSON so the frontend can use the tokens directly
  res
    .status(200)
    .json({ accessToken, refreshToken: newRefreshToken, message: 'Token refreshed' });
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, name, avatarUrl } = req.body;

    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ message: 'Email, password and name are required' });
    }

    const user = await findUserByEmail(email);
    if (user) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await hashing(password);

    const newUser: ReturnUserDto = await createUser({
      email,
      name,
      avatarUrl,
      passwordHash: hashedPassword,
    });

    // TODO: Send verification email here

    res
      .status(201)
      .json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error('Error in signup:', error);
    res.status(500).json({ message: 'user creation failed' });
  }
};

export const signin = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await findUserByEmail(email);

  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const isPasswordValid = await verifyHash(
    user.passwordHash as string,
    password
  );
  if (!isPasswordValid) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  const { accessToken, refreshToken } = await generateTokens(user.id);
  const hashedRefreshToken = hashTokenCrypto(refreshToken);

  await saveRefreshToken(user.id, hashedRefreshToken);

  // TODO: Save session info (user agent, IP) in the database for active session management
  // ? Save session info in the database for active session management
  // await saveUserSession(user.id, req.sessionID, req.get('user-agent'), req.ip);

  await saveToCookie(res, refreshToken, accessToken);

  const secureUser: ReturnUserDto = {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatarUrl || undefined,
    emailVerified: user.emailVerified,
    isActive: user.isActive,
  };

  res.status(200).json({ message: 'Signin successful', user: secureUser });
};

// @desc    Signout user and invalidate refresh token
// @route   GET|POST /auth/signout
export const signout = async (req: AuthRequest, res: Response) => {
  const { userId } = req;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await deleteUserRefreshTokens(userId); // Invalidate all refresh tokens for the user
  await clearTokens(res); // Clear cookies

  // Passport/session logout — gracefully handle if not initialized
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

// @desc    Initiate Google OAuth2 login
// @route   GET /auth/google
export const googleAuth = passport.authenticate('google', {
  scope: ['email', 'profile'],
});

// @desc    Handle Google OAuth2 callback
// @route   GET /auth/google/callback
export const googleAuthCallback = [
  passport.authenticate('google', {
    session: false, // important if you're using JWT instead of sessions
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/failure`,
  }),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as ReturnUserDto; // Type assertion for user object returned by passport

      if (!user) {
        return res.status(401).json({ message: 'Authentication failed' });
      }

      const { accessToken, refreshToken } = await generateTokens(user.id);

      const hashedRefreshToken = hashTokenCrypto(refreshToken);
      await saveRefreshToken(user.id, hashedRefreshToken);

      const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';

      return res.redirect(
        `${frontend}/api/auth/google/callback?id=${user.id}&email=${user.email}&name=${user.name}&avatar=${user.avatar || ''}&emailVerified=${user.emailVerified}&isActive=${user.isActive}&accessToken=${accessToken}&refreshToken=${refreshToken}`
      );
    } catch (error) {
      console.error('Error in Google auth callback:', error);
      const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
      return res.redirect(`${frontend}/auth/failure`);
    }
  },
];

// @desc    Google OAuth2 failure route
// @route   GET /auth/google/failure
// todo: keep one failior route
export const googleAuthFailure = async (req: Request, res: Response) => {
  const frontend = process.env.FRONTEND_URL || 'http://localhost:3000';
  res.redirect(`${frontend}/auth/failure`);
};

// @desc    Request a password reset link
// @route   POST /auth/forgot-password
// TODO: Add rate limiting to prevent abuse
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(422).json({ message: 'Email is required' });
    }

    // Always return 200 to avoid leaking whether the email exists
    const genericMessage =
      'If an account exists for this email, a password reset link has been sent.';

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(200).json({ message: genericMessage });
    }

    // Generate raw token and hash it for storage
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashTokenCrypto(rawToken);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await createPasswordResetToken(user.id, tokenHash, expiresAt);

    // Build reset link and send email
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${rawToken}`;

    await sendPasswordResetEmail(email, resetUrl);

    res.status(200).json({ message: genericMessage });
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Reset password with a valid token
// @route   POST /auth/reset-password
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

    // Validate password complexity (match frontend rules)
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

    // Hash new password and update user
    const hashedPassword = await hashing(password);
    await updateUserPassword(resetToken.userId, hashedPassword);

    // Mark token as used
    await markPasswordResetTokenUsed(resetToken.id);

    // Revoke all refresh tokens for security
    await deleteUserRefreshTokens(resetToken.userId);

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
