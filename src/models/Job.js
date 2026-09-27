const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
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
    // BOOKING
    // =====================================

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
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
    // STAFF
    // =====================================

    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      default: null,
      index: true,
    },

    // =====================================
    // JOB INFORMATION
    // =====================================

    jobNumber: {
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

    // =====================================
    // SCHEDULE
    // =====================================

    scheduledDate: {
      type: Date,
      required: true,
      index: true,
    },

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
    // STATUS
    // =====================================

    status: {
      type: String,
      enum: [
        "pending",
        "assigned",
        "in_progress",
        "completed",
        "cancelled",
      ],
      default: "pending",
      index: true,
    },

    // =====================================
    // PRIORITY
    // =====================================

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
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
    // FINANCIAL
    // =====================================

    price: {
      type: Number,
      required: true,
      min: 0,
    },

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
      maxlength: 3000,
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

jobSchema.index({
  organization: 1,
  scheduledDate: 1,
});

jobSchema.index({
  organization: 1,
  status: 1,
});

jobSchema.index({
  organization: 1,
  staff: 1,
  scheduledDate: 1,
});

jobSchema.index({
  organization: 1,
  customer: 1,
});

jobSchema.index({
  organization: 1,
  createdAt: -1,
});

// =====================================
// MODEL
// =====================================

module.exports = mongoose.model("Job", jobSchema);