const mongoose = require("mongoose");

const Service = require("../models/Service");
const User = require("../models/User");

// =====================================
// CREATE SERVICE
// =====================================

const createService = async ({
  organizationId,
  userId,
  data,
}) => {
  if (!mongoose.isValidObjectId(organizationId)) {
    throw new Error("Invalid organization ID");
  }

  if (!mongoose.isValidObjectId(userId)) {
    throw new Error("Invalid user ID");
  }

  // Verify user exists
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const service = await Service.create({
    ...data,
    organization: organizationId,
    createdBy: userId,
    isActive: true,
  });

  return service;
};

// =====================================
// GET ALL SERVICES
// =====================================

const getOrganizationServices = async ({
  organizationId,
  status,
  category,
  search,
}) => {
  if (!mongoose.isValidObjectId(organizationId)) {
    throw new Error("Invalid organization ID");
  }

  const filter = {
    organization: organizationId,
    isActive: true,
  };

  // Status filter
  if (status) {
    filter.status = status;
  }

  // Category filter
  if (category) {
    filter.category = category;
  }

  // Search
  if (search) {
    const safeSearch = search.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    filter.$or = [
      {
        name: {
          $regex: safeSearch,
          $options: "i",
        },
      },
      {
        description: {
          $regex: safeSearch,
          $options: "i",
        },
      },
      {
        category: {
          $regex: safeSearch,
          $options: "i",
        },
      },
    ];
  }

  const services = await Service.find(filter)
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });

  return services;
};

// =====================================
// GET SINGLE SERVICE
// =====================================

const getServiceById = async ({
  organizationId,
  serviceId,
}) => {
  if (!mongoose.isValidObjectId(organizationId)) {
    throw new Error("Invalid organization ID");
  }

  if (!mongoose.isValidObjectId(serviceId)) {
    throw new Error("Invalid service ID");
  }

  const service = await Service.findOne({
    _id: serviceId,
    organization: organizationId,
    isActive: true,
  }).populate("createdBy", "name email");

  if (!service) {
    throw new Error("Service not found");
  }

  return service;
};

// =====================================
// UPDATE SERVICE
// =====================================

const updateService = async ({
  organizationId,
  serviceId,
  data,
}) => {
  if (!mongoose.isValidObjectId(organizationId)) {
    throw new Error("Invalid organization ID");
  }

  if (!mongoose.isValidObjectId(serviceId)) {
    throw new Error("Invalid service ID");
  }

  const service = await Service.findOneAndUpdate(
    {
      _id: serviceId,
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
  ).populate("createdBy", "name email");

  if (!service) {
    throw new Error("Service not found");
  }

  return service;
};

// =====================================
// DELETE / ARCHIVE SERVICE
// =====================================

const deleteService = async ({
  organizationId,
  serviceId,
}) => {
  if (!mongoose.isValidObjectId(organizationId)) {
    throw new Error("Invalid organization ID");
  }

  if (!mongoose.isValidObjectId(serviceId)) {
    throw new Error("Invalid service ID");
  }

  const service = await Service.findOneAndUpdate(
    {
      _id: serviceId,
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

  if (!service) {
    throw new Error("Service not found");
  }

  return service;
};

// =====================================
// GET SERVICE STATS
// =====================================

const getServiceStats = async ({
  organizationId,
}) => {
  if (!mongoose.isValidObjectId(organizationId)) {
    throw new Error("Invalid organization ID");
  }

  const organizationObjectId =
    new mongoose.Types.ObjectId(organizationId);

  const stats = await Service.aggregate([
    {
      $match: {
        organization: organizationObjectId,
        isActive: true,
      },
    },

    {
      $group: {
        _id: "$status",
        count: {
          $sum: 1,
        },
        totalRevenuePotential: {
          $sum: "$price",
        },
      },
    },

    {
      $sort: {
        _id: 1,
      },
    },
  ]);

  const totalServices = await Service.countDocuments({
    organization: organizationId,
    isActive: true,
  });

  const activeServices = await Service.countDocuments({
    organization: organizationId,
    isActive: true,
    status: "active",
  });

  return {
    totalServices,
    activeServices,
    byStatus: stats,
  };
};

// =====================================
// EXPORT
// =====================================

module.exports = {
  createService,
  getOrganizationServices,
  getServiceById,
  updateService,
  deleteService,
  getServiceStats,
};