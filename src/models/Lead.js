const mongoose = require("mongoose");

// =========================================================
// LEAD SCHEMA
// =========================================================

const leadSchema = new mongoose.Schema(
  {
    // =======================================================
    // ORGANIZATION / TENANT
    // =======================================================

    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization is required"],
      index: true,
    },

    // =======================================================
    // LEAD INFORMATION
    // =======================================================

    name: {
      type: String,
      required: [true, "Lead name is required"],
      trim: true,
      minlength: [2, "Lead name must be at least 2 characters"],
      maxlength: [100, "Lead name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [150, "Email cannot exceed 150 characters"],
      match: [
        /^\S+@\S+\.\S+$/,
        "Please provide a valid email address",
      ],
    },

    phone: {
      type: String,
      trim: true,
      maxlength: [30, "Phone number cannot exceed 30 characters"],
    },

    company: {
      type: String,
      trim: true,
      maxlength: [150, "Company name cannot exceed 150 characters"],
    },

    // =======================================================
    // LEAD SOURCE
    // =======================================================

    source: {
      type: String,
      enum: {
        values: [
          "website",
          "facebook",
          "instagram",
          "google",
          "referral",
          "phone",
          "email",
          "whatsapp",
          "walk_in",
          "other",
        ],
        message: "Invalid lead source",
      },
      default: "other",
      index: true,
    },

    // =======================================================
    // LEAD STATUS
    // =======================================================

    status: {
      type: String,
      enum: {
        values: [
          "new",
          "contacted",
          "qualified",
          "proposal",
          "won",
          "lost",
        ],
        message: "Invalid lead status",
      },
      default: "new",
      index: true,
    },

    // =======================================================
    // PRIORITY
    // =======================================================

    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high"],
        message: "Priority must be low, medium, or high",
      },
      default: "medium",
      index: true,
    },

    // =======================================================
    // POTENTIAL VALUE
    // =======================================================

    estimatedValue: {
      type: Number,
      min: [0, "Estimated value cannot be negative"],
      default: 0,
    },

    // =======================================================
    // NOTES
    // =======================================================

    notes: {
      type: String,
      trim: true,
      maxlength: [2000, "Notes cannot exceed 2000 characters"],
    },

    // =======================================================
    // ASSIGNED USER / STAFF
    // =======================================================

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // =======================================================
    // CUSTOMER CONVERSION
    // =======================================================

    convertedToCustomer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },

    convertedAt: {
      type: Date,
      default: null,
    },

    // =======================================================
    // FOLLOW-UP
    // =======================================================

    nextFollowUpAt: {
      type: Date,
      default: null,
      index: true,
    },

    // =======================================================
    // CREATED BY
    // =======================================================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by user is required"],
    },

    // =======================================================
    // SOFT DELETE / ACTIVE STATE
    // =======================================================

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// =========================================================
// INDEXES
// =========================================================

// Organization + status
leadSchema.index({
  organization: 1,
  status: 1,
});

// Organization + priority
leadSchema.index({
  organization: 1,
  priority: 1,
});

// Organization + source
leadSchema.index({
  organization: 1,
  source: 1,
});

// Organization + assigned user
leadSchema.index({
  organization: 1,
  assignedTo: 1,
});

// Organization + created date
leadSchema.index({
  organization: 1,
  createdAt: -1,
});

// Organization + email
leadSchema.index({
  organization: 1,
  email: 1,
});

// Organization + active leads
leadSchema.index({
  organization: 1,
  isActive: 1,
});

// Follow-up queries
leadSchema.index({
  organization: 1,
  nextFollowUpAt: 1,
});

// =========================================================
// MODEL
// =========================================================

const Lead = mongoose.model("Lead", leadSchema);

module.exports = Lead;