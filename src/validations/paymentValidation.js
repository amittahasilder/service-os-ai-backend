
const { z } = require("zod");

// =====================================
// CREATE PAYMENT VALIDATION
// =====================================

const createPaymentSchema = z.object({
  invoice: z
    .string()
    .min(1, "Invoice ID is required"),

  customer: z
    .string()
    .min(1, "Customer ID is required"),

  amount: z
    .number()
    .positive("Payment amount must be greater than 0"),

  currency: z
    .string()
    .trim()
    .length(3, "Currency must be a 3-letter code")
    .optional(),

  paymentMethod: z.enum([
    "cash",
    "bank_transfer",
    "card",
    "mobile_banking",
    "cheque",
    "other",
  ]),

  status: z.enum([
    "pending",
    "completed",
    "failed",
    "refunded",
    "cancelled",
  ]).optional(),

  transactionId: z
    .string()
    .trim()
    .max(200)
    .optional(),

  referenceNumber: z
    .string()
    .trim()
    .max(200)
    .optional(),

  paymentDate: z
    .string()
    .optional(),

  notes: z
    .string()
    .trim()
    .max(2000)
    .optional(),
});

// =====================================
// UPDATE PAYMENT VALIDATION
// =====================================

const updatePaymentSchema = z
  .object({
    status: z.enum([
      "pending",
      "completed",
      "failed",
      "refunded",
      "cancelled",
    ]).optional(),

    transactionId: z
      .string()
      .trim()
      .max(200)
      .optional(),

    referenceNumber: z
      .string()
      .trim()
      .max(200)
      .optional(),

    paymentDate: z
      .string()
      .optional(),

    notes: z
      .string()
      .trim()
      .max(2000)
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
  createPaymentSchema,
  updatePaymentSchema,
};