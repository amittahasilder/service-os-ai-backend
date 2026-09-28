
const Expense = require("../models/Expense");
const mongoose = require("mongoose");

// =====================================
// HELPER: Validate MongoDB ObjectId
// =====================================
const validateObjectId = (id, fieldName = "ID") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error(`Invalid ${fieldName}`);
    error.statusCode = 400;
    throw error;
  }
};

// =====================================
// HELPER: Generate Expense Number
// =====================================
const generateExpenseNumber = async (organizationId) => {
  const year = new Date().getFullYear();
  const prefix = `EXP-${year}-`;

  const lastExpense = await Expense.findOne({
    organization: organizationId,
    expenseNumber: { $regex: `^${prefix}` },
  }).sort({ createdAt: -1 });

  let nextNumber = 1;

  if (lastExpense && lastExpense.expenseNumber) {
    const lastNumber = parseInt(
      lastExpense.expenseNumber.split("-").pop(),
      10
    );

    if (!Number.isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  return `${prefix}${String(nextNumber).padStart(5, "0")}`;
};

// =====================================
// CREATE EXPENSE
// =====================================
const createExpense = async ({
  organizationId,
  userId,
  data,
}) => {
  validateObjectId(organizationId, "Organization ID");
  validateObjectId(userId, "User ID");

  const expenseNumber = await generateExpenseNumber(
    organizationId
  );

  const expense = await Expense.create({
    ...data,
    organization: organizationId,
    createdBy: userId,
    expenseNumber,
  });

  return expense;
};

// =====================================
// GET ALL ORGANIZATION EXPENSES
// =====================================
const getOrganizationExpenses = async ({
  organizationId,
  query = {},
}) => {
  validateObjectId(organizationId, "Organization ID");

  const {
    category,
    status,
    paymentMethod,
    startDate,
    endDate,
    search,
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

  if (status) {
    filter.status = status;
  }

  if (paymentMethod) {
    filter.paymentMethod = paymentMethod;
  }

  // Date range filter
  if (startDate || endDate) {
    filter.expenseDate = {};

    if (startDate) {
      const start = new Date(startDate);

      if (Number.isNaN(start.getTime())) {
        const error = new Error("Invalid startDate");
        error.statusCode = 400;
        throw error;
      }

      filter.expenseDate.$gte = start;
    }

    if (endDate) {
      const end = new Date(endDate);

      if (Number.isNaN(end.getTime())) {
        const error = new Error("Invalid endDate");
        error.statusCode = 400;
        throw error;
      }

      end.setHours(23, 59, 59, 999);
      filter.expenseDate.$lte = end;
    }
  }

  // Search by title, vendor, or expense number
  if (search && search.trim()) {
    const escapedSearch = search.trim().replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    filter.$or = [
      { title: { $regex: escapedSearch, $options: "i" } },
      { vendor: { $regex: escapedSearch, $options: "i" } },
      {
        expenseNumber: {
          $regex: escapedSearch,
          $options: "i",
        },
      },
    ];
  }

  const currentPage = Math.max(1, Number(page) || 1);
  const perPage = Math.min(
    100,
    Math.max(1, Number(limit) || 20)
  );

  const skip = (currentPage - 1) * perPage;

  const expenses = await Expense.find(filter)
    .populate("createdBy", "name email")
    .sort({ expenseDate: -1, createdAt: -1 })
    .skip(skip)
    .limit(perPage);

  return expenses;
};

// =====================================
// GET SINGLE EXPENSE
// =====================================
const getExpenseById = async ({
  organizationId,
  expenseId,
}) => {
  validateObjectId(organizationId, "Organization ID");
  validateObjectId(expenseId, "Expense ID");

  const expense = await Expense.findOne({
    _id: expenseId,
    organization: organizationId,
    isActive: true,
  }).populate("createdBy", "name email");

  if (!expense) {
    const error = new Error("Expense not found");
    error.statusCode = 404;
    throw error;
  }

  return expense;
};

// =====================================
// UPDATE EXPENSE
// =====================================
const updateExpense = async ({
  organizationId,
  expenseId,
  data,
}) => {
  validateObjectId(organizationId, "Organization ID");
  validateObjectId(expenseId, "Expense ID");

  const expense = await Expense.findOne({
    _id: expenseId,
    organization: organizationId,
    isActive: true,
  });

  if (!expense) {
    const error = new Error("Expense not found");
    error.statusCode = 404;
    throw error;
  }

  // Prevent changing tenant and system fields
  const allowedFields = [
    "title",
    "description",
    "category",
    "amount",
    "currency",
    "paymentMethod",
    "status",
    "expenseDate",
    "vendor",
    "referenceNumber",
    "receiptUrl",
    "notes",
  ];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      expense[field] = data[field];
    }
  });

  await expense.save();

  return expense;
};

// =====================================
// SOFT DELETE EXPENSE
// =====================================
const deleteExpense = async ({
  organizationId,
  expenseId,
}) => {
  validateObjectId(organizationId, "Organization ID");
  validateObjectId(expenseId, "Expense ID");

  const expense = await Expense.findOne({
    _id: expenseId,
    organization: organizationId,
    isActive: true,
  });

  if (!expense) {
    const error = new Error("Expense not found");
    error.statusCode = 404;
    throw error;
  }

  expense.isActive = false;
  expense.status = "cancelled";

  await expense.save();

  return expense;
};

// =====================================
// EXPENSE STATISTICS
// =====================================
const getExpenseStats = async ({
  organizationId,
  query = {},
}) => {
  validateObjectId(organizationId, "Organization ID");

  const filter = {
    organization: new mongoose.Types.ObjectId(
      organizationId
    ),
    isActive: true,
  };

  if (query.startDate || query.endDate) {
    filter.expenseDate = {};

    if (query.startDate) {
      const start = new Date(query.startDate);

      if (Number.isNaN(start.getTime())) {
        const error = new Error("Invalid startDate");
        error.statusCode = 400;
        throw error;
      }

      filter.expenseDate.$gte = start;
    }

    if (query.endDate) {
      const end = new Date(query.endDate);

      if (Number.isNaN(end.getTime())) {
        const error = new Error("Invalid endDate");
        error.statusCode = 400;
        throw error;
      }

      end.setHours(23, 59, 59, 999);
      filter.expenseDate.$lte = end;
    }
  }

  const [summary, categoryStats, monthlyStats] =
    await Promise.all([
      Expense.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalExpenses: { $sum: "$amount" },
            paidExpenses: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "paid"] },
                  "$amount",
                  0,
                ],
              },
            },
            pendingExpenses: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "pending"] },
                  "$amount",
                  0,
                ],
              },
            },
            totalCount: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            totalExpenses: 1,
            paidExpenses: 1,
            pendingExpenses: 1,
            totalCount: 1,
          },
        },
      ]),

      Expense.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$category",
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { totalAmount: -1 } },
      ]),

      Expense.aggregate([
        { $match: filter },
        {
          $group: {
            _id: {
              year: { $year: "$expenseDate" },
              month: { $month: "$expenseDate" },
            },
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
      ]),
    ]);

  return {
    summary: summary[0] || {
      totalExpenses: 0,
      paidExpenses: 0,
      pendingExpenses: 0,
      totalCount: 0,
    },
    categoryStats,
    monthlyStats,
  };
};

// =====================================
// EXPORT SERVICES
// =====================================
module.exports = {
  createExpense,
  getOrganizationExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getExpenseStats,
};