/**
 * ingest-from-file.ts
 *
 * Reads a canonical Module 1 JSON payload file and POSTs it to the server's
 * ingestion endpoint.  Alias for sync-module1.ts with a more descriptive name.
 *
 * Usage:
 *   npm run db:ingest-from-file -- <path-to-payload.json>
 *   # or:
 *   INGEST_API_KEY=<key> tsx scripts/ingest-from-file.ts <path-to-payload.json>
 *
 * Optional env vars:
 *   INGEST_TARGET_URL — defaults to http://localhost:8000/internal/module1/ingest
 */

// Delegates to the canonical sync-module1 implementation.
import './sync-module1.ts';
