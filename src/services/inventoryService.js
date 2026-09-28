
const mongoose = require("mongoose");
const Inventory = require("../models/Inventory");
const InventoryMovement = require("../models/InventoryMovement");

const validateId = (id, name = "ID") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(`Invalid ${name}`);
    error.statusCode = 400;
    throw error;
  }
};

const findInventory = async (organizationId, inventoryId) => {
  validateId(organizationId, "Organization ID");
  validateId(inventoryId, "Inventory ID");

  const item = await Inventory.findOne({
    _id: inventoryId,
    organization: organizationId,
    isActive: true,
  });

  if (!item) {
    const error = new Error("Inventory item not found");
    error.statusCode = 404;
    throw error;
  }

  return item;
};

// CREATE
const createInventory = async ({
  organizationId,
  userId,
  data,
}) => {
  validateId(organizationId, "Organization ID");
  validateId(userId, "User ID");

  const item = await Inventory.create({
    ...data,
    sku: data.sku.toUpperCase().trim(),
    organization: organizationId,
    createdBy: userId,
  });

  if (item.quantity > 0) {
    await InventoryMovement.create({
      organization: organizationId,
      inventory: item._id,
      type: "stock_in",
      quantity: item.quantity,
      previousQuantity: 0,
      newQuantity: item.quantity,
      reason: "Initial stock",
      createdBy: userId,
    });
  }

  return item;
};

// GET ALL
const getInventoryItems = async ({
  organizationId,
  query = {},
}) => {
  validateId(organizationId, "Organization ID");

  const {
    search,
    category,
    lowStock,
    page = 1,
    limit = 20,
  } = query;

  const filter = {
    organization: organizationId,
    isActive: true,
  };

  if (category) {
    filter.category = category;
  }

  if (lowStock === "true") {
    filter.$expr = {
      $lte: ["$quantity", "$lowStockThreshold"],
    };
  }

  if (search && search.trim()) {
    const escaped = search.trim().replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    filter.$or = [
      { name: { $regex: escaped, $options: "i" } },
      { sku: { $regex: escaped, $options: "i" } },
      { supplier: { $regex: escaped, $options: "i" } },
    ];
  }

  const currentPage = Math.max(1, Number(page) || 1);
  const perPage = Math.min(100, Math.max(1, Number(limit) || 20));

  const [items, total] = await Promise.all([
    Inventory.find(filter)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage),

    Inventory.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      total,
      page: currentPage,
      limit: perPage,
      totalPages: Math.ceil(total / perPage),
    },
  };
};

// GET SINGLE
const getInventoryById = async ({
  organizationId,
  inventoryId,
}) => {
  return findInventory(organizationId, inventoryId);
};

// UPDATE DETAILS
const updateInventory = async ({
  organizationId,
  inventoryId,
  data,
}) => {
  const item = await findInventory(
    organizationId,
    inventoryId
  );

  const allowedFields = [
    "name",
    "sku",
    "description",
    "category",
    "unit",
    "lowStockThreshold",
    "costPrice",
    "sellingPrice",
    "currency",
    "supplier",
    "location",
    "notes",
  ];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      item[field] =
        field === "sku"
          ? data[field].toUpperCase().trim()
          : data[field];
    }
  });

  await item.save();
  return item;
};

// STOCK IN / OUT / ADJUSTMENT
const changeStock = async ({
  organizationId,
  inventoryId,
  userId,
  type,
  quantity,
  newQuantity,
  reason,
  reference,
}) => {
  validateId(userId, "User ID");

  const item = await findInventory(
    organizationId,
    inventoryId
  );

  const previousQuantity = item.quantity;
  let updatedQuantity;

  if (type === "stock_in") {
    updatedQuantity = previousQuantity + quantity;
  } else if (type === "stock_out") {
    if (previousQuantity < quantity) {
      const error = new Error("Insufficient stock");
      error.statusCode = 400;
      throw error;
    }

    updatedQuantity = previousQuantity - quantity;
  } else if (type === "adjustment") {
    updatedQuantity = newQuantity;
    quantity = Math.abs(newQuantity - previousQuantity);
  } else {
    const error = new Error("Invalid stock movement type");
    error.statusCode = 400;
    throw error;
  }

  // Atomic conditional update prevents stock going below zero.
  const updatedItem = await Inventory.findOneAndUpdate(
    {
      _id: item._id,
      organization: organizationId,
      isActive: true,
      quantity:
        type === "stock_out"
          ? { $gte: quantity }
          : previousQuantity,
    },
    {
      $set: { quantity: updatedQuantity },
    },
    { new: true, runValidators: true }
  );

  if (!updatedItem) {
    const error = new Error(
      "Stock changed concurrently. Please retry."
    );
    error.statusCode = 409;
    throw error;
  }

  try {
    await InventoryMovement.create({
      organization: organizationId,
      inventory: item._id,
      type,
      quantity,
      previousQuantity,
      newQuantity: updatedQuantity,
      reason: reason || "",
      reference: reference || "",
      createdBy: userId,
    });
  } catch (error) {
    // Restore previous quantity if movement history fails.
    await Inventory.updateOne(
      {
        _id: item._id,
        organization: organizationId,
        quantity: updatedQuantity,
      },
      { $set: { quantity: previousQuantity } }
    );

    throw error;
  }

  return updatedItem;
};

// STOCK IN
const stockIn = async (args) => {
  return changeStock({
    ...args,
    type: "stock_in",
  });
};

// STOCK OUT
const stockOut = async (args) => {
  return changeStock({
    ...args,
    type: "stock_out",
  });
};

// STOCK ADJUSTMENT
const adjustStock = async (args) => {
  return changeStock({
    ...args,
    type: "adjustment",
  });
};

// STOCK MOVEMENT HISTORY
const getStockHistory = async ({
  organizationId,
  inventoryId,
  page = 1,
  limit = 20,
}) => {
  validateId(organizationId, "Organization ID");

  const item = await findInventory(
    organizationId,
    inventoryId
  );

  const currentPage = Math.max(1, Number(page) || 1);
  const perPage = Math.min(100, Math.max(1, Number(limit) || 20));

  const [movements, total] = await Promise.all([
    InventoryMovement.find({
      organization: organizationId,
      inventory: item._id,
    })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage),

    InventoryMovement.countDocuments({
      organization: organizationId,
      inventory: item._id,
    }),
  ]);

  return {
    movements,
    pagination: {
      total,
      page: currentPage,
      limit: perPage,
      totalPages: Math.ceil(total / perPage),
    },
  };
};

// INVENTORY STATISTICS
const getInventoryStats = async ({
  organizationId,
}) => {
  validateId(organizationId, "Organization ID");

  const orgId = new mongoose.Types.ObjectId(organizationId);

  const [summary, categories, lowStockItems] =
    await Promise.all([
      Inventory.aggregate([
        {
          $match: {
            organization: orgId,
            isActive: true,
          },
        },
        {
          $group: {
            _id: null,
            totalItems: { $sum: 1 },
            totalUnits: { $sum: "$quantity" },
            inventoryCostValue: {
              $sum: {
                $multiply: ["$quantity", "$costPrice"],
              },
            },
            lowStockCount: {
              $sum: {
                $cond: [
                  {
                    $lte: [
                      "$quantity",
                      "$lowStockThreshold",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
        { $project: { _id: 0 } },
      ]),

      Inventory.aggregate([
        {
          $match: {
            organization: orgId,
            isActive: true,
          },
        },
        {
          $group: {
            _id: "$category",
            itemCount: { $sum: 1 },
            quantity: { $sum: "$quantity" },
            costValue: {
              $sum: {
                $multiply: ["$quantity", "$costPrice"],
              },
            },
          },
        },
        { $sort: { costValue: -1 } },
      ]),

      Inventory.find({
        organization: organizationId,
        isActive: true,
        $expr: {
          $lte: ["$quantity", "$lowStockThreshold"],
        },
      })
        .select("name sku quantity lowStockThreshold unit")
        .limit(50),
    ]);

  return {
    summary: summary[0] || {
      totalItems: 0,
      totalUnits: 0,
      inventoryCostValue: 0,
      lowStockCount: 0,
    },
    categories,
    lowStockItems,
  };
};

// SOFT DELETE
const deleteInventory = async ({
  organizationId,
  inventoryId,
}) => {
  const item = await findInventory(
    organizationId,
    inventoryId
  );

  item.isActive = false;
  await item.save();

  return item;
};

module.exports = {
  createInventory,
  getInventoryItems,
  getInventoryById,
  updateInventory,
  stockIn,
  stockOut,
  adjustStock,
  getStockHistory,
  getInventoryStats,
  deleteInventory,
};