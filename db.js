const { Pool } = require("@neondatabase/serverless");

const connectionString = process.env.DATABASE_URL;
const pool = connectionString ? new Pool({ connectionString }) : null;

let initPromise;

const initDatabase = () => {
  if (!connectionString) {
    return Promise.reject(
      new Error("Missing DATABASE_URL environment variable.")
    );
  }

  if (!initPromise) {
    initPromise = pool.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        snippet TEXT NOT NULL,
        body TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  }

  return initPromise;
};

const query = async (text, params) => {
  await initDatabase();
  return pool.query(text, params);
};

module.exports = { initDatabase, query };
