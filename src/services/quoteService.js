const mongoose = require("mongoose");

const Quote = require("../models/Quote");
const Job = require("../models/Job");
const Customer = require("../models/Customer");

// =====================================
// GENERATE QUOTE NUMBER
// =====================================

const generateQuoteNumber = async () => {
  const year = new Date().getFullYear();

  const lastQuote = await Quote.findOne({
    quoteNumber: new RegExp(`^QUO-${year}-`),
  })
    .sort({ createdAt: -1 })
    .select("quoteNumber");

  let nextNumber = 1;

  if (lastQuote) {
    const parts = lastQuote.quoteNumber.split("-");
    nextNumber = Number(parts[2]) + 1;
  }

  return `QUO-${year}-${String(nextNumber).padStart(5, "0")}`;
};

// =====================================
// CALCULATE QUOTE TOTALS
// =====================================

const calculateTotals = ({
  items,
  discountType = "fixed",
  discountValue = 0,
  taxRate = 0,
}) => {
  const calculatedItems = items.map((item) => {
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);

    const total = Number(
      (quantity * unitPrice).toFixed(2)
    );

    return {
      ...item,
      quantity,
      unitPrice,
      total,
    };
  });

  const subtotal = Number(
    calculatedItems
      .reduce((sum, item) => sum + item.total, 0)
      .toFixed(2)
  );

  let discountAmount = 0;

  if (discountType === "percentage") {
    discountAmount = Number(
      ((subtotal * Number(discountValue)) / 100).toFixed(2)
    );
  } else {
    discountAmount = Number(
      Math.min(Number(discountValue), subtotal).toFixed(2)
    );
  }

  const taxableAmount = Math.max(
    subtotal - discountAmount,
    0
  );

  const taxAmount = Number(
    ((taxableAmount * Number(taxRate)) / 100).toFixed(2)
  );

  const totalAmount = Number(
    (taxableAmount + taxAmount).toFixed(2)
  );

  return {
    items: calculatedItems,
    subtotal,
    discountType,
    discountValue: Number(discountValue),
    discountAmount,
    taxRate: Number(taxRate),
    taxAmount,
    totalAmount,
  };
};

// =====================================
// CREATE QUOTE
// =====================================

const createQuote = async ({
  organizationId,
  userId,
  data,
}) => {
  if (!mongoose.Types.ObjectId.isValid(organizationId)) {
    throw new Error("Invalid organization ID");
  }

  // -----------------------------------
  // Check Job
  // -----------------------------------

  const job = await Job.findOne({
    _id: data.job,
    organization: organizationId,
    isActive: true,
  });

  if (!job) {
    throw new Error(
      "Job not found or does not belong to this organization"
    );
  }

  // -----------------------------------
  // Check Customer
  // -----------------------------------

  const customer = await Customer.findOne({
    _id: data.customer,
    organization: organizationId,
    isActive: true,
  });

  if (!customer) {
    throw new Error(
      "Customer not found or does not belong to this organization"
    );
  }

  // -----------------------------------
  // Make sure Job belongs to Customer
  // -----------------------------------

  if (
    job.customer.toString() !==
    customer._id.toString()
  ) {
    throw new Error(
      "Job does not belong to the selected customer"
    );
  }

  // -----------------------------------
  // Prevent duplicate active quote
  // -----------------------------------

  const existingQuote = await Quote.findOne({
    organization: organizationId,
    job: data.job,
    isActive: true,
    status: {
      $nin: ["cancelled", "expired"],
    },
  });

  if (existingQuote) {
    throw new Error(
      "An active quote already exists for this job"
    );
  }

  // -----------------------------------
  // Calculate totals
  // -----------------------------------

  const totals = calculateTotals({
    items: data.items,
    discountType: data.discountType || "fixed",
    discountValue: data.discountValue || 0,
    taxRate: data.taxRate || 0,
  });

  // -----------------------------------
  // Dates
  // -----------------------------------

  const issueDate = data.issueDate
    ? new Date(data.issueDate)
    : new Date();

  if (Number.isNaN(issueDate.getTime())) {
    throw new Error("Invalid issue date");
  }

  let expiryDate = null;

  if (data.expiryDate) {
    expiryDate = new Date(data.expiryDate);

    if (Number.isNaN(expiryDate.getTime())) {
      throw new Error("Invalid expiry date");
    }

    if (expiryDate <= issueDate) {
      throw new Error(
        "Expiry date must be after issue date"
      );
    }
  }

  // -----------------------------------
  // Generate Quote Number
  // -----------------------------------

  const quoteNumber = await generateQuoteNumber();

  // -----------------------------------
  // Create Quote
  // -----------------------------------

  const quote = await Quote.create({
    organization: organizationId,

    job: job._id,

    customer: customer._id,

    quoteNumber,

    title: data.title,

    description: data.description || "",

    items: totals.items,

    subtotal: totals.subtotal,

    discountType: totals.discountType,

    discountValue: totals.discountValue,

    discountAmount: totals.discountAmount,

    taxRate: totals.taxRate,

    taxAmount: totals.taxAmount,

    totalAmount: totals.totalAmount,

    currency: data.currency || "BDT",

    status: data.status || "draft",

    issueDate,

    expiryDate,

    customerNotes: data.customerNotes || "",

    termsAndConditions:
      data.termsAndConditions || "",

    createdBy: userId,

    isActive: true,
  });

  // -----------------------------------
  // Populate
  // -----------------------------------

  await quote.populate([
    {
      path: "job",
    },
    {
      path: "customer",
    },
    {
      path: "createdBy",
      select: "name email",
    },
  ]);

  return quote;
};

// =====================================
// GET ORGANIZATION QUOTES
// =====================================

const getOrganizationQuotes = async ({
  organizationId,
  query = {},
}) => {
  const filter = {
    organization: organizationId,
    isActive: true,
  };

  if (query.status) {
    filter.status = query.status;
  }

  if (query.customer) {
    filter.customer = query.customer;
  }

  if (query.job) {
    filter.job = query.job;
  }

  const quotes = await Quote.find(filter)
    .populate("job")
    .populate("customer")
    .populate("createdBy", "name email")
    .sort({
      createdAt: -1,
    });

  return quotes;
};

// =====================================
// GET SINGLE QUOTE
// =====================================

const getQuoteById = async ({
  organizationId,
  quoteId,
}) => {
  const quote = await Quote.findOne({
    _id: quoteId,
    organization: organizationId,
    isActive: true,
  })
    .populate("job")
    .populate("customer")
    .populate("createdBy", "name email");

  if (!quote) {
    throw new Error("Quote not found");
  }

  return quote;
};

// =====================================
// UPDATE QUOTE
// =====================================

const updateQuote = async ({
  organizationId,
  quoteId,
  data,
}) => {
  const quote = await Quote.findOne({
    _id: quoteId,
    organization: organizationId,
    isActive: true,
  });

  if (!quote) {
    throw new Error("Quote not found");
  }

  // -----------------------------------
  // Financial fields changed?
  // -----------------------------------

  const financialChanged =
    data.items !== undefined ||
    data.discountType !== undefined ||
    data.discountValue !== undefined ||
    data.taxRate !== undefined;

  if (financialChanged) {
    const totals = calculateTotals({
      items: data.items || quote.items,
      discountType:
        data.discountType ||
        quote.discountType,
      discountValue:
        data.discountValue !== undefined
          ? data.discountValue
          : quote.discountValue,
      taxRate:
        data.taxRate !== undefined
          ? data.taxRate
          : quote.taxRate,
    });

    quote.items = totals.items;
    quote.subtotal = totals.subtotal;
    quote.discountType = totals.discountType;
    quote.discountValue = totals.discountValue;
    quote.discountAmount = totals.discountAmount;
    quote.taxRate = totals.taxRate;
    quote.taxAmount = totals.taxAmount;
    quote.totalAmount = totals.totalAmount;
  }

  // -----------------------------------
  // Dates
  // -----------------------------------

  if (data.issueDate) {
    const issueDate = new Date(data.issueDate);

    if (Number.isNaN(issueDate.getTime())) {
      throw new Error("Invalid issue date");
    }

    quote.issueDate = issueDate;
  }

  if (data.expiryDate) {
    const expiryDate = new Date(data.expiryDate);

    if (Number.isNaN(expiryDate.getTime())) {
      throw new Error("Invalid expiry date");
    }

    if (expiryDate <= quote.issueDate) {
      throw new Error(
        "Expiry date must be after issue date"
      );
    }

    quote.expiryDate = expiryDate;
  }

  // -----------------------------------
  // Update other fields
  // -----------------------------------

  const allowedFields = [
    "title",
    "description",
    "currency",
    "status",
    "customerNotes",
    "termsAndConditions",
  ];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      quote[field] = data[field];
    }
  });

  await quote.save();

  await quote.populate([
    {
      path: "job",
    },
    {
      path: "customer",
    },
    {
      path: "createdBy",
      select: "name email",
    },
  ]);

  return quote;
};

// =====================================
// DELETE / CANCEL QUOTE
// =====================================

const deleteQuote = async ({
  organizationId,
  quoteId,
}) => {
  const quote = await Quote.findOne({
    _id: quoteId,
    organization: organizationId,
    isActive: true,
  });

  if (!quote) {
    throw new Error("Quote not found");
  }

  quote.status = "cancelled";
  quote.isActive = false;

  await quote.save();

  return quote;
};

// =====================================
// QUOTE STATS
// =====================================

const getQuoteStats = async ({
  organizationId,
}) => {
  const stats = await Quote.aggregate([
    {
      $match: {
        organization: new mongoose.Types.ObjectId(
          organizationId
        ),
      },
    },

    {
      $group: {
        _id: "$status",

        count: {
          $sum: 1,
        },

        totalAmount: {
          $sum: "$totalAmount",
        },
      },
    },

    {
      $sort: {
        _id: 1,
      },
    },
  ]);

  const totalQuotes = await Quote.countDocuments({
    organization: organizationId,
  });

  const activeQuotes = await Quote.countDocuments({
    organization: organizationId,
    isActive: true,
  });

  const acceptedQuotes = await Quote.countDocuments({
    organization: organizationId,
    status: "accepted",
  });

  const rejectedQuotes = await Quote.countDocuments({
    organization: organizationId,
    status: "rejected",
  });

  return {
    totalQuotes,
    activeQuotes,
    acceptedQuotes,
    rejectedQuotes,
    byStatus: stats,
  };
};

// =====================================
// EXPORT
// =====================================

module.exports = {
  createQuote,
  getOrganizationQuotes,
  getQuoteById,
  updateQuote,
  deleteQuote,
  getQuoteStats,
};