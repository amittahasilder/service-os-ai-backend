
const mongoose = require("mongoose");

// =====================================
// ORGANIZATION SCHEMA
// =====================================

const organizationSchema = new mongoose.Schema(
  {
    // =====================================
    // BUSINESS NAME
    // =====================================

    name: {
      type: String,
      required: [true, "Business name is required"],
      trim: true,
      minlength: [
        2,
        "Business name must be at least 2 characters",
      ],
      maxlength: [
        150,
        "Business name cannot exceed 150 characters",
      ],
    },

    // =====================================
    // BUSINESS SLUG
    // =====================================

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // =====================================
    // BUSINESS TYPE
    // =====================================

    businessType: {
      type: String,
      required: [true, "Business type is required"],
      enum: [
        "cleaning",
        "plumbing",
        "hvac",
        "electrical",
        "repair",
        "salon",
        "agency",
        "consultant",
        "freelancer",
        "photography",
        "landscaping",
        "automotive",
        "other",
      ],
      default: "other",
    },

    // =====================================
    // CONTACT INFORMATION
    // =====================================

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    // =====================================
    // BUSINESS WEBSITE
    // =====================================

    website: {
      type: String,
      trim: true,
    },

    // =====================================
    // BUSINESS ADDRESS
    // =====================================

    address: {
      street: {
        type: String,
        trim: true,
      },

      city: {
        type: String,
        trim: true,
      },

      state: {
        type: String,
        trim: true,
      },

      country: {
        type: String,
        trim: true,
      },

      postalCode: {
        type: String,
        trim: true,
      },
    },

    // =====================================
    // BUSINESS LOGO
    // =====================================

    logo: {
      type: String,
      trim: true,
    },

    // =====================================
    // BUSINESS STATUS
    // =====================================

    isActive: {
      type: Boolean,
      default: true,
    },

    // =====================================
    // SUBSCRIPTION
    // =====================================

    subscriptionPlan: {
      type: String,
      enum: [
        "free",
        "starter",
        "professional",
        "business",
        "enterprise",
      ],
      default: "free",
    },
  },
  {
    timestamps: true,
  }
);

// =====================================
// INDEXES
// =====================================

organizationSchema.index({
  name: 1,
});

organizationSchema.index({
  businessType: 1,
});

organizationSchema.index({
  isActive: 1,
});

// =====================================
// MODEL
// =====================================

const Organization = mongoose.model(
  "Organization",
  organizationSchema
);

module.exports = Organization;

