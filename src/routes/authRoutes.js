
const express = require("express");

const {
  signup,
  login,
  getMe,
  logout,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================
// PUBLIC AUTH ROUTES
// =====================================

// Create new account
router.post("/signup", signup);

// Login existing user
router.post("/login", login);

// =====================================
// PROTECTED AUTH ROUTES
// =====================================

// Get currently authenticated user
router.get("/me", protect, getMe);

// =====================================
// LOGOUT
// =====================================

// Logout current user
router.post("/logout", logout);

// =====================================
// EXPORT ROUTER
// =====================================

module.exports = router;


