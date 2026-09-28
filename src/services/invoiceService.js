const mongoose = require("mongoose");

const Invoice = require("../models/Invoice");
const Job = require("../models/Job");
const Quote = require("../models/Quote");
const Customer = require("../models/Customer");

// =====================================
// GENERATE INVOICE NUMBER
// =====================================

const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();

  const latestInvoice = await Invoice.findOne({
    invoiceNumber: new RegExp(`^INV-${year}-`),
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

  return `INV-${year}-${String(nextNumber).padStart(5, "0")}`;
};

// =====================================
// CALCULATE INVOICE TOTALS
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

    return {
      ...item,
      total: Number((quantity * unitPrice).toFixed(2)),
    };
  });

  const subtotal = Number(
    calculatedItems
      .reduce((sum, item) => sum + item.total, 0)
      .toFixed(2)
  );

  let discountAmount = 0;

  if (discountType === "percentage") {
    discountAmount = subtotal * (Number(discountValue) / 100);
  } else {
    discountAmount = Number(discountValue) || 0;
  }

  // Discount cannot exceed subtotal
  discountAmount = Math.min(discountAmount, subtotal);

  discountAmount = Number(discountAmount.toFixed(2));

  const taxableAmount = Number(
    (subtotal - discountAmount).toFixed(2)
  );

  const taxAmount = Number(
    (taxableAmount * (Number(taxRate) / 100)).toFixed(2)
  );

  const totalAmount = Number(
    (taxableAmount + taxAmount).toFixed(2)
  );

  const safePaidAmount = Math.min(
    Math.max(Number(paidAmount) || 0, 0),
    totalAmount
  );

  const balanceDue = Number(
    (totalAmount - safePaidAmount).toFixed(2)
  );

  return {
    items: calculatedItems,
    subtotal,
    discountAmount,
    taxAmount,
    totalAmount,
    paidAmount: Number(safePaidAmount.toFixed(2)),
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
  // Explicit cancelled status
  if (status === "cancelled") {
    return "cancelled";
  }

  // Fully paid
  if (paidAmount >= totalAmount && totalAmount > 0) {
    return "paid";
  }

  // Partially paid
  if (paidAmount > 0 && paidAmount < totalAmount) {
    return "partially_paid";
  }

  // Overdue
  if (
    dueDate &&
    new Date(dueDate).getTime() < Date.now() &&
    paidAmount < totalAmount
  ) {
    return "overdue";
  }

  // Preserve draft/sent
  if (status === "sent") {
    return "sent";
  }

  return "draft";
};

// =====================================
// CREATE INVOICE
// =====================================

const createInvoice = async ({
  organizationId,
  userId,
  data,
}) => {
  if (!mongoose.Types.ObjectId.isValid(organizationId)) {
    const error = new Error("Invalid organization ID");
    error.statusCode = 400;
    throw error;
  }

  // =====================================
  // FIND JOB
  // =====================================

  const job = await Job.findOne({
    _id: data.job,
    organization: organizationId,
    isActive: true,
  });

  if (!job) {
    const error = new Error(
      "Job not found or does not belong to this organization"
    );

    error.statusCode = 404;
    throw error;
  }

  // =====================================
  // FIND CUSTOMER
  // =====================================

  const customer = await Customer.findOne({
    _id: data.customer,
    organization: organizationId,
    isActive: true,
  });

  if (!customer) {
    const error = new Error(
      "Customer not found or does not belong to this organization"
    );

    error.statusCode = 404;
    throw error;
  }

  // =====================================
  // JOB CUSTOMER CHECK
  // =====================================

  if (job.customer.toString() !== customer._id.toString()) {
    const error = new Error(
      "Selected customer does not belong to this job"
    );

    error.statusCode = 400;
    throw error;
  }

  // =====================================
  // OPTIONAL QUOTE
  // =====================================

  let quote = null;

  if (data.quote) {
    quote = await Quote.findOne({
      _id: data.quote,
      organization: organizationId,
      isActive: true,
    });

    if (!quote) {
      const error = new Error(
        "Quote not found or does not belong to this organization"
      );

      error.statusCode = 404;
      throw error;
    }

    // Quote must belong to same job
    if (quote.job.toString() !== job._id.toString()) {
      const error = new Error(
        "Selected quote does not belong to this job"
      );

      error.statusCode = 400;
      throw error;
    }

    // Quote must belong to same customer
    if (quote.customer.toString() !== customer._id.toString()) {
      const error = new Error(
        "Selected quote does not belong to this customer"
      );

      error.statusCode = 400;
      throw error;
    }
  }

  // =====================================
  // PREVENT DUPLICATE ACTIVE INVOICE
  // =====================================

  const existingInvoice = await Invoice.findOne({
    organization: organizationId,
    job: job._id,
    isActive: true,
  });

  if (existingInvoice) {
    const error = new Error(
      "An active invoice already exists for this job"
    );

    error.statusCode = 409;
    throw error;
  }

  // =====================================
  // VALIDATE DATES
  // =====================================

  const issueDate = data.issueDate
    ? new Date(data.issueDate)
    : new Date();

  if (Number.isNaN(issueDate.getTime())) {
    const error = new Error("Invalid issue date");
    error.statusCode = 400;
    throw error;
  }

  let dueDate = null;

  if (data.dueDate) {
    dueDate = new Date(data.dueDate);

    if (Number.isNaN(dueDate.getTime())) {
      const error = new Error("Invalid due date");
      error.statusCode = 400;
      throw error;
    }

    if (dueDate < issueDate) {
      const error = new Error(
        "Due date cannot be before issue date"
      );

      error.statusCode = 400;
      throw error;
    }
  }

  // =====================================
  // CALCULATE TOTALS
  // =====================================

  const totals = calculateTotals({
    items: data.items,
    discountType: data.discountType || "fixed",
    discountValue: data.discountValue || 0,
    taxRate: data.taxRate || 0,
    paidAmount: 0,
  });

  // =====================================
  // GENERATE NUMBER
  // =====================================

  const invoiceNumber = await generateInvoiceNumber();

  // =====================================
  // STATUS
  // =====================================

  const status = calculateInvoiceStatus({
    status: data.status || "draft",
    paidAmount: totals.paidAmount,
    totalAmount: totals.totalAmount,
    dueDate,
  });

  // =====================================
  // CREATE INVOICE
  // =====================================

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
    discountValue: data.discountValue || 0,
    discountAmount: totals.discountAmount,

    taxRate: data.taxRate || 0,
    taxAmount: totals.taxAmount,

    totalAmount: totals.totalAmount,

    currency: (data.currency || "BDT").toUpperCase(),

    status,

    issueDate,
    dueDate,

    paidAmount: totals.paidAmount,
    balanceDue: totals.balanceDue,

    customerNotes: data.customerNotes || "",
    termsAndConditions: data.termsAndConditions || "",

    createdBy: userId,

    isActive: true,
  });

  // =====================================
  // POPULATE
  // =====================================

  return Invoice.findById(invoice._id)
    .populate("job", "jobNumber title status")
    .populate("quote", "quoteNumber title status totalAmount")
    .populate(
      "customer",
      "firstName lastName email phone"
    )
    .populate(
      "createdBy",
      "firstName lastName email"
    );
};

// =====================================
// GET ALL INVOICES
// =====================================

const getOrganizationInvoices = async ({
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

  if (query.quote) {
    filter.quote = query.quote;
  }

  const invoices = await Invoice.find(filter)
    .populate("job", "jobNumber title status")
    .populate("quote", "quoteNumber title status totalAmount")
    .populate(
      "customer",
      "firstName lastName email phone"
    )
    .sort({ createdAt: -1 });

  return invoices;
};

// =====================================
// GET SINGLE INVOICE
// =====================================

const getInvoiceById = async ({
  organizationId,
  invoiceId,
}) => {
  const invoice = await Invoice.findOne({
    _id: invoiceId,
    organization: organizationId,
    isActive: true,
  })
    .populate("job", "jobNumber title status")
    .populate("quote", "quoteNumber title status totalAmount")
    .populate(
      "customer",
      "firstName lastName email phone"
    )
    .populate(
      "createdBy",
      "firstName lastName email"
    );

  if (!invoice) {
    const error = new Error("Invoice not found");
    error.statusCode = 404;
    throw error;
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
  const invoice = await Invoice.findOne({
    _id: invoiceId,
    organization: organizationId,
    isActive: true,
  });

  if (!invoice) {
    const error = new Error("Invoice not found");
    error.statusCode = 404;
    throw error;
  }

  // =====================================
  // PROTECT PAID INVOICE
  // =====================================

  if (
    invoice.status === "paid" &&
    data.status !== "cancelled"
  ) {
    const financialFields = [
      "items",
      "discountType",
      "discountValue",
      "taxRate",
      "totalAmount",
    ];

    const tryingToChangeFinancialData =
      financialFields.some((field) =>
        Object.prototype.hasOwnProperty.call(data, field)
      );

    if (tryingToChangeFinancialData) {
      const error = new Error(
        "Paid invoice financial details cannot be modified"
      );

      error.statusCode = 400;
      throw error;
    }
  }

  // =====================================
  // DATES
  // =====================================

  const issueDate = data.issueDate
    ? new Date(data.issueDate)
    : invoice.issueDate;

  if (Number.isNaN(issueDate.getTime())) {
    const error = new Error("Invalid issue date");
    error.statusCode = 400;
    throw error;
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
    const error = new Error("Invalid due date");
    error.statusCode = 400;
    throw error;
  }

  if (dueDate && dueDate < issueDate) {
    const error = new Error(
      "Due date cannot be before issue date"
    );

    error.statusCode = 400;
    throw error;
  }

  // =====================================
  // FINANCIAL RECALCULATION
  // =====================================

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
      items: data.items || invoice.items,
      discountType:
        data.discountType ||
        invoice.discountType,
      discountValue:
        data.discountValue !== undefined
          ? data.discountValue
          : invoice.discountValue,
      taxRate:
        data.taxRate !== undefined
          ? data.taxRate
          : invoice.taxRate,
      paidAmount: invoice.paidAmount,
    });
  }

  // =====================================
  // UPDATE FIELDS
  // =====================================

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
    invoice.currency = data.currency.toUpperCase();
  }

  if (data.customerNotes !== undefined) {
    invoice.customerNotes = data.customerNotes;
  }

  if (data.termsAndConditions !== undefined) {
    invoice.termsAndConditions =
      data.termsAndConditions;
  }

  if (data.status !== undefined) {
    invoice.status = data.status;
  }

  invoice.issueDate = issueDate;
  invoice.dueDate = dueDate;

  // =====================================
  // APPLY TOTALS
  // =====================================

  invoice.subtotal = totals.subtotal;
  invoice.discountAmount = totals.discountAmount;
  invoice.taxAmount = totals.taxAmount;
  invoice.totalAmount = totals.totalAmount;
  invoice.paidAmount = totals.paidAmount;
  invoice.balanceDue = totals.balanceDue;

  // =====================================
  // STATUS
  // =====================================

  invoice.status = calculateInvoiceStatus({
    status: data.status || invoice.status,
    paidAmount: invoice.paidAmount,
    totalAmount: invoice.totalAmount,
    dueDate: invoice.dueDate,
  });

  await invoice.save();

  return Invoice.findById(invoice._id)
    .populate("job", "jobNumber title status")
    .populate("quote", "quoteNumber title status totalAmount")
    .populate(
      "customer",
      "firstName lastName email phone"
    )
    .populate(
      "createdBy",
      "firstName lastName email"
    );
};

// =====================================
// DELETE / CANCEL INVOICE
// =====================================

const deleteInvoice = async ({
  organizationId,
  invoiceId,
}) => {
  const invoice = await Invoice.findOne({
    _id: invoiceId,
    organization: organizationId,
    isActive: true,
  });

  if (!invoice) {
    const error = new Error("Invoice not found");
    error.statusCode = 404;
    throw error;
  }

  invoice.status = "cancelled";
  invoice.isActive = false;

  await invoice.save();

  return invoice;
};

// =====================================
// INVOICE STATS
// =====================================

const getInvoiceStats = async ({
  organizationId,
}) => {
  const stats = await Invoice.aggregate([
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
    result[item._id] = item.count;

    result.total += item.count;

    result.totalAmount += item.amount || 0;
    result.paidAmount += item.paid || 0;
    result.balanceDue += item.balance || 0;
  });

  result.totalAmount = Number(
    result.totalAmount.toFixed(2)
  );

  result.paidAmount = Number(
    result.paidAmount.toFixed(2)
  );

  result.balanceDue = Number(
    result.balanceDue.toFixed(2)
  );

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