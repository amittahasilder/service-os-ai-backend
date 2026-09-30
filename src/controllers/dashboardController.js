const mongoose = require("mongoose");

// =====================================================
// MODELS
// =====================================================

const Customer = require("../models/Customer");

// These models may not exist yet.
// We will add them when their modules are completed.
// For now dashboard safely handles unavailable models.

// =====================================================
// HELPERS
// =====================================================

const safeCountDocuments = async (Model, filter) => {
  if (!Model) return 0;

  try {
    return await Model.countDocuments(filter);
  } catch (error) {
    console.warn(
      `Dashboard count failed: ${error.message}`
    );

    return 0;
  }
};

// =====================================================
// GET DASHBOARD SUMMARY
// =====================================================

const getDashboardSummary = async (req, res) => {
  try {
    // -------------------------------------------------
    // ORGANIZATION
    // -------------------------------------------------

    const organizationId =
      req.organization?._id ||
      req.organization?.id ||
      req.organization;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: "Organization context is required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(organizationId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organization ID.",
      });
    }

    // -------------------------------------------------
    // CUSTOMER COUNT
    // -------------------------------------------------

    const totalCustomers =
      await safeCountDocuments(Customer, {
        organization: organizationId,
        isActive: true,
      });

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.status(200).json({
      success: true,

      organizationId,

      summary: {
        totalRevenue: 0,
        activeJobs: 0,
        newLeads: 0,
        totalCustomers,

        totalBookings: 0,
        totalInvoices: 0,
        pendingInvoices: 0,
        completedJobs: 0,
      },

      growth: {
        revenue: 0,
        jobs: 0,
        leads: 0,
        customers: 0,
      },

      generatedAt: new Date(),
    });
  } catch (error) {
    console.error(
      "Dashboard summary error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard summary.",
    });
  }
};

module.exports = {
  getDashboardSummary,
};