
const express = require("express");

const {
  getAnalyticsOverview,
} = require("../controllers/analyticsController");

const protect = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const requirePermission = require("../middleware/permissionMiddleware");
const { PERMISSIONS } = require("../config/permissions");

const router = express.Router();

// =====================================
// ANALYTICS OVERVIEW
// GET /api/organizations/:organizationId/analytics
// =====================================

router.get(
  "/:organizationId/analytics",
  protect,
  tenantMiddleware,
  requirePermission(PERMISSIONS.ANALYTICS_VIEW),
  getAnalyticsOverview
);

module.exports = router;
