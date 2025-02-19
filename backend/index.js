require('dotenv').config();

const express = require('express')
const cors = require('cors')
const { sequelize } = require("./models"); 

const app = express()
app.use(cors())
app.use(express.json())

const apiRoutes = require("./routes/api");
app.use("/api", apiRoutes);

sequelize
  .authenticate()
  .then(() => console.log('✅ Connected to PostgreSQL successfully!'))
  .catch((err) => console.error('❌ PostgreSQL connection error:', err));


app.get('/', (req, res) => {
  res.send('TriSwift Backend is Running!')
})

const PORT = process.env.PORT || 3001

sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => console.error("Database connection error:", err));