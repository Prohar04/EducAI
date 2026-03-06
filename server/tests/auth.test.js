/* ──────────────────────────────────────────────
 *  Auth endpoint tests – lockout, remember-me TTL,
 *  email verification, signup, signin, refresh
 * ────────────────────────────────────────────── */
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// ─── Mock setup (must precede any dynamic imports) ───

// Prisma client (controller uses it directly in verifyEmail)
const mockPrismaUserUpdate = jest.fn();
jest.unstable_mockModule('#src/config/database.ts', () => ({
  __esModule: true,
  default: { user: { update: mockPrismaUserUpdate } },
}));

// User service
const mockFindUserByEmail = jest.fn();
const mockCreateUser = jest.fn();
const mockIncrementFailedLogin = jest.fn().mockResolvedValue(undefined);
const mockResetFailedLogin = jest.fn().mockResolvedValue(undefined);
const mockUpdateUserPassword = jest.fn().mockResolvedValue(undefined);
jest.unstable_mockModule('#src/services/user.service.ts', () => ({
  findUserByEmail: mockFindUserByEmail,
  findUserById: jest.fn(),
  createUser: mockCreateUser,
  updateUserPassword: mockUpdateUserPassword,
  incrementFailedLogin: mockIncrementFailedLogin,
  resetFailedLogin: mockResetFailedLogin,
  verifyUserEmail: jest.fn(),
}));

// Token service
const mockSaveRefreshToken = jest.fn().mockResolvedValue(undefined);
const mockFindRefreshToken = jest.fn();
const mockDeleteRefreshToken = jest.fn().mockResolvedValue(undefined);
const mockDeleteUserRefreshTokens = jest.fn().mockResolvedValue(undefined);
jest.unstable_mockModule('#src/services/token.service.ts', () => ({
  saveRefreshToken: mockSaveRefreshToken,
  findRefreshToken: mockFindRefreshToken,
  deleteRefreshToken: mockDeleteRefreshToken,
  deleteUserRefreshTokens: mockDeleteUserRefreshTokens,
}));

// Email service
const mockSendVerificationEmail = jest.fn().mockResolvedValue(undefined);
const mockSendPasswordResetEmail = jest.fn().mockResolvedValue(undefined);
jest.unstable_mockModule('#src/services/email.service.ts', () => ({
  sendVerificationEmail: mockSendVerificationEmail,
  sendPasswordResetEmail: mockSendPasswordResetEmail,
}));

// Email verification service
const mockCreateEmailVerificationToken = jest.fn().mockResolvedValue({});
const mockFindEmailVerificationToken = jest.fn();
const mockMarkEmailVerificationTokenUsed = jest.fn().mockResolvedValue({});
jest.unstable_mockModule('#src/services/emailVerification.service.ts', () => ({
  createEmailVerificationToken: mockCreateEmailVerificationToken,
  findEmailVerificationToken: mockFindEmailVerificationToken,
  markEmailVerificationTokenUsed: mockMarkEmailVerificationTokenUsed,
}));

// Password reset service
const mockCreatePasswordResetToken = jest.fn().mockResolvedValue({});
const mockFindPasswordResetToken = jest.fn();
const mockMarkPasswordResetTokenUsed = jest.fn().mockResolvedValue({});
jest.unstable_mockModule('#src/services/passwordReset.service.ts', () => ({
  createPasswordResetToken: mockCreatePasswordResetToken,
  findPasswordResetToken: mockFindPasswordResetToken,
  markPasswordResetTokenUsed: mockMarkPasswordResetTokenUsed,
}));

// Session service
jest.unstable_mockModule('#src/services/session.service.ts', () => ({
  saveUserSession: jest.fn().mockResolvedValue({}),
}));

// Google service (imported by google.config.ts)
jest.unstable_mockModule('#src/services/google.service.ts', () => ({
  CreateGoogleUser: jest.fn(),
}));

// Hash utils
const mockHashing = jest.fn().mockResolvedValue('$argon2id$hashed');
const mockVerifyHash = jest.fn();
jest.unstable_mockModule('#src/utils/auth/hash.ts', () => ({
  hashing: mockHashing,
  verifyHash: mockVerifyHash,
}));

// JWT / token utils
const mockGenerateTokens = jest.fn().mockResolvedValue({
  accessToken: 'test-access-token',
  refreshToken: 'test-refresh-token',
});
const mockSaveToCookie = jest.fn().mockResolvedValue(undefined);
const mockClearTokens = jest.fn();
const mockVerifyRefreshToken = jest.fn();
const mockHashTokenCrypto = jest.fn((v) => `hashed_${v}`);
jest.unstable_mockModule('#src/utils/jwt/tokens.ts', () => ({
  generateTokens: mockGenerateTokens,
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  verifyAccessToken: jest.fn(),
  verifyRefreshToken: mockVerifyRefreshToken,
  clearTokens: mockClearTokens,
  saveToCookie: mockSaveToCookie,
  hasExpired: jest.fn(),
  hashTokenCrypto: mockHashTokenCrypto,
}));

// ─── Dynamic imports (after mocks are registered) ───
const { default: request } = await import('supertest');
const { default: app } = await import('#src/app.js');

// ─── Fixtures ────────────────────────────────────────
const baseUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  name: 'Test User',
  passwordHash: '$argon2id$hashed',
  avatarUrl: null,
  emailVerified: true,
  isActive: true,
  failedLoginCount: 0,
  lockoutUntil: null,
  lastFailedLoginAt: null,
  oauthProvider: null,
  oauthId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

// ─── Tests ───────────────────────────────────────────
describe('Auth Endpoints', () => {
  beforeEach(() => jest.clearAllMocks());

  /* ── SIGNUP ─────────────────────────────────── */
  describe('POST /auth/signup', () => {
    it('creates a new user and sends verification email (201)', async () => {
      mockFindUserByEmail.mockResolvedValue(null);
      mockCreateUser.mockResolvedValue({
        id: baseUser.id,
        email: baseUser.email,
        name: baseUser.name,
        emailVerified: false,
        isActive: false,
      });

      const res = await request(app)
        .post('/auth/signup')
        .send({ email: 'test@example.com', password: 'Pass123!', name: 'Test' });

      expect(res.status).toBe(201);
      expect(res.body.message).toMatch(/check your email/i);
      expect(mockCreateUser).toHaveBeenCalled();
      expect(mockSendVerificationEmail).toHaveBeenCalled();
    });

    it('returns 409 for existing verified email', async () => {
      mockFindUserByEmail.mockResolvedValue({ ...baseUser });

      const res = await request(app)
        .post('/auth/signup')
        .send({ email: 'test@example.com', password: 'Pass123!', name: 'Test' });

      expect(res.status).toBe(409);
    });

    it('re-sends verification for existing unverified account (200)', async () => {
      mockFindUserByEmail.mockResolvedValue({ ...baseUser, emailVerified: false });

      const res = await request(app)
        .post('/auth/signup')
        .send({ email: 'test@example.com', password: 'Pass123!', name: 'Test' });

      expect(res.status).toBe(200);
      expect(mockSendVerificationEmail).toHaveBeenCalled();
      expect(mockCreateUser).not.toHaveBeenCalled();
    });

    it('returns 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(400);
    });
  });

  /* ── SIGNIN ─────────────────────────────────── */
  describe('POST /auth/signin', () => {
    it('signs in with valid credentials (200)', async () => {
      mockFindUserByEmail.mockResolvedValue(baseUser);
      mockVerifyHash.mockResolvedValue(true);

      const res = await request(app)
        .post('/auth/signin')
        .send({ email: 'test@example.com', password: 'Pass123!' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('refreshToken');
      expect(res.body.user.email).toBe(baseUser.email);
      expect(mockResetFailedLogin).toHaveBeenCalledWith(baseUser.id);
    });

    it('returns 401 for wrong password and increments fail count', async () => {
      mockFindUserByEmail.mockResolvedValue(baseUser);
      mockVerifyHash.mockResolvedValue(false);

      const res = await request(app)
        .post('/auth/signin')
        .send({ email: 'test@example.com', password: 'wrong' });

      expect(res.status).toBe(401);
      expect(mockIncrementFailedLogin).toHaveBeenCalledWith(baseUser.id);
    });

    it('returns 401 for non-existent user', async () => {
      mockFindUserByEmail.mockResolvedValue(null);

      const res = await request(app)
        .post('/auth/signin')
        .send({ email: 'nobody@example.com', password: 'Pass123!' });

      expect(res.status).toBe(401);
    });

    it('returns 403 with EMAIL_NOT_VERIFIED for unverified email', async () => {
      mockFindUserByEmail.mockResolvedValue({ ...baseUser, emailVerified: false });
      mockVerifyHash.mockResolvedValue(true);

      const res = await request(app)
        .post('/auth/signin')
        .send({ email: 'test@example.com', password: 'Pass123!' });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('EMAIL_NOT_VERIFIED');
    });
  });

  /* ── ACCOUNT LOCKOUT ────────────────────────── */
  describe('Account Lockout', () => {
    it('returns 423 ACCOUNT_LOCKED when lockoutUntil is in the future', async () => {
      const lockoutUntil = new Date(Date.now() + 10 * 60 * 1000);
      mockFindUserByEmail.mockResolvedValue({ ...baseUser, lockoutUntil });

      const res = await request(app)
        .post('/auth/signin')
        .send({ email: 'test@example.com', password: 'Pass123!' });

      expect(res.status).toBe(423);
      expect(res.body.code).toBe('ACCOUNT_LOCKED');
      expect(res.body.retryAfterSeconds).toBeGreaterThan(0);
      // Should NOT attempt password verification
      expect(mockVerifyHash).not.toHaveBeenCalled();
    });

    it('allows login after lockout window expires', async () => {
      mockFindUserByEmail.mockResolvedValue({
        ...baseUser,
        lockoutUntil: new Date(Date.now() - 1000),
      });
      mockVerifyHash.mockResolvedValue(true);

      const res = await request(app)
        .post('/auth/signin')
        .send({ email: 'test@example.com', password: 'Pass123!' });

      expect(res.status).toBe(200);
      expect(mockResetFailedLogin).toHaveBeenCalled();
    });

    it('increments fail count on each wrong-password attempt', async () => {
      mockFindUserByEmail.mockResolvedValue({ ...baseUser, failedLoginCount: 3 });
      mockVerifyHash.mockResolvedValue(false);

      await request(app)
        .post('/auth/signin')
        .send({ email: 'test@example.com', password: 'wrong' });

      expect(mockIncrementFailedLogin).toHaveBeenCalledWith(baseUser.id);
    });
  });

  /* ── REMEMBER-ME TTL ────────────────────────── */
  describe('Remember Me TTL', () => {
    beforeEach(() => {
      mockFindUserByEmail.mockResolvedValue(baseUser);
      mockVerifyHash.mockResolvedValue(true);
    });

    it('uses default 15-day TTL without rememberMe flag', async () => {
      await request(app)
        .post('/auth/signin')
        .send({ email: 'test@example.com', password: 'Pass123!' });

      expect(mockGenerateTokens).toHaveBeenCalledWith(baseUser.id, {
        refreshTtlDays: 15,
      });
      expect(mockSaveRefreshToken).toHaveBeenCalledWith(
        baseUser.id,
        expect.any(String),
        15,
      );
    });

    it('uses extended 30-day TTL when rememberMe is true', async () => {
      await request(app)
        .post('/auth/signin')
        .send({ email: 'test@example.com', password: 'Pass123!', rememberMe: true });

      expect(mockGenerateTokens).toHaveBeenCalledWith(baseUser.id, {
        refreshTtlDays: 30,
      });
      expect(mockSaveRefreshToken).toHaveBeenCalledWith(
        baseUser.id,
        expect.any(String),
        30,
      );
    });
  });

  /* ── VERIFY EMAIL ───────────────────────────── */
  describe('POST /auth/verify-email', () => {
    it('verifies email with a valid token (200)', async () => {
      mockFindEmailVerificationToken.mockResolvedValue({
        id: 'tok-1',
        userId: baseUser.id,
        tokenHash: 'hashed_goodtoken',
        expiresAt: new Date(Date.now() + 3600_000),
        usedAt: null,
      });
      mockPrismaUserUpdate.mockResolvedValue({});

      const res = await request(app)
        .post('/auth/verify-email')
        .send({ token: 'goodtoken' });

      expect(res.status).toBe(200);
      expect(mockPrismaUserUpdate).toHaveBeenCalledWith({
        where: { id: baseUser.id },
        data: { emailVerified: true, isActive: true },
      });
      expect(mockMarkEmailVerificationTokenUsed).toHaveBeenCalledWith('tok-1');
    });

    it('rejects an invalid / unknown token (400)', async () => {
      mockFindEmailVerificationToken.mockResolvedValue(null);

      const res = await request(app)
        .post('/auth/verify-email')
        .send({ token: 'badtoken' });

      expect(res.status).toBe(400);
    });

    it('rejects an expired token (400)', async () => {
      mockFindEmailVerificationToken.mockResolvedValue({
        id: 'tok-2',
        userId: baseUser.id,
        expiresAt: new Date(Date.now() - 1000),
        usedAt: null,
      });

      const res = await request(app)
        .post('/auth/verify-email')
        .send({ token: 'expiredtoken' });

      expect(res.status).toBe(400);
    });

    it('rejects an already-used token (400)', async () => {
      mockFindEmailVerificationToken.mockResolvedValue({
        id: 'tok-3',
        userId: baseUser.id,
        expiresAt: new Date(Date.now() + 3600_000),
        usedAt: new Date(),
      });

      const res = await request(app)
        .post('/auth/verify-email')
        .send({ token: 'usedtoken' });

      expect(res.status).toBe(400);
    });

    it('returns 400 when token is missing', async () => {
      const res = await request(app).post('/auth/verify-email').send({});
      expect(res.status).toBe(400);
    });
  });

  /* ── RESEND VERIFICATION ────────────────────── */
  describe('POST /auth/resend-verification', () => {
    it('returns 200 with generic message (user not found)', async () => {
      mockFindUserByEmail.mockResolvedValue(null);

      const res = await request(app)
        .post('/auth/resend-verification')
        .send({ email: 'unknown@example.com' });

      expect(res.status).toBe(200);
      expect(mockSendVerificationEmail).not.toHaveBeenCalled();
    });

    it('sends email for unverified user', async () => {
      mockFindUserByEmail.mockResolvedValue({ ...baseUser, emailVerified: false });

      const res = await request(app)
        .post('/auth/resend-verification')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(200);
      expect(mockSendVerificationEmail).toHaveBeenCalled();
    });

    it('does NOT send email for already-verified user', async () => {
      mockFindUserByEmail.mockResolvedValue(baseUser);

      const res = await request(app)
        .post('/auth/resend-verification')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(200);
      expect(mockSendVerificationEmail).not.toHaveBeenCalled();
    });
  });

  /* ── REFRESH TOKEN ──────────────────────────── */
  describe('POST /auth/refresh', () => {
    it('preserves stored TTL (30d) on rotation', async () => {
      mockVerifyRefreshToken.mockResolvedValue(baseUser.id);
      mockFindRefreshToken.mockResolvedValue({
        token: 'hashed_old',
        userId: baseUser.id,
        expiresAt: new Date(Date.now() + 30 * 86400_000),
        ttlDays: 30,
      });

      const res = await request(app)
        .post('/auth/refresh')
        .send({ refresh: 'old' });

      expect(res.status).toBe(200);
      expect(mockGenerateTokens).toHaveBeenCalledWith(baseUser.id, {
        refreshTtlDays: 30,
      });
      expect(mockSaveRefreshToken).toHaveBeenCalledWith(
        baseUser.id,
        expect.any(String),
        30,
      );
    });

    it('falls back to 15-day TTL when stored ttlDays is null', async () => {
      mockVerifyRefreshToken.mockResolvedValue(baseUser.id);
      mockFindRefreshToken.mockResolvedValue({
        token: 'hashed_old',
        userId: baseUser.id,
        expiresAt: new Date(Date.now() + 15 * 86400_000),
        ttlDays: null,
      });

      const res = await request(app)
        .post('/auth/refresh')
        .send({ refresh: 'old' });

      expect(res.status).toBe(200);
      expect(mockGenerateTokens).toHaveBeenCalledWith(baseUser.id, {
        refreshTtlDays: 15,
      });
    });

    it('returns 401 when no refresh token is provided', async () => {
      const res = await request(app).post('/auth/refresh').send({});
      expect(res.status).toBe(401);
    });

    it('returns 401 for an invalid refresh token', async () => {
      mockVerifyRefreshToken.mockResolvedValue(null);

      const res = await request(app)
        .post('/auth/refresh')
        .send({ refresh: 'invalid' });

      expect(res.status).toBe(401);
    });

    it('returns 401 when stored token is not found', async () => {
      mockVerifyRefreshToken.mockResolvedValue(baseUser.id);
      mockFindRefreshToken.mockResolvedValue(null);

      const res = await request(app)
        .post('/auth/refresh')
        .send({ refresh: 'orphan' });

      expect(res.status).toBe(401);
    });

    it('returns 401 and deletes expired stored token', async () => {
      mockVerifyRefreshToken.mockResolvedValue(baseUser.id);
      mockFindRefreshToken.mockResolvedValue({
        token: 'hashed_old',
        userId: baseUser.id,
        expiresAt: new Date(Date.now() - 1000), // expired
        ttlDays: 15,
      });

      const res = await request(app)
        .post('/auth/refresh')
        .send({ refresh: 'old' });

      expect(res.status).toBe(401);
      expect(mockDeleteRefreshToken).toHaveBeenCalled();
    });
  });

  /* ── FORGOT PASSWORD ────────────────────────── */
  describe('POST /auth/forgot-password', () => {
    it('returns generic 200 for existing user and sends email', async () => {
      mockFindUserByEmail.mockResolvedValue(baseUser);

      const res = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(200);
      expect(mockSendPasswordResetEmail).toHaveBeenCalled();
    });

    it('returns generic 200 even for unknown email (no leak)', async () => {
      mockFindUserByEmail.mockResolvedValue(null);

      const res = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'nobody@example.com' });

      expect(res.status).toBe(200);
      expect(mockSendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('returns 422 for missing email', async () => {
      const res = await request(app).post('/auth/forgot-password').send({});
      expect(res.status).toBe(422);
    });
  });

  /* ── RESET PASSWORD ─────────────────────────── */
  describe('POST /auth/reset-password', () => {
    it('resets password with valid token (200)', async () => {
      mockFindPasswordResetToken.mockResolvedValue({
        id: 'rst-1',
        userId: baseUser.id,
        tokenHash: 'hashed_resettoken',
        expiresAt: new Date(Date.now() + 1800_000),
        usedAt: null,
      });

      const res = await request(app)
        .post('/auth/reset-password')
        .send({ token: 'resettoken', password: 'NewPass1!' });

      expect(res.status).toBe(200);
      expect(mockUpdateUserPassword).toHaveBeenCalled();
      expect(mockMarkPasswordResetTokenUsed).toHaveBeenCalledWith('rst-1');
      expect(mockDeleteUserRefreshTokens).toHaveBeenCalledWith(baseUser.id);
    });

    it('returns 400 for invalid token', async () => {
      mockFindPasswordResetToken.mockResolvedValue(null);

      const res = await request(app)
        .post('/auth/reset-password')
        .send({ token: 'bad', password: 'NewPass1!' });

      expect(res.status).toBe(400);
    });

    it('returns 400 for already-used token', async () => {
      mockFindPasswordResetToken.mockResolvedValue({
        id: 'rst-2',
        userId: baseUser.id,
        expiresAt: new Date(Date.now() + 1800_000),
        usedAt: new Date(),
      });

      const res = await request(app)
        .post('/auth/reset-password')
        .send({ token: 'usedtoken', password: 'NewPass1!' });

      expect(res.status).toBe(400);
    });

    it('returns 422 for weak password', async () => {
      const res = await request(app)
        .post('/auth/reset-password')
        .send({ token: 'sometoken', password: 'short' });

      expect(res.status).toBe(422);
    });
  });
});
