const express = require("express");

const {
  createBookingController,
  getBookings,
  getBooking,
  updateBookingController,
  removeBooking,
  bookingStats,
} = require("../controllers/bookingController");

const protect = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const requirePermission = require("../middleware/permissionMiddleware");
const validate = require("../middleware/validationMiddleware");

const {
  createBookingSchema,
  updateBookingSchema,
} = require("../validations/bookingValidation");

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
// BOOKING STATS
// =====================================

router.get(
  "/:organizationId/bookings/stats",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.BOOKING_VIEW),
  bookingStats
);

// =====================================
// GET ALL BOOKINGS
// =====================================

router.get(
  "/:organizationId/bookings",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.BOOKING_VIEW),
  getBookings
);

// =====================================
// CREATE BOOKING
// =====================================

router.post(
  "/:organizationId/bookings",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.BOOKING_CREATE),
  validate(createBookingSchema),
  createBookingController
);

// =====================================
// GET SINGLE BOOKING
// =====================================

router.get(
  "/:organizationId/bookings/:bookingId",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.BOOKING_VIEW),
  getBooking
);

// =====================================
// UPDATE BOOKING
// =====================================

router.put(
  "/:organizationId/bookings/:bookingId",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.BOOKING_UPDATE),
  validate(updateBookingSchema),
  updateBookingController
);

// =====================================
// CANCEL BOOKING
// =====================================

router.delete(
  "/:organizationId/bookings/:bookingId",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.BOOKING_DELETE),
  removeBooking
);

module.exports = router;