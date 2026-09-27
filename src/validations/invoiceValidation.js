const { z } = require("zod");

// =====================================
// INVOICE ITEM
// =====================================

const invoiceItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Item name is required")
    .max(200, "Item name cannot exceed 200 characters"),

  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional(),

  quantity: z
    .number()
    .positive("Quantity must be greater than 0"),

  unitPrice: z
    .number()
    .min(0, "Unit price cannot be negative"),
});

// =====================================
// CREATE INVOICE
// =====================================

const createInvoiceSchema = z.object({
  // Job
  job: z
    .string()
    .min(1, "Job ID is required"),

  // Optional Quote
  quote: z
    .string()
    .min(1, "Quote ID cannot be empty")
    .optional(),

  // Customer
  customer: z
    .string()
    .min(1, "Customer ID is required"),

  // Basic Information
  title: z
    .string()
    .trim()
    .min(2, "Invoice title must be at least 2 characters")
    .max(200, "Invoice title cannot exceed 200 characters"),

  description: z
    .string()
    .trim()
    .max(3000, "Description cannot exceed 3000 characters")
    .optional(),

  // Items
  items: z
    .array(invoiceItemSchema)
    .min(1, "At least one invoice item is required"),

  // Discount
  discountType: z
    .enum(["percentage", "fixed"])
    .optional(),

  discountValue: z
    .number()
    .min(0, "Discount cannot be negative")
    .optional(),

  // Tax
  taxRate: z
    .number()
    .min(0, "Tax rate cannot be negative")
    .max(100, "Tax rate cannot exceed 100")
    .optional(),

  // Currency
  currency: z
    .string()
    .trim()
    .length(3, "Currency must be a 3-letter code")
    .optional(),

  // Dates
  issueDate: z
    .string()
    .optional(),

  dueDate: z
    .string()
    .optional(),

  // Status
  status: z
    .enum([
      "draft",
      "sent",
      "partially_paid",
      "paid",
      "overdue",
      "cancelled",
    ])
    .optional(),

  // Notes
  customerNotes: z
    .string()
    .trim()
    .max(2000, "Customer notes cannot exceed 2000 characters")
    .optional(),

  termsAndConditions: z
    .string()
    .trim()
    .max(5000, "Terms and conditions cannot exceed 5000 characters")
    .optional(),
});

// =====================================
// UPDATE INVOICE
// =====================================

const updateInvoiceSchema = createInvoiceSchema
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
  createInvoiceSchema,
  updateInvoiceSchema,
};