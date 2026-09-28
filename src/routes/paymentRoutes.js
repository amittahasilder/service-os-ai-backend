
const express = require("express");

const {
  createPaymentController,
  getPayments,
  getPayment,
  updatePaymentController,
  refundPaymentController,
  cancelPaymentController,
  paymentStats,
} = require("../controllers/paymentController");

const protect = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const requirePermission = require("../middleware/permissionMiddleware");
const validate = require("../middleware/validationMiddleware");

const {
  createPaymentSchema,
  updatePaymentSchema,
} = require("../validations/paymentValidation");

const { PERMISSIONS } = require("../utils/permissions");

const router = express.Router();

// Set organization context
const setOrganization = (req, res, next) => {
  req.headers["x-organization-id"] =
    req.params.organizationId;

  next();
};

// =====================================
// PAYMENT STATS
// GET /:organizationId/payments/stats
// =====================================

router.get(
  "/:organizationId/payments/stats",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.PAYMENT_VIEW),
  paymentStats
);

// =====================================
// GET ALL PAYMENTS
// =====================================

router.get(
  "/:organizationId/payments",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.PAYMENT_VIEW),
  getPayments
);

// =====================================
// CREATE PAYMENT
// =====================================

router.post(
  "/:organizationId/payments",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.PAYMENT_CREATE),
  validate(createPaymentSchema),
  createPaymentController
);

// =====================================
// GET SINGLE PAYMENT
// =====================================

router.get(
  "/:organizationId/payments/:paymentId",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.PAYMENT_VIEW),
  getPayment
);

// =====================================
// UPDATE PAYMENT
// =====================================

router.put(
  "/:organizationId/payments/:paymentId",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.PAYMENT_UPDATE),
  validate(updatePaymentSchema),
  updatePaymentController
);

// =====================================
// REFUND PAYMENT
// =====================================

router.post(
  "/:organizationId/payments/:paymentId/refund",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.PAYMENT_REFUND),
  refundPaymentController
);

// =====================================
// CANCEL PAYMENT
// =====================================

router.post(
  "/:organizationId/payments/:paymentId/cancel",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.PAYMENT_UPDATE),
  cancelPaymentController
);

module.exports = router;