
const mongoose = require("mongoose");

const Customer = require("../models/Customer");
const Lead = require("../models/Lead");
const User = require("../models/User");

// =====================================
// CREATE CUSTOMER
// =====================================

const createCustomer = async ({
  organizationId,
  userId,
  data,
}) => {
  const userExists = await User.findById(userId);

  if (!userExists) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const customer = await Customer.create({
    ...data,
    organization: organizationId,
    createdBy: userId,
    isActive: true,
  });

  return customer;
};

// =====================================
// GET ALL CUSTOMERS
// =====================================

const getOrganizationCustomers = async ({
  organizationId,
  filters = {},
}) => {
  const {
    status,
    source,
    search,
  } = filters;

  const query = {
    organization: organizationId,
    isActive: true,
  };

  if (status) {
    query.status = status;
  }

  if (source) {
    query.source = source;
  }

  if (search) {
    const safeSearch = search.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    query.$or = [
      {
        firstName: {
          $regex: safeSearch,
          $options: "i",
        },
      },
      {
        lastName: {
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

  const customers = await Customer.find(query)
    .populate("createdBy", "name email")
    .populate(
      "convertedFromLead",
      "name email status"
    )
    .sort({
      createdAt: -1,
    });

  return customers;
};

// =====================================
// GET SINGLE CUSTOMER
// =====================================

const getCustomerById = async ({
  organizationId,
  customerId,
}) => {
  const customer = await Customer.findOne({
    _id: customerId,
    organization: organizationId,
    isActive: true,
  })
    .populate("createdBy", "name email")
    .populate(
      "convertedFromLead",
      "name email status"
    );

  if (!customer) {
    const error = new Error("Customer not found");
    error.statusCode = 404;
    throw error;
  }

  return customer;
};

// =====================================
// UPDATE CUSTOMER
// =====================================

const updateCustomer = async ({
  organizationId,
  customerId,
  data,
}) => {
  const customer = await Customer.findOneAndUpdate(
    {
      _id: customerId,
      organization: organizationId,
      isActive: true,
    },
    {
      $set: data,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!customer) {
    const error = new Error("Customer not found");
    error.statusCode = 404;
    throw error;
  }

  return customer;
};

// =====================================
// ARCHIVE CUSTOMER
// =====================================

const deleteCustomer = async ({
  organizationId,
  customerId,
}) => {
  const customer = await Customer.findOneAndUpdate(
    {
      _id: customerId,
      organization: organizationId,
      isActive: true,
    },
    {
      $set: {
        isActive: false,
        status: "archived",
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!customer) {
    const error = new Error("Customer not found");
    error.statusCode = 404;
    throw error;
  }

  return customer;
};

// =====================================
// CONVERT LEAD → CUSTOMER
// =====================================

const convertLeadToCustomer = async ({
  organizationId,
  leadId,
  userId,
}) => {
  // Validate IDs
  if (
    !mongoose.isValidObjectId(organizationId) ||
    !mongoose.isValidObjectId(leadId) ||
    !mongoose.isValidObjectId(userId)
  ) {
    const error = new Error("Invalid ID format");
    error.statusCode = 400;
    throw error;
  }

  // Find lead inside the same organization
  const lead = await Lead.findOne({
    _id: leadId,
    organization: organizationId,
    isActive: true,
  });

  if (!lead) {
    const error = new Error("Lead not found");
    error.statusCode = 404;
    throw error;
  }

  // Prevent duplicate conversion
  if (lead.convertedToCustomer) {
    const error = new Error(
      "This lead has already been converted"
    );

    error.statusCode = 400;
    throw error;
  }

  // Split lead name safely
  const nameParts = lead.name.trim().split(/\s+/);

  const firstName = nameParts.shift().slice(0, 50);

  const lastName = nameParts.join(" ").slice(0, 50);

  // Create customer
  const customer = await Customer.create({
    organization: organizationId,

    firstName,
    lastName,

    email: lead.email,
    phone: lead.phone,
    company: lead.company,

    source: "lead",
    notes: lead.notes,

    convertedFromLead: lead._id,
    convertedAt: new Date(),

    createdBy: userId,

    isActive: true,
    status: "active",
  });

  // Atomically link customer to lead
  const updatedLead = await Lead.findOneAndUpdate(
    {
      _id: leadId,
      organization: organizationId,
      isActive: true,
      convertedToCustomer: null,
    },
    {
      $set: {
        convertedToCustomer: customer._id,
        convertedAt: new Date(),
        status: "won",
      },
    },
    {
      new: true,
    }
  );

  // Cleanup if another request converted first
  if (!updatedLead) {
    await Customer.deleteOne({
      _id: customer._id,
      organization: organizationId,
    });

    const error = new Error(
      "Lead has already been converted"
    );

    error.statusCode = 409;
    throw error;
  }

  return customer;
};

// =====================================
// CUSTOMER STATS
// =====================================

const getCustomerStats = async ({
  organizationId,
}) => {
  if (!mongoose.isValidObjectId(organizationId)) {
    const error = new Error(
      "Invalid organization ID"
    );

    error.statusCode = 400;
    throw error;
  }

  const stats = await Customer.aggregate([
    {
      $match: {
        organization: new mongoose.Types.ObjectId(
          organizationId
        ),
        isActive: true,
      },
    },
    {
      $group: {
        _id: "$status",
        count: {
          $sum: 1,
        },
        totalSpent: {
          $sum: "$totalSpent",
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]);

  return stats;
};

// =====================================
// EXPORT
// =====================================

module.exports = {
  createCustomer,
  getOrganizationCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  convertLeadToCustomer,
  getCustomerStats,
};