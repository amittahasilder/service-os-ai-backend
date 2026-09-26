const Lead = require("../models/Lead");
const User = require("../models/User");


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
  // -------------------------------------
  // Validate assigned user
  // -------------------------------------

  if (assignedTo) {
    const user = await User.findById(assignedTo);

    if (!user) {
      const error = new Error(
        "Assigned user not found"
      );

      error.statusCode = 404;

      throw error;
    }
  }

  // -------------------------------------
  // Create Lead
  // -------------------------------------

  const lead = await Lead.create({
    organization: organizationId,

    name,
    email,
    phone,
    company,

    source: source || "other",

    priority: priority || "medium",

    estimatedValue:
      estimatedValue || 0,

    notes,

    assignedTo:
      assignedTo || null,

    nextFollowUpAt:
      nextFollowUpAt || null,

    createdBy: userId,

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
  // -------------------------------------
  // Base Query
  // -------------------------------------

  const query = {
    organization: organizationId,
    isActive: true,
  };


  // -------------------------------------
  // Status Filter
  // -------------------------------------

  if (status) {
    query.status = status;
  }


  // -------------------------------------
  // Source Filter
  // -------------------------------------

  if (source) {
    query.source = source;
  }


  // -------------------------------------
  // Priority Filter
  // -------------------------------------

  if (priority) {
    query.priority = priority;
  }


  // -------------------------------------
  // Assigned User Filter
  // -------------------------------------

  if (assignedTo) {
    query.assignedTo = assignedTo;
  }


  // -------------------------------------
  // Search
  // -------------------------------------

  if (search) {
    query.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        email: {
          $regex: search,
          $options: "i",
        },
      },
      {
        phone: {
          $regex: search,
          $options: "i",
        },
      },
      {
        company: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }


  // -------------------------------------
  // Fetch Leads
  // -------------------------------------

  const leads = await Lead.find(query)
    .populate({
      path: "assignedTo",
      select: "name email avatar",
    })
    .populate({
      path: "createdBy",
      select: "name email",
    })
    .populate({
      path: "convertedToCustomer",
      select: "name email phone",
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
  const lead = await Lead.findOne({
    _id: leadId,

    organization:
      organizationId,

    isActive: true,
  })
    .populate({
      path: "assignedTo",
      select: "name email avatar",
    })
    .populate({
      path: "createdBy",
      select: "name email",
    })
    .populate({
      path: "convertedToCustomer",
      select: "name email phone",
    });


  if (!lead) {
    const error = new Error(
      "Lead not found"
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
  const lead = await Lead.findOne({
    _id: leadId,

    organization:
      organizationId,

    isActive: true,
  });


  if (!lead) {
    const error = new Error(
      "Lead not found"
    );

    error.statusCode = 404;

    throw error;
  }


  // -------------------------------------
  // Validate assigned user
  // -------------------------------------

  if (
    updateData.assignedTo
  ) {
    const user = await User.findById(
      updateData.assignedTo
    );

    if (!user) {
      const error = new Error(
        "Assigned user not found"
      );

      error.statusCode = 404;

      throw error;
    }
  }


  // -------------------------------------
  // Update
  // -------------------------------------

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
  const lead = await Lead.findOne({
    _id: leadId,

    organization:
      organizationId,

    isActive: true,
  });


  if (!lead) {
    const error = new Error(
      "Lead not found"
    );

    error.statusCode = 404;

    throw error;
  }


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
  const lead = await Lead.findOne({
    _id: leadId,

    organization:
      organizationId,

    isActive: true,
  });


  if (!lead) {
    const error = new Error(
      "Lead not found"
    );

    error.statusCode = 404;

    throw error;
  }


  // -------------------------------------
  // Soft Delete
  // -------------------------------------

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
  const stats =
    await Lead.aggregate([
      {
        $match: {
          organization:
            organizationId,

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
            $sum: "$estimatedValue",
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