
const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const requirePermission = require("../middleware/permissionMiddleware");
const validate = require("../middleware/validationMiddleware");

const {
  createInventorySchema,
  updateInventorySchema,
  stockMovementSchema,
  stockAdjustmentSchema,
} = require("../validations/inventoryValidation");

const { PERMISSIONS } = require("../utils/permissions");

const {
  createInventoryController,
  getInventoryController,
  getInventoryByIdController,
  updateInventoryController,
  stockInController,
  stockOutController,
  adjustStockController,
  getStockHistoryController,
  getInventoryStatsController,
  deleteInventoryController,
} = require("../controllers/inventoryController");

const setOrganization = (req, res, next) => {
  req.headers["x-organization-id"] =
    req.params.organizationId;
  next();
};

const base = "/:organizationId/inventory";

// Stats
router.get(
  `${base}/stats`,
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.INVENTORY_VIEW),
  getInventoryStatsController
);

// Low stock
router.get(
  `${base}/low-stock`,
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.INVENTORY_VIEW),
  (req, res, next) => {
    req.query.lowStock = "true";
    next();
  },
  getInventoryController
);

// Stock history
router.get(
  `${base}/:inventoryId/history`,
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.INVENTORY_VIEW),
  getStockHistoryController
);

// Stock in
router.post(
  `${base}/:inventoryId/stock-in`,
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.INVENTORY_UPDATE),
  validate(stockMovementSchema),
  stockInController
);

// Stock out
router.post(
  `${base}/:inventoryId/stock-out`,
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.INVENTORY_UPDATE),
  validate(stockMovementSchema),
  stockOutController
);

// Stock adjustment
router.patch(
  `${base}/:inventoryId/adjust`,
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.INVENTORY_UPDATE),
  validate(stockAdjustmentSchema),
  adjustStockController
);

// List inventory
router.get(
  base,
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.INVENTORY_VIEW),
  getInventoryController
);

// Create inventory
router.post(
  base,
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.INVENTORY_CREATE),
  validate(createInventorySchema),
  createInventoryController
);

// Get single item
router.get(
  `${base}/:inventoryId`,
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.INVENTORY_VIEW),
  getInventoryByIdController
);

// Update item
router.put(
  `${base}/:inventoryId`,
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.INVENTORY_UPDATE),
  validate(updateInventorySchema),
  updateInventoryController
);

// Delete item
router.delete(
  `${base}/:inventoryId`,
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.INVENTORY_DELETE),
  deleteInventoryController
);

module.exports = router;