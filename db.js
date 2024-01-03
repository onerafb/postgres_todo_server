const Pool = require("pg").Pool;
require("dotenv").config();
const pool = new Pool({
  // user: process.env.USERNAME,
  // password: process.env.PASSWORD,
  // host: process.env.HOST,
  // port: process.env.DBPORT,
  
  user: "postgres",
  password: "password",
  host: "localhost",
  port: 5432,
  database: "todoapp",
});

module.exports = pool;
