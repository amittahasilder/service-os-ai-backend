
// const mongoose = require("mongoose");

// const Customer = require("../models/Customer");
// const Booking = require("../models/Booking");
// const Job = require("../models/Job");
// const Lead = require("../models/Lead");
// const Invoice = require("../models/Invoice");
// const Payment = require("../models/Payment");
// const Expense = require("../models/Expense");

// // =====================================
// // HELPERS
// // =====================================

// const roundMoney = (amount) =>
//   Math.round((Number(amount) + Number.EPSILON) * 100) / 100;

// const getCount = (Model, filter) =>
//   Model.countDocuments(filter);

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
// // DASHBOARD SUMMARY
// // =====================================

// const getDashboardSummary = async ({ organizationId }) => {
//   if (!mongoose.Types.ObjectId.isValid(organizationId)) {
//     const error = new Error("Invalid organization ID.");
//     error.statusCode = 400;
//     throw error;
//   }

//   const organization = new mongoose.Types.ObjectId(
//     organizationId
//   );

//   const activeFilter = {
//     organization,
//     isActive: true,
//   };

//   const [
//     totalCustomers,
//     totalBookings,
//     totalJobs,
//     activeJobs,
//     completedJobs,
//     newLeads,
//     totalLeads,
//     totalInvoices,
//     pendingInvoices,
//     totalRevenue,
//     refundedAmount,
//     totalExpenses,
//     pendingExpenses,
//     upcomingBookings,
//     outstandingBalance,
//   ] = await Promise.all([
//     getCount(Customer, activeFilter),

//     getCount(Booking, activeFilter),

//     getCount(Job, activeFilter),

//     getCount(Job, {
//       ...activeFilter,
//       status: { $in: ["pending", "assigned", "in_progress"] },
//     }),

//     getCount(Job, {
//       ...activeFilter,
//       status: "completed",
//     }),

//     getCount(Lead, {
//       ...activeFilter,
//       status: "new",
//     }),

//     getCount(Lead, activeFilter),

//     getCount(Invoice, activeFilter),

//     getCount(Invoice, {
//       ...activeFilter,
//       status: { $in: ["sent", "partially_paid", "overdue"] },
//     }),

//     getAmount(
//       Payment,
//       { ...activeFilter, status: "completed" },
//       "amount"
//     ),

//     getAmount(
//       Payment,
//       { ...activeFilter, status: "refunded" },
//       "amount"
//     ),

//     getAmount(
//       Expense,
//       { ...activeFilter, status: "paid" },
//       "amount"
//     ),

//     getCount(Expense, {
//       ...activeFilter,
//       status: "pending",
//     }),

//     getCount(Booking, {
//       ...activeFilter,
//       bookingDate: { $gte: new Date() },
//       status: { $in: ["pending", "confirmed"] },
//     }),

//     getAmount(
//       Invoice,
//       activeFilter,
//       "balanceDue"
//     ),
//   ]);

//   const netCashFlow = roundMoney(
//     totalRevenue - refundedAmount - totalExpenses
//   );

//   return {
//     summary: {
//       totalCustomers,
//       totalBookings,
//       totalJobs,
//       activeJobs,
//       completedJobs,
//       newLeads,
//       totalLeads,
//       totalInvoices,
//       pendingInvoices,
//       totalRevenue,
//       refundedAmount,
//       totalExpenses,
//       pendingExpenses,
//       upcomingBookings,
//       outstandingBalance,
//       netCashFlow,
//     },
//     generatedAt: new Date(),
//   };
// };

// module.exports = {
//   getDashboardSummary,
// };


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
  Math.round((Number(amount || 0) + Number.EPSILON) * 100) / 100;

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

const getMonthlyRevenue = async (organizationId, year) => {
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);

  const rows = await Payment.aggregate([
    {
      $match: {
        organization: organizationId,
        isActive: true,
        status: "completed",
        currency: "BDT",
        paymentDate: {
          $gte: start,
          $lt: end,
        },
      },
    },
    {
      $group: {
        _id: { $month: "$paymentDate" },
        revenue: { $sum: "$amount" },
        paymentCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const monthlyRows = Array.from({ length: 12 }, (_, index) => ({
    month: new Date(year, index, 1).toLocaleString("en-US", {
      month: "short",
    }),
    monthNumber: index + 1,
    revenue: 0,
    paymentCount: 0,
  }));

  for (const row of rows) {
    monthlyRows[row._id - 1].revenue = roundMoney(row.revenue);
    monthlyRows[row._id - 1].paymentCount = row.paymentCount;
  }

  return monthlyRows;
};

// =====================================
// UPCOMING JOBS
// =====================================

const getUpcomingJobs = async (organizationId, limit = 5) => {
  const now = new Date();

  return Job.find({
    organization: organizationId,
    isActive: true,
    scheduledDate: { $gte: now },
    status: { $in: ["pending", "assigned", "in_progress"] },
  })
    .select(
      "jobNumber title customer service staff scheduledDate startTime endTime status priority"
    )
    .populate("customer", "name firstName lastName")
    .populate("service", "name")
    .populate("staff", "name firstName lastName")
    .sort({ scheduledDate: 1, startTime: 1 })
    .limit(limit)
    .lean();
};

// =====================================
// RECENT RECORDS
// These are recent database records, not
// a dedicated event/notification history.
// =====================================

const getRecentActivity = async (organizationId, limit = 8) => {
  const baseFilter = {
    organization: organizationId,
    isActive: true,
  };

  const [customers, leads, bookings, jobs, payments] =
    await Promise.all([
      Customer.find(baseFilter)
        .select("name firstName lastName createdAt")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),

      Lead.find(baseFilter)
        .select("name firstName lastName status createdAt")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),

      Booking.find(baseFilter)
        .select("bookingNumber customer service status createdAt")
        .populate("customer", "name firstName lastName")
        .populate("service", "name")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),

      Job.find(baseFilter)
        .select("jobNumber title customer status createdAt")
        .populate("customer", "name firstName lastName")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),

      Payment.find({
        ...baseFilter,
        currency: "BDT",
      })
        .select("paymentNumber amount currency status createdAt")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
    ]);

  const getPersonName = (record) => {
    if (!record) return "Unknown customer";

    if (record.name) return record.name;

    const fullName = [record.firstName, record.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    return fullName || "Unknown customer";
  };

  const activity = [
    ...customers.map((item) => ({
      id: `customer-${item._id}`,
      type: "customer",
      title: "Customer added",
      description: getPersonName(item),
      createdAt: item.createdAt,
    })),

    ...leads.map((item) => ({
      id: `lead-${item._id}`,
      type: "lead",
      title: "Lead created",
      description: getPersonName(item),
      status: item.status,
      createdAt: item.createdAt,
    })),

    ...bookings.map((item) => ({
      id: `booking-${item._id}`,
      type: "booking",
      title: "Booking created",
      description:
        item.service?.name ||
        item.bookingNumber ||
        "Service booking",
      customer: getPersonName(item.customer),
      status: item.status,
      createdAt: item.createdAt,
    })),

    ...jobs.map((item) => ({
      id: `job-${item._id}`,
      type: "job",
      title: "Job record created",
      description: item.title || item.jobNumber,
      customer: getPersonName(item.customer),
      status: item.status,
      createdAt: item.createdAt,
    })),

    ...payments.map((item) => ({
      id: `payment-${item._id}`,
      type: "payment",
      title:
        item.status === "completed"
          ? "Payment completed"
          : item.status === "refunded"
            ? "Payment refunded"
            : "Payment updated",
      description: item.paymentNumber,
      amount: roundMoney(item.amount),
      currency: item.currency,
      status: item.status,
      createdAt: item.createdAt,
    })),
  ];

  return activity
    .filter((item) => item.createdAt)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, limit);
};

// =====================================
// DASHBOARD SUMMARY
// =====================================

const getDashboardSummary = async ({ organizationId }) => {
  if (!mongoose.isValidObjectId(organizationId)) {
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

  // Dashboard financial totals use BDT only.
  // Do not add different currencies together.
  const bdtPaymentFilter = {
    ...activeFilter,
    currency: "BDT",
  };

  const now = new Date();
  const year = now.getFullYear();

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
    monthlyRevenue,
    upcomingJobs,
    recentActivity,
  ] = await Promise.all([
    getCount(Customer, activeFilter),

    getCount(Booking, activeFilter),

    getCount(Job, activeFilter),

    getCount(Job, {
      ...activeFilter,
      status: {
        $in: ["pending", "assigned", "in_progress"],
      },
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
      status: {
        $in: ["sent", "partially_paid", "overdue"],
      },
    }),

    getAmount(
      Payment,
      {
        ...bdtPaymentFilter,
        status: "completed",
      },
      "amount"
    ),

    getAmount(
      Payment,
      {
        ...bdtPaymentFilter,
        status: "refunded",
      },
      "amount"
    ),

    getAmount(
      Expense,
      {
        ...activeFilter,
        status: "paid",
      },
      "amount"
    ),

    getCount(Expense, {
      ...activeFilter,
      status: "pending",
    }),

    getCount(Booking, {
      ...activeFilter,
      bookingDate: { $gte: now },
      status: { $in: ["pending", "confirmed"] },
    }),

    getAmount(
      Invoice,
      {
        ...activeFilter,
        balanceDue: { $gt: 0 },
        status: {
          $in: ["sent", "partially_paid", "overdue"],
        },
      },
      "balanceDue"
    ),

    getMonthlyRevenue(organization, year),

    getUpcomingJobs(organization),

    getRecentActivity(organization),
  ]);

  // Refunds are reported separately.
  // A refunded payment is not included in totalRevenue,
  // because totalRevenue only counts completed payments.
  const netCashFlow = roundMoney(
    totalRevenue - totalExpenses
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

    revenue: {
      year,
      currency: "BDT",
      monthly: monthlyRevenue,
      total: roundMoney(
        monthlyRevenue.reduce(
          (sum, item) => sum + item.revenue,
          0
        )
      ),
    },

    upcomingJobs,
    recentActivity,

    generatedAt: new Date(),
  };
};

module.exports = {
  getDashboardSummary,
};
