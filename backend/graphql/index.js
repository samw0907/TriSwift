const { ApolloServer } = require("apollo-server-express");
const express = require("express");
const cors = require("cors");
const { PORT } = require("../util/config");
const { connectToDatabase } = require("../util/db");
const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");

const setupApolloServer = async () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();
  server.applyMiddleware({ app });

  app.listen(PORT, async () => {
    await connectToDatabase();
    console.log(`🚀 Server running on http://localhost:${PORT}/graphql`);
  });
};

setupApolloServer();
