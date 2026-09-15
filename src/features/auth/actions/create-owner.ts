/**
 * Create Owner Script (Standalone)
 * 
 * Creates the single Owner record in the database.
 * Run ONCE during initial setup.
 * 
 * IMPORTANT: This script uses RELATIVE imports and inline
 * Prisma Client initialization because `tsx` doesn't support
 * TypeScript Path Aliases (`@/*`).
 * 
 * USAGE:
 *   npx tsx src/features/auth/actions/create-owner.ts
 */

import { PrismaClient } from "../../../generated/prisma/client.ts";
import { PrismaNeon } from "@prisma/adapter-neon";
import { config } from "dotenv";
import { randomUUID } from "crypto";

// Load environment variables (in priority order)
config({ path: ".env.local" });
config({ path: ".env" });

// ============================================================
// INLINE PRISMA CLIENT
// ============================================================

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

// ============================================================
// CREATE OWNER
// ============================================================

async function createOwner() {
  const ownerEmail = process.env.OWNER_EMAIL;

  if (!ownerEmail) {
    console.error("❌ OWNER_EMAIL is not set in .env.local");
    process.exit(1);
  }

  console.log("━".repeat(50));
  console.log("🧵 Kanani Creation Ledger — Owner Setup");
  console.log("━".repeat(50));
  console.log(`📧 Owner Email: ${ownerEmail}`);
  console.log("");

  try {
    const existingOwner = await prisma.user.findFirst();

    if (existingOwner) {
      if (existingOwner.email === ownerEmail) {
        console.log("✅ Owner already exists with correct email.");
        console.log(`   ID: ${existingOwner.id}`);
        console.log(`   Name: ${existingOwner.name}`);
        return;
      }

      console.log(`⚠️  Owner exists with different email: ${existingOwner.email}`);
      console.log(`🔄 Updating to: ${ownerEmail}`);

      const updated = await prisma.user.update({
        where: { id: existingOwner.id },
        data: {
          email: ownerEmail,
          emailVerified: true,
        },
      });

      console.log("✅ Owner email updated successfully.");
      console.log(`   ID: ${updated.id}`);
      console.log(`   Email: ${updated.email}`);
      return;
    }

    console.log("📝 Creating new Owner...");

    const owner = await prisma.user.create({
      data: {
        id: randomUUID(),
        email: ownerEmail,
        name: "Owner",
        emailVerified: true,
      },
    });

    console.log("✅ Owner created successfully!");
    console.log(`   ID: ${owner.id}`);
    console.log(`   Email: ${owner.email}`);
    console.log(`   Name: ${owner.name}`);
    console.log("");
    console.log("🎉 Setup complete! You can now sign in with:");
    console.log(`   ${ownerEmail}`);
  } catch (error) {
    console.error("");
    console.error("❌ Failed to create Owner:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }

  console.log("━".repeat(50));
}

createOwner();