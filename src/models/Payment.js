const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
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
    // INVOICE
    // =====================================

    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
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
    // PAYMENT NUMBER
    // =====================================

    paymentNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },

    // =====================================
    // AMOUNT
    // =====================================

    amount: {
      type: Number,
      required: true,
      min: 0.01,
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
    // PAYMENT METHOD
    // =====================================

    paymentMethod: {
      type: String,
      enum: [
        "cash",
        "bank_transfer",
        "card",
        "mobile_banking",
        "cheque",
        "other",
      ],
      required: true,
      index: true,
    },

    // =====================================
    // PAYMENT STATUS
    // =====================================

    status: {
      type: String,
      enum: [
        "pending",
        "completed",
        "failed",
        "refunded",
        "cancelled",
      ],
      default: "completed",
      index: true,
    },

    // =====================================
    // TRANSACTION INFORMATION
    // =====================================

    transactionId: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
      index: true,
    },

    referenceNumber: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    // =====================================
    // PAYMENT DATE
    // =====================================

    paymentDate: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },

    // =====================================
    // NOTES
    // =====================================

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

paymentSchema.index({
  organization: 1,
  invoice: 1,
});

paymentSchema.index({
  organization: 1,
  customer: 1,
});

paymentSchema.index({
  organization: 1,
  status: 1,
});

paymentSchema.index({
  organization: 1,
  createdAt: -1,
});

module.exports = mongoose.model("Payment", paymentSchema);