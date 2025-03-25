require('dotenv').config();

module.exports = {
  development: {
    url: process.env.DATABASE_URL || 'postgres://postgres:Shuggie0907%21@localhost:5432/triswift-db',
    dialect: 'postgres',
    logging: true,
  },
  production: {
    url: process.env.DATABASE_URL || 'postgres://postgres:Zu4UZXkXhY9Gu4C@triswift-db.flycast:5432/triswift-db',
    dialect: 'postgres',
  },
  test: {
    url: process.env.DATABASE_URL || 'postgres://postgres:Shuggie0907%21@localhost:5432/triswift-db',
    dialect: 'postgres',
    logging: false,
  },
};