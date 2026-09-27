const Staff = require("../models/Staff");

// =====================================
// CREATE STAFF
// =====================================

const createStaff = async ({
  organizationId,
  userId,
  data,
}) => {
  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  if (!userId) {
    throw new Error("User ID is required");
  }

  const staff = await Staff.create({
    organization: organizationId,
    createdBy: userId,
    ...data,
    isActive: true,
  });

  return staff;
};

// =====================================
// GET ALL STAFF
// =====================================

const getOrganizationStaff = async ({
  organizationId,
  query = {},
}) => {
  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  const {
    search,
    status,
    role,
    availability,
  } = query;

  const filter = {
    organization: organizationId,
    isActive: true,
  };

  // Status filter
  if (status) {
    filter.status = status;
  }

  // Role filter
  if (role) {
    filter.role = role;
  }

  // Availability filter
  if (availability) {
    filter.availability = availability;
  }

  // Search
  if (search) {
    const searchRegex = new RegExp(search, "i");

    filter.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
      { jobTitle: searchRegex },
      { skills: searchRegex },
    ];
  }

  const staff = await Staff.find(filter)
    .populate("createdBy", "name email")
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  return staff;
};

// =====================================
// GET SINGLE STAFF
// =====================================

const getStaffById = async ({
  organizationId,
  staffId,
}) => {
  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  if (!staffId) {
    throw new Error("Staff ID is required");
  }

  const staff = await Staff.findOne({
    _id: staffId,
    organization: organizationId,
    isActive: true,
  })
    .populate("createdBy", "name email")
    .populate("user", "name email");

  if (!staff) {
    throw new Error("Staff not found");
  }

  return staff;
};

// =====================================
// UPDATE STAFF
// =====================================

const updateStaff = async ({
  organizationId,
  staffId,
  data,
}) => {
  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  if (!staffId) {
    throw new Error("Staff ID is required");
  }

  const staff = await Staff.findOneAndUpdate(
    {
      _id: staffId,
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
  )
    .populate("createdBy", "name email")
    .populate("user", "name email");

  if (!staff) {
    throw new Error("Staff not found");
  }

  return staff;
};

// =====================================
// DELETE / ARCHIVE STAFF
// =====================================

const deleteStaff = async ({
  organizationId,
  staffId,
}) => {
  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  if (!staffId) {
    throw new Error("Staff ID is required");
  }

  const staff = await Staff.findOneAndUpdate(
    {
      _id: staffId,
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

  if (!staff) {
    throw new Error("Staff not found");
  }

  return staff;
};

// =====================================
// STAFF STATS
// =====================================

const getStaffStats = async ({
  organizationId,
}) => {
  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  const [
    totalStaff,
    activeStaff,
    inactiveStaff,
    availableStaff,
    busyStaff,
  ] = await Promise.all([
    Staff.countDocuments({
      organization: organizationId,
      isActive: true,
    }),

    Staff.countDocuments({
      organization: organizationId,
      isActive: true,
      status: "active",
    }),

    Staff.countDocuments({
      organization: organizationId,
      isActive: true,
      status: "inactive",
    }),

    Staff.countDocuments({
      organization: organizationId,
      isActive: true,
      availability: "available",
    }),

    Staff.countDocuments({
      organization: organizationId,
      isActive: true,
      availability: "busy",
    }),
  ]);

  return {
    totalStaff,
    activeStaff,
    inactiveStaff,
    availableStaff,
    busyStaff,
  };
};

// =====================================
// EXPORT
// =====================================

module.exports = {
  createStaff,
  getOrganizationStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  getStaffStats,
};