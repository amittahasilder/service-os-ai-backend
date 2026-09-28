const {
  createInvoice,
  getOrganizationInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  getInvoiceStats,
} = require("../services/invoiceService");

// =====================================
// CREATE INVOICE
// =====================================

const createInvoiceController = async (req, res, next) => {
  try {
    const invoice = await createInvoice({
      organizationId: req.organizationId,
      userId: req.user._id,
      data: req.validatedData || req.body,
    });

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// GET ALL INVOICES
// =====================================

const getInvoices = async (req, res, next) => {
  try {
    const invoices = await getOrganizationInvoices({
      organizationId: req.organizationId,
      query: req.query,
    });

    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// GET SINGLE INVOICE
// =====================================

const getInvoice = async (req, res, next) => {
  try {
    const invoice = await getInvoiceById({
      organizationId: req.organizationId,
      invoiceId: req.params.invoiceId,
    });

    res.status(200).json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// UPDATE INVOICE
// =====================================

const updateInvoiceController = async (req, res, next) => {
  try {
    const invoice = await updateInvoice({
      organizationId: req.organizationId,
      invoiceId: req.params.invoiceId,
      data: req.validatedData || req.body,
    });

    res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// DELETE / CANCEL INVOICE
// =====================================

const removeInvoice = async (req, res, next) => {
  try {
    const invoice = await deleteInvoice({
      organizationId: req.organizationId,
      invoiceId: req.params.invoiceId,
    });

    res.status(200).json({
      success: true,
      message: "Invoice cancelled successfully",
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// INVOICE STATS
// =====================================

const invoiceStats = async (req, res, next) => {
  try {
    const stats = await getInvoiceStats({
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

// =====================================
// EXPORTS
// =====================================

module.exports = {
  createInvoiceController,
  getInvoices,
  getInvoice,
  updateInvoiceController,
  removeInvoice,
  invoiceStats,
};