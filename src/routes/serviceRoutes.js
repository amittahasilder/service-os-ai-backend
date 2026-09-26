const express = require("express");

const {
  createServiceController,
  getServices,
  getService,
  updateServiceController,
  removeService,
  serviceStats,
} = require("../controllers/serviceController");

const protect = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const requirePermission = require("../middleware/permissionMiddleware");
const validate = require("../middleware/validate");

const {
  createServiceSchema,
  updateServiceSchema,
} = require("../validations/serviceValidation");

const {
  PERMISSIONS,
} = require("../utils/permissions");

const router = express.Router();

// =====================================
// SET ORGANIZATION
// =====================================

const setOrganization = (req, res, next) => {
  req.headers["x-organization-id"] =
    req.params.organizationId;

  next();
};

// =====================================
// SERVICE STATS
// =====================================

router.get(
  "/:organizationId/services/stats",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.SERVICE_VIEW),
  serviceStats
);

// =====================================
// GET ALL SERVICES
// =====================================

router.get(
  "/:organizationId/services",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.SERVICE_VIEW),
  getServices
);

// =====================================
// CREATE SERVICE
// =====================================

router.post(
  "/:organizationId/services",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.SERVICE_CREATE),
  validate(createServiceSchema),
  createServiceController
);

// =====================================
// GET SINGLE SERVICE
// =====================================

router.get(
  "/:organizationId/services/:serviceId",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.SERVICE_VIEW),
  getService
);

// =====================================
// UPDATE SERVICE
// =====================================

router.put(
  "/:organizationId/services/:serviceId",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.SERVICE_UPDATE),
  validate(updateServiceSchema),
  updateServiceController
);

// =====================================
// DELETE / ARCHIVE SERVICE
// =====================================

router.delete(
  "/:organizationId/services/:serviceId",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.SERVICE_DELETE),
  removeService
);

// =====================================
// EXPORT
// =====================================

module.exports = router;