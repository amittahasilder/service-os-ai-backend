const {
  createQuote,
  getOrganizationQuotes,
  getQuoteById,
  updateQuote,
  deleteQuote,
  getQuoteStats,
} = require("../services/quoteService");

// =====================================
// CREATE QUOTE
// =====================================

const createQuoteController = async (req, res, next) => {
  try {
    const quote = await createQuote({
      organizationId: req.organizationId,
      userId: req.user._id,
      data: req.validatedData || req.body,
    });

    res.status(201).json({
      success: true,
      message: "Quote created successfully",
      data: quote,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// GET ALL QUOTES
// =====================================

const getQuotes = async (req, res, next) => {
  try {
    const quotes = await getOrganizationQuotes({
      organizationId: req.organizationId,
      query: req.query,
    });

    res.status(200).json({
      success: true,
      count: quotes.length,
      data: quotes,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// GET SINGLE QUOTE
// =====================================

const getQuote = async (req, res, next) => {
  try {
    const quote = await getQuoteById({
      organizationId: req.organizationId,
      quoteId: req.params.quoteId,
    });

    res.status(200).json({
      success: true,
      data: quote,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// UPDATE QUOTE
// =====================================

const updateQuoteController = async (req, res, next) => {
  try {
    const quote = await updateQuote({
      organizationId: req.organizationId,
      quoteId: req.params.quoteId,
      data: req.validatedData || req.body,
    });

    res.status(200).json({
      success: true,
      message: "Quote updated successfully",
      data: quote,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// DELETE / CANCEL QUOTE
// =====================================

const removeQuote = async (req, res, next) => {
  try {
    const quote = await deleteQuote({
      organizationId: req.organizationId,
      quoteId: req.params.quoteId,
    });

    res.status(200).json({
      success: true,
      message: "Quote cancelled successfully",
      data: quote,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// QUOTE STATS
// =====================================

const quoteStats = async (req, res, next) => {
  try {
    const stats = await getQuoteStats({
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
// EXPORT
// =====================================

module.exports = {
  createQuoteController,
  getQuotes,
  getQuote,
  updateQuoteController,
  removeQuote,
  quoteStats,
};