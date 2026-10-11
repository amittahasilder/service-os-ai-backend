const mongoose = require("mongoose");

const {
  createLead,
  getOrganizationLeads,
  getLeadById,
  updateLead,
  changeLeadStatus,
  deleteLead,
  getLeadStats,
} = require("../services/leadService");

// =====================================
// HELPER
// =====================================

const getOrganizationId = (req) => {
  const organizationId = req.organizationId;

  if (!organizationId) {
    const error = new Error(
      "Organization context is missing."
    );

    error.statusCode = 400;

    throw error;
  }

  if (
    !mongoose.Types.ObjectId.isValid(
      organizationId
    )
  ) {
    const error = new Error(
      "Invalid organization ID."
    );

    error.statusCode = 400;

    throw error;
  }

  return new mongoose.Types.ObjectId(
    organizationId
  );
};

// =====================================
// CREATE LEAD
// =====================================

const createLeadController = async (
  req,
  res,
  next
) => {
  try {
    // ---------------------------------
    // Organization
    // ---------------------------------

    const organizationId =
      getOrganizationId(req);

    // ---------------------------------
    // User
    // ---------------------------------

    if (!req.user?._id) {
      const error = new Error(
        "Authenticated user not found."
      );

      error.statusCode = 401;

      throw error;
    }

    const userId = req.user._id;

    // ---------------------------------
    // Request Body
    // ---------------------------------

    const {
      name,
      email,
      phone,
      company,
      source,
      priority,
      estimatedValue,
      notes,
      assignedTo,
      nextFollowUpAt,
    } = req.body;

    // ---------------------------------
    // Basic Validation
    // ---------------------------------

    if (
      !name ||
      typeof name !== "string" ||
      !name.trim()
    ) {
      const error = new Error(
        "Lead name is required."
      );

      error.statusCode = 400;

      throw error;
    }

    // ---------------------------------
    // Create Lead
    // ---------------------------------

    const lead = await createLead({
      organizationId,
      userId,

      name: name.trim(),

      email:
        typeof email === "string"
          ? email.trim()
          : email,

      phone:
        typeof phone === "string"
          ? phone.trim()
          : phone,

      company:
        typeof company === "string"
          ? company.trim()
          : company,

      source,
      priority,
      estimatedValue,

      notes:
        typeof notes === "string"
          ? notes.trim()
          : notes,

      assignedTo,
      nextFollowUpAt,
    });

    // ---------------------------------
    // Response
    // ---------------------------------

    return res.status(201).json({
      success: true,

      message:
        "Lead created successfully",

      data: {
        lead,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// GET ALL LEADS
// =====================================

const getLeads = async (
  req,
  res,
  next
) => {
  try {
    const organizationId =
      getOrganizationId(req);

    const {
      status,
      source,
      priority,
      assignedTo,
      search,
    } = req.query;

    // ---------------------------------
    // Get Leads
    // ---------------------------------

    const leads =
      await getOrganizationLeads({
        organizationId,

        status,
        source,
        priority,
        assignedTo,
        search,
      });

    // ---------------------------------
    // Response
    // ---------------------------------

    return res.status(200).json({
      success: true,

      message:
        "Leads retrieved successfully",

      data: {
        leads,

        count: leads.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// GET SINGLE LEAD
// =====================================

const getLead = async (
  req,
  res,
  next
) => {
  try {
    const organizationId =
      getOrganizationId(req);

    const { leadId } =
      req.params;

    // ---------------------------------
    // Validate Lead ID
    // ---------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(
        leadId
      )
    ) {
      const error = new Error(
        "Invalid lead ID."
      );

      error.statusCode = 400;

      throw error;
    }

    // ---------------------------------
    // Get Lead
    // ---------------------------------

    const lead =
      await getLeadById({
        organizationId,
        leadId,
      });

    // ---------------------------------
    // Response
    // ---------------------------------

    return res.status(200).json({
      success: true,

      message:
        "Lead retrieved successfully",

      data: {
        lead,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// UPDATE LEAD
// =====================================

const updateLeadController = async (
  req,
  res,
  next
) => {
  try {
    const organizationId =
      getOrganizationId(req);

    const { leadId } =
      req.params;

    // ---------------------------------
    // Validate Lead ID
    // ---------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(
        leadId
      )
    ) {
      const error = new Error(
        "Invalid lead ID."
      );

      error.statusCode = 400;

      throw error;
    }

    // ---------------------------------
    // Request Body
    // ---------------------------------

    const {
      name,
      email,
      phone,
      company,
      source,
      priority,
      estimatedValue,
      notes,
      assignedTo,
      nextFollowUpAt,
    } = req.body;

    const updateData = {};

    // ---------------------------------
    // Name
    // ---------------------------------

    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        !name.trim()
      ) {
        const error = new Error(
          "Lead name cannot be empty."
        );

        error.statusCode = 400;

        throw error;
      }

      updateData.name =
        name.trim();
    }

    // ---------------------------------
    // Email
    // ---------------------------------

    if (email !== undefined) {
      updateData.email =
        typeof email === "string"
          ? email.trim()
          : email;
    }

    // ---------------------------------
    // Phone
    // ---------------------------------

    if (phone !== undefined) {
      updateData.phone =
        typeof phone === "string"
          ? phone.trim()
          : phone;
    }

    // ---------------------------------
    // Company
    // ---------------------------------

    if (company !== undefined) {
      updateData.company =
        typeof company === "string"
          ? company.trim()
          : company;
    }

    // ---------------------------------
    // Source
    // ---------------------------------

    if (source !== undefined) {
      updateData.source =
        source;
    }

    // ---------------------------------
    // Priority
    // ---------------------------------

    if (priority !== undefined) {
      updateData.priority =
        priority;
    }

    // ---------------------------------
    // Estimated Value
    // ---------------------------------

    if (
      estimatedValue !== undefined
    ) {
      updateData.estimatedValue =
        estimatedValue;
    }

    // ---------------------------------
    // Notes
    // ---------------------------------

    if (notes !== undefined) {
      updateData.notes =
        typeof notes === "string"
          ? notes.trim()
          : notes;
    }

    // ---------------------------------
    // Assigned To
    // ---------------------------------

    if (
      assignedTo !== undefined
    ) {
      updateData.assignedTo =
        assignedTo;
    }

    // ---------------------------------
    // Follow Up
    // ---------------------------------

    if (
      nextFollowUpAt !== undefined
    ) {
      updateData.nextFollowUpAt =
        nextFollowUpAt;
    }

    // ---------------------------------
    // Update Lead
    // ---------------------------------

    const lead =
      await updateLead({
        organizationId,
        leadId,
        updateData,
      });

    // ---------------------------------
    // Response
    // ---------------------------------

    return res.status(200).json({
      success: true,

      message:
        "Lead updated successfully",

      data: {
        lead,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// CHANGE LEAD STATUS
// =====================================

const updateLeadStatus = async (
  req,
  res,
  next
) => {
  try {
    const organizationId =
      getOrganizationId(req);

    const { leadId } =
      req.params;

    const { status } =
      req.body;

    // ---------------------------------
    // Validate Lead ID
    // ---------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(
        leadId
      )
    ) {
      const error = new Error(
        "Invalid lead ID."
      );

      error.statusCode = 400;

      throw error;
    }

    // ---------------------------------
    // Allowed Statuses
    // ---------------------------------

    const allowedStatuses = [
      "new",
      "contacted",
      "qualified",
      "proposal",
      "won",
      "lost",
    ];

    if (
      !status ||
      !allowedStatuses.includes(
        status
      )
    ) {
      const error = new Error(
        "Invalid lead status."
      );

      error.statusCode = 400;

      throw error;
    }

    // ---------------------------------
    // Change Status
    // ---------------------------------

    const lead =
      await changeLeadStatus({
        organizationId,
        leadId,
        status,
      });

    // ---------------------------------
    // Response
    // ---------------------------------

    return res.status(200).json({
      success: true,

      message:
        "Lead status updated successfully",

      data: {
        lead,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// DELETE / ARCHIVE LEAD
// =====================================

const removeLead = async (
  req,
  res,
  next
) => {
  try {
    const organizationId =
      getOrganizationId(req);

    const { leadId } =
      req.params;

    // ---------------------------------
    // Validate Lead ID
    // ---------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(
        leadId
      )
    ) {
      const error = new Error(
        "Invalid lead ID."
      );

      error.statusCode = 400;

      throw error;
    }

    // ---------------------------------
    // Archive
    // ---------------------------------

    const lead =
      await deleteLead({
        organizationId,
        leadId,
      });

    // ---------------------------------
    // Response
    // ---------------------------------

    return res.status(200).json({
      success: true,

      message:
        "Lead archived successfully",

      data: {
        lead,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// LEAD STATISTICS
// =====================================

const leadStats = async (
  req,
  res,
  next
) => {
  try {
    const organizationId =
      getOrganizationId(req);

    // ---------------------------------
    // Get Statistics
    // ---------------------------------

    const stats =
      await getLeadStats(
        organizationId
      );

    // ---------------------------------
    // Response
    // ---------------------------------

    return res.status(200).json({
      success: true,

      message:
        "Lead statistics retrieved successfully",

      data: {
        stats,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// EXPORT
// =====================================

module.exports = {
  createLeadController,
  getLeads,
  getLead,
  updateLeadController,
  updateLeadStatus,
  removeLead,
  leadStats,
};