
const { z } = require("zod");

const createInventorySchema = z.object({
  name: z.string().trim().min(2).max(150),
  sku: z.string().trim().min(2).max(50),
  description: z.string().max(1000).optional(),
  category: z.enum([
    "cleaning_supplies",
    "tools",
    "spare_parts",
    "equipment",
    "office_supplies",
    "safety",
    "other",
  ]).optional(),
  unit: z.enum([
    "piece", "kg", "gram", "liter", "ml",
    "meter", "box", "pack", "set", "unit",
  ]).optional(),
  quantity: z.number().min(0),
  lowStockThreshold: z.number().min(0).optional(),
  costPrice: z.number().min(0),
  sellingPrice: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  supplier: z.string().max(150).optional(),
  location: z.string().max(150).optional(),
  notes: z.string().max(1000).optional(),
});

const updateInventorySchema = z.object({
  name: z.string().trim().min(2).max(150).optional(),
  sku: z.string().trim().min(2).max(50).optional(),
  description: z.string().max(1000).optional(),
  category: z.enum([
    "cleaning_supplies",
    "tools",
    "spare_parts",
    "equipment",
    "office_supplies",
    "safety",
    "other",
  ]).optional(),
  unit: z.enum([
    "piece", "kg", "gram", "liter", "ml",
    "meter", "box", "pack", "set", "unit",
  ]).optional(),
  lowStockThreshold: z.number().min(0).optional(),
  costPrice: z.number().min(0).optional(),
  sellingPrice: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  supplier: z.string().max(150).optional(),
  location: z.string().max(150).optional(),
  notes: z.string().max(1000).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field is required" }
);

const stockMovementSchema = z.object({
  quantity: z.number().positive(),
  reason: z.string().max(500).optional(),
  reference: z.string().max(150).optional(),
});

const stockAdjustmentSchema = z.object({
  newQuantity: z.number().min(0),
  reason: z.string().trim().min(3).max(500),
});

module.exports = {
  createInventorySchema,
  updateInventorySchema,
  stockMovementSchema,
  stockAdjustmentSchema,
};