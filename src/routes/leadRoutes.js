const express = require("express");

const {
  createLeadController,
  getLeads,
  getLead,
  updateLeadController,
  updateLeadStatus,
  removeLead,
  leadStats,
} = require("../controllers/leadController");

const protect = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const requirePermission = require("../middleware/permissionMiddleware");
const validate = require("../middleware/validationMiddleware");

const { PERMISSIONS } = require("../utils/permissions");

const {
  createLeadSchema,
  updateLeadSchema,
  updateLeadStatusSchema,
} = require("../validations/leadValidation");

const router = express.Router();

// =====================================================
// LEAD STATS
// =====================================================

router.get(
  "/:organizationId/leads/stats",
  protect,
  tenantMiddleware,
  requirePermission(PERMISSIONS.LEAD_VIEW),
  leadStats
);

// =====================================================
// GET ALL LEADS
// =====================================================

router.get(
  "/:organizationId/leads",
  protect,
  tenantMiddleware,
  requirePermission(PERMISSIONS.LEAD_VIEW),
  getLeads
);

// =====================================================
// CREATE LEAD
// =====================================================

router.post(
  "/:organizationId/leads",
  protect,
  tenantMiddleware,
  requirePermission(PERMISSIONS.LEAD_CREATE),
  validate(createLeadSchema),
  createLeadController
);

// =====================================================
// GET SINGLE LEAD
// =====================================================

router.get(
  "/:organizationId/leads/:leadId",
  protect,
  tenantMiddleware,
  requirePermission(PERMISSIONS.LEAD_VIEW),
  getLead
);

// =====================================================
// UPDATE LEAD
// =====================================================

router.put(
  "/:organizationId/leads/:leadId",
  protect,
  tenantMiddleware,
  requirePermission(PERMISSIONS.LEAD_UPDATE),
  validate(updateLeadSchema),
  updateLeadController
);

// =====================================================
// UPDATE LEAD STATUS
// =====================================================

router.patch(
  "/:organizationId/leads/:leadId/status",
  protect,
  tenantMiddleware,
  requirePermission(PERMISSIONS.LEAD_UPDATE),
  validate(updateLeadStatusSchema),
  updateLeadStatus
);

// =====================================================
// DELETE / ARCHIVE LEAD
// =====================================================

router.delete(
  "/:organizationId/leads/:leadId",
  protect,
  tenantMiddleware,
  requirePermission(PERMISSIONS.LEAD_DELETE),
  removeLead
);

module.exports = router;