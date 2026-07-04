import dotenv from "dotenv";
dotenv.config({ path: ".env", override: true });

import { getDatabaseConnectionString } from "@/lib/db/postgres";
import { isDatabaseAvailable, prisma } from "@/lib/prisma";

async function main() {
  try {
    const url = getDatabaseConnectionString();
    const sanitized = url.replace(/:([^:@/]+)@/, ":****@");
    console.log("Connection target:", sanitized);
  } catch (error) {
    console.error("Configuration error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }

  const ok = await isDatabaseAvailable();
  if (!ok) {
    console.error(
      "Could not connect. Check POSTGRES_* / DATABASE_URL, that PostgreSQL is running, and the database exists.",
    );
    process.exit(1);
  }

  const ext = await prisma.$queryRaw<{ extname: string }[]>`
    SELECT extname FROM pg_extension WHERE extname = 'vector'
  `;
  if (ext.length === 0) {
    console.warn("Warning: pgvector extension is not installed (optional; app uses Float[] embeddings).");
  } else {
    console.log("pgvector extension: OK");
  }

  console.log("Database connection: OK");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
