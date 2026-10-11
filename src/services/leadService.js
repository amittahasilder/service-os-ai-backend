const mongoose = require("mongoose");

const Lead = require("../models/Lead");
const User = require("../models/User");

// =====================================
// HELPER
// =====================================

const normalizeObjectId = (
  value,
  fieldName
) => {
  if (!value) {
    const error = new Error(
      `${fieldName} is required.`
    );

    error.statusCode = 400;

    throw error;
  }

  // ---------------------------------
  // Handle Object
  // ---------------------------------

  if (
    typeof value === "object" &&
    value._id
  ) {
    value = value._id;
  }

  // ---------------------------------
  // Validate
  // ---------------------------------

  if (
    !mongoose.Types.ObjectId.isValid(
      value
    )
  ) {
    const error = new Error(
      `Invalid ${fieldName}.`
    );

    error.statusCode = 400;

    throw error;
  }

  return new mongoose.Types.ObjectId(
    value
  );
};

// =====================================
// CREATE LEAD
// =====================================

const createLead = async ({
  organizationId,
  userId,
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
}) => {
  // ---------------------------------
  // Normalize IDs
  // ---------------------------------

  const organizationObjectId =
    normalizeObjectId(
      organizationId,
      "organization ID"
    );

  const userObjectId =
    normalizeObjectId(
      userId,
      "user ID"
    );

  // ---------------------------------
  // Validate Assigned User
  // ---------------------------------

  let assignedUserId = null;

  if (assignedTo) {
    assignedUserId =
      normalizeObjectId(
        assignedTo,
        "assigned user ID"
      );

    const user =
      await User.findById(
        assignedUserId
      );

    if (!user) {
      const error = new Error(
        "Assigned user not found."
      );

      error.statusCode = 404;

      throw error;
    }
  }

  // ---------------------------------
  // Create Lead
  // ---------------------------------

  const lead =
    await Lead.create({
      organization:
        organizationObjectId,

      name,

      email:
        email || undefined,

      phone:
        phone || undefined,

      company:
        company || undefined,

      source:
        source || "other",

      priority:
        priority || "medium",

      estimatedValue:
        estimatedValue !== undefined &&
        estimatedValue !== null
          ? Number(estimatedValue)
          : 0,

      notes:
        notes || undefined,

      assignedTo:
        assignedUserId,

      nextFollowUpAt:
        nextFollowUpAt || null,

      createdBy:
        userObjectId,

      status: "new",

      isActive: true,
    });

  return lead;
};

// =====================================
// GET ALL LEADS
// =====================================

const getOrganizationLeads = async ({
  organizationId,
  status,
  source,
  priority,
  assignedTo,
  search,
}) => {
  const organizationObjectId =
    normalizeObjectId(
      organizationId,
      "organization ID"
    );

  // ---------------------------------
  // Base Query
  // ---------------------------------

  const query = {
    organization:
      organizationObjectId,

    isActive: true,
  };

  // ---------------------------------
  // Status
  // ---------------------------------

  if (status) {
    query.status = status;
  }

  // ---------------------------------
  // Source
  // ---------------------------------

  if (source) {
    query.source = source;
  }

  // ---------------------------------
  // Priority
  // ---------------------------------

  if (priority) {
    query.priority = priority;
  }

  // ---------------------------------
  // Assigned User
  // ---------------------------------

  if (assignedTo) {
    query.assignedTo =
      normalizeObjectId(
        assignedTo,
        "assigned user ID"
      );
  }

  // ---------------------------------
  // Search
  // ---------------------------------

  if (search) {
    const safeSearch =
      String(search).trim();

    if (safeSearch) {
      query.$or = [
        {
          name: {
            $regex: safeSearch,
            $options: "i",
          },
        },

        {
          email: {
            $regex: safeSearch,
            $options: "i",
          },
        },

        {
          phone: {
            $regex: safeSearch,
            $options: "i",
          },
        },

        {
          company: {
            $regex: safeSearch,
            $options: "i",
          },
        },
      ];
    }
  }

  // ---------------------------------
  // Fetch Leads
  // ---------------------------------

  const leads =
    await Lead.find(query)
      .populate({
        path: "assignedTo",
        select:
          "name email avatar",
      })
      .populate({
        path: "createdBy",
        select:
          "name email",
      })
      .populate({
        path:
          "convertedToCustomer",
        select:
          "name email phone",
      })
      .sort({
        createdAt: -1,
      });

  return leads;
};

// =====================================
// GET SINGLE LEAD
// =====================================

const getLeadById = async ({
  organizationId,
  leadId,
}) => {
  const organizationObjectId =
    normalizeObjectId(
      organizationId,
      "organization ID"
    );

  const leadObjectId =
    normalizeObjectId(
      leadId,
      "lead ID"
    );

  // ---------------------------------
  // Find
  // ---------------------------------

  const lead =
    await Lead.findOne({
      _id: leadObjectId,

      organization:
        organizationObjectId,

      isActive: true,
    })
      .populate({
        path: "assignedTo",
        select:
          "name email avatar",
      })
      .populate({
        path: "createdBy",
        select:
          "name email",
      })
      .populate({
        path:
          "convertedToCustomer",
        select:
          "name email phone",
      });

  // ---------------------------------
  // Not Found
  // ---------------------------------

  if (!lead) {
    const error = new Error(
      "Lead not found."
    );

    error.statusCode = 404;

    throw error;
  }

  return lead;
};

// =====================================
// UPDATE LEAD
// =====================================

const updateLead = async ({
  organizationId,
  leadId,
  updateData,
}) => {
  const organizationObjectId =
    normalizeObjectId(
      organizationId,
      "organization ID"
    );

  const leadObjectId =
    normalizeObjectId(
      leadId,
      "lead ID"
    );

  // ---------------------------------
  // Find Lead
  // ---------------------------------

  const lead =
    await Lead.findOne({
      _id: leadObjectId,

      organization:
        organizationObjectId,

      isActive: true,
    });

  if (!lead) {
    const error = new Error(
      "Lead not found."
    );

    error.statusCode = 404;

    throw error;
  }

  // ---------------------------------
  // Validate Assigned User
  // ---------------------------------

  if (
    updateData.assignedTo !==
    undefined
  ) {
    if (
      updateData.assignedTo ===
        null ||
      updateData.assignedTo === ""
    ) {
      updateData.assignedTo =
        null;
    } else {
      const assignedUserId =
        normalizeObjectId(
          updateData.assignedTo,
          "assigned user ID"
        );

      const user =
        await User.findById(
          assignedUserId
        );

      if (!user) {
        const error = new Error(
          "Assigned user not found."
        );

        error.statusCode = 404;

        throw error;
      }

      updateData.assignedTo =
        assignedUserId;
    }
  }

  // ---------------------------------
  // Update
  // ---------------------------------

  Object.assign(
    lead,
    updateData
  );

  await lead.save();

  return lead;
};

// =====================================
// CHANGE LEAD STATUS
// =====================================

const changeLeadStatus = async ({
  organizationId,
  leadId,
  status,
}) => {
  const organizationObjectId =
    normalizeObjectId(
      organizationId,
      "organization ID"
    );

  const leadObjectId =
    normalizeObjectId(
      leadId,
      "lead ID"
    );

  // ---------------------------------
  // Find Lead
  // ---------------------------------

  const lead =
    await Lead.findOne({
      _id: leadObjectId,

      organization:
        organizationObjectId,

      isActive: true,
    });

  if (!lead) {
    const error = new Error(
      "Lead not found."
    );

    error.statusCode = 404;

    throw error;
  }

  // ---------------------------------
  // Update Status
  // ---------------------------------

  lead.status = status;

  await lead.save();

  return lead;
};

// =====================================
// DELETE / ARCHIVE LEAD
// =====================================

const deleteLead = async ({
  organizationId,
  leadId,
}) => {
  const organizationObjectId =
    normalizeObjectId(
      organizationId,
      "organization ID"
    );

  const leadObjectId =
    normalizeObjectId(
      leadId,
      "lead ID"
    );

  // ---------------------------------
  // Find Lead
  // ---------------------------------

  const lead =
    await Lead.findOne({
      _id: leadObjectId,

      organization:
        organizationObjectId,

      isActive: true,
    });

  if (!lead) {
    const error = new Error(
      "Lead not found."
    );

    error.statusCode = 404;

    throw error;
  }

  // ---------------------------------
  // Soft Delete
  // ---------------------------------

  lead.isActive = false;

  await lead.save();

  return lead;
};

// =====================================
// LEAD STATISTICS
// =====================================

const getLeadStats = async (
  organizationId
) => {
  const organizationObjectId =
    normalizeObjectId(
      organizationId,
      "organization ID"
    );

  // ---------------------------------
  // Aggregate
  // ---------------------------------

  const stats =
    await Lead.aggregate([
      {
        $match: {
          organization:
            organizationObjectId,

          isActive: true,
        },
      },

      {
        $group: {
          _id: "$status",

          count: {
            $sum: 1,
          },

          totalEstimatedValue: {
            $sum:
              "$estimatedValue",
          },
        },
      },

      {
        $sort: {
          count: -1,
        },
      },
    ]);

  return stats;
};

// =====================================
// EXPORT
// =====================================

module.exports = {
  createLead,
  getOrganizationLeads,
  getLeadById,
  updateLead,
  changeLeadStatus,
  deleteLead,
  getLeadStats,
};