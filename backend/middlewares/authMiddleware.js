const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../util/config");

const authMiddleware = (req, res, next) => {
  const authorization = req.get("authorization");

  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    try {
      const decodedToken = jwt.verify(authorization.substring(7), JWT_SECRET);

      if (decodedToken) {
        req.user = decodedToken;
        console.log("Decoded User:", decodedToken);
      }
    } catch (error) {
      return res.status(401).json({ error: "Invalid token" });
    }
  }
   // return res.status(401).json({ error: "Token missing" });
   next();
};

module.exports = authMiddleware;
