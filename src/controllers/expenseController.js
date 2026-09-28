
const {
  createExpense,
  getOrganizationExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseStats,
} = require("../services/expenseService");

const createExpenseController = async (req, res, next) => {
  try {
    const expense = await createExpense({
      organizationId: req.organizationId,
      userId: req.user._id,
      data: req.body,
    });

    res.status(201).json({
      success: true,
      message: "Expense created successfully",
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

const getExpenses = async (req, res, next) => {
  try {
    const expenses = await getOrganizationExpenses({
      organizationId: req.organizationId,
      query: req.query,
    });

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    next(error);
  }
};

const getExpense = async (req, res, next) => {
  try {
    const expense = await getExpenseById({
      organizationId: req.organizationId,
      expenseId: req.params.expenseId,
    });

    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

const updateExpenseController = async (req, res, next) => {
  try {
    const expense = await updateExpense({
      organizationId: req.organizationId,
      expenseId: req.params.expenseId,
      data: req.body,
    });

    res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

const removeExpense = async (req, res, next) => {
  try {
    const expense = await deleteExpense({
      organizationId: req.organizationId,
      expenseId: req.params.expenseId,
    });

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

const expenseStats = async (req, res, next) => {
  try {
    const stats = await getExpenseStats({
      organizationId: req.organizationId,
      query: req.query,
    });

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExpenseController,
  getExpenses,
  getExpense,
  updateExpenseController,
  removeExpense,
  expenseStats,
};