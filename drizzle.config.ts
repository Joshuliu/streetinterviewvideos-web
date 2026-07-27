import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    // Only needed for `npm run db:migrate` — `db:generate` works offline.
    url: process.env.DATABASE_URL ?? '',
  },
});
