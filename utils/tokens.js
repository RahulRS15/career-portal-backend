const jwt = require("jsonwebtoken");

// ACCESS TOKEN
const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

// REFRESH TOKEN
const generateRefreshToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

// VERIFY ACCESS TOKEN
const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { id: decoded.userId, role: decoded.role };
  } catch (error) {
    return null;
  }
};

// VERIFY REFRESH TOKEN
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
