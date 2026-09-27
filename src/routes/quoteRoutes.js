const express = require("express");

const {
  createQuoteController,
  getQuotes,
  getQuote,
  updateQuoteController,
  removeQuote,
  quoteStats,
} = require("../controllers/quoteController");

const protect = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const requirePermission = require("../middleware/permissionMiddleware");
const validate = require("../middleware/validationMiddleware");

const {
  createQuoteSchema,
  updateQuoteSchema,
} = require("../validations/quoteValidation");

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
// QUOTE ROUTES
// =====================================

// Get quote statistics
router.get(
  "/:organizationId/quotes/stats",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.QUOTE_VIEW),
  quoteStats
);

// Get all quotes
router.get(
  "/:organizationId/quotes",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.QUOTE_VIEW),
  getQuotes
);

// Create quote
router.post(
  "/:organizationId/quotes",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.QUOTE_CREATE),
  validate(createQuoteSchema),
  createQuoteController
);

// Get single quote
router.get(
  "/:organizationId/quotes/:quoteId",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.QUOTE_VIEW),
  getQuote
);

// Update quote
router.put(
  "/:organizationId/quotes/:quoteId",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.QUOTE_UPDATE),
  validate(updateQuoteSchema),
  updateQuoteController
);

// Delete / cancel quote
router.delete(
  "/:organizationId/quotes/:quoteId",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.QUOTE_DELETE),
  removeQuote
);

module.exports = router;