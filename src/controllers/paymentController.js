
const {
  createPayment,
  getOrganizationPayments,
  getPaymentById,
  updatePayment,
  refundPayment,
  cancelPayment,
  getPaymentStats,
} = require("../services/paymentService");

// CREATE
const createPaymentController = async (req, res, next) => {
  try {
    const payment = await createPayment({
      organizationId: req.organizationId,
      userId: req.user._id,
      data: req.body,
    });

    res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL
const getPayments = async (req, res, next) => {
  try {
    const payments = await getOrganizationPayments({
      organizationId: req.organizationId,
      query: req.query,
    });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    next(error);
  }
};

// GET SINGLE
const getPayment = async (req, res, next) => {
  try {
    const payment = await getPaymentById({
      organizationId: req.organizationId,
      paymentId: req.params.paymentId,
    });

    res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE
const updatePaymentController = async (req, res, next) => {
  try {
    const payment = await updatePayment({
      organizationId: req.organizationId,
      paymentId: req.params.paymentId,
      data: req.body,
    });

    res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

// REFUND
const refundPaymentController = async (req, res, next) => {
  try {
    const payment = await refundPayment({
      organizationId: req.organizationId,
      paymentId: req.params.paymentId,
    });

    res.status(200).json({
      success: true,
      message: "Payment refunded successfully",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

// CANCEL
const cancelPaymentController = async (req, res, next) => {
  try {
    const payment = await cancelPayment({
      organizationId: req.organizationId,
      paymentId: req.params.paymentId,
    });

    res.status(200).json({
      success: true,
      message: "Payment cancelled successfully",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

// STATS
const paymentStats = async (req, res, next) => {
  try {
    const stats = await getPaymentStats({
      organizationId: req.organizationId,
    });

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentController,
  getPayments,
  getPayment,
  updatePaymentController,
  refundPaymentController,
  cancelPaymentController,
  paymentStats,
};