/**
 * sync-module1.ts
 *
 * Reads a canonical Module 1 JSON payload file and POSTs it to the server
 * ingestion endpoint.  Use this to manually seed/sync data.
 *
 * Usage:
 *   INGEST_API_KEY=<key> tsx scripts/sync-module1.ts <path-to-payload.json>
 *
 * Optional env vars:
 *   INGEST_TARGET_URL — defaults to http://localhost:8000/internal/module1/ingest
 */

import 'dotenv/config';
import { readFileSync } from 'fs';
import { resolve }      from 'path';

async function main() {
  const jsonFile = process.argv[2];
  if (!jsonFile) {
    console.error('Usage: tsx scripts/sync-module1.ts <path-to-payload.json>');
    process.exit(1);
  }

  const key = process.env.INGEST_API_KEY;
  if (!key) {
    console.error('❌  INGEST_API_KEY environment variable is required.');
    process.exit(1);
  }

  const port       = process.env.PORT ?? '8000';
  const ingestUrl  = process.env.INGEST_TARGET_URL
    ?? `http://localhost:${port}/internal/module1/ingest`;

  let payload: unknown;
  try {
    payload = JSON.parse(readFileSync(resolve(jsonFile), 'utf-8'));
  } catch (e) {
    console.error(`❌  Failed to read/parse ${jsonFile}:`, e);
    process.exit(1);
  }

  console.log(`Posting to ${ingestUrl} …`);

  const res = await fetch(ingestUrl, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-INGEST-KEY': key,
    },
    body: JSON.stringify(payload),
  });

  const body = await res.json();
  if (!res.ok) {
    console.error(`❌  Ingestion failed (HTTP ${res.status}):`, body);
    process.exit(1);
  }

  console.log('✓  Ingestion successful:');
  console.log(JSON.stringify(body, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
