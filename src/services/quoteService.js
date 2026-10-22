
const mongoose = require("mongoose");

const Quote = require("../models/Quote");
const Job = require("../models/Job");
const Customer = require("../models/Customer");

// =====================================================
// CONSTANTS
// =====================================================

const QUOTE_STATUSES = [
  "draft",
  "sent",
  "accepted",
  "rejected",
  "expired",
  "cancelled",
];

const FINAL_STATUSES = [
  "accepted",
  "rejected",
  "expired",
  "cancelled",
];

const STATUS_TRANSITIONS = {
  draft: ["draft", "sent", "cancelled"],
  sent: ["sent", "accepted", "rejected", "expired", "cancelled"],
  accepted: ["accepted"],
  rejected: ["rejected"],
  expired: ["expired"],
  cancelled: ["cancelled"],
};

const POPULATE_FIELDS = [
  { path: "job" },
  { path: "customer" },
  { path: "createdBy", select: "name email" },
];

// =====================================================
// COMMON HELPERS
// =====================================================

const isValidObjectId = (id) =>
  typeof id === "string" &&
  mongoose.Types.ObjectId.isValid(id) &&
  String(new mongoose.Types.ObjectId(id)) === id;

const validateOrganizationId = (organizationId) => {
  if (!isValidObjectId(String(organizationId || ""))) {
    throw new Error("Invalid organization ID");
  }
};

const validateUserId = (userId) => {
  if (!isValidObjectId(String(userId || ""))) {
    throw new Error("Invalid user ID");
  }
};

const validateQuoteId = (quoteId) => {
  if (!isValidObjectId(String(quoteId || ""))) {
    throw new Error("Invalid quote ID");
  }
};

const roundMoney = (value) =>
  Number((value + Number.EPSILON).toFixed(2));

const toValidDate = (value, fieldName) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid ${fieldName}`);
  }

  return date;
};

const validateDateRange = (issueDate, expiryDate) => {
  if (
    expiryDate &&
    expiryDate.getTime() <= issueDate.getTime()
  ) {
    throw new Error(
      "Expiry date must be after issue date"
    );
  }
};

const populateQuote = async (quote) => {
  await quote.populate(POPULATE_FIELDS);
  return quote;
};

const isDuplicateKeyError = (error) =>
  error?.code === 11000;

// =====================================================
// GENERATE QUOTE NUMBER
// =====================================================

// Example: QUO-2026-00001
// The database unique index remains the final protection
// against duplicate quote numbers.

const generateQuoteNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `QUO-${year}-`;

  const lastQuote = await Quote.findOne({
    quoteNumber: new RegExp(`^${prefix}`),
  })
    .sort({ quoteNumber: -1 })
    .select("quoteNumber")
    .lean();

  let nextNumber = 1;

  if (lastQuote?.quoteNumber) {
    const suffix = lastQuote.quoteNumber.slice(
      prefix.length
    );

    const parsedNumber = Number(suffix);

    if (Number.isInteger(parsedNumber) && parsedNumber > 0) {
      nextNumber = parsedNumber + 1;
    }
  }

  return `${prefix}${String(nextNumber).padStart(5, "0")}`;
};

// =====================================================
// CALCULATE QUOTE TOTALS
// =====================================================

const calculateTotals = ({
  items,
  discountType = "fixed",
  discountValue = 0,
  taxRate = 0,
}) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error(
      "At least one quote item is required"
    );
  }

  if (!["fixed", "percentage"].includes(discountType)) {
    throw new Error("Invalid discount type");
  }

  const numericDiscount = Number(discountValue);
  const numericTaxRate = Number(taxRate);

  if (
    !Number.isFinite(numericDiscount) ||
    numericDiscount < 0
  ) {
    throw new Error(
      "Discount value must be a valid non-negative number"
    );
  }

  if (
    !Number.isFinite(numericTaxRate) ||
    numericTaxRate < 0 ||
    numericTaxRate > 100
  ) {
    throw new Error(
      "Tax rate must be between 0 and 100"
    );
  }

  if (
    discountType === "percentage" &&
    numericDiscount > 100
  ) {
    throw new Error(
      "Percentage discount cannot exceed 100"
    );
  }

  const calculatedItems = items.map((item, index) => {
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);
    const name = String(item.name || "").trim();

    if (!name) {
      throw new Error(
        `Quote item ${index + 1}: name is required`
      );
    }

    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      throw new Error(
        `Quote item ${index + 1}: quantity must be greater than 0`
      );
    }

    if (
      !Number.isFinite(unitPrice) ||
      unitPrice < 0
    ) {
      throw new Error(
        `Quote item ${index + 1}: unit price must be non-negative`
      );
    }

    const total = roundMoney(quantity * unitPrice);

    return {
      name,
      description: item.description || "",
      quantity,
      unitPrice,
      total,
    };
  });

  const subtotal = roundMoney(
    calculatedItems.reduce(
      (sum, item) => sum + item.total,
      0
    )
  );

  let discountAmount = 0;

  if (discountType === "percentage") {
    discountAmount = roundMoney(
      (subtotal * numericDiscount) / 100
    );
  } else {
    // A fixed discount cannot exceed the subtotal.
    discountAmount = roundMoney(
      Math.min(numericDiscount, subtotal)
    );
  }

  const taxableAmount = roundMoney(
    Math.max(subtotal - discountAmount, 0)
  );

  const taxAmount = roundMoney(
    (taxableAmount * numericTaxRate) / 100
  );

  const totalAmount = roundMoney(
    taxableAmount + taxAmount
  );

  return {
    items: calculatedItems,
    subtotal,
    discountType,
    discountValue: numericDiscount,
    discountAmount,
    taxRate: numericTaxRate,
    taxAmount,
    totalAmount,
  };
};

// =====================================================
// CREATE QUOTE
// =====================================================

const createQuote = async ({
  organizationId,
  userId,
  data,
}) => {
  validateOrganizationId(String(organizationId || ""));
  validateUserId(String(userId || ""));

  if (!data || typeof data !== "object") {
    throw new Error("Quote data is required");
  }

  if (!isValidObjectId(String(data.job || ""))) {
    throw new Error("Valid job ID is required");
  }

  if (!isValidObjectId(String(data.customer || ""))) {
    throw new Error("Valid customer ID is required");
  }

  if (!String(data.title || "").trim()) {
    throw new Error("Quote title is required");
  }

  // -----------------------------------------------------
  // Validate Job belongs to this organization
  // -----------------------------------------------------

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

  // -----------------------------------------------------
  // Validate Customer belongs to this organization
  // -----------------------------------------------------

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

  // -----------------------------------------------------
  // Ensure Job and Customer are related
  // -----------------------------------------------------

  if (
    !job.customer ||
    job.customer.toString() !== customer._id.toString()
  ) {
    throw new Error(
      "Job does not belong to the selected customer"
    );
  }

  // -----------------------------------------------------
  // Prevent another active quote for this Job
  // -----------------------------------------------------

  const existingQuote = await Quote.findOne({
    organization: organizationId,
    job: job._id,
    isActive: true,
    status: {
      $nin: ["cancelled", "expired"],
    },
  }).select("_id quoteNumber status");

  if (existingQuote) {
    throw new Error(
      "An active quote already exists for this job"
    );
  }

  // -----------------------------------------------------
  // Initial status
  // -----------------------------------------------------

  const initialStatus = data.status || "draft";

  if (!["draft", "sent"].includes(initialStatus)) {
    throw new Error(
      "A new quote can only be created as draft or sent"
    );
  }

  // -----------------------------------------------------
  // Calculate totals on the server
  // -----------------------------------------------------

  const totals = calculateTotals({
    items: data.items,
    discountType: data.discountType || "fixed",
    discountValue: data.discountValue ?? 0,
    taxRate: data.taxRate ?? 0,
  });

  // -----------------------------------------------------
  // Validate dates
  // -----------------------------------------------------

  const issueDate = data.issueDate
    ? toValidDate(data.issueDate, "issue date")
    : new Date();

  const expiryDate = data.expiryDate
    ? toValidDate(data.expiryDate, "expiry date")
    : null;

  validateDateRange(issueDate, expiryDate);

  // -----------------------------------------------------
  // Build payload
  // -----------------------------------------------------

  const quotePayload = {
    organization: organizationId,
    job: job._id,
    customer: customer._id,
    title: String(data.title).trim(),
    description: data.description || "",
    ...totals,
    currency: String(data.currency || "BDT").toUpperCase(),
    status: initialStatus,
    issueDate,
    expiryDate,
    customerNotes: data.customerNotes || "",
    termsAndConditions: data.termsAndConditions || "",
    createdBy: userId,
    isActive: true,
  };

  // -----------------------------------------------------
  // Create with limited duplicate-number retries
  // -----------------------------------------------------

  let quote = null;
  let lastError = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      quote = await Quote.create({
        ...quotePayload,
        quoteNumber: await generateQuoteNumber(),
      });

      break;
    } catch (error) {
      lastError = error;

      if (
        !isDuplicateKeyError(error) ||
        attempt === 2
      ) {
        throw error;
      }
    }
  }

  if (!quote) {
    throw lastError || new Error("Failed to create quote");
  }

  return populateQuote(quote);
};

// =====================================================
// GET ORGANIZATION QUOTES
// =====================================================

const getOrganizationQuotes = async ({
  organizationId,
  query = {},
}) => {
  validateOrganizationId(String(organizationId || ""));

  const filter = {
    organization: organizationId,
    isActive: true,
  };

  if (query.status) {
    if (!QUOTE_STATUSES.includes(query.status)) {
      throw new Error("Invalid quote status filter");
    }

    filter.status = query.status;
  }

  if (query.customer) {
    if (!isValidObjectId(String(query.customer))) {
      throw new Error("Invalid customer ID filter");
    }

    filter.customer = query.customer;
  }

  if (query.job) {
    if (!isValidObjectId(String(query.job))) {
      throw new Error("Invalid job ID filter");
    }

    filter.job = query.job;
  }

  return Quote.find(filter)
    .populate(POPULATE_FIELDS)
    .sort({ createdAt: -1 });
};

// =====================================================
// GET SINGLE QUOTE
// =====================================================

const getQuoteById = async ({
  organizationId,
  quoteId,
}) => {
  validateOrganizationId(String(organizationId || ""));
  validateQuoteId(String(quoteId || ""));

  const quote = await Quote.findOne({
    _id: quoteId,
    organization: organizationId,
    isActive: true,
  }).populate(POPULATE_FIELDS);

  if (!quote) {
    throw new Error("Quote not found");
  }

  return quote;
};

// =====================================================
// UPDATE QUOTE
// =====================================================

const updateQuote = async ({
  organizationId,
  quoteId,
  data,
}) => {
  validateOrganizationId(String(organizationId || ""));
  validateQuoteId(String(quoteId || ""));

  if (!data || typeof data !== "object") {
    throw new Error("Quote update data is required");
  }

  // Job and customer cannot be reassigned through this update.
  if (data.job !== undefined || data.customer !== undefined) {
    throw new Error(
      "Changing a quote's job or customer is not allowed"
    );
  }

  const quote = await Quote.findOne({
    _id: quoteId,
    organization: organizationId,
    isActive: true,
  });

  if (!quote) {
    throw new Error("Quote not found");
  }

  const financialChanged =
    data.items !== undefined ||
    data.discountType !== undefined ||
    data.discountValue !== undefined ||
    data.taxRate !== undefined;

  // Finalized quotes cannot have their financial values changed.
  if (
    financialChanged &&
    FINAL_STATUSES.includes(quote.status)
  ) {
    throw new Error(
      "Financial fields cannot be changed after the quote is finalized"
    );
  }

  // -----------------------------------------------------
  // Validate status transition
  // -----------------------------------------------------

  if (data.status !== undefined) {
    if (!QUOTE_STATUSES.includes(data.status)) {
      throw new Error("Invalid quote status");
    }

    const allowedStatuses =
      STATUS_TRANSITIONS[quote.status] || [];

    if (!allowedStatuses.includes(data.status)) {
      throw new Error(
        `Cannot change quote status from ${quote.status} to ${data.status}`
      );
    }
  }

  // -----------------------------------------------------
  // Recalculate totals if financial fields changed
  // -----------------------------------------------------

  if (financialChanged) {
    const currentItems = quote.items.map((item) =>
      typeof item.toObject === "function"
        ? item.toObject()
        : item
    );

    const totals = calculateTotals({
      items: data.items !== undefined
        ? data.items
        : currentItems,
      discountType: data.discountType !== undefined
        ? data.discountType
        : quote.discountType,
      discountValue: data.discountValue !== undefined
        ? data.discountValue
        : quote.discountValue,
      taxRate: data.taxRate !== undefined
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

  // -----------------------------------------------------
  // Resolve final date values before comparing
  // -----------------------------------------------------

  const finalIssueDate =
    data.issueDate !== undefined
      ? toValidDate(data.issueDate, "issue date")
      : quote.issueDate;

  const finalExpiryDate =
    data.expiryDate !== undefined
      ? (
          data.expiryDate === null ||
          data.expiryDate === ""
            ? null
            : toValidDate(data.expiryDate, "expiry date")
        )
      : quote.expiryDate;

  validateDateRange(finalIssueDate, finalExpiryDate);

  quote.issueDate = finalIssueDate;
  quote.expiryDate = finalExpiryDate;

  // -----------------------------------------------------
  // Allow only explicitly approved fields
  // -----------------------------------------------------

  const allowedFields = [
    "title",
    "description",
    "currency",
    "status",
    "customerNotes",
    "termsAndConditions",
  ];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      quote[field] = data[field];
    }
  }

  if (data.title !== undefined) {
    if (!String(data.title).trim()) {
      throw new Error("Quote title cannot be empty");
    }

    quote.title = String(data.title).trim();
  }

  if (data.currency !== undefined) {
    quote.currency = String(data.currency).toUpperCase();
  }

  await quote.save();

  return populateQuote(quote);
};

// =====================================================
// DELETE / CANCEL QUOTE
// =====================================================

const deleteQuote = async ({
  organizationId,
  quoteId,
}) => {
  validateOrganizationId(String(organizationId || ""));
  validateQuoteId(String(quoteId || ""));

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

// =====================================================
// QUOTE STATS
// =====================================================

const getQuoteStats = async ({
  organizationId,
}) => {
  validateOrganizationId(String(organizationId || ""));

  const organizationObjectId =
    new mongoose.Types.ObjectId(organizationId);

  // Status breakdown only includes active quotes.
  const stats = await Quote.aggregate([
    {
      $match: {
        organization: organizationObjectId,
        isActive: true,
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalAmount: { $sum: "$totalAmount" },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // All records, including soft-deleted records.
  const totalQuotes = await Quote.countDocuments({
    organization: organizationId,
  });

  // Quotes currently visible and active.
  const activeQuotes = await Quote.countDocuments({
    organization: organizationId,
    isActive: true,
  });

  const acceptedQuotes = await Quote.countDocuments({
    organization: organizationId,
    isActive: true,
    status: "accepted",
  });

  const rejectedQuotes = await Quote.countDocuments({
    organization: organizationId,
    isActive: true,
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

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createQuote,
  getOrganizationQuotes,
  getQuoteById,
  updateQuote,
  deleteQuote,
  getQuoteStats,
};
