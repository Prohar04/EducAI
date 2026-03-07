import { Request, Response } from 'express';
import prisma from '#src/config/database.ts';
import { Prisma, ProgramLevel } from '../generated/client.ts';

export const searchPrograms = async (req: Request, res: Response) => {
  try {
    const { country, level, field, q, page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.ProgramWhereInput = {};
    if (country) where.university = { country: { code: country.toUpperCase() } };
    if (level && Object.values(ProgramLevel).includes(level as ProgramLevel)) {
      where.level = level as ProgramLevel;
    }
    if (field) where.field = { contains: field, mode: 'insensitive' };
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { field: { contains: q, mode: 'insensitive' } },
        { university: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.program.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          university: { include: { country: true } },
        },
        orderBy: [{ university: { name: 'asc' } }, { title: 'asc' }],
      }),
      prisma.program.count({ where }),
    ]);

    const noDataMessage = total === 0 ? 'No data available yet. Run sync.' : undefined;
    res.status(200).json({ items, page: pageNum, limit: limitNum, total, ...(noDataMessage && { noDataMessage }) });
  } catch {
    res.status(500).json({ message: 'Failed to search programs' });
  }
};

export const getProgramById = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const program = await prisma.program.findUnique({
      where: { id },
      include: {
        university: { include: { country: true } },
        requirements: { orderBy: { key: 'asc' } },
        deadlines: { orderBy: { deadline: 'asc' } },
      },
    });

    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    res.status(200).json(program);
  } catch {
    res.status(500).json({ message: 'Failed to fetch program' });
  }
};
