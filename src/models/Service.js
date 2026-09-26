const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    // =====================================
    // ORGANIZATION
    // =====================================

    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    // =====================================
    // SERVICE INFORMATION
    // =====================================

    name: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
      minlength: 2,
      maxlength: 150,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    category: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "General",
    },

    // =====================================
    // PRICING
    // =====================================

    price: {
      type: Number,
      required: [true, "Service price is required"],
      min: 0,
    },

    duration: {
      type: Number,
      required: [true, "Service duration is required"],
      min: 1,
    },

    durationUnit: {
      type: String,
      enum: ["minutes", "hours", "days"],
      default: "minutes",
    },

    // =====================================
    // STATUS
    // =====================================

    status: {
      type: String,
      enum: ["active", "inactive", "archived"],
      default: "active",
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // =====================================
    // SERVICE SETTINGS
    // =====================================

    taxRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    // =====================================
    // CREATED BY
    // =====================================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================
// INDEXES
// =====================================

serviceSchema.index({
  organization: 1,
  createdAt: -1,
});

serviceSchema.index({
  organization: 1,
  category: 1,
});

serviceSchema.index({
  organization: 1,
  status: 1,
});

serviceSchema.index({
  organization: 1,
  name: 1,
});

// =====================================
// MODEL
// =====================================

const Service = mongoose.model("Service", serviceSchema);

module.exports = Service;