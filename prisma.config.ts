// Prisma CLI configuration. Prisma 7 doesn't load env files itself, so read the same
// ones Next.js uses: .env.local first, then .env.
//
// Migrations need a direct (non-pooled) connection: Migrate holds a session-level
// advisory lock, which Neon's PgBouncer pooler can't keep. The app itself uses the
// pooled DATABASE_URL through the Neon adapter (app/lib/db.ts).
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: [".env.local", ".env"], quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // `prisma generate` doesn't need a database, so allow it to run without one.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
