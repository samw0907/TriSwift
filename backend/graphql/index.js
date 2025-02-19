const { ApolloServer } = require("apollo-server-express");
const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");

const setupApolloServer = async (app) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();
  server.applyMiddleware({ app });

  console.log(`🚀 GraphQL Server running at http://localhost:3001/graphql`);
};

module.exports = { setupApolloServer };
