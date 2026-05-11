const { Sequelize } = require("sequelize");

const databaseUrl = process.env.DATABASE_URL;
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbHost = process.env.DB_HOST || "localhost";
const dbPort = Number(process.env.DB_PORT || 5432);
const useSsl =
  process.env.DB_SSL === "true" ||
  (databaseUrl && !databaseUrl.includes("localhost") && !databaseUrl.includes("127.0.0.1"));

const connectionOptions = {
  dialect: "postgres",
  logging: process.env.DB_LOGGING === "true",
};

if (useSsl) {
  connectionOptions.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  };
}

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, connectionOptions)
  : new Sequelize(dbName, dbUser, dbPass, {
      ...connectionOptions,
      host: dbHost,
      port: dbPort,
    });

module.exports = sequelize;
