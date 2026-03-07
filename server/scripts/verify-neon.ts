/**
 * verify-neon.ts
 *
 * Verifies all Module 1 tables are present on the Neon (or configured) DB
 * and prints row counts.  Exits 1 if any tables are missing.
 *
 * Usage:
 *   npm run db:verify-neon
 *   # or with an explicit URL:
 *   DATABASE_URL=<neon-url> tsx scripts/verify-neon.ts
 */

// Delegates to the canonical check-neon-schema implementation.
import './check-neon-schema.ts';
