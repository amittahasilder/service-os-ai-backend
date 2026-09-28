
const mongoose = require("mongoose");

const inventoryMovementSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },

    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["stock_in", "stock_out", "adjustment"],
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0.001,
    },

    previousQuantity: {
      type: Number,
      required: true,
      min: 0,
    },

    newQuantity: {
      type: Number,
      required: true,
      min: 0,
    },

    reason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    reference: {
      type: String,
      trim: true,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

inventoryMovementSchema.index({
  organization: 1,
  inventory: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "InventoryMovement",
  inventoryMovementSchema
);