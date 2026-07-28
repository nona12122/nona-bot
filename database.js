import pkg from "pg";

const { Pool } = pkg;

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function initDatabase() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS stats (
      user_id TEXT PRIMARY KEY,
      messages INTEGER DEFAULT 0,
      voice INTEGER DEFAULT 0
    );
  `);

  console.log("✅ Database Ready");
}