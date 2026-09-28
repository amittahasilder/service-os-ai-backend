
const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    expenseNumber: {
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

    category: {
      type: String,
      enum: [
        "salary",
        "rent",
        "utilities",
        "transport",
        "supplies",
        "equipment",
        "marketing",
        "maintenance",
        "software",
        "tax",
        "other",
      ],
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },

    currency: {
      type: String,
      uppercase: true,
      trim: true,
      default: "BDT",
      maxlength: 3,
    },

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
    },

    status: {
      type: String,
      enum: ["pending", "paid", "cancelled"],
      default: "paid",
      index: true,
    },

    expenseDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },

    vendor: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    referenceNumber: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    receiptUrl: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
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

expenseSchema.index({
  organization: 1,
  expenseDate: -1,
});

expenseSchema.index({
  organization: 1,
  category: 1,
});

expenseSchema.index({
  organization: 1,
  status: 1,
});

expenseSchema.index({
  organization: 1,
  createdAt: -1,
});

module.exports = mongoose.model("Expense", expenseSchema);