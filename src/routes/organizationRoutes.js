// =====================================
// ORGANIZATION / BUSINESS ROUTES
// ServiceOS
// =====================================

const express = require("express");

// =====================================
// ORGANIZATION CONTROLLERS
// =====================================

const {
  createBusiness,
  getMyBusinesses,
  getBusiness,
  updateBusiness,
  deactivateBusiness,
} = require("../controllers/organizationController");

// =====================================
// ORGANIZATION MEMBER CONTROLLERS
// =====================================

const {
  getMembers,
  addMember,
  updateMemberRole,
  removeMember,
} = require("../controllers/organizationMemberController");

// =====================================
// MIDDLEWARE
// =====================================

const protect = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const authorize = require("../middleware/roleMiddleware");

// =====================================
// ROUTER
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
| Get all businesses where the logged-in user
| is an active member.
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
|
| - Authentication
| - Organization membership
| - Tenant isolation
| - Organization role
|
| GET /api/organizations/:organizationId/context
|
*/

router.get(
  "/:organizationId/context",

  protect,

  // -------------------------------------
  // Set organization ID
  // -------------------------------------

  (req, res, next) => {
    req.headers["x-organization-id"] =
      req.params.organizationId;

    next();
  },

  tenantMiddleware,

  // -------------------------------------
  // Response
  // -------------------------------------

  (req, res) => {
    res.status(200).json({
      success: true,

      message: "Tenant access granted",

      data: {
        userId: req.user._id,

        organization: req.organization,

        membership: {
          id: req.membership._id,
          role: req.organizationRole,
          status: req.membership.status,
          joinedAt: req.membership.joinedAt,
        },
      },
    });
  }
);


/*
|--------------------------------------------------------------------------
| GET SINGLE BUSINESS
|--------------------------------------------------------------------------
|
| GET /api/organizations/:organizationId
|
*/

router.get(
  "/:organizationId",

  protect,

  // -------------------------------------
  // Set organization ID
  // -------------------------------------

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

  // -------------------------------------
  // Set organization ID
  // -------------------------------------

  (req, res, next) => {
    req.headers["x-organization-id"] =
      req.params.organizationId;

    next();
  },

  tenantMiddleware,

  // -------------------------------------
  // RBAC
  // -------------------------------------

  authorize(
    "owner",
    "admin"
  ),

  updateBusiness
);


/*
|--------------------------------------------------------------------------
| DEACTIVATE BUSINESS
|--------------------------------------------------------------------------
| Only owner can deactivate business.
|
| PATCH /api/organizations/:organizationId/deactivate
|
*/

router.patch(
  "/:organizationId/deactivate",

  protect,

  // -------------------------------------
  // Set organization ID
  // -------------------------------------

  (req, res, next) => {
    req.headers["x-organization-id"] =
      req.params.organizationId;

    next();
  },

  tenantMiddleware,

  // -------------------------------------
  // RBAC
  // -------------------------------------

  authorize("owner"),

  deactivateBusiness
);


// =====================================
// ORGANIZATION MEMBER ROUTES
// =====================================


/*
|--------------------------------------------------------------------------
| GET ORGANIZATION MEMBERS
|--------------------------------------------------------------------------
| All active members can view members.
|
| GET /api/organizations/:organizationId/members
|
*/

router.get(
  "/:organizationId/members",

  protect,

  // -------------------------------------
  // Set organization ID
  // -------------------------------------

  (req, res, next) => {
    req.headers["x-organization-id"] =
      req.params.organizationId;

    next();
  },

  tenantMiddleware,

  getMembers
);


/*
|--------------------------------------------------------------------------
| ADD ORGANIZATION MEMBER
|--------------------------------------------------------------------------
| Only owner/admin can add members.
|
| POST /api/organizations/:organizationId/members
|
| Body:
|
| {
|   "email": "user@example.com",
|   "role": "staff"
| }
|
*/

router.post(
  "/:organizationId/members",

  protect,

  // -------------------------------------
  // Set organization ID
  // -------------------------------------

  (req, res, next) => {
    req.headers["x-organization-id"] =
      req.params.organizationId;

    next();
  },

  tenantMiddleware,

  // -------------------------------------
  // RBAC
  // -------------------------------------

  authorize(
    "owner",
    "admin"
  ),

  addMember
);


/*
|--------------------------------------------------------------------------
| CHANGE MEMBER ROLE
|--------------------------------------------------------------------------
| Only owner/admin can change member role.
|
| PATCH /api/organizations/:organizationId/members/:memberId/role
|
| Body:
|
| {
|   "role": "manager"
| }
|
*/

router.patch(
  "/:organizationId/members/:memberId/role",

  protect,

  // -------------------------------------
  // Set organization ID
  // -------------------------------------

  (req, res, next) => {
    req.headers["x-organization-id"] =
      req.params.organizationId;

    next();
  },

  tenantMiddleware,

  // -------------------------------------
  // RBAC
  // -------------------------------------

  authorize(
    "owner",
    "admin"
  ),

  updateMemberRole
);


/*
|--------------------------------------------------------------------------
| REMOVE ORGANIZATION MEMBER
|--------------------------------------------------------------------------
| Only owner/admin can remove members.
|
| DELETE /api/organizations/:organizationId/members/:memberId
|
*/

router.delete(
  "/:organizationId/members/:memberId",

  protect,

  // -------------------------------------
  // Set organization ID
  // -------------------------------------

  (req, res, next) => {
    req.headers["x-organization-id"] =
      req.params.organizationId;

    next();
  },

  tenantMiddleware,

  // -------------------------------------
  // RBAC
  // -------------------------------------

  authorize(
    "owner",
    "admin"
  ),

  removeMember
);


// =====================================
// EXPORT ROUTER
// =====================================

module.exports = router;