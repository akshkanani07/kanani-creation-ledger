/**
 * Prisma Client Singleton
 * 
 * This file provides a single, reused Prisma Client instance across
 * the application. It handles two critical concerns:
 * 
 * 1. HOT RELOAD (Development):
 *    Next.js reloads modules on file changes. Without a global singleton,
 *    each reload would create a new PrismaClient, exhausting DB connections.
 *    We store the client on `globalThis` in development.
 * 
 * 2. SERVERLESS (Production/Vercel):
 *    Vercel runs code in ephemeral serverless functions. Traditional
 *    PostgreSQL TCP connections don't work well here. We use the Neon
 *    serverless driver via `@prisma/adapter-neon` for HTTP/WebSocket.
 * 
 * WHY TWO URLS:
 * - DATABASE_URL (pooled) → app runtime queries, serverless-friendly
 * - DATABASE_URL_UNPOOLED → prisma.config.ts only (migrations)
 * 
 * USAGE:
 *   import { prisma } from "@/lib/prisma";
 *   const karigars = await prisma.karigar.findMany();
 */

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

// ============================================================
// NEON ADAPTER SETUP
// ============================================================

/**
 * Neon serverless adapter — connects Prisma to Neon over HTTP/WebSocket.
 * 
 * Uses the POOLED connection string (contains "-pooler" in hostname).
 * The pooler is optimized for serverless workloads with many short-lived
 * connections.
 */
const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});

// ============================================================
// PRISMA CLIENT FACTORY
// ============================================================

/**
 * Creates a new PrismaClient with logging configured per environment.
 */
function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

// ============================================================
// SINGLETON PATTERN
// ============================================================

/**
 * In development, Next.js hot-reloads modules. We must persist the client
 * across reloads to avoid opening hundreds of connections.
 * 
 * In production, this file is loaded once per serverless invocation.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}