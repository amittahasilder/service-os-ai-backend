const jwt = require("jsonwebtoken");
const User = require("../models/User");

// =====================================
// AUTHENTICATION MIDDLEWARE
// =====================================

const protect = async (req, res, next) => {
  try {
    // Get JWT from HTTP-only cookie
    const token = req.cookies.serviceos_token;

    // Token না থাকলে
    if (!token) {
      const error = new Error("Authentication required");
      error.statusCode = 401;
      throw error;
    }

    // Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Find user from database
    const user = await User.findById(decoded.userId);

    // User পাওয়া না গেলে
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 401;
      throw error;
    }

    // User inactive হলে
    if (!user.isActive) {
      const error = new Error("Your account is inactive");
      error.statusCode = 403;
      throw error;
    }

    // Attach user to request
    req.user = user;

    // Continue
    next();
  } catch (error) {
    // JWT invalid/expired
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      error.statusCode = 401;
      error.message = "Invalid or expired authentication token";
    }

    next(error);
  }
};

module.exports = protect;