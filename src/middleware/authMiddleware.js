
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// =====================================
// AUTHENTICATION MIDDLEWARE
// =====================================

const protect = async (req, res, next) => {
  try {
    // =====================================
    // CHECK JWT SECRET
    // =====================================

    if (!process.env.JWT_SECRET) {
      const error = new Error(
        "JWT_SECRET is missing in environment variables"
      );

      error.statusCode = 500;

      throw error;
    }

    // =====================================
    // GET TOKEN FROM COOKIE
    // =====================================

    const token = req.cookies?.serviceos_token;

    // =====================================
    // TOKEN NOT FOUND
    // =====================================

    if (!token) {
      const error = new Error(
        "Authentication required"
      );

      error.statusCode = 401;

      throw error;
    }

    // =====================================
    // VERIFY JWT
    // =====================================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // =====================================
    // CHECK JWT PAYLOAD
    // =====================================

    if (!decoded?.userId) {
      const error = new Error(
        "Invalid authentication token"
      );

      error.statusCode = 401;

      throw error;
    }

    // =====================================
    // FIND USER
    // =====================================

    const user = await User.findById(
      decoded.userId
    );

    // =====================================
    // USER NOT FOUND
    // =====================================

    if (!user) {
      const error = new Error(
        "User not found"
      );

      error.statusCode = 401;

      throw error;
    }

    // =====================================
    // CHECK ACCOUNT STATUS
    // =====================================

    if (!user.isActive) {
      const error = new Error(
        "Your account is inactive"
      );

      error.statusCode = 403;

      throw error;
    }

    // =====================================
    // ATTACH USER TO REQUEST
    // =====================================

    req.user = user;

    // =====================================
    // CONTINUE REQUEST
    // =====================================

    next();
  } catch (error) {
    // =====================================
    // JWT ERROR HANDLING
    // =====================================

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      error.statusCode = 401;

      error.message =
        error.name === "TokenExpiredError"
          ? "Authentication token has expired"
          : "Invalid authentication token";
    }

    // =====================================
    // SEND ERROR TO GLOBAL ERROR HANDLER
    // =====================================

    next(error);
  }
};

// =====================================
// EXPORT
// =====================================

module.exports = protect;

