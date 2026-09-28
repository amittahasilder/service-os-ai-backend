const { z } = require("zod");

const notificationTypes = [
  "booking",
  "job",
  "quote",
  "invoice",
  "payment",
  "customer",
  "lead",
  "staff",
  "system",
  "reminder",
  "review",
];

const priorities = ["low", "normal", "high", "urgent"];

const createNotificationSchema = z.object({
  recipient: z.string().min(1, "Recipient is required"),

  type: z
    .enum(notificationTypes)
    .default("system"),

  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title cannot exceed 200 characters"),

  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(1000, "Message cannot exceed 1000 characters"),

  link: z
    .string()
    .trim()
    .optional()
    .nullable(),

  entityType: z
    .string()
    .trim()
    .optional()
    .nullable(),

  entityId: z
    .string()
    .optional()
    .nullable(),

  priority: z
    .enum(priorities)
    .default("normal"),

  metadata: z
    .record(z.string(), z.any())
    .optional(),
});

module.exports = {
  createNotificationSchema,
};