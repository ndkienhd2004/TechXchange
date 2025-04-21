const jwt = require("jsonwebtoken");
const redisClient = require("../redisClient");

const requireAuth = async (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const storedToken = await redisClient.get(`token:${decoded.user_id}`);

    if (storedToken !== token) {
      return res.status(401).json({ message: "Token expired or invalid" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = requireAuth;
