// =====================================
// ORGANIZATION MEMBER CONTROLLER
// =====================================

const {
  getOrganizationMembers,
  addOrganizationMember,
  changeMemberRole,
  removeOrganizationMember,
} = require("../services/organizationMemberService");

// =====================================
// GET MEMBERS
// =====================================

const getMembers = async (req, res, next) => {
  try {
    const members =
      await getOrganizationMembers(
        req.organizationId
      );

    res.status(200).json({
      success: true,
      message: "Members retrieved successfully",

      data: {
        members,
        count: members.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// ADD MEMBER
// =====================================

const addMember = async (req, res, next) => {
  try {
    const { email, role } = req.body;

    if (!email) {
      const error = new Error(
        "Email is required"
      );

      error.statusCode = 400;

      throw error;
    }

    const allowedRoles = [
      "admin",
      "manager",
      "staff",
      "viewer",
    ];

    if (!role || !allowedRoles.includes(role)) {
      const error = new Error(
        "Invalid member role"
      );

      error.statusCode = 400;

      throw error;
    }

    const membership =
      await addOrganizationMember({
        organizationId:
          req.organizationId,
        email,
        role,
      });

    res.status(201).json({
      success: true,
      message: "Member added successfully",

      data: {
        membership,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// CHANGE MEMBER ROLE
// =====================================

const updateMemberRole = async (
  req,
  res,
  next
) => {
  try {
    const { memberId } = req.params;
    const { role } = req.body;

    const allowedRoles = [
      "admin",
      "manager",
      "staff",
      "viewer",
    ];

    if (!role || !allowedRoles.includes(role)) {
      const error = new Error(
        "Invalid member role"
      );

      error.statusCode = 400;

      throw error;
    }

    const membership =
      await changeMemberRole({
        organizationId:
          req.organizationId,
        memberId,
        role,
      });

    res.status(200).json({
      success: true,
      message: "Member role updated successfully",

      data: {
        membership,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// REMOVE MEMBER
// =====================================

const removeMember = async (
  req,
  res,
  next
) => {
  try {
    const { memberId } = req.params;

    const membership =
      await removeOrganizationMember({
        organizationId:
          req.organizationId,
        memberId,
      });

    res.status(200).json({
      success: true,
      message: "Member removed successfully",

      data: {
        membership,
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
  getMembers,
  addMember,
  updateMemberRole,
  removeMember,
};