
const mongoose = require("mongoose");

const Booking = require("../models/Booking");
const Customer = require("../models/Customer");
const Service = require("../models/Service");
const Staff = require("../models/Staff");

// =====================================
// COMMON HELPERS
// =====================================

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateObjectId = (id, field = "ID") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError(`Invalid ${field}`, 400);
  }
};

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const populateBooking = (query) =>
  query
    .populate("customer", "name email phone")
    .populate(
      "service",
      "name category price duration durationUnit"
    )
    .populate(
      "staff",
      "name email phone jobTitle role"
    )
    .populate("createdBy", "name email");

const validateBookingDate = (date) => {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    throw createError("Invalid booking date", 400);
  }

  return parsedDate;
};

// =====================================
// DATE RANGE
// =====================================

const getDayRange = (date) => {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);

  return {
    $gte: start,
    $lte: end,
  };
};

// =====================================
// VALIDATE CUSTOMER
// =====================================

const validateCustomer = async ({
  customerId,
  organizationId,
}) => {
  validateObjectId(customerId, "Customer ID");

  const customer = await Customer.findOne({
    _id: customerId,
    organization: organizationId,
    isActive: true,
  });

  if (!customer) {
    throw createError("Customer not found or inactive", 404);
  }

  return customer;
};

// =====================================
// VALIDATE SERVICE
// =====================================

const validateService = async ({
  serviceId,
  organizationId,
}) => {
  validateObjectId(serviceId, "Service ID");

  const service = await Service.findOne({
    _id: serviceId,
    organization: organizationId,
    isActive: true,
    status: "active",
  });

  if (!service) {
    throw createError(
      "Service not found or inactive",
      404
    );
  }

  return service;
};

// =====================================
// VALIDATE STAFF
// =====================================

const validateStaff = async ({
  staffId,
  organizationId,
}) => {
  if (!staffId) return null;

  validateObjectId(staffId, "Staff ID");

  const staff = await Staff.findOne({
    _id: staffId,
    organization: organizationId,
    isActive: true,
    status: "active",
  });

  if (!staff) {
    throw createError(
      "Staff not found or inactive",
      404
    );
  }

  return staff;
};

// =====================================
// PREVENT DOUBLE BOOKING
// =====================================

const checkStaffAvailability = async ({
  organizationId,
  staffId,
  bookingDate,
  startTime,
  endTime,
  excludeBookingId = null,
}) => {
  if (!staffId) return true;

  const filter = {
    organization: organizationId,
    staff: staffId,
    isActive: true,

    bookingDate: getDayRange(bookingDate),

    status: {
      $nin: ["cancelled", "no_show"],
    },

    startTime: {
      $lt: endTime,
    },

    endTime: {
      $gt: startTime,
    },
  };

  if (excludeBookingId) {
    filter._id = {
      $ne: excludeBookingId,
    };
  }

  const existingBooking = await Booking.findOne(filter)
    .select("_id startTime endTime");

  if (existingBooking) {
    throw createError(
      "This staff member already has a booking during this time.",
      409
    );
  }

  return true;
};

// =====================================
// STATUS TRANSITIONS
// =====================================

const allowedStatusTransitions = {
  pending: [
    "confirmed",
    "cancelled",
    "no_show",
  ],

  confirmed: [
    "in_progress",
    "cancelled",
    "no_show",
  ],

  in_progress: [
    "completed",
    "cancelled",
  ],

  completed: [],
  cancelled: [],
  no_show: [],
};

const validateStatusTransition = (
  currentStatus,
  newStatus
) => {
  if (!newStatus || currentStatus === newStatus) {
    return true;
  }

  const allowed =
    allowedStatusTransitions[currentStatus] || [];

  if (!allowed.includes(newStatus)) {
    throw createError(
      `Cannot change booking status from ${currentStatus} to ${newStatus}`,
      400
    );
  }

  return true;
};

// =====================================
// CREATE BOOKING
// =====================================

const createBooking = async ({
  organizationId,
  userId,
  data,
}) => {
  if (!organizationId) {
    throw createError("Organization ID is required");
  }

  if (!userId) {
    throw createError("User ID is required");
  }

  validateObjectId(organizationId, "Organization ID");
  validateObjectId(userId, "User ID");

  // Validate related documents
  await validateCustomer({
    customerId: data.customer,
    organizationId,
  });

  const service = await validateService({
    serviceId: data.service,
    organizationId,
  });

  await validateStaff({
    staffId: data.staff,
    organizationId,
  });

  const bookingDate = validateBookingDate(
    data.bookingDate
  );

  // Prevent overlapping staff bookings
  await checkStaffAvailability({
    organizationId,
    staffId: data.staff,
    bookingDate,
    startTime: data.startTime,
    endTime: data.endTime,
  });

  // Create using trusted server values
  const booking = await Booking.create({
    organization: organizationId,
    createdBy: userId,

    customer: data.customer,
    service: data.service,
    staff: data.staff || undefined,

    bookingDate,
    startTime: data.startTime,
    endTime: data.endTime,

    location: data.location,
    notes: data.notes,

    price: service.price,
    taxRate: 0,
    status: "pending",

    isActive: true,
  });

  return populateBooking(
    Booking.findById(booking._id)
  );
};

// =====================================
// GET ALL BOOKINGS
// =====================================

const getOrganizationBookings = async ({
  organizationId,
  query = {},
}) => {
  if (!organizationId) {
    throw createError("Organization ID is required");
  }

  validateObjectId(organizationId, "Organization ID");

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
    validateObjectId(staff, "Staff ID");
    filter.staff = staff;
  }

  if (customer) {
    validateObjectId(customer, "Customer ID");
    filter.customer = customer;
  }

  if (service) {
    validateObjectId(service, "Service ID");
    filter.service = service;
  }

  if (date) {
    filter.bookingDate = getDayRange(
      validateBookingDate(date)
    );
  }

  // Search related documents
  if (search) {
    const searchText = String(search).trim();

    if (searchText.length > 100) {
      throw createError("Search query is too long");
    }

    const regex = new RegExp(
      escapeRegex(searchText),
      "i"
    );

    const [customerIds, serviceIds, staffIds] =
      await Promise.all([
        Customer.find({
          organization: organizationId,
          isActive: true,
          $or: [
            { name: regex },
            { email: regex },
            { phone: regex },
          ],
        }).distinct("_id"),

        Service.find({
          organization: organizationId,
          isActive: true,
          $or: [
            { name: regex },
            { category: regex },
          ],
        }).distinct("_id"),

        Staff.find({
          organization: organizationId,
          isActive: true,
          $or: [
            { name: regex },
            { email: regex },
            { jobTitle: regex },
          ],
        }).distinct("_id"),
      ]);

    filter.$or = [
      { customer: { $in: customerIds } },
      { service: { $in: serviceIds } },
      { staff: { $in: staffIds } },
      { notes: regex },
    ];
  }

  const bookings = await populateBooking(
    Booking.find(filter).sort({
      bookingDate: 1,
      startTime: 1,
    })
  );

  return bookings;
};

// =====================================
// GET SINGLE BOOKING
// =====================================

const getBookingById = async ({
  organizationId,
  bookingId,
}) => {
  if (!organizationId || !bookingId) {
    throw createError(
      "Organization ID and Booking ID are required"
    );
  }

  validateObjectId(bookingId, "Booking ID");

  const booking = await populateBooking(
    Booking.findOne({
      _id: bookingId,
      organization: organizationId,
      isActive: true,
    })
  );

  if (!booking) {
    throw createError("Booking not found", 404);
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
  if (!organizationId || !bookingId) {
    throw createError(
      "Organization ID and Booking ID are required"
    );
  }

  validateObjectId(bookingId, "Booking ID");

  const existingBooking = await Booking.findOne({
    _id: bookingId,
    organization: organizationId,
    isActive: true,
  });

  if (!existingBooking) {
    throw createError("Booking not found", 404);
  }

  // Completed, cancelled, and no-show bookings
  // cannot be edited.
  if (
    ["completed", "cancelled", "no_show"].includes(
      existingBooking.status
    )
  ) {
    throw createError(
      "This booking can no longer be updated",
      400
    );
  }

  if (data.status) {
    validateStatusTransition(
      existingBooking.status,
      data.status
    );
  }

  if (data.customer) {
    await validateCustomer({
      customerId: data.customer,
      organizationId,
    });
  }

  let updatedService = null;

  if (data.service) {
    updatedService = await validateService({
      serviceId: data.service,
      organizationId,
    });
  }

  if (
    Object.prototype.hasOwnProperty.call(
      data,
      "staff"
    )
  ) {
    await validateStaff({
      staffId: data.staff,
      organizationId,
    });
  }

  if (data.bookingDate) {
    data.bookingDate = validateBookingDate(
      data.bookingDate
    );
  }

  // Resolve final values, including unchanged fields
  const finalBookingDate =
    data.bookingDate || existingBooking.bookingDate;

  const finalStartTime =
    data.startTime || existingBooking.startTime;

  const finalEndTime =
    data.endTime || existingBooking.endTime;

  const finalStaff =
    Object.prototype.hasOwnProperty.call(
      data,
      "staff"
    )
      ? data.staff
      : existingBooking.staff;

  if (finalStartTime >= finalEndTime) {
    throw createError(
      "End time must be after start time",
      400
    );
  }

  await checkStaffAvailability({
    organizationId,
    staffId: finalStaff,
    bookingDate: finalBookingDate,
    startTime: finalStartTime,
    endTime: finalEndTime,
    excludeBookingId: bookingId,
  });

  // Build a safe update object
  const updateData = {
    ...data,
  };

  delete updateData.organization;
  delete updateData.createdBy;
  delete updateData.isActive;
  delete updateData._id;
  delete updateData.price;
  delete updateData.taxRate;

  // Recalculate price if service changes
  if (updatedService) {
    updateData.price = updatedService.price;
    updateData.taxRate = 0;
  }

  const booking = await populateBooking(
    Booking.findOneAndUpdate(
      {
        _id: bookingId,
        organization: organizationId,
        isActive: true,
      },
      {
        $set: updateData,
      },
      {
        new: true,
        runValidators: true,
      }
    )
  );

  if (!booking) {
    throw createError("Booking not found", 404);
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
  if (!organizationId || !bookingId) {
    throw createError(
      "Organization ID and Booking ID are required"
    );
  }

  validateObjectId(bookingId, "Booking ID");

  const existingBooking = await Booking.findOne({
    _id: bookingId,
    organization: organizationId,
    isActive: true,
  });

  if (!existingBooking) {
    throw createError("Booking not found", 404);
  }

  if (
    ["completed", "cancelled", "no_show"].includes(
      existingBooking.status
    )
  ) {
    throw createError(
      "This booking cannot be cancelled",
      400
    );
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
      runValidators: true,
    }
  );

  return booking;
};

// =====================================
// BOOKING STATS
// =====================================

const getBookingStats = async ({
  organizationId,
}) => {
  if (!organizationId) {
    throw createError("Organization ID is required");
  }

  validateObjectId(organizationId, "Organization ID");

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