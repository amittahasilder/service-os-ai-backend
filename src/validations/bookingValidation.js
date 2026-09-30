
const { z } = require("zod");

// =====================================
// COMMON VALIDATION HELPERS
// =====================================

// MongoDB ObjectId validation
const objectIdSchema = z
  .string()
  .regex(
    /^[0-9a-fA-F]{24}$/,
    "Invalid MongoDB ID"
  );

// ISO Date validation
const bookingDateSchema = z
  .string()
  .datetime({
    offset: true,
    message: "Booking date must be a valid ISO datetime",
  });

// Time validation: HH:mm (24-hour format)
const timeSchema = z
  .string()
  .regex(
    /^([01]\d|2[0-3]):[0-5]\d$/,
    "Time must be in HH:mm format (e.g. 09:30)"
  );

// =====================================
// LOCATION VALIDATION
// =====================================

const locationSchema = z
  .object({
    address: z
      .string()
      .trim()
      .max(500)
      .optional(),

    city: z
      .string()
      .trim()
      .max(100)
      .optional(),

    postalCode: z
      .string()
      .trim()
      .max(20)
      .optional(),

    notes: z
      .string()
      .trim()
      .max(1000)
      .optional(),
  })
  .strict();

// =====================================
// CREATE BOOKING
// =====================================

const createBookingSchema = z
  .object({
    // Customer ID
    customer: objectIdSchema,

    // Service ID
    service: objectIdSchema,

    // Staff ID (optional)
    staff: objectIdSchema.optional(),

    // Booking date
    bookingDate: bookingDateSchema,

    // Start time
    startTime: timeSchema,

    // End time
    endTime: timeSchema,

    // Location
    location: locationSchema.optional(),

    // Additional notes
    notes: z
      .string()
      .trim()
      .max(2000)
      .optional(),
  })
  .strict()
  .refine(
    (data) => data.startTime < data.endTime,
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );

// =====================================
// UPDATE BOOKING
// =====================================

const updateBookingSchema = z
  .object({
    customer: objectIdSchema.optional(),

    service: objectIdSchema.optional(),

    staff: objectIdSchema.nullable().optional(),

    bookingDate: bookingDateSchema.optional(),

    startTime: timeSchema.optional(),

    endTime: timeSchema.optional(),

    status: z
      .enum([
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ])
      .optional(),

    location: locationSchema.optional(),

    notes: z
      .string()
      .trim()
      .max(2000)
      .optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field is required for update",
    }
  )
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return data.startTime < data.endTime;
      }

      return true;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );

// =====================================
// EXPORT
// =====================================

module.exports = {
  createBookingSchema,
  updateBookingSchema,
};