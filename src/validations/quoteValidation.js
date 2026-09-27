
const { z } = require("zod");

// =====================================
// QUOTE ITEM VALIDATION
// =====================================

const quoteItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Item name is required")
    .max(200),

  description: z
    .string()
    .trim()
    .max(1000)
    .optional(),

  quantity: z
    .number()
    .positive("Quantity must be greater than 0"),

  unitPrice: z
    .number()
    .min(0, "Unit price cannot be negative"),
});

// =====================================
// CREATE QUOTE VALIDATION
// =====================================

const createQuoteSchema = z.object({
  job: z
    .string()
    .min(1, "Job ID is required"),

  customer: z
    .string()
    .min(1, "Customer ID is required"),

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
    .min(0, "Discount cannot be negative")
    .optional(),

  taxRate: z
    .number()
    .min(0, "Tax rate cannot be negative")
    .max(100, "Tax rate cannot exceed 100")
    .optional(),

  currency: z
    .string()
    .trim()
    .length(3, "Currency must be a 3-letter code")
    .optional(),

  issueDate: z
    .string()
    .optional(),

  expiryDate: z
    .string()
    .optional(),

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
// UPDATE QUOTE VALIDATION
// =====================================

const updateQuoteSchema = createQuoteSchema
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
  createQuoteSchema,
  updateQuoteSchema,
};