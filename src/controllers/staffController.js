const {
  createStaff,
  getOrganizationStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  getStaffStats,
} = require("../services/staffService");

// =====================================
// CREATE STAFF
// =====================================

const createStaffController = async (req, res, next) => {
  try {
    const staff = await createStaff({
      organizationId: req.organizationId,
      userId: req.user._id,
      data: req.validatedData,
    });

    res.status(201).json({
      success: true,
      message: "Staff created successfully",
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// GET ALL STAFF
// =====================================

const getStaff = async (req, res, next) => {
  try {
    const staff = await getOrganizationStaff({
      organizationId: req.organizationId,
      query: req.query,
    });

    res.status(200).json({
      success: true,
      count: staff.length,
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// GET SINGLE STAFF
// =====================================

const getStaffMember = async (req, res, next) => {
  try {
    const staff = await getStaffById({
      organizationId: req.organizationId,
      staffId: req.params.staffId,
    });

    res.status(200).json({
      success: true,
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// UPDATE STAFF
// =====================================

const updateStaffController = async (req, res, next) => {
  try {
    const staff = await updateStaff({
      organizationId: req.organizationId,
      staffId: req.params.staffId,
      data: req.validatedData,
    });

    res.status(200).json({
      success: true,
      message: "Staff updated successfully",
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// DELETE / ARCHIVE STAFF
// =====================================

const removeStaff = async (req, res, next) => {
  try {
    const staff = await deleteStaff({
      organizationId: req.organizationId,
      staffId: req.params.staffId,
    });

    res.status(200).json({
      success: true,
      message: "Staff archived successfully",
      data: staff,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// STAFF STATS
// =====================================

const staffStats = async (req, res, next) => {
  try {
    const stats = await getStaffStats({
      organizationId: req.organizationId,
    });

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// EXPORT
// =====================================

module.exports = {
  createStaffController,
  getStaff,
  getStaffMember,
  updateStaffController,
  removeStaff,
  staffStats,
};