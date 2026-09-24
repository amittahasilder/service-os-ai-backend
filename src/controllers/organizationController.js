
const {
  createOrganization,
  getUserOrganizations,
  getUserOrganization,
} = require("../services/organizationService");

// =====================================
// CREATE ORGANIZATION
// =====================================

const createBusiness = async (req, res, next) => {
  try {
    const {
      name,
      businessType,
      email,
      phone,
      website,
      address,
      logo,
    } = req.body;

    // -------------------------------------
    // Basic validation
    // -------------------------------------

    if (!name || !name.trim()) {
      const error = new Error(
        "Business name is required"
      );

      error.statusCode = 400;

      throw error;
    }

    if (!businessType) {
      const error = new Error(
        "Business type is required"
      );

      error.statusCode = 400;

      throw error;
    }

    // -------------------------------------
    // Create organization
    // -------------------------------------

    const organization =
      await createOrganization({
        userId: req.user._id,
        name,
        businessType,
        email,
        phone,
        website,
        address,
        logo,
      });

    // -------------------------------------
    // Response
    // -------------------------------------

    res.status(201).json({
      success: true,
      message:
        "Business created successfully",
      data: {
        organization,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// GET MY ORGANIZATIONS
// =====================================

const getMyBusinesses = async (
  req,
  res,
  next
) => {
  try {
    const memberships =
      await getUserOrganizations(
        req.user._id
      );

    const businesses = memberships.map(
      (membership) => ({
        membershipId: membership._id,

        role: membership.role,

        status: membership.status,

        joinedAt: membership.joinedAt,

        organization:
          membership.organization,
      })
    );

    res.status(200).json({
      success: true,
      message:
        "Businesses retrieved successfully",

      data: {
        businesses,
        count: businesses.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// GET SINGLE BUSINESS
// =====================================

const getBusiness = async (
  req,
  res,
  next
) => {
  try {
    const { organizationId } =
      req.params;

    const membership =
      await getUserOrganization({
        userId: req.user._id,
        organizationId,
      });

    res.status(200).json({
      success: true,
      message:
        "Business retrieved successfully",

      data: {
        membership: {
          id: membership._id,
          role: membership.role,
          status: membership.status,
          joinedAt: membership.joinedAt,
        },

        organization:
          membership.organization,
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
  createBusiness,
  getMyBusinesses,
  getBusiness,
};

