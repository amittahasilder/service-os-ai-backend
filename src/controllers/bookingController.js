const {
  createBooking,
  getOrganizationBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getBookingStats,
} = require("../services/bookingService");

// =====================================
// CREATE BOOKING
// =====================================

const createBookingController = async (req, res, next) => {
  try {
    const booking = await createBooking({
      organizationId: req.organizationId,
      userId: req.user._id,
      data: req.validatedData,
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// GET ALL BOOKINGS
// =====================================

const getBookings = async (req, res, next) => {
  try {
    const bookings = await getOrganizationBookings({
      organizationId: req.organizationId,
      query: req.query,
    });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// GET SINGLE BOOKING
// =====================================

const getBooking = async (req, res, next) => {
  try {
    const booking = await getBookingById({
      organizationId: req.organizationId,
      bookingId: req.params.bookingId,
    });

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// UPDATE BOOKING
// =====================================

const updateBookingController = async (req, res, next) => {
  try {
    const booking = await updateBooking({
      organizationId: req.organizationId,
      bookingId: req.params.bookingId,
      data: req.validatedData,
    });

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// CANCEL BOOKING
// =====================================

const removeBooking = async (req, res, next) => {
  try {
    const booking = await deleteBooking({
      organizationId: req.organizationId,
      bookingId: req.params.bookingId,
    });

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// BOOKING STATS
// =====================================

const bookingStats = async (req, res, next) => {
  try {
    const stats = await getBookingStats({
      organizationId: req.organizationId,
    });

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// EXPORT
// =====================================

module.exports = {
  createBookingController,
  getBookings,
  getBooking,
  updateBookingController,
  removeBooking,
  bookingStats,
};