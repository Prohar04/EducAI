import { Request, Response } from 'express';
import prisma from '#src/config/database.ts';
import { ProgramLevel } from '../generated/client.ts';

interface MatchInput {
  targetCountry?: string;
  level?: string;
  intendedField?: string;
  gpa?: number;
  ielts?: number;
  toefl?: number;
  gre?: number;
  budgetMaxUSD?: number;
}

interface MatchResult {
  programId: string;
  score: number;
  reasons: string[];
  programSummary: {
    title: string;
    level: string;
    field: string;
    tuitionRange: string;
    universityName: string;
    country: string;
  };
}

// TODO(scraping): When scrapers upsert University/Program records, this
// function will automatically pick them up because it queries all programs.
export const matchPrograms = async (req: Request, res: Response) => {
  try {
    const {
      targetCountry,
      level,
      intendedField,
      gpa,
      ielts,
      toefl,
      gre,
      budgetMaxUSD,
    }: MatchInput = req.body ?? {};

    const programs = await prisma.program.findMany({
      include: {
        university: { include: { country: true } },
        requirements: true,
      },
    });

    const results: MatchResult[] = [];

    for (const program of programs) {
      let score = 0;
      const reasons: string[] = [];

      // +25 country match
      if (targetCountry && program.university.country.code === targetCountry.toUpperCase()) {
        score += 25;
        reasons.push(`Located in ${program.university.country.name}`);
      }

      // +20 level match
      if (level && program.level === (level as ProgramLevel)) {
        score += 20;
        reasons.push(`${level} level match`);
      }

      // +20 field fuzzy match
      if (intendedField) {
        const fLow = intendedField.toLowerCase();
        const pLow = program.field.toLowerCase();
        if (pLow.includes(fLow) || fLow.includes(pLow)) {
          score += 20;
          reasons.push(`Field match: ${program.field}`);
        }
      }

      // +20 within budget (tuitionMinUSD <= budgetMaxUSD)
      if (
        budgetMaxUSD !== undefined &&
        program.tuitionMinUSD !== null &&
        budgetMaxUSD >= program.tuitionMinUSD
      ) {
        score += 20;
        const min = program.tuitionMinUSD.toLocaleString();
        const max = program.tuitionMaxUSD?.toLocaleString() ?? '?';
        reasons.push(`Within budget ($${min}–$${max}/yr)`);
      }

      // +15 meets academic requirements
      let reqScore = 0;
      let reqChecked = 0;
      let reqMet = 0;
      for (const req of program.requirements) {
        const threshold = parseFloat(req.value);
        if (isNaN(threshold)) continue;
        if (req.key === 'GPA' && gpa !== undefined) {
          reqChecked++;
          if (gpa >= threshold) reqMet++;
        } else if (req.key === 'IELTS' && ielts !== undefined) {
          reqChecked++;
          if (ielts >= threshold) reqMet++;
        } else if (req.key === 'TOEFL' && toefl !== undefined) {
          reqChecked++;
          if (toefl >= threshold) reqMet++;
        } else if (req.key === 'GRE' && gre !== undefined) {
          reqChecked++;
          if (gre >= threshold) reqMet++;
        }
      }
      if (reqChecked > 0 && reqMet === reqChecked) {
        reqScore = 15;
        reasons.push('Meets stated academic requirements');
      } else if (reqChecked === 0 && (gpa !== undefined || ielts !== undefined || toefl !== undefined)) {
        // No checkable requirements — still reward engagement
        reqScore = 10;
        reasons.push('No minimum requirements listed');
      }
      score += reqScore;

      score = Math.min(100, score);
      if (score === 0) continue;

      const tuitionRange =
        program.tuitionMinUSD === 0
          ? 'Fully funded'
          : program.tuitionMinUSD !== null
          ? `$${program.tuitionMinUSD.toLocaleString()}–$${(program.tuitionMaxUSD ?? program.tuitionMinUSD).toLocaleString()}/yr`
          : 'Contact university';

      results.push({
        programId: program.id,
        score,
        reasons,
        programSummary: {
          title: program.title,
          level: program.level,
          field: program.field,
          tuitionRange,
          universityName: program.university.name,
          country: program.university.country.name,
        },
      });
    }

    results.sort((a, b) => b.score - a.score);
    res.status(200).json(results.slice(0, 20));
  } catch {
    res.status(500).json({ message: 'Failed to compute matches' });
  }
};
