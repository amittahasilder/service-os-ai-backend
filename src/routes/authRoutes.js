
const express = require("express");

const {
  signup,
  login,
  getMe,
  logout,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

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
router.get(
  "/me",
  protect,
  getMe
);

// =====================================
// LOGOUT
// =====================================

// Logout current user
router.post(
  "/logout",
  logout
);

// =====================================
// RBAC TEST ROUTES
// =====================================

// =====================================
// OWNER ONLY
// =====================================

router.get(
  "/owner-test",
  protect,
  authorize("owner"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Owner access granted",

      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
        },
      },
    });
  }
);

// =====================================
// OWNER + ADMIN
// =====================================

router.get(
  "/admin-test",
  protect,
  authorize("owner", "admin"),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Admin-level access granted",

      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
        },
      },
    });
  }
);

// =====================================
// OWNER + ADMIN + MANAGER
// =====================================

router.get(
  "/manager-test",
  protect,
  authorize(
    "owner",
    "admin",
    "manager"
  ),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: "Manager-level access granted",

      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
        },
      },
    });
  }
);

// =====================================
// EXPORT ROUTER
// =====================================

module.exports = router;

