
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: [
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
      ],
      default: "system",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    link: {
      type: String,
      trim: true,
      default: null,
    },

    entityType: {
      type: String,
      trim: true,
      default: null,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
      default: null,
    },

    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Faster notification queries
notificationSchema.index({
  organization: 1,
  recipient: 1,
  createdAt: -1,
});

notificationSchema.index({
  organization: 1,
  recipient: 1,
  isRead: 1,
});

module.exports = mongoose.model("Notification", notificationSchema);