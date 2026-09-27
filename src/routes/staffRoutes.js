const express = require("express");

const {
  createStaffController,
  getStaff,
  getStaffMember,
  updateStaffController,
  removeStaff,
  staffStats,
} = require("../controllers/staffController");

const protect = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const requirePermission = require("../middleware/permissionMiddleware");
const validate = require("../middleware/validationMiddleware");

const {
  createStaffSchema,
  updateStaffSchema,
} = require("../validations/staffValidation");

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
// STAFF STATS
// =====================================

router.get(
  "/:organizationId/staff/stats",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.STAFF_VIEW),
  staffStats
);

// =====================================
// GET ALL STAFF
// =====================================

router.get(
  "/:organizationId/staff",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.STAFF_VIEW),
  getStaff
);

// =====================================
// CREATE STAFF
// =====================================

router.post(
  "/:organizationId/staff",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.STAFF_CREATE),
  validate(createStaffSchema),
  createStaffController
);

// =====================================
// GET SINGLE STAFF
// =====================================

router.get(
  "/:organizationId/staff/:staffId",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.STAFF_VIEW),
  getStaffMember
);

// =====================================
// UPDATE STAFF
// =====================================

router.put(
  "/:organizationId/staff/:staffId",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.STAFF_UPDATE),
  validate(updateStaffSchema),
  updateStaffController
);

// =====================================
// DELETE / ARCHIVE STAFF
// =====================================

router.delete(
  "/:organizationId/staff/:staffId",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.STAFF_DELETE),
  removeStaff
);

module.exports = router;