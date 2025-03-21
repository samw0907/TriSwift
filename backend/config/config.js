require('dotenv').config();

module.exports = {
  development: {
    url: process.env.DATABASE_URL || 'postgres://postgres:Shuggie0907!@localhost:5432/triswiftdb',
    dialect: 'postgres',
    logging: true,
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
  },
  test: {
    dialect: 'postgres',
    storage: ':memory:',
  },
};
