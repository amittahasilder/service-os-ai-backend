const express = require("express");

const {
  getAnalyticsOverview,
} = require("../controllers/analyticsController");

const protect = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const requirePermission = require("../middleware/permissionMiddleware");

const { PERMISSIONS } = require("../utils/permissions");

const router = express.Router();

// =====================================
// SET ORGANIZATION
// =====================================

const setOrganization = (req, res, next) => {
  req.headers["x-organization-id"] = req.params.organizationId;
  next();
};

// =====================================
// ANALYTICS ROUTE
// =====================================

router.get(
  "/:organizationId/analytics",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.ANALYTICS_VIEW),
  getAnalyticsOverview
);

module.exports = router;