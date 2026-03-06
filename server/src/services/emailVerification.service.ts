import prisma from '#src/config/database.ts';

export async function createEmailVerificationToken(
  userId: string,
  tokenHash: string,
  expiresAt: Date
) {
  return await prisma.emailVerificationToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });
}

export async function findEmailVerificationToken(tokenHash: string) {
  return await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
  });
}

export async function markEmailVerificationTokenUsed(tokenId: string) {
  return await prisma.emailVerificationToken.update({
    where: { id: tokenId },
    data: { usedAt: new Date() },
  });
}
