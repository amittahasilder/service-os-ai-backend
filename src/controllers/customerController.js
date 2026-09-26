const {
  createCustomer,
  getOrganizationCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  convertLeadToCustomer,
  getCustomerStats,
} = require("../services/customerService");

// =====================================
// CREATE CUSTOMER
// =====================================

const createCustomerController = async (
  req,
  res,
  next
) => {
  try {
    const customer =
      await createCustomer({
        organizationId:
          req.organizationId,

        userId: req.user._id,

        data: req.body,
      });

    res.status(201).json({
      success: true,
      message:
        "Customer created successfully",
      customer,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// GET ALL CUSTOMERS
// =====================================

const getCustomers = async (
  req,
  res,
  next
) => {
  try {
    const customers =
      await getOrganizationCustomers({
        organizationId:
          req.organizationId,

        filters: {
          status: req.query.status,

          source: req.query.source,

          search: req.query.search,
        },
      });

    res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// GET SINGLE CUSTOMER
// =====================================

const getCustomer = async (
  req,
  res,
  next
) => {
  try {
    const customer =
      await getCustomerById({
        organizationId:
          req.organizationId,

        customerId:
          req.params.customerId,
      });

    res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// UPDATE CUSTOMER
// =====================================

const updateCustomerController =
  async (req, res, next) => {
    try {
      const customer =
        await updateCustomer({
          organizationId:
            req.organizationId,

          customerId:
            req.params.customerId,

          data: req.body,
        });

      res.status(200).json({
        success: true,
        message:
          "Customer updated successfully",
        customer,
      });
    } catch (error) {
      next(error);
    }
  };

// =====================================
// DELETE / ARCHIVE CUSTOMER
// =====================================

const removeCustomer = async (
  req,
  res,
  next
) => {
  try {
    const customer =
      await deleteCustomer({
        organizationId:
          req.organizationId,

        customerId:
          req.params.customerId,
      });

    res.status(200).json({
      success: true,
      message:
        "Customer archived successfully",
      customer,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// CONVERT LEAD → CUSTOMER
// =====================================

const convertLead = async (
  req,
  res,
  next
) => {
  try {
    const customer =
      await convertLeadToCustomer({
        organizationId:
          req.organizationId,

        leadId:
          req.params.leadId,

        userId:
          req.user._id,
      });

    res.status(201).json({
      success: true,
      message:
        "Lead converted to customer successfully",
      customer,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// CUSTOMER STATISTICS
// =====================================

const customerStats = async (
  req,
  res,
  next
) => {
  try {
    const stats =
      await getCustomerStats({
        organizationId:
          req.organizationId,
      });

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// EXPORT
// =====================================

module.exports = {
  createCustomerController,
  getCustomers,
  getCustomer,
  updateCustomerController,
  removeCustomer,
  convertLead,
  customerStats,
};