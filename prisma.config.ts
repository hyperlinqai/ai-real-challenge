import dotenv from "dotenv";
dotenv.config({ path: ".env", override: true });
import { defineConfig } from "prisma/config";
import { getDatabaseConnectionString } from "./lib/db/postgres";

function datasourceUrl(): string {
  if (process.env.DATABASE_URL?.trim()) {
    return process.env.DATABASE_URL.trim();
  }
  if (process.env.POSTGRES_USER) {
    return getDatabaseConnectionString();
  }
  return "postgresql://localhost:5432/placeholder?schema=public";
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: datasourceUrl() },
});
