import { Request, Response } from 'express';
import prisma from '#src/config/database.ts';
import { Prisma } from '../generated/client.ts';

export const searchUniversities = async (req: Request, res: Response) => {
  try {
    const { country, q, page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.UniversityWhereInput = {};
    if (country) where.country = { code: country.toUpperCase() };
    if (q) where.name = { contains: q, mode: 'insensitive' };

    const [items, total] = await Promise.all([
      prisma.university.findMany({
        where,
        skip,
        take: limitNum,
        include: { country: true },
        orderBy: { name: 'asc' },
      }),
      prisma.university.count({ where }),
    ]);

    res.status(200).json({ items, page: pageNum, limit: limitNum, total });
  } catch {
    res.status(500).json({ message: 'Failed to search universities' });
  }
};
