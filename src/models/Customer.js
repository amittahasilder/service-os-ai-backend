const mongoose = require("mongoose");

// =====================================
// CUSTOMER SCHEMA
// =====================================

const customerSchema = new mongoose.Schema(
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
    // BASIC INFORMATION
    // =====================================

    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    lastName: {
      type: String,
      trim: true,
      maxlength: 50,
    },

    // =====================================
    // CONTACT INFORMATION
    // =====================================

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 30,
    },

    // =====================================
    // COMPANY
    // =====================================

    company: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    // =====================================
    // ADDRESS
    // =====================================

    address: {
      street: {
        type: String,
        trim: true,
        maxlength: 200,
      },

      city: {
        type: String,
        trim: true,
        maxlength: 100,
      },

      state: {
        type: String,
        trim: true,
        maxlength: 100,
      },

      postalCode: {
        type: String,
        trim: true,
        maxlength: 20,
      },

      country: {
        type: String,
        trim: true,
        maxlength: 100,
      },
    },

    // =====================================
    // CUSTOMER STATUS
    // =====================================

    status: {
      type: String,
      enum: [
        "active",
        "inactive",
        "archived",
      ],
      default: "active",
      index: true,
    },

    // =====================================
    // CUSTOMER SOURCE
    // =====================================

    source: {
      type: String,
      enum: [
        "lead",
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
      default: "other",
    },

    // =====================================
    // NOTES
    // =====================================

    notes: {
      type: String,
      trim: true,
      maxlength: 3000,
    },

    // =====================================
    // CUSTOMER VALUE
    // =====================================

    totalSpent: {
      type: Number,
      min: 0,
      default: 0,
    },

    // =====================================
    // LEAD REFERENCE
    // =====================================

    convertedFromLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lead",
      default: null,
    },

    convertedAt: {
      type: Date,
      default: null,
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
    // ACTIVE FLAG
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

customerSchema.index({
  organization: 1,
  createdAt: -1,
});

customerSchema.index({
  organization: 1,
  status: 1,
});

customerSchema.index({
  organization: 1,
  email: 1,
});

// =====================================
// EXPORT
// =====================================

module.exports = mongoose.model(
  "Customer",
  customerSchema
);