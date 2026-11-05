
const { z } = require("zod");

// =====================================
// CREATE CONVERSATION VALIDATION
// =====================================

const createConversationSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Conversation title cannot be empty.")
      .max(150, "Title cannot exceed 150 characters.")
      .optional(),
  })
  .strict();

// =====================================
// SEND MESSAGE VALIDATION
// =====================================

const sendMessageSchema = z
  .object({
    message: z
      .string()
      .trim()
      .min(1, "Message cannot be empty.")
      .max(10000, "Message cannot exceed 10000 characters."),
  })
  .strict();

// =====================================
// EXPORTS
// =====================================

module.exports = {
  createConversationSchema,
  sendMessageSchema,
};
