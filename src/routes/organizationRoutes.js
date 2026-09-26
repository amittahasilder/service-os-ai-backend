// =====================================
// ORGANIZATION / BUSINESS ROUTES
// ServiceOS
// =====================================

const express = require("express");

// =====================================
// CONTROLLERS
// =====================================

const {
  createBusiness,
  getMyBusinesses,
  getBusiness,
  updateBusiness,
  deactivateBusiness,
} = require("../controllers/organizationController");

// =====================================
// MIDDLEWARE
// =====================================

const protect = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const authorize = require("../middleware/roleMiddleware");

// =====================================
// UTILS
// =====================================

const router = express.Router();

// =====================================
// ORGANIZATION / BUSINESS ROUTES
// =====================================


/*
|--------------------------------------------------------------------------
| CREATE BUSINESS
|--------------------------------------------------------------------------
| Any authenticated user can create a business.
|
| POST /api/organizations
|
*/

router.post(
  "/",
  protect,
  createBusiness
);


/*
|--------------------------------------------------------------------------
| GET MY BUSINESSES
|--------------------------------------------------------------------------
| Get all businesses where the logged-in user is a member.
|
| GET /api/organizations
|
*/

router.get(
  "/",
  protect,
  getMyBusinesses
);


/*
|--------------------------------------------------------------------------
| TENANT SECURITY TEST
|--------------------------------------------------------------------------
| Temporary route for testing:
| - Authentication
| - Organization membership
| - Tenant isolation
|
| GET /api/organizations/:organizationId/context
|
*/

router.get(
  "/:organizationId/context",

  protect,

  // Put organization ID into request header
  (req, res, next) => {
    req.headers["x-organization-id"] =
      req.params.organizationId;

    next();
  },

  tenantMiddleware,

  (req, res) => {
    res.status(200).json({
      success: true,

      message: "Tenant access granted",

      data: {
        userId: req.user._id,

        organization: req.organization,

        membership: {
          role: req.organizationRole,
          status: req.membership.status,
        },
      },
    });
  }
);


/*
|--------------------------------------------------------------------------
| GET SINGLE BUSINESS
|--------------------------------------------------------------------------
| User must belong to the selected business.
|
| GET /api/organizations/:organizationId
|
*/

router.get(
  "/:organizationId",

  protect,

  // Convert URL organizationId
  // into tenant context
  (req, res, next) => {
    req.headers["x-organization-id"] =
      req.params.organizationId;

    next();
  },

  tenantMiddleware,

  getBusiness
);


/*
|--------------------------------------------------------------------------
| UPDATE BUSINESS
|--------------------------------------------------------------------------
| Only owner/admin can update business.
|
| PUT /api/organizations/:organizationId
|
*/

router.put(
  "/:organizationId",

  protect,

  (req, res, next) => {
    req.headers["x-organization-id"] =
      req.params.organizationId;

    next();
  },

  tenantMiddleware,

  authorize("owner", "admin"),

  updateBusiness
);


/*
|--------------------------------------------------------------------------
| DEACTIVATE BUSINESS
|--------------------------------------------------------------------------
| Only owner can deactivate a business.
|
| PATCH /api/organizations/:organizationId/deactivate
|
*/

router.patch(
  "/:organizationId/deactivate",

  protect,

  (req, res, next) => {
    req.headers["x-organization-id"] =
      req.params.organizationId;

    next();
  },

  tenantMiddleware,

  authorize("owner"),

  deactivateBusiness
);


// =====================================
// EXPORT ROUTER
// =====================================

module.exports = router;