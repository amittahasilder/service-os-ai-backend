
const express = require("express");

const {
  createBusiness,
  getMyBusinesses,
  getBusiness,
} = require("../controllers/organizationController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================
// ORGANIZATION / BUSINESS ROUTES
// =====================================

// Create a new business
router.post(
  "/",
  protect,
  createBusiness
);

// Get all businesses of logged-in user
router.get(
  "/",
  protect,
  getMyBusinesses
);

// Get a single business
router.get(
  "/:organizationId",
  protect,
  getBusiness
);

module.exports = router;

