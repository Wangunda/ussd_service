// db.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || undefined,
  // If you get SSL errors, you can try forcing SSL options:
  ssl: { rejectUnauthorized: false } // only if necessary
});

module.exports = pool;
