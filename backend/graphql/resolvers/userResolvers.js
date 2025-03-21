const { User, Session } = require("../../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../../util/config");

const userResolvers = {
    Query: {
        users: async (_, __, { user }) => {
            if (!user) throw new Error("Authentication required.");
            return [await User.findByPk(user.id)];
          },
      
          user: async (_, __, { user }) => {
            if (!user) throw new Error("Authentication required.");
            return await User.findByPk(user.id, { include: Session, as: "Sessions" });
          },
    },
    Mutation: {
        createUser: async (_, { input }) => {
            try {
              if (!input.name || !input.email || !input.password) {
                throw new Error("All fields (name, email, password) are required");
              }
      
              const normalizedEmail = input.email.toLowerCase().trim();
      
              const existingUser = await User.findOne({ where: { email: normalizedEmail } });
              if (existingUser) {
                throw new Error("Email is already in use");
              }
      
              const passwordHash = await bcrypt.hash(input.password, 12);
              const user = await User.create({
                name: input.name.trim(),
                email: normalizedEmail,
                password_hash: passwordHash
              });
      
              return {
                ...user.toJSON(),
                created_at: user.created_at.toISOString(),
                updated_at: user.updated_at.toISOString(),
              };
            } catch (error) {
              throw new Error("Failed to create user: " + error.message);
            }
          },
      
          updateUser: async (_, { id, input }, { user }) => {
            if (!user) throw new Error("Authentication required.");
            if (user.id !== parseInt(id)) throw new Error("Unauthorized: You can only update your own account.");
      
            try {
              const userToUpdate = await User.findByPk(id);
              if (!userToUpdate) throw new Error("User not found");
      
              const updatedValues = {};
              if (input.email) {
                const normalizedEmail = input.email.toLowerCase().trim();
                if (normalizedEmail !== user.email) {
                  const existingUser = await User.findOne({ where: { email: normalizedEmail } });
                  if (existingUser) throw new Error("Email is already in use");
                }
                updatedValues.email = normalizedEmail;
              }
      
              if (input.password) {
                updatedValues.password_hash = await bcrypt.hash(input.password, 12);
              }
      
              await userToUpdate.update(updatedValues);
      
              return {
                ...userToUpdate.toJSON(),
                created_at: userToUpdate.created_at.toISOString(),
                updated_at: userToUpdate.updated_at.toISOString(),
              };
            } catch (error) {
              throw new Error("Failed to update user: " + error.message);
            }
          },
      
          deleteUser: async (_, { id }, { user }) => {
            if (!user) throw new Error("Authentication required.");
            if (user.id !== parseInt(id)) throw new Error("Unauthorized: You can only delete your own account.");
      
            try {
              const userToDelete = await User.findByPk(id);
              if (!userToDelete) throw new Error("User not found");
      
              await userToDelete.destroy();
      
              return { message: "User deleted successfully" };
            } catch (error) {
              throw new Error("Failed to delete user: " + error.message);
            }
          },      
    }
}

module.exports = userResolvers;