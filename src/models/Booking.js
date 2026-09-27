const mongoose = require("mongoose");

// =====================================
// BOOKING SCHEMA
// =====================================

const bookingSchema = new mongoose.Schema(
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
    // CUSTOMER
    // =====================================

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
      index: true,
    },

    // =====================================
    // SERVICE
    // =====================================

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
      index: true,
    },

    // =====================================
    // ASSIGNED STAFF
    // =====================================

    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      default: null,
      index: true,
    },

    // =====================================
    // BOOKING DATE
    // =====================================

    bookingDate: {
      type: Date,
      required: true,
      index: true,
    },

    // =====================================
    // START / END TIME
    // =====================================

    startTime: {
      type: String,
      required: true,
      trim: true,
    },

    endTime: {
      type: String,
      required: true,
      trim: true,
    },

    // =====================================
    // BOOKING STATUS
    // =====================================

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ],
      default: "pending",
      index: true,
    },

    // =====================================
    // LOCATION
    // =====================================

    location: {
      address: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "",
      },

      city: {
        type: String,
        trim: true,
        maxlength: 100,
        default: "",
      },

      postalCode: {
        type: String,
        trim: true,
        maxlength: 20,
        default: "",
      },

      notes: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: "",
      },
    },

    // =====================================
    // PRICE
    // =====================================

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // =====================================
    // TAX
    // =====================================

    taxRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
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
    // ACTIVE STATUS
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

bookingSchema.index({
  organization: 1,
  bookingDate: 1,
});

bookingSchema.index({
  organization: 1,
  status: 1,
});

bookingSchema.index({
  organization: 1,
  customer: 1,
});

bookingSchema.index({
  organization: 1,
  staff: 1,
  bookingDate: 1,
});

bookingSchema.index({
  organization: 1,
  createdAt: -1,
});

// =====================================
// EXPORT
// =====================================

module.exports = mongoose.model("Booking", bookingSchema);