const mongoose = require("mongoose");

const Booking = require("../models/Booking");
const Customer = require("../models/Customer");
const Service = require("../models/Service");
const Staff = require("../models/Staff");

// =====================================
// CREATE BOOKING
// =====================================

const createBooking = async ({
  organizationId,
  userId,
  data,
}) => {
  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  if (!userId) {
    throw new Error("User ID is required");
  }

  // Validate Customer
  const customer = await Customer.findOne({
    _id: data.customer,
    organization: organizationId,
    isActive: true,
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  // Validate Service
  const service = await Service.findOne({
    _id: data.service,
    organization: organizationId,
    isActive: true,
    status: "active",
  });

  if (!service) {
    throw new Error("Service not found or inactive");
  }

  // Validate Staff if provided
  if (data.staff) {
    const staff = await Staff.findOne({
      _id: data.staff,
      organization: organizationId,
      isActive: true,
      status: "active",
    });

    if (!staff) {
      throw new Error("Staff not found or inactive");
    }
  }

  // Prevent invalid booking date
  const bookingDate = new Date(data.bookingDate);

  if (Number.isNaN(bookingDate.getTime())) {
    throw new Error("Invalid booking date");
  }

  const booking = await Booking.create({
    organization: organizationId,
    createdBy: userId,
    ...data,
    bookingDate,
    isActive: true,
  });

  return await Booking.findById(booking._id)
    .populate("customer", "name email phone")
    .populate("service", "name category price duration durationUnit")
    .populate("staff", "name email phone jobTitle role")
    .populate("createdBy", "name email");
};

// =====================================
// GET ALL BOOKINGS
// =====================================

const getOrganizationBookings = async ({
  organizationId,
  query = {},
}) => {
  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  const {
    search,
    status,
    staff,
    customer,
    service,
    date,
  } = query;

  const filter = {
    organization: organizationId,
    isActive: true,
  };

  if (status) {
    filter.status = status;
  }

  if (staff) {
    filter.staff = staff;
  }

  if (customer) {
    filter.customer = customer;
  }

  if (service) {
    filter.service = service;
  }

  if (date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    filter.bookingDate = {
      $gte: startOfDay,
      $lte: endOfDay,
    };
  }

  let bookings = Booking.find(filter)
    .populate("customer", "name email phone")
    .populate("service", "name category price duration durationUnit")
    .populate("staff", "name email phone jobTitle role")
    .populate("createdBy", "name email")
    .sort({
      bookingDate: 1,
      startTime: 1,
    });

  // Basic search
  if (search) {
    const searchRegex = new RegExp(search, "i");

    const [customerIds, serviceIds, staffIds] =
      await Promise.all([
        Customer.find({
          organization: organizationId,
          isActive: true,
          $or: [
            { name: searchRegex },
            { email: searchRegex },
            { phone: searchRegex },
          ],
        }).distinct("_id"),

        Service.find({
          organization: organizationId,
          isActive: true,
          $or: [
            { name: searchRegex },
            { category: searchRegex },
          ],
        }).distinct("_id"),

        Staff.find({
          organization: organizationId,
          isActive: true,
          $or: [
            { name: searchRegex },
            { email: searchRegex },
            { jobTitle: searchRegex },
          ],
        }).distinct("_id"),
      ]);

    filter.$or = [
      { customer: { $in: customerIds } },
      { service: { $in: serviceIds } },
      { staff: { $in: staffIds } },
      { notes: searchRegex },
    ];

    bookings = Booking.find(filter)
      .populate("customer", "name email phone")
      .populate(
        "service",
        "name category price duration durationUnit"
      )
      .populate(
        "staff",
        "name email phone jobTitle role"
      )
      .populate("createdBy", "name email")
      .sort({
        bookingDate: 1,
        startTime: 1,
      });
  }

  return await bookings;
};

// =====================================
// GET SINGLE BOOKING
// =====================================

const getBookingById = async ({
  organizationId,
  bookingId,
}) => {
  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  if (!bookingId) {
    throw new Error("Booking ID is required");
  }

  const booking = await Booking.findOne({
    _id: bookingId,
    organization: organizationId,
    isActive: true,
  })
    .populate("customer", "name email phone")
    .populate("service", "name category price duration durationUnit")
    .populate("staff", "name email phone jobTitle role")
    .populate("createdBy", "name email");

  if (!booking) {
    throw new Error("Booking not found");
  }

  return booking;
};

// =====================================
// UPDATE BOOKING
// =====================================

const updateBooking = async ({
  organizationId,
  bookingId,
  data,
}) => {
  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  if (!bookingId) {
    throw new Error("Booking ID is required");
  }

  // Validate Customer if changing
  if (data.customer) {
    const customer = await Customer.findOne({
      _id: data.customer,
      organization: organizationId,
      isActive: true,
    });

    if (!customer) {
      throw new Error("Customer not found");
    }
  }

  // Validate Service if changing
  if (data.service) {
    const service = await Service.findOne({
      _id: data.service,
      organization: organizationId,
      isActive: true,
      status: "active",
    });

    if (!service) {
      throw new Error("Service not found or inactive");
    }
  }

  // Validate Staff if changing
  if (data.staff) {
    const staff = await Staff.findOne({
      _id: data.staff,
      organization: organizationId,
      isActive: true,
      status: "active",
    });

    if (!staff) {
      throw new Error("Staff not found or inactive");
    }
  }

  // Validate booking date if changing
  if (data.bookingDate) {
    const bookingDate = new Date(data.bookingDate);

    if (Number.isNaN(bookingDate.getTime())) {
      throw new Error("Invalid booking date");
    }

    data.bookingDate = bookingDate;
  }

  const booking = await Booking.findOneAndUpdate(
    {
      _id: bookingId,
      organization: organizationId,
      isActive: true,
    },
    {
      $set: data,
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("customer", "name email phone")
    .populate("service", "name category price duration durationUnit")
    .populate("staff", "name email phone jobTitle role")
    .populate("createdBy", "name email");

  if (!booking) {
    throw new Error("Booking not found");
  }

  return booking;
};

// =====================================
// CANCEL / ARCHIVE BOOKING
// =====================================

const deleteBooking = async ({
  organizationId,
  bookingId,
}) => {
  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  if (!bookingId) {
    throw new Error("Booking ID is required");
  }

  const booking = await Booking.findOneAndUpdate(
    {
      _id: bookingId,
      organization: organizationId,
      isActive: true,
    },
    {
      $set: {
        status: "cancelled",
        isActive: false,
      },
    },
    {
      new: true,
    }
  );

  if (!booking) {
    throw new Error("Booking not found");
  }

  return booking;
};

// =====================================
// BOOKING STATS
// =====================================

const getBookingStats = async ({
  organizationId,
}) => {
  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  const stats = await Booking.aggregate([
    {
      $match: {
        organization: new mongoose.Types.ObjectId(
          organizationId
        ),
        isActive: true,
      },
    },
    {
      $group: {
        _id: "$status",
        count: {
          $sum: 1,
        },
        totalValue: {
          $sum: "$price",
        },
      },
    },
    {
      $sort: {
        count: -1,
      },
    },
  ]);

  const totalBookings = stats.reduce(
    (total, item) => total + item.count,
    0
  );

  const totalValue = stats.reduce(
    (total, item) => total + item.totalValue,
    0
  );

  return {
    totalBookings,
    totalValue,
    byStatus: stats,
  };
};

// =====================================
// EXPORT
// =====================================

module.exports = {
  createBooking,
  getOrganizationBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getBookingStats,
};