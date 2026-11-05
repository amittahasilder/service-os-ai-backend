

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

const validateOrganizationId = (organizationId) => {
  if (!mongoose.isValidObjectId(organizationId)) {
    const error = new Error("Invalid organization ID.");
    error.statusCode = 400;
    throw error;
  }
};

const roundMoney = (value) =>
  Math.round((Number(value) || 0) * 100) / 100;

const normalizeCurrency = (currency) =>
  String(currency || "BDT").toUpperCase();

// =====================================
// GET FINANCIAL TOTALS BY CURRENCY
// =====================================

const getFinancialSummary = async (organizationId) => {
  const organization = new mongoose.Types.ObjectId(
    organizationId
  );

  const [
    paymentSummary,
    refundedSummary,
    expenseSummary,
    invoiceSummary,
  ] = await Promise.all([

    // COMPLETED PAYMENTS
    Payment.aggregate([
      {
        $match: {
          organization,
          isActive: true,
          status: "completed",
        },
      },
      {
        $group: {
          _id: "$currency",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]),

    // REFUNDED PAYMENTS
    Payment.aggregate([
      {
        $match: {
          organization,
          isActive: true,
          status: "refunded",
        },
      },
      {
        $group: {
          _id: "$currency",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]),

    // PAID EXPENSES
    Expense.aggregate([
      {
        $match: {
          organization,
          isActive: true,
          status: "paid",
        },
      },
      {
        $group: {
          _id: "$currency",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]),

    // OUTSTANDING INVOICES
    Invoice.aggregate([
      {
        $match: {
          organization,
          isActive: true,
          status: {
            $in: ["sent", "partially_paid", "overdue"],
          },
        },
      },
      {
        $group: {
          _id: "$currency",
          outstanding: { $sum: "$balanceDue" },
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  // =====================================
  // COMBINE CURRENCIES
  // =====================================

  const currencyMap = new Map();

  const getCurrencyEntry = (currency) => {
    const key = normalizeCurrency(currency);

    if (!currencyMap.has(key)) {
      currencyMap.set(key, {
        currency: key,
        collectedRevenue: 0,
        refundedPayments: 0,
        paidExpenses: 0,
        estimatedProfit: 0,
        outstandingBalance: 0,
        paymentCount: 0,
        refundCount: 0,
        expenseCount: 0,
        outstandingInvoiceCount: 0,
      });
    }

    return currencyMap.get(key);
  };

  paymentSummary.forEach((item) => {
    const entry = getCurrencyEntry(item._id);

    entry.collectedRevenue = Number(item.total || 0);
    entry.paymentCount = item.count || 0;
  });

  refundedSummary.forEach((item) => {
    const entry = getCurrencyEntry(item._id);

    entry.refundedPayments = Number(item.total || 0);
    entry.refundCount = item.count || 0;
  });

  expenseSummary.forEach((item) => {
    const entry = getCurrencyEntry(item._id);

    entry.paidExpenses = Number(item.total || 0);
    entry.expenseCount = item.count || 0;
  });

  invoiceSummary.forEach((item) => {
    const entry = getCurrencyEntry(item._id);

    entry.outstandingBalance = Number(
      item.outstanding || 0
    );

    entry.outstandingInvoiceCount = item.count || 0;
  });

  const financials = Array.from(currencyMap.values()).map(
    (item) => ({
      ...item,
      collectedRevenue: roundMoney(item.collectedRevenue),
      refundedPayments: roundMoney(item.refundedPayments),
      paidExpenses: roundMoney(item.paidExpenses),
      estimatedProfit: roundMoney(
        item.collectedRevenue - item.paidExpenses
      ),
      outstandingBalance: roundMoney(
        item.outstandingBalance
      ),
    })
  );

  return financials;
};

// =====================================
// GET BUSINESS CONTEXT
// =====================================

const getBusinessContext = async ({ organizationId }) => {
  validateOrganizationId(organizationId);

  const organization = new mongoose.Types.ObjectId(
    organizationId
  );

  const organizationFilter = {
    organization,
  };

  const [
    totalCustomers,
    totalLeads,
    totalBookings,
    totalJobs,
    totalInvoices,
    paidInvoices,
    pendingInvoices,
    completedJobs,
    pendingJobs,
    inProgressJobs,
    recentJobs,
    financials,
  ] = await Promise.all([

    Customer.countDocuments(organizationFilter),

    Lead.countDocuments(organizationFilter),

    Booking.countDocuments(organizationFilter),

    Job.countDocuments(organizationFilter),

    Invoice.countDocuments({
      ...organizationFilter,
      isActive: true,
    }),

    Invoice.countDocuments({
      ...organizationFilter,
      isActive: true,
      status: "paid",
    }),

    Invoice.countDocuments({
      ...organizationFilter,
      isActive: true,
      status: {
        $in: ["sent", "partially_paid", "overdue"],
      },
    }),

    Job.countDocuments({
      ...organizationFilter,
      isActive: true,
      status: "completed",
    }),

    Job.countDocuments({
      ...organizationFilter,
      isActive: true,
      status: {
        $in: ["pending", "assigned"],
      },
    }),

    Job.countDocuments({
      ...organizationFilter,
      isActive: true,
      status: "in_progress",
    }),

    Job.find({
      ...organizationFilter,
      isActive: true,
    })
      .select("jobNumber title status priority scheduledDate")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),

    getFinancialSummary(organizationId),
  ]);

  // =====================================
  // RESPONSE
  // =====================================

  return {
    summary: {
      totalCustomers,
      totalLeads,
      totalBookings,
      totalJobs,
      totalInvoices,

      paidInvoices,
      pendingInvoices,

      completedJobs,
      pendingJobs,
      inProgressJobs,
    },

    financials,

    recentActivity: {
      jobs: recentJobs,
    },

    financialNotes: [
      "Revenue represents completed active payments.",
      "Refunded payments are reported separately.",
      "Expenses represent paid active expenses only.",
      "Outstanding balance comes from active sent, partially paid and overdue invoices.",
      "Estimated profit is collected revenue minus paid expenses.",
      "Financial figures are separated by currency and must not be combined across currencies.",
      "Estimated profit is not a tax-adjusted accounting profit.",
    ],

    generatedAt: new Date(),
  };
};

// =====================================
// EXPORTS
// =====================================

module.exports = {
  getBusinessContext,
  getFinancialSummary,
};
