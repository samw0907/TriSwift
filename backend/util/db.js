const { Sequelize } = require("sequelize");
const { DATABASE_URL } = require("./config");

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: "postgres",
  logging: false
});

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to PostgreSQL successfully!");
  } catch (error) {
    console.error("PostgreSQL connection error:", error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectToDatabase };
