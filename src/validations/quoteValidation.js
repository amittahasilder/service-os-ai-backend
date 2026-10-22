
const { z } = require("zod");

// =====================================
// REUSABLE VALIDATORS
// =====================================

const objectIdSchema = z
  .string()
  .regex(
    /^[a-fA-F0-9]{24}$/,
    "Invalid MongoDB ObjectId"
  );

const dateSchema = z
  .string()
  .trim()
  .min(1, "Date cannot be empty")
  .refine(
    (value) => !Number.isNaN(Date.parse(value)),
    "Invalid date"
  );

// =====================================
// QUOTE ITEM VALIDATION
// =====================================

const quoteItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Item name must be at least 2 characters")
    .max(200),

  description: z
    .string()
    .trim()
    .max(1000)
    .optional(),

  quantity: z
    .number()
    .finite()
    .positive("Quantity must be greater than 0"),

  unitPrice: z
    .number()
    .finite()
    .min(0, "Unit price cannot be negative"),
});

// =====================================
// SHARED QUOTE FIELDS
// =====================================

const quoteFieldsSchema = z.object({
  job: objectIdSchema,

  customer: objectIdSchema,

  title: z
    .string()
    .trim()
    .min(2, "Quote title must be at least 2 characters")
    .max(200),

  description: z
    .string()
    .trim()
    .max(3000)
    .optional(),

  items: z
    .array(quoteItemSchema)
    .min(1, "At least one quote item is required"),

  discountType: z
    .enum(["percentage", "fixed"])
    .optional(),

  discountValue: z
    .number()
    .finite()
    .min(0, "Discount cannot be negative")
    .optional(),

  taxRate: z
    .number()
    .finite()
    .min(0, "Tax rate cannot be negative")
    .max(100, "Tax rate cannot exceed 100")
    .optional(),

  currency: z
    .string()
    .trim()
    .regex(
      /^[A-Za-z]{3}$/,
      "Currency must be a 3-letter currency code"
    )
    .transform((value) => value.toUpperCase())
    .optional(),

  issueDate: dateSchema.optional(),

  expiryDate: dateSchema.optional(),

  status: z
    .enum([
      "draft",
      "sent",
      "accepted",
      "rejected",
      "expired",
      "cancelled",
    ])
    .optional(),

  customerNotes: z
    .string()
    .trim()
    .max(2000)
    .optional(),

  termsAndConditions: z
    .string()
    .trim()
    .max(5000)
    .optional(),
});

// =====================================
// FINANCIAL VALIDATION
// =====================================

const validateQuoteFields = (data, ctx) => {
  if (
    data.discountType === "percentage" &&
    data.discountValue !== undefined &&
    data.discountValue > 100
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["discountValue"],
      message: "Percentage discount cannot exceed 100%",
    });
  }

  if (data.issueDate && data.expiryDate) {
    const issueDate = new Date(data.issueDate);
    const expiryDate = new Date(data.expiryDate);

    if (expiryDate <= issueDate) {
      ctx.addIssue({
        code: "custom",
        path: ["expiryDate"],
        message: "Expiry date must be after issue date",
      });
    }
  }
};

// =====================================
// CREATE QUOTE VALIDATION
// =====================================

const createQuoteSchema = quoteFieldsSchema
  .superRefine(validateQuoteFields);

// =====================================
// UPDATE QUOTE VALIDATION
// =====================================

const updateQuoteSchema = quoteFieldsSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field is required for update",
    }
  )
  .superRefine(validateQuoteFields);

// =====================================
// EXPORT
// =====================================

module.exports = {
  createQuoteSchema,
  updateQuoteSchema,
};
