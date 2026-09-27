const { z } = require("zod");

// =====================================
// CREATE STAFF
// =====================================

const createStaffSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Staff name must be at least 2 characters")
    .max(150, "Staff name cannot exceed 150 characters"),

  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(150, "Email cannot exceed 150 characters")
    .optional(),

  phone: z
    .string()
    .trim()
    .max(30, "Phone cannot exceed 30 characters")
    .optional(),

  jobTitle: z
    .string()
    .trim()
    .max(100, "Job title cannot exceed 100 characters")
    .optional(),

  role: z
    .enum(["manager", "staff", "technician", "assistant"])
    .optional(),

  skills: z
    .array(
      z
        .string()
        .trim()
        .max(100, "Skill cannot exceed 100 characters")
    )
    .optional(),

  hourlyRate: z
    .number()
    .min(0, "Hourly rate cannot be negative")
    .optional(),

  status: z
    .enum(["active", "inactive", "archived"])
    .optional(),

  availability: z
    .enum(["available", "busy", "off"])
    .optional(),

  notes: z
    .string()
    .trim()
    .max(2000, "Notes cannot exceed 2000 characters")
    .optional(),
});

// =====================================
// UPDATE STAFF
// =====================================

const updateStaffSchema = createStaffSchema
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
  createStaffSchema,
  updateStaffSchema,
};