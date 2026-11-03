
const mongoose = require("mongoose");

const Invoice = require("../models/Invoice");
const Job = require("../models/Job");
const Quote = require("../models/Quote");
const Customer = require("../models/Customer");

// =====================================
// HELPERS
// =====================================

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateObjectId = (id, name = "ID") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError(`Invalid ${name}`, 400);
  }
};

const roundMoney = (amount) =>
  Math.round((Number(amount) + Number.EPSILON) * 100) / 100;

// =====================================
// GENERATE INVOICE NUMBER
// =====================================

const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  const latestInvoice = await Invoice.findOne({
    invoiceNumber: new RegExp(`^${prefix}`),
  })
    .sort({ createdAt: -1 })
    .select("invoiceNumber")
    .lean();

  let nextNumber = 1;

  if (latestInvoice?.invoiceNumber) {
    const match = latestInvoice.invoiceNumber.match(
      new RegExp(`^INV-${year}-(\\d+)$`)
    );

    if (match) {
      nextNumber = Number(match[1]) + 1;
    }
  }

  return `${prefix}${String(nextNumber).padStart(5, "0")}`;
};

// =====================================
// CALCULATE TOTALS
// =====================================

const calculateTotals = ({
  items = [],
  discountType = "fixed",
  discountValue = 0,
  taxRate = 0,
  paidAmount = 0,
}) => {
  const calculatedItems = items.map((item) => {
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);

    if (
      !Number.isFinite(quantity) ||
      quantity <= 0 ||
      !Number.isFinite(unitPrice) ||
      unitPrice < 0
    ) {
      throw createError("Invalid invoice item quantity or price");
    }

    return {
      ...item,
      total: roundMoney(quantity * unitPrice),
    };
  });

  const subtotal = roundMoney(
    calculatedItems.reduce((sum, item) => sum + item.total, 0)
  );

  const safeDiscountValue = Number(discountValue);
  const safeTaxRate = Number(taxRate);

  if (
    !Number.isFinite(safeDiscountValue) ||
    safeDiscountValue < 0
  ) {
    throw createError("Invalid discount value");
  }

  if (
    !Number.isFinite(safeTaxRate) ||
    safeTaxRate < 0
  ) {
    throw createError("Invalid tax rate");
  }

  if (
    discountType !== "fixed" &&
    discountType !== "percentage"
  ) {
    throw createError("Invalid discount type");
  }

  if (
    discountType === "percentage" &&
    safeDiscountValue > 100
  ) {
    throw createError("Percentage discount cannot exceed 100%");
  }

  let discountAmount =
    discountType === "percentage"
      ? subtotal * (safeDiscountValue / 100)
      : safeDiscountValue;

  discountAmount = roundMoney(
    Math.min(discountAmount, subtotal)
  );

  const taxableAmount = roundMoney(
    subtotal - discountAmount
  );

  const taxAmount = roundMoney(
    taxableAmount * (safeTaxRate / 100)
  );

  const totalAmount = roundMoney(
    taxableAmount + taxAmount
  );

  const safePaidAmount = roundMoney(
    Math.min(
      Math.max(Number(paidAmount) || 0, 0),
      totalAmount
    )
  );

  const balanceDue = roundMoney(
    totalAmount - safePaidAmount
  );

  return {
    items: calculatedItems,
    subtotal,
    discountAmount,
    taxAmount,
    totalAmount,
    paidAmount: safePaidAmount,
    balanceDue,
  };
};

// =====================================
// CALCULATE STATUS
// =====================================

const calculateInvoiceStatus = ({
  status,
  paidAmount,
  totalAmount,
  dueDate,
}) => {
  if (status === "cancelled") {
    return "cancelled";
  }

  if (status === "draft") {
    return "draft";
  }

  if (totalAmount > 0 && paidAmount >= totalAmount) {
    return "paid";
  }

  if (
    dueDate &&
    new Date(dueDate).getTime() < Date.now()
  ) {
    return "overdue";
  }

  if (paidAmount > 0) {
    return "partially_paid";
  }

  return "sent";
};

// =====================================
// POPULATE INVOICE
// =====================================

const populateInvoice = (query) =>
  query
    .populate("job", "jobNumber title status")
    .populate("quote", "quoteNumber title status totalAmount")
    .populate("customer", "firstName lastName email phone")
    .populate("createdBy", "firstName lastName email");

// =====================================
// CREATE INVOICE
// =====================================

const createInvoice = async ({
  organizationId,
  userId,
  data,
}) => {
  validateObjectId(organizationId, "Organization ID");
  validateObjectId(data.job, "Job ID");
  validateObjectId(data.customer, "Customer ID");

  const job = await Job.findOne({
    _id: data.job,
    organization: organizationId,
    isActive: true,
  });

  if (!job) {
    throw createError(
      "Job not found or does not belong to this organization",
      404
    );
  }

  const customer = await Customer.findOne({
    _id: data.customer,
    organization: organizationId,
    isActive: true,
  });

  if (!customer) {
    throw createError(
      "Customer not found or does not belong to this organization",
      404
    );
  }

  if (String(job.customer) !== String(customer._id)) {
    throw createError(
      "Selected customer does not belong to this job"
    );
  }

  let quote = null;

  if (data.quote) {
    validateObjectId(data.quote, "Quote ID");

    quote = await Quote.findOne({
      _id: data.quote,
      organization: organizationId,
      isActive: true,
    });

    if (!quote) {
      throw createError(
        "Quote not found or does not belong to this organization",
        404
      );
    }

    if (String(quote.job) !== String(job._id)) {
      throw createError("Selected quote does not belong to this job");
    }

    if (String(quote.customer) !== String(customer._id)) {
      throw createError(
        "Selected quote does not belong to this customer"
      );
    }
  }

  const existingInvoice = await Invoice.findOne({
    organization: organizationId,
    job: job._id,
    isActive: true,
  });

  if (existingInvoice) {
    throw createError(
      "An active invoice already exists for this job",
      409
    );
  }

  const issueDate = data.issueDate
    ? new Date(data.issueDate)
    : new Date();

  if (Number.isNaN(issueDate.getTime())) {
    throw createError("Invalid issue date");
  }

  let dueDate = null;

  if (data.dueDate) {
    dueDate = new Date(data.dueDate);

    if (Number.isNaN(dueDate.getTime())) {
      throw createError("Invalid due date");
    }

    if (dueDate < issueDate) {
      throw createError(
        "Due date cannot be before issue date"
      );
    }
  }

  const totals = calculateTotals({
    items: data.items || [],
    discountType: data.discountType || "fixed",
    discountValue: data.discountValue ?? 0,
    taxRate: data.taxRate ?? 0,
    paidAmount: 0,
  });

  const currency = (data.currency || "BDT").toUpperCase();

  if (!/^[A-Z]{3}$/.test(currency)) {
    throw createError("Invalid invoice currency");
  }

  const requestedStatus = data.status || "draft";

  if (!["draft", "sent"].includes(requestedStatus)) {
    throw createError(
      "New invoices can only be created as draft or sent"
    );
  }

  const invoiceNumber = await generateInvoiceNumber();

  const status = calculateInvoiceStatus({
    status: requestedStatus,
    paidAmount: totals.paidAmount,
    totalAmount: totals.totalAmount,
    dueDate,
  });

  const invoice = await Invoice.create({
    organization: organizationId,
    job: job._id,
    quote: quote?._id || null,
    customer: customer._id,

    invoiceNumber,
    title: data.title,
    description: data.description || "",

    items: totals.items,
    subtotal: totals.subtotal,

    discountType: data.discountType || "fixed",
    discountValue: data.discountValue ?? 0,
    discountAmount: totals.discountAmount,

    taxRate: data.taxRate ?? 0,
    taxAmount: totals.taxAmount,

    totalAmount: totals.totalAmount,
    currency,
    status,

    issueDate,
    dueDate,

    paidAmount: 0,
    balanceDue: totals.balanceDue,

    customerNotes: data.customerNotes || "",
    termsAndConditions: data.termsAndConditions || "",

    createdBy: userId,
    isActive: true,
  });

  return populateInvoice(
    Invoice.findById(invoice._id)
  );
};

// =====================================
// GET ORGANIZATION INVOICES
// =====================================

const getOrganizationInvoices = async ({
  organizationId,
  query = {},
}) => {
  validateObjectId(organizationId, "Organization ID");

  const filter = {
    organization: organizationId,
    isActive: true,
  };

  if (query.status) filter.status = query.status;
  if (query.customer) filter.customer = query.customer;
  if (query.job) filter.job = query.job;
  if (query.quote) filter.quote = query.quote;

  return populateInvoice(
    Invoice.find(filter).sort({ createdAt: -1 })
  );
};

// =====================================
// GET SINGLE INVOICE
// =====================================

const getInvoiceById = async ({
  organizationId,
  invoiceId,
}) => {
  validateObjectId(organizationId, "Organization ID");
  validateObjectId(invoiceId, "Invoice ID");

  const invoice = await populateInvoice(
    Invoice.findOne({
      _id: invoiceId,
      organization: organizationId,
      isActive: true,
    })
  );

  if (!invoice) {
    throw createError("Invoice not found", 404);
  }

  return invoice;
};

// =====================================
// UPDATE INVOICE
// =====================================

const updateInvoice = async ({
  organizationId,
  invoiceId,
  data,
}) => {
  validateObjectId(organizationId, "Organization ID");
  validateObjectId(invoiceId, "Invoice ID");

  const invoice = await Invoice.findOne({
    _id: invoiceId,
    organization: organizationId,
    isActive: true,
  });

  if (!invoice) {
    throw createError("Invoice not found", 404);
  }

  if (invoice.status === "cancelled") {
    throw createError("Cancelled invoices cannot be updated");
  }

  const hasPayments = Number(invoice.paidAmount || 0) > 0;

  const financialFields = [
    "items",
    "discountType",
    "discountValue",
    "taxRate",
    "currency",
    "totalAmount",
    "paidAmount",
    "balanceDue",
  ];

  if (hasPayments) {
    const tryingToChangeFinancialData = financialFields.some(
      (field) =>
        Object.prototype.hasOwnProperty.call(data, field)
    );

    if (tryingToChangeFinancialData) {
      throw createError(
        "Invoice financial details cannot be changed after payments. Refund or reconcile payments first."
      );
    }
  }

  if (
    data.status !== undefined &&
    !["draft", "sent"].includes(data.status)
  ) {
    throw createError(
      "Use the cancel endpoint to cancel an invoice. Payment status is managed by payments."
    );
  }

  const issueDate =
    data.issueDate !== undefined
      ? new Date(data.issueDate)
      : invoice.issueDate;

  if (Number.isNaN(issueDate.getTime())) {
    throw createError("Invalid issue date");
  }

  let dueDate =
    data.dueDate !== undefined
      ? data.dueDate
        ? new Date(data.dueDate)
        : null
      : invoice.dueDate;

  if (
    dueDate &&
    Number.isNaN(dueDate.getTime())
  ) {
    throw createError("Invalid due date");
  }

  if (dueDate && dueDate < issueDate) {
    throw createError(
      "Due date cannot be before issue date"
    );
  }

  const financialFieldsChanged =
    data.items !== undefined ||
    data.discountType !== undefined ||
    data.discountValue !== undefined ||
    data.taxRate !== undefined;

  let totals = {
    items: invoice.items,
    subtotal: invoice.subtotal,
    discountAmount: invoice.discountAmount,
    taxAmount: invoice.taxAmount,
    totalAmount: invoice.totalAmount,
    paidAmount: invoice.paidAmount,
    balanceDue: invoice.balanceDue,
  };

  if (financialFieldsChanged) {
    totals = calculateTotals({
      items: data.items ?? invoice.items,
      discountType:
        data.discountType ?? invoice.discountType,
      discountValue:
        data.discountValue ?? invoice.discountValue,
      taxRate:
        data.taxRate ?? invoice.taxRate,
      paidAmount: invoice.paidAmount,
    });
  }

  if (data.title !== undefined) {
    invoice.title = data.title;
  }

  if (data.description !== undefined) {
    invoice.description = data.description;
  }

  if (data.items !== undefined) {
    invoice.items = totals.items;
  }

  if (data.discountType !== undefined) {
    invoice.discountType = data.discountType;
  }

  if (data.discountValue !== undefined) {
    invoice.discountValue = data.discountValue;
  }

  if (data.taxRate !== undefined) {
    invoice.taxRate = data.taxRate;
  }

  if (data.currency !== undefined) {
    const currency = data.currency.toUpperCase();

    if (!/^[A-Z]{3}$/.test(currency)) {
      throw createError("Invalid invoice currency");
    }

    invoice.currency = currency;
  }

  if (data.customerNotes !== undefined) {
    invoice.customerNotes = data.customerNotes;
  }

  if (data.termsAndConditions !== undefined) {
    invoice.termsAndConditions = data.termsAndConditions;
  }

  invoice.issueDate = issueDate;
  invoice.dueDate = dueDate;

  invoice.subtotal = totals.subtotal;
  invoice.discountAmount = totals.discountAmount;
  invoice.taxAmount = totals.taxAmount;
  invoice.totalAmount = totals.totalAmount;
  invoice.paidAmount = totals.paidAmount;
  invoice.balanceDue = totals.balanceDue;

  invoice.status = calculateInvoiceStatus({
    status: data.status ?? invoice.status,
    paidAmount: invoice.paidAmount,
    totalAmount: invoice.totalAmount,
    dueDate: invoice.dueDate,
  });

  await invoice.save();

  return populateInvoice(
    Invoice.findById(invoice._id)
  );
};

// =====================================
// CANCEL INVOICE
// =====================================

const deleteInvoice = async ({
  organizationId,
  invoiceId,
}) => {
  validateObjectId(organizationId, "Organization ID");
  validateObjectId(invoiceId, "Invoice ID");

  const invoice = await Invoice.findOne({
    _id: invoiceId,
    organization: organizationId,
    isActive: true,
  });

  if (!invoice) {
    throw createError("Invoice not found", 404);
  }

  if (invoice.status === "cancelled") {
    throw createError("Invoice is already cancelled");
  }

  invoice.status = "cancelled";

  // Keep invoice active for payment history and refunds.
  invoice.isActive = true;

  await invoice.save();

  return populateInvoice(
    Invoice.findById(invoice._id)
  );
};

// =====================================
// INVOICE STATISTICS
// =====================================

const getInvoiceStats = async ({
  organizationId,
}) => {
  validateObjectId(organizationId, "Organization ID");

  const stats = await Invoice.aggregate([
    {
      $match: {
        organization: new mongoose.Types.ObjectId(
          organizationId
        ),
        isActive: true,
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        amount: { $sum: "$totalAmount" },
        paid: { $sum: "$paidAmount" },
        balance: { $sum: "$balanceDue" },
      },
    },
  ]);

  const result = {
    total: 0,
    draft: 0,
    sent: 0,
    partially_paid: 0,
    paid: 0,
    overdue: 0,
    cancelled: 0,
    totalAmount: 0,
    paidAmount: 0,
    balanceDue: 0,
  };

  stats.forEach((item) => {
    if (Object.prototype.hasOwnProperty.call(result, item._id)) {
      result[item._id] = item.count;
    }

    result.total += item.count;
    result.totalAmount += item.amount || 0;
    result.paidAmount += item.paid || 0;
    result.balanceDue += item.balance || 0;
  });

  result.totalAmount = roundMoney(result.totalAmount);
  result.paidAmount = roundMoney(result.paidAmount);
  result.balanceDue = roundMoney(result.balanceDue);

  return result;
};

// =====================================
// EXPORTS
// =====================================

module.exports = {
  createInvoice,
  getOrganizationInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  getInvoiceStats,
};
