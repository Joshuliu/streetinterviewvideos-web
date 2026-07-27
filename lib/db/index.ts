import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Lazy singleton so importing this module never throws at build time —
// DATABASE_URL only needs to exist when a query actually runs.
let cached: ReturnType<typeof connect> | null = null;

function connect() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return drizzle(neon(url), { schema });
}

export function db() {
  if (!cached) cached = connect();
  return cached;
}

export * as tables from './schema';
