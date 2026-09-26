const { z } = require("zod");

// =====================================
// CREATE SERVICE VALIDATION
// =====================================

const createServiceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Service name must be at least 2 characters")
    .max(150, "Service name cannot exceed 150 characters"),

  description: z
    .string()
    .trim()
    .max(2000, "Description cannot exceed 2000 characters")
    .optional(),

  category: z
    .string()
    .trim()
    .max(100, "Category cannot exceed 100 characters")
    .optional(),

  price: z
    .number()
    .min(0, "Price cannot be negative"),

  duration: z
    .number()
    .int("Duration must be a whole number")
    .min(1, "Duration must be at least 1"),

  durationUnit: z
    .enum(["minutes", "hours", "days"])
    .optional(),

  status: z
    .enum(["active", "inactive", "archived"])
    .optional(),

  taxRate: z
    .number()
    .min(0, "Tax rate cannot be negative")
    .max(100, "Tax rate cannot exceed 100")
    .optional(),

  isOnline: z
    .boolean()
    .optional(),

  notes: z
    .string()
    .trim()
    .max(2000, "Notes cannot exceed 2000 characters")
    .optional(),
});

// =====================================
// UPDATE SERVICE VALIDATION
// =====================================

const updateServiceSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Service name must be at least 2 characters")
      .max(150, "Service name cannot exceed 150 characters")
      .optional(),

    description: z
      .string()
      .trim()
      .max(2000, "Description cannot exceed 2000 characters")
      .optional(),

    category: z
      .string()
      .trim()
      .max(100, "Category cannot exceed 100 characters")
      .optional(),

    price: z
      .number()
      .min(0, "Price cannot be negative")
      .optional(),

    duration: z
      .number()
      .int("Duration must be a whole number")
      .min(1, "Duration must be at least 1")
      .optional(),

    durationUnit: z
      .enum(["minutes", "hours", "days"])
      .optional(),

    status: z
      .enum(["active", "inactive", "archived"])
      .optional(),

    taxRate: z
      .number()
      .min(0, "Tax rate cannot be negative")
      .max(100, "Tax rate cannot exceed 100")
      .optional(),

    isOnline: z
      .boolean()
      .optional(),

    notes: z
      .string()
      .trim()
      .max(2000, "Notes cannot exceed 2000 characters")
      .optional(),
  })
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
  createServiceSchema,
  updateServiceSchema,
};