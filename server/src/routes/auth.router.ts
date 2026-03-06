import { Router } from 'express';
import {
  forgotPassword,
  googleAuth,
  googleAuthCallback,
  googleAuthFailure,
  me,
  refresh,
  resendVerification,
  resetPassword,
  signin,
  signout,
  signup,
  verifyEmail,
} from '#src/controllers/auth.controller.ts';
import { authMiddleware } from '#src/middlewares/authenticate.ts';

const router = Router();

// Google OAuth2 routes
router.get('/google', googleAuth);
router.get('/google/callback', googleAuthCallback);
router.get('/google/failure', googleAuthFailure);

// Local auth routes
router.post('/signup', signup);
router.post('/signin', signin);

// Email verification
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);

// Get new access token using refresh token (POST preferred, GET for backward compat)
router.post('/refresh', refresh);
router.get('/refresh', refresh);

// Signout (POST preferred, GET for backward compat)
router.post('/signout', authMiddleware, signout);
router.get('/signout', authMiddleware, signout);

// Current user profile
router.get('/me', authMiddleware, me);

// Password reset flow
// TODO: Add rate limiting to /forgot-password to prevent abuse
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
