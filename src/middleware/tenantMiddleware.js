const OrganizationMember = require("../models/OrganizationMember");

const tenantMiddleware = async (req, res, next) => {
  try {
    // 1. User must be authenticated
    if (!req.user) {
      const error = new Error("Authentication required");
      error.statusCode = 401;
      throw error;
    }

    // 2. Get organization ID from request header
    const organizationId = req.headers["x-organization-id"];

    if (!organizationId) {
      const error = new Error(
        "Please select a business first (x-organization-id required)"
      );
      error.statusCode = 400;
      throw error;
    }

    // 3. Check if user belongs to selected organization
    const membership = await OrganizationMember.findOne({
      user: req.user._id,
      organization: organizationId,
      status: "active",
    }).populate({
      path: "organization",
      select: "name slug businessType isActive subscriptionPlan",
    });

    if (!membership) {
      const error = new Error(
        "You do not have access to this business"
      );
      error.statusCode = 403;
      throw error;
    }

    // 4. Check if organization is active
    if (!membership.organization || !membership.organization.isActive) {
      const error = new Error("This business is inactive");
      error.statusCode = 403;
      throw error;
    }

    // 5. Attach tenant context to request
    req.organization = membership.organization;
    req.organizationId = membership.organization._id;
    req.membership = membership;
    req.organizationRole = membership.role;

    next();
  } catch (error) {
    if (error.name === "CastError" || error.name === "BSONError") {
      error.statusCode = 400;
      error.message = "Invalid organization ID";
    }

    next(error);
  }
};

module.exports = tenantMiddleware;