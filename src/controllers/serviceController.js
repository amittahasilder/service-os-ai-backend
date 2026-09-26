const {
  createService,
  getOrganizationServices,
  getServiceById,
  updateService,
  deleteService,
  getServiceStats,
} = require("../services/serviceService");

// =====================================
// CREATE SERVICE
// =====================================

const createServiceController = async (req, res, next) => {
  try {
    const service = await createService({
      organizationId: req.organizationId,
      userId: req.user._id,
      data: req.validatedData,
    });

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      service,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// GET ALL SERVICES
// =====================================

const getServices = async (req, res, next) => {
  try {
    const services = await getOrganizationServices({
      organizationId: req.organizationId,
      status: req.query.status,
      category: req.query.category,
      search: req.query.search,
    });

    res.status(200).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// GET SINGLE SERVICE
// =====================================

const getService = async (req, res, next) => {
  try {
    const service = await getServiceById({
      organizationId: req.organizationId,
      serviceId: req.params.serviceId,
    });

    res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// UPDATE SERVICE
// =====================================

const updateServiceController = async (req, res, next) => {
  try {
    const service = await updateService({
      organizationId: req.organizationId,
      serviceId: req.params.serviceId,
      data: req.validatedData,
    });

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      service,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// DELETE / ARCHIVE SERVICE
// =====================================

const removeService = async (req, res, next) => {
  try {
    await deleteService({
      organizationId: req.organizationId,
      serviceId: req.params.serviceId,
    });

    res.status(200).json({
      success: true,
      message: "Service archived successfully",
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// SERVICE STATS
// =====================================

const serviceStats = async (req, res, next) => {
  try {
    const stats = await getServiceStats({
      organizationId: req.organizationId,
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
  createServiceController,
  getServices,
  getService,
  updateServiceController,
  removeService,
  serviceStats,
};