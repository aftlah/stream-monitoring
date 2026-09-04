/**
 * Apply supabase/schema.sql via direct Postgres connection.
 *
 * Usage:
 *   1. Add to .env.local:
 *        SUPABASE_DB_URL=postgresql://postgres.[ref]:[PASSWORD]@....supabase.com:6543/postgres
 *   2. Run:
 *        npm run db:setup
 *
 * Get connection string when dashboard is back:
 *   Supabase → Project Settings → Database → Connection string (URI)
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvLocal() {
  try {
    const envPath = join(__dirname, "..", ".env.local");
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // .env.local optional if vars already exported
  }
}

loadEnvLocal();

const connectionString =
  process.env.SUPABASE_DB_URL ?? process.env.DATABASE_URL ?? "";

if (!connectionString) {
  console.error(`
Missing SUPABASE_DB_URL in .env.local

Example:
SUPABASE_DB_URL=postgresql://postgres.yjlzvjespvgclxefwbud:YOUR_PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres

Find it in Supabase → Project Settings → Database → Connection string
(or reset database password there if you forgot it).
`);
  process.exit(1);
}

const schemaPath = join(__dirname, "..", "supabase", "schema.sql");
const sql = readFileSync(schemaPath, "utf8");

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(sql);
  console.log("OK — tables live_state & notification_log created/verified.");
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error("Failed to apply schema:", message);
  process.exit(1);
} finally {
  await client.end();
}
