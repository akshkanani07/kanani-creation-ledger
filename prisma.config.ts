/**
 * Prisma Configuration (Prisma 7+)
 * 
 * CRITICAL: Prisma 7 removed `directUrl` support from prisma.config.ts.
 * 
 * WHY THIS SETUP:
 * - CLI commands (migrate, db push) connect via the DIRECT (unpooled) URL
 *   because PgBouncer transaction pooling breaks schema migrations.
 * - Application runtime uses the POOLED URL via Neon adapter (in src/lib/prisma.ts).
 * 
 * So:
 *   prisma.config.ts  → uses DATABASE_URL_UNPOOLED (for CLI)
 *   src/lib/prisma.ts → uses DATABASE_URL (pooled, for app)
 * 
 * USAGE:
 *   npx prisma migrate dev
 *   npx prisma generate
 */

import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local first (Next.js standard), fallback to .env
config({ path: ".env.local" });
config({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    // ⚠️ CLI uses DIRECT URL for migrations
    // The application uses POOLED URL via adapter (see src/lib/prisma.ts)
    url: process.env.DATABASE_URL_UNPOOLED,
  },
});