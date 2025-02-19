const jwt = require("jsonwebtoken");
const { SECRET } = require("../util/config");

const authMiddleware = (req, res, next) => {
  const authorization = req.get("authorization");

  if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
    try {
      const decodedToken = jwt.verify(authorization.substring(7), SECRET);
      req.user = decodedToken;
      next();
    } catch (error) {
      return res.status(401).json({ error: "Invalid token" });
    }
  } else {
    return res.status(401).json({ error: "Token missing" });
  }
};

module.exports = authMiddleware;
