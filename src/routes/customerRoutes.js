
const express = require("express");

const router = express.Router();

// =====================================
// CONTROLLERS
// =====================================

const {
  createCustomerController,
  getCustomers,
  getCustomer,
  updateCustomerController,
  removeCustomer,
  convertLead,
  customerStats,
} = require("../controllers/customerController");

// =====================================
// MIDDLEWARE
// =====================================

const protect = require("../middleware/authMiddleware");

const tenantMiddleware = require("../middleware/tenantMiddleware");

const requirePermission = require("../middleware/permissionMiddleware");

const validate = require("../middleware/validationMiddleware");

// =====================================
// PERMISSIONS
// =====================================

const {
  CUSTOMER_CREATE,
  CUSTOMER_VIEW,
  CUSTOMER_UPDATE,
  CUSTOMER_DELETE,
} = require("../utils/permissions");

// =====================================
// VALIDATION
// =====================================

const {
  createCustomerSchema,
  updateCustomerSchema,
} = require("../validations/customerValidation");

// =====================================
// ORGANIZATION MIDDLEWARE
// =====================================

const setOrganization = (req, res, next) => {
  req.headers["x-organization-id"] =
    req.params.organizationId;

  next();
};

// =====================================
// CUSTOMER STATISTICS
// =====================================

router.get(
  "/:organizationId/customers/stats",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(CUSTOMER_VIEW),
  customerStats
);

// =====================================
// CONVERT LEAD TO CUSTOMER
// =====================================

router.post(
  "/:organizationId/leads/:leadId/convert",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(CUSTOMER_CREATE),
  convertLead
);

// =====================================
// GET ALL CUSTOMERS
// =====================================

router.get(
  "/:organizationId/customers",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(CUSTOMER_VIEW),
  getCustomers
);

// =====================================
// CREATE CUSTOMER
// =====================================

router.post(
  "/:organizationId/customers",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(CUSTOMER_CREATE),
  validate(createCustomerSchema),
  createCustomerController
);

// =====================================
// GET SINGLE CUSTOMER
// =====================================

router.get(
  "/:organizationId/customers/:customerId",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(CUSTOMER_VIEW),
  getCustomer
);

// =====================================
// UPDATE CUSTOMER
// =====================================

router.put(
  "/:organizationId/customers/:customerId",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(CUSTOMER_UPDATE),
  validate(updateCustomerSchema),
  updateCustomerController
);

// =====================================
// ARCHIVE CUSTOMER
// =====================================

router.delete(
  "/:organizationId/customers/:customerId",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(CUSTOMER_DELETE),
  removeCustomer
);

// =====================================
// EXPORT
// =====================================

module.exports = router;