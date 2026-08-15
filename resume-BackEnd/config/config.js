"use strict";

require("dotenv").config({ quiet: true });

function createDatabaseConfig(environment) {
  const urlVariable = process.env.DATABASE_URL
    ? "DATABASE_URL"
    : process.env.MYSQL_URL
      ? "MYSQL_URL"
      : null;
  const useSsl = process.env.DATABASE_SSL === "true";
  const common = {
    dialect: "mysql",
    logging: process.env.DATABASE_LOGGING === "true" ? console.log : false,
    pool: {
      max: Number(process.env.DATABASE_POOL_MAX) || 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      connectTimeout: 10000,
      ...(useSsl
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : {}),
    },
  };

  if (urlVariable) {
    return {
      ...common,
      use_env_variable: urlVariable,
    };
  }

  return {
    ...common,
    username: process.env.DATABASE_USER || process.env.MYSQLUSER || "root",
    password: process.env.DATABASE_PASSWORD || process.env.MYSQLPASSWORD || "",
    database: process.env.DATABASE_NAME || process.env.MYSQLDATABASE || (
      environment === "test" ? "resume_db_test" : "resume_db"
    ),
    host: process.env.DATABASE_HOST || process.env.MYSQLHOST || "127.0.0.1",
    port: Number(
      process.env.DATABASE_PORT ||
      process.env.MY_SQL_PORT ||
      process.env.MYSQLPORT,
    ) || 3306,
  };
}

module.exports = {
  development: createDatabaseConfig("development"),
  test: createDatabaseConfig("test"),
  production: createDatabaseConfig("production"),
};
