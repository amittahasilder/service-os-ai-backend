const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    // =====================================
    // ORGANIZATION / TENANT
    // =====================================

    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    // =====================================
    // LEAD INFORMATION
    // =====================================

    name: {
      type: String,
      required: [true, "Lead name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
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

    company: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    // =====================================
    // LEAD SOURCE
    // =====================================

    source: {
      type: String,
      enum: [
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
    // LEAD STATUS
    // =====================================

    status: {
      type: String,
      enum: [
        "new",
        "contacted",
        "qualified",
        "proposal",
        "won",
        "lost",
      ],
      default: "new",
      index: true,
    },

    // =====================================
    // PRIORITY
    // =====================================

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    // =====================================
    // POTENTIAL VALUE
    // =====================================

    estimatedValue: {
      type: Number,
      min: 0,
      default: 0,
    },

    // =====================================
    // NOTES
    // =====================================

    notes: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    // =====================================
    // ASSIGNED USER
    // =====================================

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // =====================================
    // CONVERTED CUSTOMER
    // =====================================

    convertedToCustomer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },

    convertedAt: {
      type: Date,
      default: null,
    },

    // =====================================
    // FOLLOW-UP
    // =====================================

    nextFollowUpAt: {
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
    // ACTIVE
    // =====================================

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);


// =====================================
// INDEXES
// =====================================

leadSchema.index({
  organization: 1,
  status: 1,
});

leadSchema.index({
  organization: 1,
  createdAt: -1,
});

leadSchema.index({
  organization: 1,
  email: 1,
});


// =====================================
// MODEL
// =====================================

const Lead = mongoose.model("Lead", leadSchema);

module.exports = Lead;