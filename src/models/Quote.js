
const mongoose = require("mongoose");

const quoteItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    quantity: {
      type: Number,
      required: true,
      min: 0.01,
      default: 1,
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true }
);

const quoteSchema = new mongoose.Schema(
  {
    // Organization / Tenant
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    // Related Job
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },

    // Related Customer
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    // Quote Number
    quoteNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },

    // Quote Items
    items: {
      type: [quoteItemSchema],
      required: true,
      validate: {
        validator: (items) =>
          Array.isArray(items) && items.length > 0,
        message: "At least one quote item is required",
      },
    },

    // Financial Summary
    subtotal: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "fixed",
    },

    discountValue: {
      type: Number,
      min: 0,
      default: 0,
    },

    discountAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    taxRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    taxAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    currency: {
      type: String,
      uppercase: true,
      trim: true,
      default: "BDT",
      maxlength: 3,
    },

    // Status
    status: {
      type: String,
      enum: [
        "draft",
        "sent",
        "accepted",
        "rejected",
        "expired",
        "cancelled",
      ],
      default: "draft",
      index: true,
    },

    // Validity
    issueDate: {
      type: Date,
      default: Date.now,
      required: true,
    },

    expiryDate: {
      type: Date,
      default: null,
    },

    // Customer response
    customerNotes: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    termsAndConditions: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },

    // Audit
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

quoteSchema.index({
  organization: 1,
  status: 1,
});

quoteSchema.index({
  organization: 1,
  customer: 1,
});

quoteSchema.index({
  organization: 1,
  job: 1,
});

quoteSchema.index({
  organization: 1,
  createdAt: -1,
});

// =====================================
// MODEL
// =====================================

module.exports = mongoose.model("Quote", quoteSchema);