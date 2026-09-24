
const express = require("express");

const {
  signup,
  login,
  logout,
} = require("../controllers/authController");

const router = express.Router();

// =====================================
// AUTH ROUTES
// =====================================

// POST /api/auth/signup
router.post("/signup", signup);

// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/logout
router.post("/logout", logout);

// =====================================
// EXPORT ROUTER
// =====================================

module.exports = router;

