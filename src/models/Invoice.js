const mongoose = require("mongoose");

const invoiceItemSchema = new mongoose.Schema(
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
  {
    _id: true,
  }
);

const invoiceSchema = new mongoose.Schema(
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
    // JOB
    // =====================================

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },

    // =====================================
    // QUOTE
    // =====================================

    quote: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quote",
      default: null,
      index: true,
    },

    // =====================================
    // CUSTOMER
    // =====================================

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    // =====================================
    // INVOICE NUMBER
    // =====================================

    invoiceNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },

    // =====================================
    // BASIC INFORMATION
    // =====================================

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

    // =====================================
    // ITEMS
    // =====================================

    items: {
      type: [invoiceItemSchema],
      required: true,

      validate: {
        validator: (items) =>
          Array.isArray(items) && items.length > 0,

        message: "At least one invoice item is required",
      },
    },

    // =====================================
    // FINANCIALS
    // =====================================

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

    // =====================================
    // CURRENCY
    // =====================================

    currency: {
      type: String,
      uppercase: true,
      trim: true,
      default: "BDT",
      maxlength: 3,
    },

    // =====================================
    // STATUS
    // =====================================

    status: {
      type: String,
      enum: [
        "draft",
        "sent",
        "partially_paid",
        "paid",
        "overdue",
        "cancelled",
      ],
      default: "draft",
      index: true,
    },

    // =====================================
    // DATES
    // =====================================

    issueDate: {
      type: Date,
      default: Date.now,
      required: true,
    },

    dueDate: {
      type: Date,
      default: null,
    },

    // =====================================
    // PAYMENT SUMMARY
    // =====================================

    paidAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    balanceDue: {
      type: Number,
      min: 0,
      default: 0,
    },

    // =====================================
    // NOTES
    // =====================================

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

    // =====================================
    // CREATED BY
    // =====================================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =====================================
    // ACTIVE
    // =====================================

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

invoiceSchema.index({
  organization: 1,
  status: 1,
});

invoiceSchema.index({
  organization: 1,
  customer: 1,
});

invoiceSchema.index({
  organization: 1,
  job: 1,
});

invoiceSchema.index({
  organization: 1,
  quote: 1,
});

invoiceSchema.index({
  organization: 1,
  createdAt: -1,
});

module.exports = mongoose.model("Invoice", invoiceSchema);