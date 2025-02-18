require('dotenv').config();

const express = require('express')
const cors = require('cors')
const { Sequelize } = require('sequelize');

const app = express()
app.use(cors())
app.use(express.json())

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: console.log, // Logs SQL queries (useful for debugging)
});

sequelize
  .authenticate()
  .then(() => console.log('✅ Connected to PostgreSQL successfully!'))
  .catch((err) => console.error('❌ PostgreSQL connection error:', err));


app.get('/', (req, res) => {
  res.send('TriSwift Backend is Running!')
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
