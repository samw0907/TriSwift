require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PORT } = require("./util/config");
const { connectToDatabase } = require("./util/db");
const { setupApolloServer } = require("./graphql");

const sessionRoutes = require("./routes/sessions");
const authRoutes = require("./routes/auth");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionRoutes);

app.get("/", (req, res) => {
  res.send("TriSwift Backend is Running!");
});

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: "Something went wrong" });
});

const start = async () => {
  await connectToDatabase();
  await setupApolloServer(app);
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();

