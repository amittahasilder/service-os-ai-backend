// const { z } = require("zod");

// // =====================================
// // INVOICE ITEM
// // =====================================

// const invoiceItemSchema = z.object({
//   name: z
//     .string()
//     .trim()
//     .min(2, "Item name is required")
//     .max(200, "Item name cannot exceed 200 characters"),

//   description: z
//     .string()
//     .trim()
//     .max(1000, "Description cannot exceed 1000 characters")
//     .optional(),

//   quantity: z
//     .number()
//     .positive("Quantity must be greater than 0"),

//   unitPrice: z
//     .number()
//     .min(0, "Unit price cannot be negative"),
// });

// // =====================================
// // CREATE INVOICE
// // =====================================

// const createInvoiceSchema = z.object({
//   // Job
//   job: z
//     .string()
//     .min(1, "Job ID is required"),

//   // Optional Quote
//   quote: z
//     .string()
//     .min(1, "Quote ID cannot be empty")
//     .optional(),

//   // Customer
//   customer: z
//     .string()
//     .min(1, "Customer ID is required"),

//   // Basic Information
//   title: z
//     .string()
//     .trim()
//     .min(2, "Invoice title must be at least 2 characters")
//     .max(200, "Invoice title cannot exceed 200 characters"),

//   description: z
//     .string()
//     .trim()
//     .max(3000, "Description cannot exceed 3000 characters")
//     .optional(),

//   // Items
//   items: z
//     .array(invoiceItemSchema)
//     .min(1, "At least one invoice item is required"),

//   // Discount
//   discountType: z
//     .enum(["percentage", "fixed"])
//     .optional(),

//   discountValue: z
//     .number()
//     .min(0, "Discount cannot be negative")
//     .optional(),

//   // Tax
//   taxRate: z
//     .number()
//     .min(0, "Tax rate cannot be negative")
//     .max(100, "Tax rate cannot exceed 100")
//     .optional(),

//   // Currency
//   currency: z
//     .string()
//     .trim()
//     .length(3, "Currency must be a 3-letter code")
//     .optional(),

//   // Dates
//   issueDate: z
//     .string()
//     .optional(),

//   dueDate: z
//     .string()
//     .optional(),

//   // Status
//   status: z
//     .enum([
//       "draft",
//       "sent",
//       "partially_paid",
//       "paid",
//       "overdue",
//       "cancelled",
//     ])
//     .optional(),

//   // Notes
//   customerNotes: z
//     .string()
//     .trim()
//     .max(2000, "Customer notes cannot exceed 2000 characters")
//     .optional(),

//   termsAndConditions: z
//     .string()
//     .trim()
//     .max(5000, "Terms and conditions cannot exceed 5000 characters")
//     .optional(),
// });

// // =====================================
// // UPDATE INVOICE
// // =====================================

// const updateInvoiceSchema = createInvoiceSchema
//   .partial()
//   .refine(
//     (data) => Object.keys(data).length > 0,
//     {
//       message: "At least one field is required for update",
//     }
//   );

// // =====================================
// // EXPORT
// // =====================================

// module.exports = {
//   createInvoiceSchema,
//   updateInvoiceSchema,
// };



const { z } = require("zod");

// =====================================
// COMMON VALIDATION
// =====================================

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

const dateSchema = z
  .string()
  .datetime({ offset: true })
  .or(z.string().date());

// =====================================
// INVOICE ITEM
// =====================================

const invoiceItemSchema = z
  .object({
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
      .finite()
      .positive("Quantity must be greater than 0"),

    unitPrice: z
      .number()
      .finite()
      .min(0, "Unit price cannot be negative"),
  })
  .strict();

// =====================================
// CREATE INVOICE
// =====================================

const createInvoiceSchema = z
  .object({
    job: objectIdSchema,

    quote: objectIdSchema.optional(),

    customer: objectIdSchema,

    title: z
      .string()
      .trim()
      .min(2)
      .max(200),

    description: z
      .string()
      .trim()
      .max(3000)
      .optional(),

    items: z
      .array(invoiceItemSchema)
      .min(1, "At least one invoice item is required"),

    discountType: z
      .enum(["percentage", "fixed"])
      .optional(),

    discountValue: z
      .number()
      .finite()
      .min(0)
      .optional(),

    taxRate: z
      .number()
      .finite()
      .min(0)
      .max(100)
      .optional(),

    currency: z
      .string()
      .trim()
      .length(3)
      .transform((value) => value.toUpperCase())
      .optional(),

    issueDate: dateSchema.optional(),

    dueDate: dateSchema.optional(),

    // Financial statuses are controlled by the backend.
    status: z
      .enum(["draft", "sent"])
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
  })
  .strict()
  .superRefine((data, ctx) => {
    if (
      data.discountType === "percentage" &&
      data.discountValue !== undefined &&
      data.discountValue > 100
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["discountValue"],
        message: "Percentage discount cannot exceed 100",
      });
    }

    if (
      data.issueDate &&
      data.dueDate &&
      new Date(data.dueDate) < new Date(data.issueDate)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["dueDate"],
        message: "Due date cannot be before issue date",
      });
    }
  });

// =====================================
// UPDATE INVOICE
// =====================================

const updateInvoiceSchema = z
  .object({
    title: z.string().trim().min(2).max(200).optional(),

    description: z.string().trim().max(3000).optional(),

    items: z
      .array(invoiceItemSchema)
      .min(1)
      .optional(),

    discountType: z
      .enum(["percentage", "fixed"])
      .optional(),

    discountValue: z
      .number()
      .finite()
      .min(0)
      .optional(),

    taxRate: z
      .number()
      .finite()
      .min(0)
      .max(100)
      .optional(),

    currency: z
      .string()
      .trim()
      .length(3)
      .transform((value) => value.toUpperCase())
      .optional(),

    issueDate: dateSchema.optional(),

    dueDate: dateSchema.optional(),

    status: z
      .enum(["draft", "sent"])
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
  })
  .strict()
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
