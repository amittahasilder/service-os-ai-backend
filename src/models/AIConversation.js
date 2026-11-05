
const mongoose = require("mongoose");

// =====================================
// AI MESSAGE SCHEMA
// =====================================

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);

// =====================================
// AI CONVERSATION SCHEMA
// =====================================

const aiConversationSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "New AI Conversation",
    },

    messages: {
      type: [messageSchema],
      default: [],
    },

    isArchived: {
      type: Boolean,
      default: false,
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================
// INDEXES
// =====================================

aiConversationSchema.index({
  organization: 1,
  user: 1,
  lastMessageAt: -1,
});

aiConversationSchema.index({
  organization: 1,
  isArchived: 1,
});

// =====================================
// MODEL
// =====================================

module.exports = mongoose.model(
  "AIConversation",
  aiConversationSchema
);
