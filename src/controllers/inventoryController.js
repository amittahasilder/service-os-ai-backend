
const service = require("../services/inventoryService");

const createInventoryController = async (req, res, next) => {
  try {
    const item = await service.createInventory({
      organizationId: req.organizationId,
      userId: req.user._id,
      data: req.body,
    });

    res.status(201).json({
      success: true,
      message: "Inventory item created successfully",
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

const getInventoryController = async (req, res, next) => {
  try {
    const result = await service.getInventoryItems({
      organizationId: req.organizationId,
      query: req.query,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const getInventoryByIdController = async (req, res, next) => {
  try {
    const item = await service.getInventoryById({
      organizationId: req.organizationId,
      inventoryId: req.params.inventoryId,
    });

    res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

const updateInventoryController = async (req, res, next) => {
  try {
    const item = await service.updateInventory({
      organizationId: req.organizationId,
      inventoryId: req.params.inventoryId,
      data: req.body,
    });

    res.status(200).json({
      success: true,
      message: "Inventory updated successfully",
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

const stockInController = async (req, res, next) => {
  try {
    const item = await service.stockIn({
      organizationId: req.organizationId,
      inventoryId: req.params.inventoryId,
      userId: req.user._id,
      ...req.body,
    });

    res.status(200).json({
      success: true,
      message: "Stock added successfully",
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

const stockOutController = async (req, res, next) => {
  try {
    const item = await service.stockOut({
      organizationId: req.organizationId,
      inventoryId: req.params.inventoryId,
      userId: req.user._id,
      ...req.body,
    });

    res.status(200).json({
      success: true,
      message: "Stock removed successfully",
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

const adjustStockController = async (req, res, next) => {
  try {
    const item = await service.adjustStock({
      organizationId: req.organizationId,
      inventoryId: req.params.inventoryId,
      userId: req.user._id,
      ...req.body,
    });

    res.status(200).json({
      success: true,
      message: "Stock adjusted successfully",
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

const getStockHistoryController = async (req, res, next) => {
  try {
    const result = await service.getStockHistory({
      organizationId: req.organizationId,
      inventoryId: req.params.inventoryId,
      page: req.query.page,
      limit: req.query.limit,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const getInventoryStatsController = async (req, res, next) => {
  try {
    const stats = await service.getInventoryStats({
      organizationId: req.organizationId,
    });

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

const deleteInventoryController = async (req, res, next) => {
  try {
    const item = await service.deleteInventory({
      organizationId: req.organizationId,
      inventoryId: req.params.inventoryId,
    });

    res.status(200).json({
      success: true,
      message: "Inventory item deleted successfully",
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInventoryController,
  getInventoryController,
  getInventoryByIdController,
  updateInventoryController,
  stockInController,
  stockOutController,
  adjustStockController,
  getStockHistoryController,
  getInventoryStatsController,
  deleteInventoryController,
};