
// const mongoose = require("mongoose");

// const Customer = require("../models/Customer");
// const Lead = require("../models/Lead");
// const Booking = require("../models/Booking");
// const Job = require("../models/Job");
// const Invoice = require("../models/Invoice");
// const Payment = require("../models/Payment");
// const Expense = require("../models/Expense");

// // =====================================
// // HELPERS
// // =====================================

// const roundMoney = (value) =>
//   Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

// const getAmount = async (Model, filter, field) => {
//   const result = await Model.aggregate([
//     { $match: filter },
//     {
//       $group: {
//         _id: null,
//         total: { $sum: `$${field}` },
//       },
//     },
//   ]);

//   return roundMoney(result[0]?.total || 0);
// };

// // =====================================
// // ANALYTICS OVERVIEW
// // =====================================

// const getAnalyticsOverview = async ({
//   organizationId,
//   year = new Date().getFullYear(),
// }) => {
//   if (!mongoose.isValidObjectId(organizationId)) {
//     const error = new Error("Invalid organization ID.");
//     error.statusCode = 400;
//     throw error;
//   }

//   const organization = new mongoose.Types.ObjectId(organizationId);
//   const selectedYear = Number(year);

//   if (
//     !Number.isInteger(selectedYear) ||
//     selectedYear < 2000 ||
//     selectedYear > 2100
//   ) {
//     const error = new Error("Invalid analytics year.");
//     error.statusCode = 400;
//     throw error;
//   }

//   const activeFilter = {
//     organization,
//     isActive: true,
//   };

//   const bdtFilter = {
//     ...activeFilter,
//     currency: "BDT",
//   };

//   const start = new Date(selectedYear, 0, 1);
//   const end = new Date(selectedYear + 1, 0, 1);

//   const dateFilter = {
//     $gte: start,
//     $lt: end,
//   };

//   const [
//     totalCustomers,
//     totalLeads,
//     totalBookings,
//     totalJobs,
//     completedJobs,
//     totalInvoices,
//     totalRevenue,
//     refundedAmount,
//     totalExpenses,
//     monthlyRevenue,
//     monthlyExpenses,
//     jobStatuses,
//     leadStatuses,
//   ] = await Promise.all([
//     Customer.countDocuments(activeFilter),
//     Lead.countDocuments(activeFilter),
//     Booking.countDocuments(activeFilter),
//     Job.countDocuments(activeFilter),
//     Job.countDocuments({
//       ...activeFilter,
//       status: "completed",
//     }),
//     Invoice.countDocuments(activeFilter),

//     getAmount(
//       Payment,
//       {
//         ...bdtFilter,
//         status: "completed",
//         paymentDate: dateFilter,
//       },
//       "amount"
//     ),

//     getAmount(
//       Payment,
//       {
//         ...bdtFilter,
//         status: "refunded",
//         paymentDate: dateFilter,
//       },
//       "amount"
//     ),

//     getAmount(
//       Expense,
//       {
//         ...bdtFilter,
//         status: "paid",
//         expenseDate: dateFilter,
//       },
//       "amount"
//     ),

//     Payment.aggregate([
//       {
//         $match: {
//           ...bdtFilter,
//           status: "completed",
//           paymentDate: dateFilter,
//         },
//       },
//       {
//         $group: {
//           _id: { $month: "$paymentDate" },
//           total: { $sum: "$amount" },
//         },
//       },
//       { $sort: { _id: 1 } },
//     ]),

//     Expense.aggregate([
//       {
//         $match: {
//           ...bdtFilter,
//           status: "paid",
//           expenseDate: dateFilter,
//         },
//       },
//       {
//         $group: {
//           _id: { $month: "$expenseDate" },
//           total: { $sum: "$amount" },
//         },
//       },
//       { $sort: { _id: 1 } },
//     ]),

//     Job.aggregate([
//       { $match: activeFilter },
//       {
//         $group: {
//           _id: "$status",
//           count: { $sum: 1 },
//         },
//       },
//     ]),

//     Lead.aggregate([
//       { $match: activeFilter },
//       {
//         $group: {
//           _id: "$status",
//           count: { $sum: 1 },
//         },
//       },
//     ]),
//   ]);

//   const createMonthlyData = (rows) => {
//     const result = Array.from({ length: 12 }, (_, index) => ({
//       month: new Date(selectedYear, index, 1).toLocaleString(
//         "en-US",
//         { month: "short" }
//       ),
//       monthNumber: index + 1,
//       total: 0,
//     }));

//     rows.forEach((row) => {
//       result[row._id - 1].total = roundMoney(row.total);
//     });

//     return result;
//   };

//   const revenueData = createMonthlyData(monthlyRevenue);
//   const expenseData = createMonthlyData(monthlyExpenses);

//   return {
//     year: selectedYear,
//     currency: "BDT",

//     overview: {
//       totalCustomers,
//       totalLeads,
//       totalBookings,
//       totalJobs,
//       completedJobs,
//       totalInvoices,
//       totalRevenue,
//       refundedAmount,
//       totalExpenses,
//       netCashFlow: roundMoney(
//         totalRevenue - refundedAmount - totalExpenses
//       ),
//     },

//     monthly: {
//       revenue: revenueData,
//       expenses: expenseData,
//     },

//     jobStatuses: jobStatuses.map((item) => ({
//       status: item._id,
//       count: item.count,
//     })),

//     leadStatuses: leadStatuses.map((item) => ({
//       status: item._id,
//       count: item.count,
//     })),

//     generatedAt: new Date(),
//   };
// };

// module.exports = {
//   getAnalyticsOverview,
// };





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

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

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
// DATE RANGE
// =====================================

const parseDate = (value, fieldName) => {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    throw createError(`${fieldName} must use YYYY-MM-DD format.`);
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw createError(`Invalid ${fieldName}.`);
  }

  return date;
};

const getDateRange = ({ year, startDate, endDate }) => {
  // Custom date range
  if (startDate || endDate) {
    if (!startDate || !endDate) {
      throw createError(
        "Both startDate and endDate are required."
      );
    }

    const start = parseDate(startDate, "startDate");
    const end = parseDate(endDate, "endDate");

    if (start > end) {
      throw createError(
        "startDate cannot be later than endDate."
      );
    }

    // Include the complete end date
    const endExclusive = new Date(end);
    endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);

    return {
      start,
      end: endExclusive,
      startDate,
      endDate,
      selectedYear: null,
      isCustomRange: true,
    };
  }

  // Existing yearly filter
  const selectedYear = Number(
    year || new Date().getFullYear()
  );

  if (
    !Number.isInteger(selectedYear) ||
    selectedYear < 2000 ||
    selectedYear > 2100
  ) {
    throw createError("Invalid analytics year.");
  }

  return {
    start: new Date(Date.UTC(selectedYear, 0, 1)),
    end: new Date(Date.UTC(selectedYear + 1, 0, 1)),
    startDate: `${selectedYear}-01-01`,
    endDate: `${selectedYear}-12-31`,
    selectedYear,
    isCustomRange: false,
  };
};

// =====================================
// TIMELINE AGGREGATION
// =====================================

const getTimeline = async ({
  Model,
  filter,
  dateField,
  granularity,
}) => {
  const dateFormat =
    granularity === "daily" ? "%Y-%m-%d" : "%Y-%m";

  return Model.aggregate([
    { $match: filter },
    {
      $group: {
        _id: {
          $dateToString: {
            format: dateFormat,
            date: `$${dateField}`,
            timezone: "UTC",
          },
        },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

// =====================================
// MONTHLY DATA (BACKWARD COMPATIBILITY)
// =====================================

const createMonthlyData = (rows, selectedYear) => {
  const result = Array.from({ length: 12 }, (_, index) => ({
    month: new Date(
      Date.UTC(selectedYear, index, 1)
    ).toLocaleString("en-US", {
      month: "short",
      timeZone: "UTC",
    }),
    monthNumber: index + 1,
    _id: index + 1,
    total: 0,
  }));

  rows.forEach((row) => {
    const monthNumber = Number(row._id);

    if (monthNumber >= 1 && monthNumber <= 12) {
      result[monthNumber - 1].total = roundMoney(row.total);
    }
  });

  return result;
};

// =====================================
// ANALYTICS OVERVIEW
// =====================================

const getAnalyticsOverview = async ({
  organizationId,
  year,
  startDate,
  endDate,
  granularity,
}) => {
  if (!mongoose.isValidObjectId(organizationId)) {
    throw createError("Invalid organization ID.");
  }

  const organization = new mongoose.Types.ObjectId(
    organizationId
  );

  const range = getDateRange({
    year,
    startDate,
    endDate,
  });

  // Choose chart grouping
  let selectedGranularity = granularity;

  if (!selectedGranularity) {
    if (range.isCustomRange) {
      const days =
        (range.end.getTime() - range.start.getTime()) /
        (1000 * 60 * 60 * 24);

      selectedGranularity = days <= 62 ? "daily" : "monthly";
    } else {
      selectedGranularity = "monthly";
    }
  }

  if (!["daily", "monthly"].includes(selectedGranularity)) {
    throw createError(
      "granularity must be daily or monthly."
    );
  }

  const activeFilter = {
    organization,
    isActive: true,
  };

  const bdtFilter = {
    ...activeFilter,
    currency: "BDT",
  };

  const paymentDateFilter = {
    ...bdtFilter,
    paymentDate: {
      $gte: range.start,
      $lt: range.end,
    },
  };

  const expenseDateFilter = {
    ...bdtFilter,
    expenseDate: {
      $gte: range.start,
      $lt: range.end,
    },
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
    revenueTimeline,
    expenseTimeline,
    jobStatuses,
    leadStatuses,
  ] = await Promise.all([
    // All-time business counts
    Customer.countDocuments(activeFilter),
    Lead.countDocuments(activeFilter),
    Booking.countDocuments(activeFilter),
    Job.countDocuments(activeFilter),

    Job.countDocuments({
      ...activeFilter,
      status: "completed",
    }),

    Invoice.countDocuments(activeFilter),

    // Selected date range financial data
    getAmount(
      Payment,
      {
        ...paymentDateFilter,
        status: "completed",
      },
      "amount"
    ),

    getAmount(
      Payment,
      {
        ...paymentDateFilter,
        status: "refunded",
      },
      "amount"
    ),

    getAmount(
      Expense,
      {
        ...expenseDateFilter,
        status: "paid",
      },
      "amount"
    ),

    // Dynamic revenue timeline
    getTimeline({
      Model: Payment,
      filter: {
        ...paymentDateFilter,
        status: "completed",
      },
      dateField: "paymentDate",
      granularity: selectedGranularity,
    }),

    // Dynamic expense timeline
    getTimeline({
      Model: Expense,
      filter: {
        ...expenseDateFilter,
        status: "paid",
      },
      dateField: "expenseDate",
      granularity: selectedGranularity,
    }),

    // All-time status breakdowns
    Job.aggregate([
      { $match: activeFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),

    Lead.aggregate([
      { $match: activeFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  // Merge revenue and expenses into one timeline
  const timelineMap = new Map();

  revenueTimeline.forEach((item) => {
    timelineMap.set(item._id, {
      date: item._id,
      revenue: roundMoney(item.total),
      expenses: 0,
    });
  });

  expenseTimeline.forEach((item) => {
    const existing = timelineMap.get(item._id) || {
      date: item._id,
      revenue: 0,
      expenses: 0,
    };

    existing.expenses = roundMoney(item.total);
    timelineMap.set(item._id, existing);
  });

  const timeline = Array.from(
    timelineMap.values()
  ).sort((a, b) => a.date.localeCompare(b.date));

  // Keep the previous monthly response for existing UI
  let monthly = {
    revenue: [],
    expenses: [],
  };

  if (!range.isCustomRange) {
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          ...paymentDateFilter,
          status: "completed",
        },
      },
      {
        $group: {
          _id: { $month: "$paymentDate" },
          total: { $sum: "$amount" },
        },
      },
    ]);

    const monthlyExpenses = await Expense.aggregate([
      {
        $match: {
          ...expenseDateFilter,
          status: "paid",
        },
      },
      {
        $group: {
          _id: { $month: "$expenseDate" },
          total: { $sum: "$amount" },
        },
      },
    ]);

    monthly = {
      revenue: createMonthlyData(
        monthlyRevenue,
        range.selectedYear
      ),
      expenses: createMonthlyData(
        monthlyExpenses,
        range.selectedYear
      ),
    };
  }

  return {
    year: range.selectedYear,
    dateRange: {
      startDate: range.startDate,
      endDate: range.endDate,
    },
    granularity: selectedGranularity,
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

    timeline,

    // Backward compatibility with the existing Analytics.jsx
    monthly,

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
