import { Pool } from "pg"

let pool
let schemaPromise

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured")
  }

  return databaseUrl
}

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: getDatabaseUrl(),
      allowExitOnIdle: true,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 3,
    })
  }

  return pool
}

export async function query(text, params = []) {
  return getPool().query(text, params)
}

export async function ensureSchema() {
  if (!schemaPromise) {
    schemaPromise = query(`
      CREATE TABLE IF NOT EXISTS todos (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        activity TEXT NOT NULL,
        priority TEXT NOT NULL,
        recurrence TEXT NOT NULL,
        date DATE NOT NULL,
        "start" TEXT NOT NULL DEFAULT '',
        "end" TEXT NOT NULL DEFAULT '',
        location TEXT NOT NULL DEFAULT '',
        notes TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL,
        checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
        "order" BIGINT NOT NULL DEFAULT 0,
        top3_date DATE,
        created_at TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL,
        completed_at TIMESTAMPTZ,
        CONSTRAINT todos_priority_check
          CHECK (priority IN ('red', 'yellow', 'green', 'white')),
        CONSTRAINT todos_recurrence_check
          CHECK (recurrence IN ('once', 'weekly', 'monthly')),
        CONSTRAINT todos_status_check
          CHECK (status IN ('open', 'done', 'cancelled'))
      );

      CREATE INDEX IF NOT EXISTS todos_date_idx ON todos (date);
      CREATE INDEX IF NOT EXISTS todos_top3_date_idx ON todos (top3_date);
      CREATE INDEX IF NOT EXISTS todos_status_idx ON todos (status);
    `).catch((error) => {
      schemaPromise = undefined
      throw error
    })
  }

  await schemaPromise
}
