const {
  getAnalyticsOverview,
} = require("../services/analyticsService");

// =====================================
// GET ANALYTICS OVERVIEW
// =====================================

const getAnalyticsOverviewController = async (req, res, next) => {
  try {
    const result = await getAnalyticsOverview({
      organizationId: req.organizationId,
      year: req.query.year,
    });

    return res.status(200).json({
      success: true,
      organizationId: String(req.organizationId),
      ...result,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getAnalyticsOverview: getAnalyticsOverviewController,
};