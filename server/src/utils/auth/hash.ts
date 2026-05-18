import { hash, verify } from 'argon2';
import logger from '#src/config/logger.ts';

export const hashing = async (password: string) => {
  const hashedPass = await hash(password);
  return hashedPass;
};

export const verifyHash = async (hashedPassword: string, password: string) => {
  try {
    const isValid = await verify(hashedPassword, password);
    return isValid;
  } catch (err) {
    logger.error('Error in verifying password:', err);
    throw err;
  }
};