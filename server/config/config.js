require("dotenv").config();

module.exports = {
  development: {
    username: process.env.mariaDB_USER,
    password: process.env.mariaDB_PASSWORD,
    database: process.env.mariaDB_DB,
    host: process.env.mariaDB_HOST,
    dialect: "mysql",
    port: process.env.mariaDB_PORT,
  },
  test: {
    dialect: "sqlite",
    storage: ":memory:",
  },
  production: {
    username: process.env.PROD_DB_USERNAME, // อ่านจาก Env Var บน Production Server
    password: process.env.PROD_DB_PASSWORD,
    database: process.env.PROD_DB_NAME,
    host: process.env.PROD_DB_HOST,
    dialect: "mysql",
    port: process.env.PROD_DB_PORT || 3306,
  },
};
