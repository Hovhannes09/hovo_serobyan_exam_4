import { Sequelize } from "sequelize";

const {
  MY_SQL_HOST,
  MY_SQL_DATABASE,
  MY_SQL_PASSWORD,
  MY_SQL_USER,
  MY_SQL_PORT,
} = process.env;

const sequelize = new Sequelize(MY_SQL_DATABASE, MY_SQL_USER, MY_SQL_PASSWORD, {
  host: MY_SQL_HOST,
  port: MY_SQL_PORT,
  dialect: "mysql",
  logging: false,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

try {
  await sequelize.authenticate();
  console.log("Database connection established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

export default sequelize;
