const { ApolloServer } = require("apollo-server-express");
const jwt = require("jsonwebtoken");
const typeDefs = require("./typeDefs");
const resolvers = require("./resolvers");
const { User } = require("../models");
const { JWT_SECRET } = require("../util/config");

const getUserFromToken = async (token) => {
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    return user ? { id: user.id, email: user.email } : null;
  } catch (error) {
    return null;
  }
};

const setupApolloServer = async (app) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      console.log("Received Headers:", req.headers); 
      const token = req.headers.authorization?.split("Bearer ")[1];
      const user = await getUserFromToken(token);
      console.log("Decoded User:", user);
      return { user };
    }
  });

  await server.start();
  server.applyMiddleware({ app });

  console.log(`🚀 GraphQL Server running at http://localhost:3001/graphql`);
};

module.exports = { setupApolloServer };
