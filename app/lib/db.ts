import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../../generated/prisma/client";

// The analytics database, through Prisma and Neon's serverless driver. Null when
// DATABASE_URL isn't set, so the site still runs (and simply doesn't record visits)
// without a database.

function create() {
  const connectionString = process.env.DATABASE_URL;
  return connectionString
    ? new PrismaClient({ adapter: new PrismaNeon({ connectionString }) })
    : null;
}

// Reuse one client across hot reloads in development; each client holds a pool.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient | null };
export const prisma = globalForPrisma.prisma ?? create();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
