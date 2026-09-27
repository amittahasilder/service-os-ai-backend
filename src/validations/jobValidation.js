const { z } = require("zod");

// =====================================
// CREATE JOB VALIDATION
// =====================================

const createJobSchema = z.object({
  booking: z.string().min(1, "Booking ID is required"),

  customer: z.string().min(1, "Customer ID is required"),

  service: z.string().min(1, "Service ID is required"),

  staff: z.string().min(1, "Staff ID is required").optional(),

  title: z
    .string()
    .trim()
    .min(2, "Job title must be at least 2 characters")
    .max(200, "Job title cannot exceed 200 characters"),

  description: z
    .string()
    .trim()
    .max(3000, "Description cannot exceed 3000 characters")
    .optional(),

  scheduledDate: z
    .string()
    .min(1, "Scheduled date is required"),

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
      "assigned",
      "in_progress",
      "completed",
      "cancelled",
    ])
    .optional(),

  priority: z
    .enum(["low", "medium", "high", "urgent"])
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
    .min(0, "Tax rate cannot be negative")
    .max(100, "Tax rate cannot exceed 100")
    .optional(),

  notes: z
    .string()
    .trim()
    .max(3000, "Notes cannot exceed 3000 characters")
    .optional(),
});

// =====================================
// UPDATE JOB VALIDATION
// =====================================

const updateJobSchema = createJobSchema
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
  createJobSchema,
  updateJobSchema,
};