const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
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
      default: null,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 150,
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 30,
    },

    jobTitle: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "Staff",
    },

    role: {
      type: String,
      enum: ["manager", "staff", "technician", "assistant"],
      default: "staff",
    },

    skills: [
      {
        type: String,
        trim: true,
        maxlength: 100,
      },
    ],

    hourlyRate: {
      type: Number,
      min: 0,
      default: 0,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "archived"],
      default: "active",
    },

    availability: {
      type: String,
      enum: ["available", "busy", "off"],
      default: "available",
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

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

// =====================================
// INDEXES
// =====================================

staffSchema.index({
  organization: 1,
  createdAt: -1,
});

staffSchema.index({
  organization: 1,
  status: 1,
});

staffSchema.index({
  organization: 1,
  role: 1,
});

staffSchema.index({
  organization: 1,
  name: 1,
});

module.exports = mongoose.model("Staff", staffSchema);