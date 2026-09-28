
const { z } = require("zod");

const expenseCategories = [
  "salary",
  "rent",
  "utilities",
  "transport",
  "supplies",
  "equipment",
  "marketing",
  "maintenance",
  "software",
  "tax",
  "other",
];

const paymentMethods = [
  "cash",
  "bank_transfer",
  "card",
  "mobile_banking",
  "cheque",
  "other",
];

const expenseStatuses = [
  "pending",
  "paid",
  "cancelled",
];

const createExpenseSchema = z.object({
  title: z.string().trim().min(2).max(200),

  description: z.string().trim().max(3000).optional(),

  category: z.enum(expenseCategories),

  amount: z.number().positive(
    "Expense amount must be greater than zero"
  ),

  currency: z.string().trim().length(3).optional(),

  paymentMethod: z.enum(paymentMethods),

  status: z.enum(expenseStatuses).optional(),

  expenseDate: z.string().optional(),

  vendor: z.string().trim().max(200).optional(),

  referenceNumber: z.string().trim().max(200).optional(),

  receiptUrl: z.string().trim().max(2000).optional(),

  notes: z.string().trim().max(2000).optional(),
});

const updateExpenseSchema = z
  .object({
    title: z.string().trim().min(2).max(200).optional(),

    description: z.string().trim().max(3000).optional(),

    category: z.enum(expenseCategories).optional(),

    amount: z.number().positive().optional(),

    currency: z.string().trim().length(3).optional(),

    paymentMethod: z.enum(paymentMethods).optional(),

    status: z.enum(expenseStatuses).optional(),

    expenseDate: z.string().optional(),

    vendor: z.string().trim().max(200).optional(),

    referenceNumber: z.string().trim().max(200).optional(),

    receiptUrl: z.string().trim().max(2000).optional(),

    notes: z.string().trim().max(2000).optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field is required for update",
    }
  );

module.exports = {
  createExpenseSchema,
  updateExpenseSchema,
};