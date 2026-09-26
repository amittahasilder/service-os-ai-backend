// =====================================
// ORGANIZATION MEMBER SERVICE
// ServiceOS
// =====================================

const OrganizationMember = require("../models/OrganizationMember");
const User = require("../models/User");

// =====================================
// GET ORGANIZATION MEMBERS
// =====================================

const getOrganizationMembers = async (
  organizationId
) => {
  const members =
    await OrganizationMember.find({
      organization: organizationId,
      status: "active",
    })
      .populate({
        path: "user",
        select: "name email avatar",
      })
      .sort({
        createdAt: 1,
      });

  return members;
};

// =====================================
// ADD MEMBER
// =====================================

const addOrganizationMember = async ({
  organizationId,
  email,
  role,
}) => {
  // -------------------------------------
  // Find user by email
  // -------------------------------------

  const user = await User.findOne({
    email: email.toLowerCase().trim(),
  });

  if (!user) {
    const error = new Error(
      "User not found. The user must have an account first."
    );

    error.statusCode = 404;

    throw error;
  }

  // -------------------------------------
  // Check existing membership
  // -------------------------------------

  const existingMember =
    await OrganizationMember.findOne({
      user: user._id,
      organization: organizationId,
    });

  if (existingMember) {
    if (existingMember.status === "active") {
      const error = new Error(
        "User is already a member of this business"
      );

      error.statusCode = 409;

      throw error;
    }

    // Reactivate inactive membership
    existingMember.status = "active";
    existingMember.role = role;

    await existingMember.save();

    return existingMember;
  }

  // -------------------------------------
  // Create membership
  // -------------------------------------

  const membership =
    await OrganizationMember.create({
      user: user._id,
      organization: organizationId,
      role,
      status: "active",
    });

  return membership;
};

// =====================================
// CHANGE MEMBER ROLE
// =====================================

const changeMemberRole = async ({
  organizationId,
  memberId,
  role,
}) => {
  const membership =
    await OrganizationMember.findOne({
      _id: memberId,
      organization: organizationId,
      status: "active",
    });

  if (!membership) {
    const error = new Error(
      "Organization member not found"
    );

    error.statusCode = 404;

    throw error;
  }

  // -------------------------------------
  // Owner role protection
  // -------------------------------------

  if (membership.role === "owner") {
    const error = new Error(
      "Owner role cannot be changed"
    );

    error.statusCode = 400;

    throw error;
  }

  // -------------------------------------
  // Update role
  // -------------------------------------

  membership.role = role;

  await membership.save();

  return membership;
};

// =====================================
// REMOVE MEMBER
// =====================================

const removeOrganizationMember = async ({
  organizationId,
  memberId,
}) => {
  const membership =
    await OrganizationMember.findOne({
      _id: memberId,
      organization: organizationId,
      status: "active",
    });

  if (!membership) {
    const error = new Error(
      "Organization member not found"
    );

    error.statusCode = 404;

    throw error;
  }

  // -------------------------------------
  // Owner protection
  // -------------------------------------

  if (membership.role === "owner") {
    const error = new Error(
      "Business owner cannot be removed"
    );

    error.statusCode = 400;

    throw error;
  }

  // -------------------------------------
  // Soft remove
  // -------------------------------------

  membership.status = "inactive";

  await membership.save();

  return membership;
};

// =====================================
// EXPORT
// =====================================

module.exports = {
  getOrganizationMembers,
  addOrganizationMember,
  changeMemberRole,
  removeOrganizationMember,
};