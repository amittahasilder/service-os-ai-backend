
// =====================================
// ORGANIZATION CONTROLLER
// ServiceOS
// =====================================

const {
  createOrganization,
  getUserOrganizations,
  updateOrganization,
  deactivateOrganization,
} = require("../services/organizationService");


// =====================================
// CREATE BUSINESS
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

    if (!businessType || !businessType.trim()) {
      const error = new Error(
        "Business type is required"
      );

      error.statusCode = 400;

      throw error;
    }

    // -------------------------------------
    // Create organization
    // -------------------------------------

    const organization = await createOrganization({
      userId: req.user._id,
      name: name.trim(),
      businessType: businessType.trim(),
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
      message: "Business created successfully",

      data: {
        organization,
      },
    });
  } catch (error) {
    next(error);
  }
};


// =====================================
// GET MY BUSINESSES
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

    // -------------------------------------
    // Response
    // -------------------------------------

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
    // -------------------------------------
    // Tenant middleware already verified:
    //
    // 1. User authenticated
    // 2. Organization exists
    // 3. User belongs to organization
    // 4. Membership is active
    // 5. Organization is active
    // -------------------------------------

    res.status(200).json({
      success: true,

      message:
        "Business retrieved successfully",

      data: {
        membership: {
          id: req.membership._id,

          role: req.organizationRole,

          status: req.membership.status,

          joinedAt:
            req.membership.joinedAt,
        },

        organization:
          req.organization,
      },
    });
  } catch (error) {
    next(error);
  }
};


// =====================================
// UPDATE BUSINESS
// =====================================

const updateBusiness = async (
  req,
  res,
  next
) => {
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

    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        !name.trim()
      ) {
        const error = new Error(
          "Business name cannot be empty"
        );

        error.statusCode = 400;

        throw error;
      }
    }

    if (businessType !== undefined) {
      if (
        typeof businessType !== "string" ||
        !businessType.trim()
      ) {
        const error = new Error(
          "Business type cannot be empty"
        );

        error.statusCode = 400;

        throw error;
      }
    }

    // -------------------------------------
    // Prepare update data
    // -------------------------------------

    const updateData = {};

    if (name !== undefined) {
      updateData.name = name.trim();
    }

    if (businessType !== undefined) {
      updateData.businessType =
        businessType.trim();
    }

    if (email !== undefined) {
      updateData.email = email;
    }

    if (phone !== undefined) {
      updateData.phone = phone;
    }

    if (website !== undefined) {
      updateData.website = website;
    }

    if (address !== undefined) {
      updateData.address = address;
    }

    if (logo !== undefined) {
      updateData.logo = logo;
    }

    // -------------------------------------
    // Update organization
    // -------------------------------------

    const organization =
      await updateOrganization({
        organizationId:
          req.organizationId,

        updateData,
      });

    // -------------------------------------
    // Response
    // -------------------------------------

    res.status(200).json({
      success: true,

      message:
        "Business updated successfully",

      data: {
        organization,
      },
    });
  } catch (error) {
    next(error);
  }
};


// =====================================
// DEACTIVATE BUSINESS
// =====================================

const deactivateBusiness = async (
  req,
  res,
  next
) => {
  try {
    // -------------------------------------
    // Deactivate organization
    // -------------------------------------

    const organization =
      await deactivateOrganization(
        req.organizationId
      );

    // -------------------------------------
    // Response
    // -------------------------------------

    res.status(200).json({
      success: true,

      message:
        "Business deactivated successfully",

      data: {
        organization,
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
  updateBusiness,
  deactivateBusiness,
};