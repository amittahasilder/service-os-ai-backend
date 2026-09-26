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
// CREATE LEAD
// =====================================

const createLeadController = async (
  req,
  res,
  next
) => {
  try {
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


    // -------------------------------------
    // Basic Validation
    // -------------------------------------

    if (
      !name ||
      typeof name !== "string" ||
      !name.trim()
    ) {
      const error = new Error(
        "Lead name is required"
      );

      error.statusCode = 400;

      throw error;
    }


    // -------------------------------------
    // Create Lead
    // -------------------------------------

    const lead = await createLead({
      organizationId:
        req.organizationId,

      userId:
        req.user._id,

      name: name.trim(),

      email:
        email?.trim(),

      phone:
        phone?.trim(),

      company:
        company?.trim(),

      source,

      priority,

      estimatedValue,

      notes:
        notes?.trim(),

      assignedTo,

      nextFollowUpAt,
    });


    res.status(201).json({
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
    const {
      status,
      source,
      priority,
      assignedTo,
      search,
    } = req.query;


    const leads =
      await getOrganizationLeads({
        organizationId:
          req.organizationId,

        status,

        source,

        priority,

        assignedTo,

        search,
      });


    res.status(200).json({
      success: true,

      message:
        "Leads retrieved successfully",

      data: {
        leads,

        count:
          leads.length,
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
    const {
      leadId,
    } = req.params;


    const lead =
      await getLeadById({
        organizationId:
          req.organizationId,

        leadId,
      });


    res.status(200).json({
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
    const {
      leadId,
    } = req.params;


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


    // -------------------------------------
    // Allowed Fields
    // -------------------------------------

    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        !name.trim()
      ) {
        const error = new Error(
          "Lead name cannot be empty"
        );

        error.statusCode = 400;

        throw error;
      }

      updateData.name =
        name.trim();
    }


    if (email !== undefined) {
      updateData.email =
        email?.trim();
    }


    if (phone !== undefined) {
      updateData.phone =
        phone?.trim();
    }


    if (company !== undefined) {
      updateData.company =
        company?.trim();
    }


    if (source !== undefined) {
      updateData.source =
        source;
    }


    if (priority !== undefined) {
      updateData.priority =
        priority;
    }


    if (
      estimatedValue !== undefined
    ) {
      updateData.estimatedValue =
        estimatedValue;
    }


    if (notes !== undefined) {
      updateData.notes =
        notes?.trim();
    }


    if (
      assignedTo !== undefined
    ) {
      updateData.assignedTo =
        assignedTo;
    }


    if (
      nextFollowUpAt !== undefined
    ) {
      updateData.nextFollowUpAt =
        nextFollowUpAt;
    }


    // -------------------------------------
    // Update Lead
    // -------------------------------------

    const lead =
      await updateLead({
        organizationId:
          req.organizationId,

        leadId,

        updateData,
      });


    res.status(200).json({
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
    const {
      leadId,
    } = req.params;

    const {
      status,
    } = req.body;


    // -------------------------------------
    // Allowed Statuses
    // -------------------------------------

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
      !allowedStatuses.includes(status)
    ) {
      const error = new Error(
        "Invalid lead status"
      );

      error.statusCode = 400;

      throw error;
    }


    // -------------------------------------
    // Update Status
    // -------------------------------------

    const lead =
      await changeLeadStatus({
        organizationId:
          req.organizationId,

        leadId,

        status,
      });


    res.status(200).json({
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
    const {
      leadId,
    } = req.params;


    const lead =
      await deleteLead({
        organizationId:
          req.organizationId,

        leadId,
      });


    res.status(200).json({
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
    const stats =
      await getLeadStats(
        req.organizationId
      );


    res.status(200).json({
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