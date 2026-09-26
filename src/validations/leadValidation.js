const { z } = require("zod");

// =====================================
// COMMON HELPERS
// =====================================

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

const optionalEmail = z.preprocess(
  (value) => {
    if (value === "" || value === null) {
      return undefined;
    }

    return value;
  },
  z.string().email("Invalid email address").optional()
);

const optionalDate = z.preprocess(
  (value) => {
    if (value === "" || value === null) {
      return null;
    }

    return value;
  },
  z.coerce.date().nullable().optional()
);

// =====================================
// LEAD ENUMS
// =====================================

const leadSourceSchema = z.enum([
  "website",
  "facebook",
  "instagram",
  "google",
  "referral",
  "phone",
  "email",
  "whatsapp",
  "walk_in",
  "other",
]);

const leadStatusSchema = z.enum([
  "new",
  "contacted",
  "qualified",
  "proposal",
  "won",
  "lost",
]);

const leadPrioritySchema = z.enum([
  "low",
  "medium",
  "high",
]);

// =====================================
// CREATE LEAD
// =====================================

const createLeadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Lead name must be at least 2 characters")
    .max(100, "Lead name cannot exceed 100 characters"),

  email: optionalEmail,

  phone: z
    .string()
    .trim()
    .max(30, "Phone number cannot exceed 30 characters")
    .optional(),

  company: z
    .string()
    .trim()
    .max(150, "Company name cannot exceed 150 characters")
    .optional(),

  source: leadSourceSchema.optional(),

  status: leadStatusSchema.optional(),

  priority: leadPrioritySchema.optional(),

  estimatedValue: z
    .number()
    .min(0, "Estimated value cannot be negative")
    .optional(),

  notes: z
    .string()
    .trim()
    .max(2000, "Notes cannot exceed 2000 characters")
    .optional(),

  assignedTo: objectIdSchema.optional(),

  nextFollowUpAt: optionalDate,
});

// =====================================
// UPDATE LEAD
// =====================================

const updateLeadSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Lead name must be at least 2 characters")
      .max(100, "Lead name cannot exceed 100 characters")
      .optional(),

    email: optionalEmail,

    phone: z
      .string()
      .trim()
      .max(30, "Phone number cannot exceed 30 characters")
      .optional(),

    company: z
      .string()
      .trim()
      .max(150, "Company name cannot exceed 150 characters")
      .optional(),

    source: leadSourceSchema.optional(),

    priority: leadPrioritySchema.optional(),

    estimatedValue: z
      .number()
      .min(0, "Estimated value cannot be negative")
      .optional(),

    notes: z
      .string()
      .trim()
      .max(2000, "Notes cannot exceed 2000 characters")
      .optional(),

    assignedTo: objectIdSchema.nullable().optional(),

    nextFollowUpAt: optionalDate,
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field is required to update the lead",
    }
  );

// =====================================
// UPDATE LEAD STATUS
// =====================================

const updateLeadStatusSchema = z.object({
  status: leadStatusSchema,

  notes: z
    .string()
    .trim()
    .max(2000, "Notes cannot exceed 2000 characters")
    .optional(),
});

// =====================================
// EXPORT
// =====================================

module.exports = {
  createLeadSchema,
  updateLeadSchema,
  updateLeadStatusSchema,
};