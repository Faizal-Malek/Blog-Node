const { Pool } = require("@neondatabase/serverless");

const connectionString =
  process.env.DATABASE_URL || process.env.DATABASE_URL_UNPOOLED;
const pool = connectionString ? new Pool({ connectionString }) : null;

let initPromise;

const initDatabase = () => {
  if (!connectionString) {
    const error = new Error(
      "Missing DATABASE_URL or DATABASE_URL_UNPOOLED environment variable."
    );
    console.error(error.message);
    return Promise.reject(error);
  }

  if (!initPromise) {
    initPromise = pool
      .query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        snippet TEXT NOT NULL,
        body TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
      .then(() =>
        Promise.all([
          pool.query(
            "ALTER TABLE blogs ADD COLUMN IF NOT EXISTS title TEXT NOT NULL DEFAULT ''"
          ),
          pool.query(
            "ALTER TABLE blogs ADD COLUMN IF NOT EXISTS snippet TEXT NOT NULL DEFAULT ''"
          ),
          pool.query(
            "ALTER TABLE blogs ADD COLUMN IF NOT EXISTS body TEXT NOT NULL DEFAULT ''"
          ),
          pool.query(
            "ALTER TABLE blogs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()"
          )
        ])
      )
      .then(() => undefined);
  }

  return initPromise;
};

const query = async (text, params) => {
  await initDatabase();
  return pool.query(text, params);
};

module.exports = { initDatabase, query };
