import type { Request, Response } from 'express';
import { searchProfessors, isValidQuery } from '#src/services/professors.service.ts';
import logger from '#src/config/logger.ts';

export async function searchProfessorsHandler(req: Request, res: Response): Promise<void> {
  const { researchInterest, university, country, level } = req.body as {
    researchInterest?: string;
    university?: string;
    country?: string;
    level?: 'phd' | 'masters';
  };

  if (!researchInterest || typeof researchInterest !== 'string' || researchInterest.trim().length === 0) {
    res.status(400).json({ error: 'researchInterest is required' });
    return;
  }

  if (researchInterest.length > 200) {
    res.status(400).json({ error: 'researchInterest must be 200 characters or fewer' });
    return;
  }

  if (!isValidQuery(researchInterest)) {
    res.status(400).json({ error: 'Please enter a real research area (e.g. "Natural Language Processing", "Quantum Computing")' });
    return;
  }

  // Validate university name if provided — reject obvious nonsense
  if (university && !isValidQuery(university)) {
    res.status(400).json({ error: 'Please enter a valid university name' });
    return;
  }

  try {
    logger.info(`[professors] searching for "${researchInterest}" university=${university ?? 'any'} country=${country ?? 'any'}`);

    const result = await searchProfessors({
      researchInterest: researchInterest.trim(),
      university: university?.trim() || undefined,
      country: country?.trim() || undefined,
      level: level === 'masters' ? 'masters' : 'phd',
    });

    logger.info(`[professors] found ${result.results.length} verified professors`);
    res.status(200).json(result);
  } catch (err) {
    logger.error(`[professors] search failed: ${err}`);
    res.status(502).json({ error: 'Professor search failed. Please try again.' });
  }
}
