import { Router } from 'express';
import {
  forgotPassword,
  googleAuth,
  googleAuthCallback,
  googleAuthFailure,
  googleExchange,
  me,
  refresh,
  resendVerification,
  resetPassword,
  signin,
  signout,
  signup,
  verifyEmail,
  deleteAccount,
  exportUserData,
} from '#src/controllers/auth.controller.ts';
import { authMiddleware } from '#src/middlewares/authenticate.ts';
import { authRateLimit, forgotPasswordRateLimit } from '#src/middlewares/rateLimit.ts';

const router = Router();

// Google OAuth2 routes
router.get('/google', googleAuth);
router.get('/google/callback', googleAuthCallback);
router.get('/google/exchange', googleExchange);
router.get('/google/failure', googleAuthFailure);

// Local auth routes — rate limited
router.post('/signup', authRateLimit, signup);
router.post('/signin', authRateLimit, signin);

// Email verification — rate limited
router.post('/verify-email', authRateLimit, verifyEmail);
router.post('/resend-verification', authRateLimit, resendVerification);

// Get new access token using refresh token (POST preferred, GET for backward compat)
router.post('/refresh', refresh);
router.get('/refresh', refresh);

// Signout (POST preferred, GET for backward compat)
router.post('/signout', authMiddleware, signout);
router.get('/signout', authMiddleware, signout);

// Current user profile
router.get('/me', authMiddleware, me);

// Password reset flow — stricter rate limit on forgot-password
router.post('/forgot-password', forgotPasswordRateLimit, forgotPassword);
router.post('/reset-password', authRateLimit, resetPassword);

// Account management (requires authentication)
router.delete('/account', authMiddleware, deleteAccount);
router.get('/export-data', authMiddleware, exportUserData);

export default router;
