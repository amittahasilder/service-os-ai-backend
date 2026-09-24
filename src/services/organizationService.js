

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

const generateUniqueSlug = async (name) => {
  const baseSlug = generateSlug(name);

  let slug = baseSlug;
  let counter = 1;

  while (await Organization.exists({ slug })) {
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

  const slug = await generateUniqueSlug(name);

  // -------------------------------------
  // Create organization
  // -------------------------------------

  const organization = await Organization.create({
    name,
    slug,
    businessType,
    email,
    phone,
    website,
    address,
    logo,
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
    // Rollback organization if membership
    // creation fails
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

const getUserOrganizations = async (userId) => {
  const memberships =
    await OrganizationMember.find({
      user: userId,
      status: "active",
    })
      .populate({
        path: "organization",
        select:
          "name slug businessType email phone website logo isActive subscriptionPlan createdAt",
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

  if (!membership) {
    const error = new Error(
      "You are not a member of this organization"
    );

    error.statusCode = 403;

    throw error;
  }

  return membership;
};

// =====================================
// EXPORT
// =====================================

module.exports = {
  createOrganization,
  getUserOrganizations,
  getUserOrganization,
};

