const { Pool } = require("@neondatabase/serverless");
const { hashPassword } = require("./auth");

const connectionString =
  process.env.DATABASE_URL ||
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_URL_NON_POOLING;
const pool = connectionString ? new Pool({ connectionString }) : null;

let initPromise;

const initDatabase = () => {
  if (!connectionString) {
    const error = new Error(
      "Missing DATABASE_URL, DATABASE_URL_UNPOOLED, POSTGRES_URL, or POSTGRES_URL_NON_POOLING environment variable."
    );
    console.error(error.message);
    return Promise.reject(error);
  }

  if (!initPromise) {
    initPromise = pool
      .query("SELECT 1")
      .then(() =>
        pool.query(`
          CREATE TABLE IF NOT EXISTS blogs (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            snippet TEXT NOT NULL,
            body TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )
        `)
      )
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
          ),
          pool.query(
            `
              CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                password_salt TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
              )
            `
          ),
          pool.query(
            `
              CREATE TABLE IF NOT EXISTS blog_views (
                id SERIAL PRIMARY KEY,
                blog_id INT NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
              )
            `
          ),
          pool.query(
            `
              CREATE TABLE IF NOT EXISTS blog_likes (
                id SERIAL PRIMARY KEY,
                blog_id INT NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
              )
            `
          )
        ])
      )
      .then(async () => {
        const email = process.env.ADMIN_EMAIL;
        const password = process.env.ADMIN_PASSWORD;
        if (!email || !password) {
          return;
        }

        const { rows } = await pool.query(
          "SELECT id FROM users WHERE email = $1",
          [email]
        );
        if (rows.length) {
          return;
        }

        const { salt, hash } = hashPassword(password);
        await pool.query(
          "INSERT INTO users (email, password_hash, password_salt) VALUES ($1, $2, $3)",
          [email, hash, salt]
        );
      })
      .then(() => undefined);
  }

  return initPromise;
};

const query = async (text, params) => {
  await initDatabase();
  return pool.query(text, params);
};

module.exports = { initDatabase, query };
