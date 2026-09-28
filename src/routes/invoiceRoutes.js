const express = require("express");

const {
  createInvoiceController,
  getInvoices,
  getInvoice,
  updateInvoiceController,
  removeInvoice,
  invoiceStats,
} = require("../controllers/invoiceController");

const protect = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const requirePermission = require("../middleware/permissionMiddleware");
const validate = require("../middleware/validationMiddleware");

const {
  createInvoiceSchema,
  updateInvoiceSchema,
} = require("../validations/invoiceValidation");

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
// INVOICE ROUTES
// =====================================

// Get invoice statistics
router.get(
  "/:organizationId/invoices/stats",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.INVOICE_VIEW),
  invoiceStats
);

// Get all invoices
router.get(
  "/:organizationId/invoices",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.INVOICE_VIEW),
  getInvoices
);

// Create invoice
router.post(
  "/:organizationId/invoices",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.INVOICE_CREATE),
  validate(createInvoiceSchema),
  createInvoiceController
);

// Get single invoice
router.get(
  "/:organizationId/invoices/:invoiceId",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.INVOICE_VIEW),
  getInvoice
);

// Update invoice
router.put(
  "/:organizationId/invoices/:invoiceId",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.INVOICE_UPDATE),
  validate(updateInvoiceSchema),
  updateInvoiceController
);

// Delete / cancel invoice
router.delete(
  "/:organizationId/invoices/:invoiceId",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.INVOICE_DELETE),
  removeInvoice
);

module.exports = router;