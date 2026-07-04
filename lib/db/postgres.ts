import { PrismaPg } from "@prisma/adapter-pg";
import { Pool, type PoolConfig } from "pg";

function buildConnectionString(): string {
  const direct = process.env.DATABASE_URL?.trim();
  if (direct) return direct;

  const user = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;
  const host = process.env.POSTGRES_HOST ?? "localhost";
  const port = process.env.POSTGRES_PORT ?? "5432";
  const database = process.env.POSTGRES_DB ?? "tourism_discovery";

  if (!user) {
    throw new Error(
      "Set DATABASE_URL or POSTGRES_USER (and POSTGRES_PASSWORD) for your self-hosted PostgreSQL instance.",
    );
  }

  const encodedUser = encodeURIComponent(user);
  const encodedPassword = password ? encodeURIComponent(password) : "";
  const auth = encodedPassword ? `${encodedUser}:${encodedPassword}` : encodedUser;

  const schema = process.env.POSTGRES_SCHEMA ?? "public";
  return `postgresql://${auth}@${host}:${port}/${database}?schema=${schema}`;
}

function sslConfig(): PoolConfig["ssl"] | undefined {
  const mode = (process.env.POSTGRES_SSL ?? "").toLowerCase();
  if (mode === "true" || mode === "require" || mode === "1") {
    return { rejectUnauthorized: process.env.POSTGRES_SSL_REJECT_UNAUTHORIZED !== "false" };
  }
  return undefined;
}

let pool: Pool | undefined;

export function getDatabaseConnectionString(): string {
  return buildConnectionString();
}

export function getPrismaPgAdapter(): PrismaPg {
  if (!pool) {
    pool = new Pool({
      connectionString: buildConnectionString(),
      ssl: sslConfig(),
      max: Number(process.env.POSTGRES_POOL_MAX ?? 10),
    });
  }
  return new PrismaPg(pool);
}

export async function closePostgresPool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}
