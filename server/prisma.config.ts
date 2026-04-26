import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// @ts-ignore
const node_env = process.env.NODE_ENV || 'development';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'prisma/seed.ts',
  },
  datasource: {
    // Priority: DATABASE_URL (Render/Neon inject this) → LOCAL (dev) → CLOUD (legacy)
    // @ts-ignore
    url:
      process.env['DATABASE_URL'] ||
      (node_env === 'development'
        ? process.env['DATABASE_URL_LOCAL']
        : process.env['DATABASE_URL_CLOUD']),
  },
});
