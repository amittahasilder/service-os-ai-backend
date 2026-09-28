
const mongoose = require("mongoose");

const Payment = require("../models/Payment");
const Invoice = require("../models/Invoice");
const Customer = require("../models/Customer");

// =====================================
// HELPERS
// =====================================

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const roundMoney = (amount) =>
  Math.round((Number(amount) + Number.EPSILON) * 100) / 100;

const validateObjectId = (id, name = "ID") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError(`Invalid ${name}`, 400);
  }
};

// =====================================
// GENERATE PAYMENT NUMBER
// =====================================

const generatePaymentNumber = async (session) => {
  const year = new Date().getFullYear();

  const prefix = `PAY-${year}-`;

  const lastPayment = await Payment.findOne({
    paymentNumber: new RegExp(`^${prefix}`),
  })
    .sort({ createdAt: -1 })
    .session(session);

  let nextNumber = 1;

  if (lastPayment) {
    const lastNumber = parseInt(
      lastPayment.paymentNumber.split("-")[2],
      10
    );

    nextNumber = lastNumber + 1;
  }

  return `${prefix}${String(nextNumber).padStart(5, "0")}`;
};

// =====================================
// FIND PAYMENT
// =====================================

const findPayment = async ({
  organizationId,
  paymentId,
  session,
}) => {
  validateObjectId(paymentId, "Payment ID");

  const payment = await Payment.findOne({
    _id: paymentId,
    organization: organizationId,
    isActive: true,
  }).session(session || null);

  if (!payment) {
    throw createError("Payment not found", 404);
  }

  return payment;
};

// =====================================
// UPDATE INVOICE BALANCE
// =====================================

const syncInvoiceBalance = async ({
  invoice,
  session,
}) => {
  const payments = await Payment.find({
    organization: invoice.organization,
    invoice: invoice._id,
    status: "completed",
    isActive: true,
  }).session(session);

  const paidAmount = roundMoney(
    payments.reduce(
      (total, payment) => total + payment.amount,
      0
    )
  );

  const balanceDue = roundMoney(
    Math.max(0, invoice.totalAmount - paidAmount)
  );

  invoice.paidAmount = paidAmount;
  invoice.balanceDue = balanceDue;

  if (invoice.status !== "cancelled") {
    if (balanceDue <= 0) {
      invoice.status = "paid";
    } else if (paidAmount > 0) {
      invoice.status = "partially_paid";
    } else if (
      invoice.dueDate &&
      new Date(invoice.dueDate) < new Date()
    ) {
      invoice.status = "overdue";
    } else if (
      invoice.status !== "draft"
    ) {
      invoice.status = "sent";
    } else {
      invoice.status = "draft";
    }
  }

  await invoice.save({ session });

  return invoice;
};

// =====================================
// CREATE PAYMENT
// =====================================

const createPayment = async ({
  organizationId,
  userId,
  data,
}) => {
  validateObjectId(organizationId, "Organization ID");
  validateObjectId(data.invoice, "Invoice ID");
  validateObjectId(data.customer, "Customer ID");

  const session = await mongoose.startSession();

  let createdPayment;

  try {
    await session.withTransaction(async () => {
      const invoice = await Invoice.findOne({
        _id: data.invoice,
        organization: organizationId,
        isActive: true,
      }).session(session);

      if (!invoice) {
        throw createError("Invoice not found", 404);
      }

      if (invoice.status === "cancelled") {
        throw createError(
          "Cannot pay a cancelled invoice"
        );
      }

      const customer = await Customer.findOne({
        _id: data.customer,
        organization: organizationId,
        isActive: true,
      }).session(session);

      if (!customer) {
        throw createError("Customer not found", 404);
      }

      if (
        String(invoice.customer) !==
        String(customer._id)
      ) {
        throw createError(
          "Customer does not match the invoice"
        );
      }

      if (
        data.currency &&
        data.currency.toUpperCase() !==
          invoice.currency.toUpperCase()
      ) {
        throw createError(
          "Payment currency must match invoice currency"
        );
      }

      const amount = roundMoney(data.amount);

      if (amount <= 0) {
        throw createError(
          "Payment amount must be greater than zero"
        );
      }

      const currentPaid = roundMoney(
        invoice.paidAmount || 0
      );

      const currentBalance = roundMoney(
        invoice.totalAmount - currentPaid
      );

      const paymentStatus = data.status || "completed";

      if (
        paymentStatus === "completed" &&
        amount > currentBalance
      ) {
        throw createError(
          `Payment exceeds invoice balance. Balance due: ${currentBalance}`
        );
      }

      // Prevent duplicate transaction IDs
      if (data.transactionId) {
        const existingTransaction =
          await Payment.findOne({
            organization: organizationId,
            transactionId: data.transactionId,
            isActive: true,
          }).session(session);

        if (existingTransaction) {
          throw createError(
            "Transaction ID already exists",
            409
          );
        }
      }

      const paymentNumber =
        await generatePaymentNumber(session);

      const [payment] = await Payment.create(
        [
          {
            organization: organizationId,
            invoice: invoice._id,
            customer: customer._id,
            paymentNumber,
            amount,
            currency:
              data.currency || invoice.currency,
            paymentMethod: data.paymentMethod,
            status: paymentStatus,
            transactionId: data.transactionId || "",
            referenceNumber:
              data.referenceNumber || "",
            paymentDate: data.paymentDate
              ? new Date(data.paymentDate)
              : new Date(),
            notes: data.notes || "",
            createdBy: userId,
          },
        ],
        { session }
      );

      if (paymentStatus === "completed") {
        await syncInvoiceBalance({
          invoice,
          session,
        });
      }

      createdPayment = payment;
    });

    return await Payment.findById(
      createdPayment._id
    )
      .populate("invoice", "invoiceNumber totalAmount paidAmount balanceDue status")
      .populate("customer", "name email phone");
  } finally {
    await session.endSession();
  }
};

// =====================================
// GET ORGANIZATION PAYMENTS
// =====================================

const getOrganizationPayments = async ({
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

  if (query.invoice) {
    filter.invoice = query.invoice;
  }

  if (query.paymentMethod) {
    filter.paymentMethod = query.paymentMethod;
  }

  const payments = await Payment.find(filter)
    .populate(
      "invoice",
      "invoiceNumber totalAmount paidAmount balanceDue status"
    )
    .populate("customer", "name email phone")
    .sort({ createdAt: -1 });

  return payments;
};

// =====================================
// GET SINGLE PAYMENT
// =====================================

const getPaymentById = async ({
  organizationId,
  paymentId,
}) => {
  const payment = await Payment.findOne({
    _id: paymentId,
    organization: organizationId,
    isActive: true,
  })
    .populate(
      "invoice",
      "invoiceNumber totalAmount paidAmount balanceDue status"
    )
    .populate("customer", "name email phone");

  if (!payment) {
    throw createError("Payment not found", 404);
  }

  return payment;
};

// =====================================
// UPDATE PAYMENT
// =====================================

const updatePayment = async ({
  organizationId,
  paymentId,
  data,
}) => {
  const session = await mongoose.startSession();

  let updatedPayment;

  try {
    await session.withTransaction(async () => {
      const payment = await findPayment({
        organizationId,
        paymentId,
        session,
      });

      const invoice = await Invoice.findOne({
        _id: payment.invoice,
        organization: organizationId,
        isActive: true,
      }).session(session);

      if (!invoice) {
        throw createError("Invoice not found", 404);
      }

      const oldStatus = payment.status;
      const newStatus = data.status || oldStatus;

      // Do not allow editing a refunded payment
      if (oldStatus === "refunded") {
        throw createError(
          "Refunded payment cannot be updated"
        );
      }

      // Prevent directly changing completed payments
      // back to pending or failed. Use refund handling.
      if (
        oldStatus === "completed" &&
        ["pending", "failed", "cancelled"].includes(
          newStatus
        )
      ) {
        throw createError(
          "Completed payments must be refunded, not cancelled"
        );
      }

      if (
        oldStatus !== "completed" &&
        newStatus === "completed"
      ) {
        const currentPaid = roundMoney(
          invoice.paidAmount || 0
        );

        const balance = roundMoney(
          invoice.totalAmount - currentPaid
        );

        if (payment.amount > balance) {
          throw createError(
            `Payment exceeds invoice balance. Balance due: ${balance}`
          );
        }
      }

      // Check transaction ID uniqueness
      if (data.transactionId) {
        const duplicate = await Payment.findOne({
          organization: organizationId,
          transactionId: data.transactionId,
          _id: { $ne: payment._id },
          isActive: true,
        }).session(session);

        if (duplicate) {
          throw createError(
            "Transaction ID already exists",
            409
          );
        }
      }

      if (data.status !== undefined) {
        payment.status = data.status;
      }

      if (data.transactionId !== undefined) {
        payment.transactionId = data.transactionId;
      }

      if (data.referenceNumber !== undefined) {
        payment.referenceNumber =
          data.referenceNumber;
      }

      if (data.paymentDate !== undefined) {
        payment.paymentDate = new Date(
          data.paymentDate
        );
      }

      if (data.notes !== undefined) {
        payment.notes = data.notes;
      }

      await payment.save({ session });

      if (
        oldStatus !== newStatus &&
        (
          oldStatus === "completed" ||
          newStatus === "completed"
        )
      ) {
        await syncInvoiceBalance({
          invoice,
          session,
        });
      }

      updatedPayment = payment;
    });

    return await Payment.findById(
      updatedPayment._id
    )
      .populate(
        "invoice",
        "invoiceNumber totalAmount paidAmount balanceDue status"
      )
      .populate("customer", "name email phone");
  } finally {
    await session.endSession();
  }
};

// =====================================
// REFUND PAYMENT
// =====================================

const refundPayment = async ({
  organizationId,
  paymentId,
}) => {
  const session = await mongoose.startSession();

  let refundedPayment;

  try {
    await session.withTransaction(async () => {
      const payment = await findPayment({
        organizationId,
        paymentId,
        session,
      });

      if (payment.status !== "completed") {
        throw createError(
          "Only completed payments can be refunded"
        );
      }

      const invoice = await Invoice.findOne({
        _id: payment.invoice,
        organization: organizationId,
        isActive: true,
      }).session(session);

      if (!invoice) {
        throw createError("Invoice not found", 404);
      }

      payment.status = "refunded";

      await payment.save({ session });

      await syncInvoiceBalance({
        invoice,
        session,
      });

      refundedPayment = payment;
    });

    return await Payment.findById(
      refundedPayment._id
    )
      .populate(
        "invoice",
        "invoiceNumber totalAmount paidAmount balanceDue status"
      )
      .populate("customer", "name email phone");
  } finally {
    await session.endSession();
  }
};

// =====================================
// CANCEL PAYMENT
// =====================================

const cancelPayment = async ({
  organizationId,
  paymentId,
}) => {
  const payment = await Payment.findOne({
    _id: paymentId,
    organization: organizationId,
    isActive: true,
  });

  if (!payment) {
    throw createError("Payment not found", 404);
  }

  if (payment.status === "completed") {
    throw createError(
      "Completed payments must be refunded"
    );
  }

  if (
    ["refunded", "cancelled"].includes(payment.status)
  ) {
    throw createError(
      "Payment is already refunded or cancelled"
    );
  }

  payment.status = "cancelled";

  await payment.save();

  return payment;
};

// =====================================
// PAYMENT STATISTICS
// =====================================

const getPaymentStats = async ({
  organizationId,
}) => {
  const result = await Payment.aggregate([
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
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: "$amount" },

        completedAmount: {
          $sum: {
            $cond: [
              { $eq: ["$status", "completed"] },
              "$amount",
              0,
            ],
          },
        },

        refundedAmount: {
          $sum: {
            $cond: [
              { $eq: ["$status", "refunded"] },
              "$amount",
              0,
            ],
          },
        },

        pendingAmount: {
          $sum: {
            $cond: [
              { $eq: ["$status", "pending"] },
              "$amount",
              0,
            ],
          },
        },
      },
    },
  ]);

  const methodStats = await Payment.aggregate([
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
        _id: "$paymentMethod",
        count: { $sum: 1 },
        amount: { $sum: "$amount" },
      },
    },
  ]);

  return {
    summary: result[0] || {
      totalPayments: 0,
      totalAmount: 0,
      completedAmount: 0,
      refundedAmount: 0,
      pendingAmount: 0,
    },
    paymentMethods: methodStats,
  };
};

// =====================================
// EXPORTS
// =====================================

module.exports = {
  createPayment,
  getOrganizationPayments,
  getPaymentById,
  updatePayment,
  refundPayment,
  cancelPayment,
  getPaymentStats,
};