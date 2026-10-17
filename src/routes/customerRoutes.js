
// const express = require("express");

// const router = express.Router();

// // =====================================
// // CONTROLLERS
// // =====================================

// const {
//   createCustomerController,
//   getCustomers,
//   getCustomer,
//   updateCustomerController,
//   removeCustomer,
//   convertLead,
//   customerStats,
// } = require("../controllers/customerController");

// // =====================================
// // MIDDLEWARE
// // =====================================

// const protect = require("../middleware/authMiddleware");
// const tenantMiddleware = require("../middleware/tenantMiddleware");
// const requirePermission = require("../middleware/permissionMiddleware");
// const validate = require("../middleware/validationMiddleware");

// // =====================================
// // PERMISSIONS
// // =====================================

// const {
//   CUSTOMER_CREATE,
//   CUSTOMER_VIEW,
//   CUSTOMER_UPDATE,
//   CUSTOMER_DELETE,
// } = require("../utils/permissions");

// // =====================================
// // VALIDATION
// // =====================================

// const {
//   createCustomerSchema,
//   updateCustomerSchema,
// } = require("../validations/customerValidation");

// // =====================================
// // CUSTOMER STATISTICS
// // =====================================

// router.get(
//   "/:organizationId/customers/stats",
//   protect,
//   tenantMiddleware,
//   requirePermission(CUSTOMER_VIEW),
//   customerStats
// );

// // =====================================
// // CONVERT LEAD TO CUSTOMER
// // =====================================

// router.post(
//   "/:organizationId/leads/:leadId/convert",
//   protect,
//   tenantMiddleware,
//   requirePermission(CUSTOMER_CREATE),
//   convertLead
// );

// // =====================================
// // GET ALL CUSTOMERS
// // =====================================

// router.get(
//   "/:organizationId/customers",
//   protect,
//   tenantMiddleware,
//   requirePermission(CUSTOMER_VIEW),
//   getCustomers
// );

// // =====================================
// // CREATE CUSTOMER
// // =====================================

// router.post(
//   "/:organizationId/customers",
//   protect,
//   tenantMiddleware,
//   requirePermission(CUSTOMER_CREATE),
//   validate(createCustomerSchema),
//   createCustomerController
// );

// // =====================================
// // GET SINGLE CUSTOMER
// // =====================================

// router.get(
//   "/:organizationId/customers/:customerId",
//   protect,
//   tenantMiddleware,
//   requirePermission(CUSTOMER_VIEW),
//   getCustomer
// );

// // =====================================
// // UPDATE CUSTOMER
// // =====================================

// router.put(
//   "/:organizationId/customers/:customerId",
//   protect,
//   tenantMiddleware,
//   requirePermission(CUSTOMER_UPDATE),
//   validate(updateCustomerSchema),
//   updateCustomerController
// );

// // =====================================
// // ARCHIVE CUSTOMER
// // =====================================

// router.delete(
//   "/:organizationId/customers/:customerId",
//   protect,
//   tenantMiddleware,
//   requirePermission(CUSTOMER_DELETE),
//   removeCustomer
// );

// // =====================================
// // EXPORT
// // =====================================

// module.exports = router;



const express = require("express");

const router = express.Router();

// =====================================================
// CONTROLLERS
// =====================================================

const {
  createCustomerController,
  getCustomers,
  getCustomer,
  updateCustomerController,
  removeCustomer,
  convertLead,
  customerStats,
} = require("../controllers/customerController");

// =====================================================
// MIDDLEWARE
// =====================================================

const protect = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const requirePermission = require("../middleware/permissionMiddleware");
const validate = require("../middleware/validationMiddleware");

// =====================================================
// PERMISSIONS
// =====================================================

const {
  CUSTOMER_CREATE,
  CUSTOMER_VIEW,
  CUSTOMER_UPDATE,
  CUSTOMER_DELETE,
} = require("../utils/permissions");

// =====================================================
// DEBUG: VERIFY IMPORTED PERMISSIONS
// =====================================================

console.log("========================================");
console.log("SERVICEOS CUSTOMER ROUTE PERMISSIONS");
console.log({
  CUSTOMER_CREATE,
  CUSTOMER_VIEW,
  CUSTOMER_UPDATE,
  CUSTOMER_DELETE,
});
console.log("========================================");

// =====================================================
// VALIDATION
// =====================================================

const {
  createCustomerSchema,
  updateCustomerSchema,
} = require("../validations/customerValidation");

// =====================================================
// CUSTOMER STATISTICS
// GET /api/organizations/:organizationId/customers/stats
// =====================================================

router.get(
  "/:organizationId/customers/stats",
  protect,
  tenantMiddleware,
  requirePermission(CUSTOMER_VIEW),
  customerStats
);

// =====================================================
// CONVERT LEAD TO CUSTOMER
// POST /api/organizations/:organizationId/leads/:leadId/convert
// =====================================================

router.post(
  "/:organizationId/leads/:leadId/convert",
  protect,
  tenantMiddleware,
  requirePermission(CUSTOMER_CREATE),
  convertLead
);

// =====================================================
// GET ALL CUSTOMERS
// GET /api/organizations/:organizationId/customers
// =====================================================

router.get(
  "/:organizationId/customers",
  protect,
  tenantMiddleware,
  requirePermission(CUSTOMER_VIEW),
  getCustomers
);

// =====================================================
// CREATE CUSTOMER
// POST /api/organizations/:organizationId/customers
// =====================================================

router.post(
  "/:organizationId/customers",
  protect,
  tenantMiddleware,
  requirePermission(CUSTOMER_CREATE),
  validate(createCustomerSchema),
  createCustomerController
);

// =====================================================
// GET SINGLE CUSTOMER
// GET /api/organizations/:organizationId/customers/:customerId
// =====================================================

router.get(
  "/:organizationId/customers/:customerId",
  protect,
  tenantMiddleware,
  requirePermission(CUSTOMER_VIEW),
  getCustomer
);

// =====================================================
// UPDATE CUSTOMER
// PUT /api/organizations/:organizationId/customers/:customerId
// =====================================================

router.put(
  "/:organizationId/customers/:customerId",
  protect,
  tenantMiddleware,
  requirePermission(CUSTOMER_UPDATE),
  validate(updateCustomerSchema),
  updateCustomerController
);

// =====================================================
// ARCHIVE CUSTOMER
// DELETE /api/organizations/:organizationId/customers/:customerId
// =====================================================

router.delete(
  "/:organizationId/customers/:customerId",
  protect,
  tenantMiddleware,
  requirePermission(CUSTOMER_DELETE),
  removeCustomer
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;
