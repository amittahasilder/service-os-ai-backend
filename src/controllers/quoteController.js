
const {
  createQuote,
  getOrganizationQuotes,
  getQuoteById,
  updateQuote,
  deleteQuote,
  getQuoteStats,
} = require("../services/quoteService");

// =====================================================
// COMMON REQUEST GUARDS
// =====================================================

const createHttpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const requireOrganization = (req) => {
  if (!req.organizationId) {
    throw createHttpError(
      "Organization context is required",
      400
    );
  }
};

const requireAuthenticatedUser = (req) => {
  if (!req.user?._id) {
    throw createHttpError(
      "Authentication is required",
      401
    );
  }
};

// Require data that has passed through validation middleware.
// Never silently fall back to unvalidated req.body.
const requireValidatedData = (req) => {
  if (
    !req.validatedData ||
    typeof req.validatedData !== "object" ||
    Array.isArray(req.validatedData)
  ) {
    throw createHttpError(
      "Validated request data is missing. Check the quote validation middleware.",
      400
    );
  }

  return req.validatedData;
};

// =====================================================
// CREATE QUOTE
// POST
// =====================================================

const createQuoteController = async (req, res, next) => {
  try {
    requireOrganization(req);
    requireAuthenticatedUser(req);

    const data = requireValidatedData(req);

    const quote = await createQuote({
      organizationId: req.organizationId,
      userId: req.user._id,
      data,
    });

    return res.status(201).json({
      success: true,
      message: "Quote created successfully",
      data: quote,
    });
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// GET ALL ORGANIZATION QUOTES
// GET
// =====================================================

const getQuotes = async (req, res, next) => {
  try {
    requireOrganization(req);

    const quotes = await getOrganizationQuotes({
      organizationId: req.organizationId,
      query: req.query,
    });

    return res.status(200).json({
      success: true,
      count: quotes.length,
      data: quotes,
    });
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// GET SINGLE QUOTE
// GET
// =====================================================

const getQuote = async (req, res, next) => {
  try {
    requireOrganization(req);

    const quote = await getQuoteById({
      organizationId: req.organizationId,
      quoteId: req.params.quoteId,
    });

    return res.status(200).json({
      success: true,
      data: quote,
    });
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// UPDATE QUOTE
// PATCH / PUT
// =====================================================

const updateQuoteController = async (req, res, next) => {
  try {
    requireOrganization(req);

    const data = requireValidatedData(req);

    const quote = await updateQuote({
      organizationId: req.organizationId,
      quoteId: req.params.quoteId,
      data,
    });

    return res.status(200).json({
      success: true,
      message: "Quote updated successfully",
      data: quote,
    });
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// DELETE / CANCEL QUOTE
// DELETE
// =====================================================

const removeQuote = async (req, res, next) => {
  try {
    requireOrganization(req);

    const quote = await deleteQuote({
      organizationId: req.organizationId,
      quoteId: req.params.quoteId,
    });

    return res.status(200).json({
      success: true,
      message: "Quote cancelled successfully",
      data: quote,
    });
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// QUOTE STATS
// GET
// =====================================================

const quoteStats = async (req, res, next) => {
  try {
    requireOrganization(req);

    const stats = await getQuoteStats({
      organizationId: req.organizationId,
    });

    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return next(error);
  }
};

// =====================================================
// EXPORT CONTROLLERS
// =====================================================

module.exports = {
  createQuoteController,
  getQuotes,
  getQuote,
  updateQuoteController,
  removeQuote,
  quoteStats,
};
