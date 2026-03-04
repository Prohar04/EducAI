import prisma from '#src/config/database.ts';

export async function createPasswordResetToken(
  userId: string,
  tokenHash: string,
  expiresAt: Date
) {
  try {
    return await prisma.passwordResetToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  } catch (err) {
    console.error('Error creating password reset token:', err);
    throw err;
  }
}

export async function findPasswordResetToken(tokenHash: string) {
  try {
    return await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });
  } catch (err) {
    console.error('Error finding password reset token:', err);
    throw err;
  }
}

export async function markPasswordResetTokenUsed(tokenId: string) {
  try {
    return await prisma.passwordResetToken.update({
      where: { id: tokenId },
      data: { usedAt: new Date() },
    });
  } catch (err) {
    console.error('Error marking password reset token as used:', err);
    throw err;
  }
}
