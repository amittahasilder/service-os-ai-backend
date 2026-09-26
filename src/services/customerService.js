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
  // Check assigned/created user
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

  // Status filter
  if (status) {
    query.status = status;
  }

  // Source filter
  if (source) {
    query.source = source;
  }

  // Search
  if (search) {
    query.$or = [
      {
        firstName: {
          $regex: search,
          $options: "i",
        },
      },
      {
        lastName: {
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

  const customers =
    await Customer.find(query)
      .populate(
        "createdBy",
        "name email"
      )
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
  const customer =
    await Customer.findOne({
      _id: customerId,
      organization: organizationId,
      isActive: true,
    })
      .populate(
        "createdBy",
        "name email"
      )
      .populate(
        "convertedFromLead",
        "name email status"
      );

  if (!customer) {
    const error = new Error(
      "Customer not found"
    );

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
  const customer =
    await Customer.findOneAndUpdate(
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
    const error = new Error(
      "Customer not found"
    );

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
  const customer =
    await Customer.findOneAndUpdate(
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
      }
    );

  if (!customer) {
    const error = new Error(
      "Customer not found"
    );

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
  // Find lead inside same organization
  const lead = await Lead.findOne({
    _id: leadId,
    organization: organizationId,
    isActive: true,
  });

  if (!lead) {
    const error = new Error(
      "Lead not found"
    );

    error.statusCode = 404;

    throw error;
  }

  // Prevent duplicate conversion
  if (lead.convertedToCustomer) {
    const error = new Error(
      "This lead has already been converted to a customer"
    );

    error.statusCode = 400;

    throw error;
  }

  // Create customer from lead
  const customer =
    await Customer.create({
      organization: organizationId,

      firstName: lead.name,

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

  // Update lead
  lead.convertedToCustomer =
    customer._id;

  lead.convertedAt = new Date();

  lead.status = "won";

  await lead.save();

  return customer;
};

// =====================================
// CUSTOMER STATS
// =====================================

const getCustomerStats = async ({
  organizationId,
}) => {
  const stats =
    await Customer.aggregate([
      {
        $match: {
          organization: organizationId,
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