
const express = require("express");

const {
  createExpenseController,
  getExpenses,
  getExpense,
  updateExpenseController,
  removeExpense,
  expenseStats,
} = require("../controllers/expenseController");

const protect = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const requirePermission = require("../middleware/permissionMiddleware");
const validate = require("../middleware/validationMiddleware");

const {
  createExpenseSchema,
  updateExpenseSchema,
} = require("../validations/expenseValidation");

const { PERMISSIONS } = require("../utils/permissions");

const router = express.Router();

const setOrganization = (req, res, next) => {
  req.headers["x-organization-id"] =
    req.params.organizationId;

  next();
};

// Stats
router.get(
  "/:organizationId/expenses/stats",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.EXPENSE_VIEW),
  expenseStats
);

// Get all
router.get(
  "/:organizationId/expenses",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.EXPENSE_VIEW),
  getExpenses
);

// Create
router.post(
  "/:organizationId/expenses",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.EXPENSE_CREATE),
  validate(createExpenseSchema),
  createExpenseController
);

// Get single
router.get(
  "/:organizationId/expenses/:expenseId",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.EXPENSE_VIEW),
  getExpense
);

// Update
router.put(
  "/:organizationId/expenses/:expenseId",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.EXPENSE_UPDATE),
  validate(updateExpenseSchema),
  updateExpenseController
);

// Delete
router.delete(
  "/:organizationId/expenses/:expenseId",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.EXPENSE_DELETE),
  removeExpense
);

module.exports = router;