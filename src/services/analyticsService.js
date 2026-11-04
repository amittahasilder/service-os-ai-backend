
const mongoose = require("mongoose");

const Customer = require("../models/Customer");
const Lead = require("../models/Lead");
const Booking = require("../models/Booking");
const Job = require("../models/Job");
const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");
const Expense = require("../models/Expense");

// =====================================
// HELPERS
// =====================================

const roundMoney = (value) =>
  Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

const getAmount = async (Model, filter, field) => {
  const result = await Model.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        total: { $sum: `$${field}` },
      },
    },
  ]);

  return roundMoney(result[0]?.total || 0);
};

// =====================================
// ANALYTICS OVERVIEW
// =====================================

const getAnalyticsOverview = async ({
  organizationId,
  year = new Date().getFullYear(),
}) => {
  if (!mongoose.isValidObjectId(organizationId)) {
    const error = new Error("Invalid organization ID.");
    error.statusCode = 400;
    throw error;
  }

  const organization = new mongoose.Types.ObjectId(organizationId);
  const selectedYear = Number(year);

  if (
    !Number.isInteger(selectedYear) ||
    selectedYear < 2000 ||
    selectedYear > 2100
  ) {
    const error = new Error("Invalid analytics year.");
    error.statusCode = 400;
    throw error;
  }

  const activeFilter = {
    organization,
    isActive: true,
  };

  const bdtFilter = {
    ...activeFilter,
    currency: "BDT",
  };

  const start = new Date(selectedYear, 0, 1);
  const end = new Date(selectedYear + 1, 0, 1);

  const dateFilter = {
    $gte: start,
    $lt: end,
  };

  const [
    totalCustomers,
    totalLeads,
    totalBookings,
    totalJobs,
    completedJobs,
    totalInvoices,
    totalRevenue,
    refundedAmount,
    totalExpenses,
    monthlyRevenue,
    monthlyExpenses,
    jobStatuses,
    leadStatuses,
  ] = await Promise.all([
    Customer.countDocuments(activeFilter),
    Lead.countDocuments(activeFilter),
    Booking.countDocuments(activeFilter),
    Job.countDocuments(activeFilter),
    Job.countDocuments({
      ...activeFilter,
      status: "completed",
    }),
    Invoice.countDocuments(activeFilter),

    getAmount(
      Payment,
      {
        ...bdtFilter,
        status: "completed",
        paymentDate: dateFilter,
      },
      "amount"
    ),

    getAmount(
      Payment,
      {
        ...bdtFilter,
        status: "refunded",
        paymentDate: dateFilter,
      },
      "amount"
    ),

    getAmount(
      Expense,
      {
        ...bdtFilter,
        status: "paid",
        expenseDate: dateFilter,
      },
      "amount"
    ),

    Payment.aggregate([
      {
        $match: {
          ...bdtFilter,
          status: "completed",
          paymentDate: dateFilter,
        },
      },
      {
        $group: {
          _id: { $month: "$paymentDate" },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    Expense.aggregate([
      {
        $match: {
          ...bdtFilter,
          status: "paid",
          expenseDate: dateFilter,
        },
      },
      {
        $group: {
          _id: { $month: "$expenseDate" },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    Job.aggregate([
      { $match: activeFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),

    Lead.aggregate([
      { $match: activeFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const createMonthlyData = (rows) => {
    const result = Array.from({ length: 12 }, (_, index) => ({
      month: new Date(selectedYear, index, 1).toLocaleString(
        "en-US",
        { month: "short" }
      ),
      monthNumber: index + 1,
      total: 0,
    }));

    rows.forEach((row) => {
      result[row._id - 1].total = roundMoney(row.total);
    });

    return result;
  };

  const revenueData = createMonthlyData(monthlyRevenue);
  const expenseData = createMonthlyData(monthlyExpenses);

  return {
    year: selectedYear,
    currency: "BDT",

    overview: {
      totalCustomers,
      totalLeads,
      totalBookings,
      totalJobs,
      completedJobs,
      totalInvoices,
      totalRevenue,
      refundedAmount,
      totalExpenses,
      netCashFlow: roundMoney(
        totalRevenue - refundedAmount - totalExpenses
      ),
    },

    monthly: {
      revenue: revenueData,
      expenses: expenseData,
    },

    jobStatuses: jobStatuses.map((item) => ({
      status: item._id,
      count: item.count,
    })),

    leadStatuses: leadStatuses.map((item) => ({
      status: item._id,
      count: item.count,
    })),

    generatedAt: new Date(),
  };
};

module.exports = {
  getAnalyticsOverview,
};
