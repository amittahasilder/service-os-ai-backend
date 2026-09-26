

// =====================================
// ORGANIZATION SERVICE
// ServiceOS
// =====================================

const Organization = require("../models/Organization");
const OrganizationMember = require("../models/OrganizationMember");


// =====================================
// SLUG GENERATOR
// =====================================

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};


// =====================================
// UNIQUE SLUG GENERATOR
// =====================================

const generateUniqueSlug = async (
  name,
  excludeOrganizationId = null
) => {
  const baseSlug = generateSlug(name);

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = {
      slug,
    };

    // -------------------------------------
    // When updating an organization,
    // ignore its own existing slug
    // -------------------------------------

    if (excludeOrganizationId) {
      query._id = {
        $ne: excludeOrganizationId,
      };
    }

    const exists =
      await Organization.exists(query);

    if (!exists) {
      break;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};


// =====================================
// CREATE ORGANIZATION
// =====================================

const createOrganization = async ({
  userId,
  name,
  businessType,
  email,
  phone,
  website,
  address,
  logo,
}) => {
  // -------------------------------------
  // Generate unique slug
  // -------------------------------------

  const slug =
    await generateUniqueSlug(name);

  // -------------------------------------
  // Create organization
  // -------------------------------------

  const organization =
    await Organization.create({
      name,
      slug,
      businessType,
      email,
      phone,
      website,
      address,
      logo,
      isActive: true,
    });

  // -------------------------------------
  // Create owner membership
  // -------------------------------------

  try {
    await OrganizationMember.create({
      user: userId,
      organization: organization._id,
      role: "owner",
      status: "active",
    });
  } catch (error) {
    // -----------------------------------
    // Rollback organization
    // -----------------------------------

    await Organization.findByIdAndDelete(
      organization._id
    );

    throw error;
  }

  // -------------------------------------
  // Return organization
  // -------------------------------------

  return organization;
};


// =====================================
// GET USER ORGANIZATIONS
// =====================================

const getUserOrganizations = async (
  userId
) => {
  const memberships =
    await OrganizationMember.find({
      user: userId,
      status: "active",
    })
      .populate({
        path: "organization",

        select:
          "name slug businessType email phone website address logo isActive subscriptionPlan createdAt updatedAt",
      })
      .sort({
        createdAt: -1,
      });

  return memberships;
};


// =====================================
// GET SINGLE USER ORGANIZATION
// =====================================

const getUserOrganization = async ({
  userId,
  organizationId,
}) => {
  const membership =
    await OrganizationMember.findOne({
      user: userId,
      organization: organizationId,
      status: "active",
    }).populate({
      path: "organization",

      select:
        "name slug businessType email phone website address logo isActive subscriptionPlan createdAt updatedAt",
    });

  // -------------------------------------
  // Membership not found
  // -------------------------------------

  if (!membership) {
    const error = new Error(
      "You are not a member of this organization"
    );

    error.statusCode = 403;

    throw error;
  }

  // -------------------------------------
  // Organization not found
  // -------------------------------------

  if (!membership.organization) {
    const error = new Error(
      "Organization not found"
    );

    error.statusCode = 404;

    throw error;
  }

  // -------------------------------------
  // Organization inactive
  // -------------------------------------

  if (!membership.organization.isActive) {
    const error = new Error(
      "This organization is inactive"
    );

    error.statusCode = 403;

    throw error;
  }

  return membership;
};


// =====================================
// UPDATE ORGANIZATION
// =====================================

const updateOrganization = async ({
  organizationId,
  updateData,
}) => {
  // -------------------------------------
  // Find organization
  // -------------------------------------

  const organization =
    await Organization.findById(
      organizationId
    );

  if (!organization) {
    const error = new Error(
      "Organization not found"
    );

    error.statusCode = 404;

    throw error;
  }

  // -------------------------------------
  // Generate new slug if name changes
  // -------------------------------------

  if (
    updateData.name &&
    updateData.name.trim() !==
      organization.name
  ) {
    updateData.slug =
      await generateUniqueSlug(
        updateData.name,
        organizationId
      );
  }

  // -------------------------------------
  // Update organization
  // -------------------------------------

  Object.assign(
    organization,
    updateData
  );

  await organization.save();

  // -------------------------------------
  // Return updated organization
  // -------------------------------------

  return organization;
};


// =====================================
// DEACTIVATE ORGANIZATION
// =====================================

const deactivateOrganization = async (
  organizationId
) => {
  // -------------------------------------
  // Find organization
  // -------------------------------------

  const organization =
    await Organization.findById(
      organizationId
    );

  if (!organization) {
    const error = new Error(
      "Organization not found"
    );

    error.statusCode = 404;

    throw error;
  }

  // -------------------------------------
  // Already inactive
  // -------------------------------------

  if (!organization.isActive) {
    const error = new Error(
      "Organization is already inactive"
    );

    error.statusCode = 400;

    throw error;
  }

  // -------------------------------------
  // Deactivate
  // -------------------------------------

  organization.isActive = false;

  await organization.save();

  // -------------------------------------
  // Return organization
  // -------------------------------------

  return organization;
};


// =====================================
// EXPORT
// =====================================

module.exports = {
  createOrganization,
  getUserOrganizations,
  getUserOrganization,
  updateOrganization,
  deactivateOrganization,
};