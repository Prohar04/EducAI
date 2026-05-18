import prisma from '#src/config/database.ts';
import logger from '#src/config/logger.ts';

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
    logger.error('Error creating password reset token:', err);
    throw err;
  }
}

export async function findPasswordResetToken(tokenHash: string) {
  try {
    return await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });
  } catch (err) {
    logger.error('Error finding password reset token:', err);
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
    logger.error('Error marking password reset token as used:', err);
    throw err;
  }
}
