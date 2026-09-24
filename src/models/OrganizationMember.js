
const mongoose = require("mongoose");

// =====================================
// ORGANIZATION MEMBER SCHEMA
// =====================================

const organizationMemberSchema = new mongoose.Schema(
  {
    // =====================================
    // USER
    // =====================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },

    // =====================================
    // ORGANIZATION / BUSINESS
    // =====================================

    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: [
        true,
        "Organization is required",
      ],
    },

    // =====================================
    // ROLE
    // =====================================

    role: {
      type: String,

      enum: [
        "owner",
        "admin",
        "manager",
        "staff",
      ],

      required: [true, "Role is required"],

      default: "staff",
    },

    // =====================================
    // MEMBER STATUS
    // =====================================

    status: {
      type: String,

      enum: [
        "active",
        "invited",
        "suspended",
      ],

      default: "active",
    },

    // =====================================
    // JOINED DATE
    // =====================================

    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// =====================================
// UNIQUE MEMBERSHIP
// =====================================
//
// A user can belong to many organizations,
// but cannot be added twice to the same
// organization.
//

organizationMemberSchema.index(
  {
    user: 1,
    organization: 1,
  },
  {
    unique: true,
  }
);

// =====================================
// QUERY INDEXES
// =====================================

organizationMemberSchema.index({
  user: 1,
});

organizationMemberSchema.index({
  organization: 1,
});

organizationMemberSchema.index({
  role: 1,
});

organizationMemberSchema.index({
  status: 1,
});

// =====================================
// MODEL
// =====================================

const OrganizationMember =
  mongoose.model(
    "OrganizationMember",
    organizationMemberSchema
  );

module.exports = OrganizationMember;

