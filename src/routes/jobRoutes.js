const express = require("express");

// Controllers
const {
  createJobController,
  getJobs,
  getJob,
  updateJobController,
  removeJob,
  jobStats,
} = require("../controllers/jobController");

// Middleware
const protect = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const requirePermission = require("../middleware/permissionMiddleware");
const validate = require("../middleware/validationMiddleware");

// Validation
const {
  createJobSchema,
  updateJobSchema,
} = require("../validations/jobValidation");

// Permissions
const { PERMISSIONS } = require("../utils/permissions");

const router = express.Router();

// =====================================
// ORGANIZATION MIDDLEWARE
// =====================================

const setOrganization = (req, res, next) => {
  req.headers["x-organization-id"] =
    req.params.organizationId;

  next();
};

// =====================================
// JOB STATS
// GET /:organizationId/jobs/stats
// =====================================

router.get(
  "/:organizationId/jobs/stats",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.JOB_VIEW),
  jobStats
);

// =====================================
// GET ALL JOBS
// GET /:organizationId/jobs
// =====================================

router.get(
  "/:organizationId/jobs",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.JOB_VIEW),
  getJobs
);

// =====================================
// CREATE JOB
// POST /:organizationId/jobs
// =====================================

router.post(
  "/:organizationId/jobs",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.JOB_CREATE),
  validate(createJobSchema),
  createJobController
);

// =====================================
// GET SINGLE JOB
// GET /:organizationId/jobs/:jobId
// =====================================

router.get(
  "/:organizationId/jobs/:jobId",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.JOB_VIEW),
  getJob
);

// =====================================
// UPDATE JOB
// PUT /:organizationId/jobs/:jobId
// =====================================

router.put(
  "/:organizationId/jobs/:jobId",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.JOB_UPDATE),
  validate(updateJobSchema),
  updateJobController
);

// =====================================
// DELETE / CANCEL JOB
// DELETE /:organizationId/jobs/:jobId
// =====================================

router.delete(
  "/:organizationId/jobs/:jobId",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.JOB_DELETE),
  removeJob
);

// =====================================
// EXPORT
// =====================================

module.exports = router;