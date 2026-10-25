
const {
  getDashboardSummary,
} = require("../services/dashboardService");

// =====================================
// GET DASHBOARD SUMMARY
// =====================================

const getDashboardSummaryController = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: "Organization context is required.",
      });
    }

    const result = await getDashboardSummary({
      organizationId,
    });

    return res.status(200).json({
      success: true,
      organizationId: String(organizationId),
      ...result,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getDashboardSummary: getDashboardSummaryController,
};
