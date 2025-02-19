require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PORT } = require("./util/config");
const { connectToDatabase } = require("./util/db");

const sessionRoutes = require("./routes/sessions");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", sessionRoutes);

app.get("/", (req, res) => {
  res.send("TriSwift Backend is Running!");
});

const start = async () => {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();

