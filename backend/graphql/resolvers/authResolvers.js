const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../../models");
const { JWT_SECRET } = require("../../util/config");

const authResolvers = {
  Mutation: {
    login: async (_, { email, password }) => {
      try {
        if (!email || !password) throw new Error("Missing email or password");

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ where: { email: normalizedEmail } });
        if (!user) throw new Error("Invalid credentials");

        const passwordValid = await bcrypt.compare(password, user.password_hash);
        if (!passwordValid) throw new Error("Invalid credentials");

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });

        return {
          token,
          user: { id: user.id, name: user.name, email: user.email },
        };
      } catch (error) {
        throw new Error(`Login failed: ${error.message}`);
      }
    },
  },
};

module.exports = authResolvers;
