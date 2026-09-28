
const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    sku: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    category: {
      type: String,
      trim: true,
      default: "other",
      enum: [
        "cleaning_supplies",
        "tools",
        "spare_parts",
        "equipment",
        "office_supplies",
        "safety",
        "other",
      ],
    },

    unit: {
      type: String,
      trim: true,
      default: "piece",
      enum: [
        "piece",
        "kg",
        "gram",
        "liter",
        "ml",
        "meter",
        "box",
        "pack",
        "set",
        "unit",
      ],
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    lowStockThreshold: {
      type: Number,
      min: 0,
      default: 5,
    },

    costPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    sellingPrice: {
      type: Number,
      min: 0,
      default: 0,
    },

    currency: {
      type: String,
      default: "BDT",
      uppercase: true,
    },

    supplier: {
      type: String,
      trim: true,
      default: "",
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

inventorySchema.index(
  { organization: 1, sku: 1 },
  { unique: true }
);

inventorySchema.index({
  organization: 1,
  isActive: 1,
  category: 1,
});

module.exports = mongoose.model("Inventory", inventorySchema);