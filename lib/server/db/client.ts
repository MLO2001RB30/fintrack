import "server-only";

import postgres, { type Sql } from "postgres";

import { getEnv, isDatabaseConfigured } from "@/lib/server/env";
import { ApiError } from "@/lib/server/http";

let sqlClient: Sql | null = null;

export function getDb() {
  if (!isDatabaseConfigured()) {
    throw new ApiError(503, "database_not_configured", "Database access is not configured.");
  }

  if (!sqlClient) {
    sqlClient = postgres(getEnv().DATABASE_URL!, {
      max: 5,
      idle_timeout: 20,
      prepare: false,
    });
  }

  return sqlClient;
}

export async function withTransaction<T>(callback: (sql: Sql) => Promise<T>) {
  const db = getDb();
  return db.begin((sql) => callback(sql));
}
