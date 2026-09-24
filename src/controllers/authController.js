
const {
  signupSchema,
  loginSchema,
} = require("../validations/authValidation");

const {
  signupUser,
  loginUser,
} = require("../services/authService");

// =====================================
// COOKIE OPTIONS
// =====================================

const cookieOptions = {
  httpOnly: true,

  // HTTPS হলে production-এ true হবে
  secure: process.env.NODE_ENV === "production",

  // Localhost development-এর জন্য lax
  sameSite:
    process.env.NODE_ENV === "production"
      ? "none"
      : "lax",

  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// =====================================
// SIGNUP
// =====================================

const signup = async (req, res, next) => {
  try {
    // Validate request body
    const validatedData = signupSchema.parse(req.body);

    // Create user + generate JWT
    const result = await signupUser(validatedData);

    // Store JWT inside HTTP-only cookie
    res.cookie(
      "serviceos_token",
      result.token,
      cookieOptions
    );

    // Send response
    res.status(201).json({
      success: true,
      message: "Account created successfully",

      data: {
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// LOGIN
// =====================================

const login = async (req, res, next) => {
  try {
    // Validate request body
    const validatedData = loginSchema.parse(req.body);

    // Login user + generate JWT
    const result = await loginUser(validatedData);

    // Store JWT inside HTTP-only cookie
    res.cookie(
      "serviceos_token",
      result.token,
      cookieOptions
    );

    // Send response
    res.status(200).json({
      success: true,
      message: "Login successful",

      data: {
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// LOGOUT
// =====================================

const logout = (req, res) => {
  // Remove authentication cookie
  res.clearCookie("serviceos_token", {
    httpOnly: true,

    secure:
      process.env.NODE_ENV === "production",

    sameSite:
      process.env.NODE_ENV === "production"
        ? "none"
        : "lax",
  });

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};

// =====================================
// EXPORT
// =====================================

module.exports = {
  signup,
  login,
  logout,
};

