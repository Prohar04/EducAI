/* ──────────────────────────────────────────────────────────────
 *  Unit tests – linkGoogleAccount (account linking behavior)
 * ────────────────────────────────────────────────────────────── */
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// ─── Mock Prisma before any dynamic imports ───────────────────────
const mockUserFindUnique = jest.fn();
const mockUserUpdate = jest.fn();

jest.unstable_mockModule('#src/config/database.ts', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: mockUserFindUnique,
      update: mockUserUpdate,
    },
  },
}));

// ─── Dynamic import (after mocks) ────────────────────────────────
const { linkGoogleAccount } = await import('#src/services/user.service.ts');

// ─── Fixtures ─────────────────────────────────────────────────────
const passwordUser = {
  id: 'user-123',
  email: 'alice@example.com',
  name: 'Alice',
  passwordHash: '$argon2id$hashed_password',
  avatarUrl: null,
  emailVerified: false,
  isActive: true,
  oauthProvider: null,
  oauthId: null,
};

// ─── Tests ─────────────────────────────────────────────────────────
describe('linkGoogleAccount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('links a password-based account to Google and returns the updated user', async () => {
    const linkedUser = {
      ...passwordUser,
      oauthProvider: 'google',
      oauthId: 'google-profile-id-456',
      emailVerified: true,
      avatarUrl: 'https://photo.google/avatar.jpg',
    };

    mockUserFindUnique.mockResolvedValue(passwordUser);
    mockUserUpdate.mockResolvedValue(linkedUser);

    const result = await linkGoogleAccount(
      'alice@example.com',
      'google-profile-id-456',
      'Alice Google',
      'https://photo.google/avatar.jpg'
    );

    // oauthProvider must be 'google'
    expect(result.oauthProvider).toBe('google');
    // oauthId must be the supplied Google profile id
    expect(result.oauthId).toBe('google-profile-id-456');
    // emailVerified must be true
    expect(result.emailVerified).toBe(true);
    // passwordHash must be preserved (not wiped)
    expect(result.passwordHash).toBe(passwordUser.passwordHash);

    // Verify prisma.user.update was called with the right data
    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: passwordUser.id },
      data: expect.objectContaining({
        oauthProvider: 'google',
        oauthId: 'google-profile-id-456',
        emailVerified: true,
      }),
    });
  });

  it('normalizes the email to lowercase when looking up the user', async () => {
    mockUserFindUnique.mockResolvedValue(passwordUser);
    mockUserUpdate.mockResolvedValue({ ...passwordUser, oauthProvider: 'google', oauthId: 'g-id', emailVerified: true });

    await linkGoogleAccount('ALICE@EXAMPLE.COM', 'g-id', 'Alice', null);

    expect(mockUserFindUnique).toHaveBeenCalledWith({
      where: { email: 'alice@example.com' },
    });
  });

  it('keeps existing name when it is already set (does not overwrite)', async () => {
    const userWithName = { ...passwordUser, name: 'Existing Name' };
    mockUserFindUnique.mockResolvedValue(userWithName);
    mockUserUpdate.mockResolvedValue({ ...userWithName, oauthProvider: 'google', oauthId: 'g-id', emailVerified: true });

    await linkGoogleAccount('alice@example.com', 'g-id', 'New Display Name', null);

    // 'name' is NOT included in the update payload when it already has a value —
    // we do a sparse update, so only changed fields are written.
    const updateCall = mockUserUpdate.mock.calls[0][0];
    expect(updateCall.data).not.toHaveProperty('name');
  });

  it('fills in empty name from Google profile', async () => {
    const userNoName = { ...passwordUser, name: '' };
    mockUserFindUnique.mockResolvedValue(userNoName);
    mockUserUpdate.mockResolvedValue({ ...userNoName, oauthProvider: 'google', oauthId: 'g-id', emailVerified: true, name: 'Google Display Name' });

    await linkGoogleAccount('alice@example.com', 'g-id', 'Google Display Name', null);

    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: userNoName.id },
      data: expect.objectContaining({
        name: 'Google Display Name',
      }),
    });
  });

  it('keeps existing avatarUrl when it is already set', async () => {
    const userWithAvatar = { ...passwordUser, avatarUrl: 'https://existing/avatar.jpg' };
    mockUserFindUnique.mockResolvedValue(userWithAvatar);
    mockUserUpdate.mockResolvedValue({ ...userWithAvatar, oauthProvider: 'google', oauthId: 'g-id', emailVerified: true });

    await linkGoogleAccount('alice@example.com', 'g-id', 'Alice', 'https://google/new-avatar.jpg');

    expect(mockUserUpdate).toHaveBeenCalledWith({
      where: { id: userWithAvatar.id },
      data: expect.objectContaining({
        avatarUrl: 'https://existing/avatar.jpg',
      }),
    });
  });

  it('throws when no user is found for the given email', async () => {
    mockUserFindUnique.mockResolvedValue(null);

    await expect(
      linkGoogleAccount('unknown@example.com', 'g-id', 'Unknown', null)
    ).rejects.toThrow('No user found with email: unknown@example.com');

    expect(mockUserUpdate).not.toHaveBeenCalled();
  });
});
