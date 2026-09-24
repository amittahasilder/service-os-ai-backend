
const {
  signupSchema,
  loginSchema,
} = require("../validations/authValidation");

const {
  signupUser,
  loginUser,
} = require("../services/authService");

// =====================================
// COOKIE CONFIGURATION
// =====================================

const COOKIE_NAME = "serviceos_token";

const cookieOptions = {
  httpOnly: true,

  // HTTPS required in production
  secure: process.env.NODE_ENV === "production",

  // Cross-site cookie in production
  // Local development uses lax
  sameSite:
    process.env.NODE_ENV === "production"
      ? "none"
      : "lax",

  // 7 days
  maxAge: 7 * 24 * 60 * 60 * 1000,

  // Cookie available for the entire application
  path: "/",
};

// =====================================
// SIGNUP
// =====================================

const signup = async (req, res, next) => {
  try {
    // Validate request body
    const validatedData = signupSchema.parse(req.body);

    // Create user and generate JWT
    const result = await signupUser(validatedData);

    // Store JWT inside HTTP-only cookie
    res.cookie(
      COOKIE_NAME,
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

    // Authenticate user and generate JWT
    const result = await loginUser(validatedData);

    // Store JWT inside HTTP-only cookie
    res.cookie(
      COOKIE_NAME,
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
// GET CURRENT USER
// =====================================

const getMe = async (req, res, next) => {
  try {
    // req.user is created by authMiddleware
    const user = req.user;

    res.status(200).json({
      success: true,
      message: "Authenticated user",

      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
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
  // Clear authentication cookie
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,

    secure:
      process.env.NODE_ENV === "production",

    sameSite:
      process.env.NODE_ENV === "production"
        ? "none"
        : "lax",

    path: "/",
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
  getMe,
  logout,
};

