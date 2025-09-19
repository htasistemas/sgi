const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: Number.parseInt(process.env.DATABASE_POOL_MAX ?? '10', 10),
  idleTimeoutMillis: Number.parseInt(process.env.DATABASE_POOL_IDLE ?? '10000', 10),
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
