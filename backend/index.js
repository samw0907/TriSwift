const express = require("express");
const cors = require("cors");
const { sequelize } = require("./models");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const sessionRoutes = require("./routes/sessions");
app.use("/api", sessionRoutes);

app.get("/", (req, res) => {
  res.send("TriSwift Backend is Running!");
});

sequelize
  .authenticate()
  .then(() => console.log(" Connected to PostgreSQL successfully!"))
  .catch((err) => console.error(" PostgreSQL connection error:", err));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
