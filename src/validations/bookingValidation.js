const { z } = require("zod");

// =====================================
// CREATE BOOKING
// =====================================

const createBookingSchema = z.object({
  customer: z
    .string()
    .min(1, "Customer ID is required"),

  service: z
    .string()
    .min(1, "Service ID is required"),

  staff: z
    .string()
    .min(1, "Staff ID is required")
    .optional(),

  bookingDate: z
    .string()
    .min(1, "Booking date is required"),

  startTime: z
    .string()
    .min(1, "Start time is required")
    .max(20),

  endTime: z
    .string()
    .min(1, "End time is required")
    .max(20),

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

  location: z
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
    .optional(),

  price: z
    .number()
    .min(0, "Price cannot be negative"),

  taxRate: z
    .number()
    .min(0)
    .max(100)
    .optional(),

  notes: z
    .string()
    .trim()
    .max(2000)
    .optional(),
});

// =====================================
// UPDATE BOOKING
// =====================================

const updateBookingSchema = createBookingSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field is required for update",
    }
  );

// =====================================
// EXPORT
// =====================================

module.exports = {
  createBookingSchema,
  updateBookingSchema,
};