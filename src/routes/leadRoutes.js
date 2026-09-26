const express = require("express");

// =====================================
// CONTROLLER
// =====================================

const {
  createLeadController,
  getLeads,
  getLead,
  updateLeadController,
  updateLeadStatus,
  removeLead,
  leadStats,
} = require("../controllers/leadController");

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
  LEAD_CREATE,
  LEAD_VIEW,
  LEAD_UPDATE,
  LEAD_DELETE,
} = require("../utils/permissions");

// =====================================
// VALIDATION SCHEMAS
// =====================================

const {
  createLeadSchema,
  updateLeadSchema,
  updateLeadStatusSchema,
} = require("../validations/leadValidation");

// =====================================
// ROUTER
// =====================================

const router = express.Router();

// =====================================
// TENANT MIDDLEWARE HELPER
// =====================================

const setOrganization = (req, res, next) => {
  req.headers["x-organization-id"] =
    req.params.organizationId;

  next();
};

// =====================================
// GET LEAD STATISTICS
// =====================================

/*
|--------------------------------------------------------------------------
| GET LEAD STATISTICS
|--------------------------------------------------------------------------
|
| GET /api/organizations/:organizationId/leads/stats
|
*/

router.get(
  "/:organizationId/leads/stats",

  protect,

  setOrganization,

  tenantMiddleware,

  requirePermission(LEAD_VIEW),

  leadStats
);

// =====================================
// GET ALL LEADS
// =====================================

/*
|--------------------------------------------------------------------------
| GET ALL LEADS
|--------------------------------------------------------------------------
|
| GET /api/organizations/:organizationId/leads
|
| Optional query:
|
| ?status=new
| ?source=facebook
| ?priority=high
| ?assignedTo=USER_ID
| ?search=john
|
*/

router.get(
  "/:organizationId/leads",

  protect,

  setOrganization,

  tenantMiddleware,

  requirePermission(LEAD_VIEW),

  getLeads
);

// =====================================
// CREATE LEAD
// =====================================

/*
|--------------------------------------------------------------------------
| CREATE LEAD
|--------------------------------------------------------------------------
|
| POST /api/organizations/:organizationId/leads
|
*/

router.post(
  "/:organizationId/leads",

  protect,

  setOrganization,

  tenantMiddleware,

  requirePermission(LEAD_CREATE),

  validate(createLeadSchema),

  createLeadController
);

// =====================================
// GET SINGLE LEAD
// =====================================

/*
|--------------------------------------------------------------------------
| GET SINGLE LEAD
|--------------------------------------------------------------------------
|
| GET /api/organizations/:organizationId/leads/:leadId
|
*/

router.get(
  "/:organizationId/leads/:leadId",

  protect,

  setOrganization,

  tenantMiddleware,

  requirePermission(LEAD_VIEW),

  getLead
);

// =====================================
// UPDATE LEAD
// =====================================

/*
|--------------------------------------------------------------------------
| UPDATE LEAD
|--------------------------------------------------------------------------
|
| PUT /api/organizations/:organizationId/leads/:leadId
|
*/

router.put(
  "/:organizationId/leads/:leadId",

  protect,

  setOrganization,

  tenantMiddleware,

  requirePermission(LEAD_UPDATE),

  validate(updateLeadSchema),

  updateLeadController
);

// =====================================
// CHANGE LEAD STATUS
// =====================================

/*
|--------------------------------------------------------------------------
| UPDATE LEAD STATUS
|--------------------------------------------------------------------------
|
| PATCH /api/organizations/:organizationId/leads/:leadId/status
|
*/

router.patch(
  "/:organizationId/leads/:leadId/status",

  protect,

  setOrganization,

  tenantMiddleware,

  requirePermission(LEAD_UPDATE),

  validate(updateLeadStatusSchema),

  updateLeadStatus
);

// =====================================
// DELETE / ARCHIVE LEAD
// =====================================

/*
|--------------------------------------------------------------------------
| DELETE LEAD
|--------------------------------------------------------------------------
|
| DELETE /api/organizations/:organizationId/leads/:leadId
|
*/

router.delete(
  "/:organizationId/leads/:leadId",

  protect,

  setOrganization,

  tenantMiddleware,

  requirePermission(LEAD_DELETE),

  removeLead
);

// =====================================
// EXPORT
// =====================================

module.exports = router;