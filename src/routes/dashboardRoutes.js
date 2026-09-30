const express = require("express");

const {
  getDashboardSummary,
} = require("../controllers/dashboardController");

const protect = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");

const router = express.Router();

// =====================================================
// DASHBOARD SUMMARY
// =====================================================

router.get(
  "/summary",
  protect,
  tenantMiddleware,
  getDashboardSummary
);

module.exports = router;