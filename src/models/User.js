const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // =====================================
    // USER NAME
    // =====================================
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    // =====================================
    // EMAIL
    // =====================================
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    // =====================================
    // PASSWORD
    // =====================================
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    // =====================================
    // ROLE
    // =====================================
    role: {
      type: String,
      enum: ["owner", "admin", "manager", "staff"],
      default: "owner",
    },

    // =====================================
    // ACCOUNT STATUS
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

const User = mongoose.model("User", userSchema);

module.exports = User;