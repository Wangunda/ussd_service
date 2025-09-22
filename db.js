const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",      // or your cloud host
  database: "ussd_db",
  password: "Haust",
  port: 5432,             // default postgres port
});

module.exports = pool;
