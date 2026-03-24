import express from 'express';
import logger from './config/logger.ts';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import session from 'express-session';
import passport from 'passport';

import prisma from './config/database.ts';
import { authMiddleware } from './middlewares/authenticate.ts';
import authRoutes from './routes/auth.router.ts';
import userRoutes from './routes/user.router.ts';
import universityRoutes from './routes/university.router.ts';
import programRoutes from './routes/program.router.ts';
import matchRoutes from './routes/match.router.ts';
import savedProgramRoutes from './routes/savedProgram.router.ts';
import ingestRoutes from './routes/ingest.router.ts';
import timelineRoutes from './routes/timeline.router.ts';
import strategyRoutes from './routes/strategy.router.ts';
// import { PrismaSessionStore } from './services/session.service.ts';

const app = express();
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Store sessions in PostgreSQL via Prisma
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret && process.env.NODE_ENV === 'production') {
  throw new Error('SESSION_SECRET must be set in production');
}
app.use(
  session({
    secret: sessionSecret || 'dev-only-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: 'lax',
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(
  morgan('combined', {
    stream: { write: message => logger.info(message.trim()) },
  })
);

app.get('/', (req, res) => {
  res.status(200).json({ message: 'EducAI API', version: '1.0.0' });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/health/db', async (req, res) => {
  try {
    const [users, countries, universities, programs, requirements, deadlines] = await Promise.all([
      prisma.user.count(),
      prisma.country.count().catch(() => -1),
      prisma.university.count().catch(() => -1),
      prisma.program.count().catch(() => -1),
      prisma.programRequirement.count().catch(() => -1),
      prisma.programDeadline.count().catch(() => -1),
    ]);
    res.status(200).json({
      status: 'OK',
      database: 'connected',
      timestamp: new Date().toISOString(),
      counts: { users, countries, universities, programs, requirements, deadlines },
    });
  } catch (err) {
    res.status(503).json({
      status: 'ERROR',
      database: 'unreachable',
      timestamp: new Date().toISOString(),
    });
  }
});

app.get('/health/schema', async (_req, res) => {
  const tables: Record<string, boolean> = {};
  try { await prisma.country.count();     tables.countries     = true; } catch { tables.countries     = false; }
  try { await prisma.university.count();  tables.universities  = true; } catch { tables.universities  = false; }
  try { await prisma.program.count();     tables.programs      = true; } catch { tables.programs      = false; }
  const ok = Object.values(tables).every(Boolean);
  res.status(ok ? 200 : 503).json(
    ok
      ? { ok: true,  tables }
      : { ok: false, error: 'Migrations not applied — run: NODE_ENV=production npm run db:migrate:deploy', tables },
  );
});

app.get('/health/timeline', async (_req, res) => {
  try {
    const [visaTemplateCount, roadmapCount] = await Promise.all([
      prisma.visaTimelineTemplate.count(),
      prisma.userRoadmap.count(),
    ]);
    res.status(200).json({
      ok: true,
      timestamp: new Date().toISOString(),
      database: 'connected',
      visaTemplates: visaTemplateCount,
      roadmaps: roadmapCount,
      ready: visaTemplateCount > 0,
    });
  } catch (err) {
    res.status(503).json({
      ok: false,
      status: 'ERROR',
      message: 'Timeline health check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

app.get('/health/whoami', authMiddleware, async (req: any, res) => {
  try {
    const userId = req.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const savedProgramsCount = await prisma.savedProgram.count({
      where: { userId },
    });

    res.status(200).json({
      ok: true,
      userId,
      email: user?.email,
      dbHost: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] ?? 'unknown',
      savedProgramsCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: 'Failed to fetch user info',
      timestamp: new Date().toISOString(),
    });
  }
});

app.get('/api', (req, res) => {
  res.status(200).json({ message: 'EducAI API is running!' });
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/universities', universityRoutes);
app.use('/programs', programRoutes);
app.use('/match', matchRoutes);
app.use('/saved-programs', savedProgramRoutes);
app.use('/internal', ingestRoutes);
app.use('/timeline', timelineRoutes);
app.use('/strategy', strategyRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;
