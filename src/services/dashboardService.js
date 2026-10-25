
const mongoose = require("mongoose");

const Customer = require("../models/Customer");
const Booking = require("../models/Booking");
const Job = require("../models/Job");
const Lead = require("../models/Lead");
const Invoice = require("../models/Invoice");
const Payment = require("../models/Payment");
const Expense = require("../models/Expense");

// =====================================
// HELPERS
// =====================================

const roundMoney = (amount) =>
  Math.round((Number(amount) + Number.EPSILON) * 100) / 100;

const getCount = (Model, filter) =>
  Model.countDocuments(filter);

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
// DASHBOARD SUMMARY
// =====================================

const getDashboardSummary = async ({ organizationId }) => {
  if (!mongoose.Types.ObjectId.isValid(organizationId)) {
    const error = new Error("Invalid organization ID.");
    error.statusCode = 400;
    throw error;
  }

  const organization = new mongoose.Types.ObjectId(
    organizationId
  );

  const activeFilter = {
    organization,
    isActive: true,
  };

  const [
    totalCustomers,
    totalBookings,
    totalJobs,
    activeJobs,
    completedJobs,
    newLeads,
    totalLeads,
    totalInvoices,
    pendingInvoices,
    totalRevenue,
    refundedAmount,
    totalExpenses,
    pendingExpenses,
    upcomingBookings,
    outstandingBalance,
  ] = await Promise.all([
    getCount(Customer, activeFilter),

    getCount(Booking, activeFilter),

    getCount(Job, activeFilter),

    getCount(Job, {
      ...activeFilter,
      status: { $in: ["pending", "assigned", "in_progress"] },
    }),

    getCount(Job, {
      ...activeFilter,
      status: "completed",
    }),

    getCount(Lead, {
      ...activeFilter,
      status: "new",
    }),

    getCount(Lead, activeFilter),

    getCount(Invoice, activeFilter),

    getCount(Invoice, {
      ...activeFilter,
      status: { $in: ["sent", "partially_paid", "overdue"] },
    }),

    getAmount(
      Payment,
      { ...activeFilter, status: "completed" },
      "amount"
    ),

    getAmount(
      Payment,
      { ...activeFilter, status: "refunded" },
      "amount"
    ),

    getAmount(
      Expense,
      { ...activeFilter, status: "paid" },
      "amount"
    ),

    getCount(Expense, {
      ...activeFilter,
      status: "pending",
    }),

    getCount(Booking, {
      ...activeFilter,
      bookingDate: { $gte: new Date() },
      status: { $in: ["pending", "confirmed"] },
    }),

    getAmount(
      Invoice,
      activeFilter,
      "balanceDue"
    ),
  ]);

  const netCashFlow = roundMoney(
    totalRevenue - refundedAmount - totalExpenses
  );

  return {
    summary: {
      totalCustomers,
      totalBookings,
      totalJobs,
      activeJobs,
      completedJobs,
      newLeads,
      totalLeads,
      totalInvoices,
      pendingInvoices,
      totalRevenue,
      refundedAmount,
      totalExpenses,
      pendingExpenses,
      upcomingBookings,
      outstandingBalance,
      netCashFlow,
    },
    generatedAt: new Date(),
  };
};

module.exports = {
  getDashboardSummary,
};
