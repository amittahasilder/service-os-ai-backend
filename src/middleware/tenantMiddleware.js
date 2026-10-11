const mongoose = require("mongoose");

const Organization = require("../models/Organization");
const OrganizationMember = require("../models/OrganizationMember");

// =====================================================
// TENANT MIDDLEWARE
// =====================================================

const tenantMiddleware = async (req, res, next) => {
  try {
    // =================================================
    // 1. GET ORGANIZATION ID
    // =================================================
    //
    // PRIMARY SOURCE:
    // /api/organizations/:organizationId/...
    //
    // Example:
    // /api/organizations/6abe0bd1e0cc24cd4079a78d/leads
    //
    // req.params.organizationId
    // =================================================

    let organizationId = req.params.organizationId;

    // =================================================
    // 2. FALLBACK: HEADER
    // =================================================

    if (!organizationId) {
      organizationId =
        req.headers["x-organization-id"];
    }

    // =================================================
    // 3. FALLBACK: BODY
    // =================================================

    if (!organizationId) {
      organizationId =
        req.body?.organizationId;
    }

    // =================================================
    // 4. FALLBACK: QUERY
    // =================================================

    if (!organizationId) {
      organizationId =
        req.query?.organizationId;
    }

    // =================================================
    // 5. DEBUG - RAW VALUE
    // =================================================

    console.log("");
    console.log("=================================");
    console.log("🔍 ORGANIZATION ID DEBUG");
    console.log("=================================");

    console.log(
      "URL:",
      req.originalUrl
    );

    console.log(
      "METHOD:",
      req.method
    );

    console.log(
      "PARAM organizationId:",
      req.params.organizationId
    );

    console.log(
      "HEADER organizationId:",
      req.headers["x-organization-id"]
    );

    console.log(
      "BODY organizationId:",
      req.body?.organizationId
    );

    console.log(
      "RAW organizationId:",
      organizationId
    );

    console.log(
      "RAW TYPE:",
      typeof organizationId
    );

    // =================================================
    // 6. HANDLE OBJECT
    // =================================================

    if (
      organizationId &&
      typeof organizationId === "object"
    ) {
      organizationId =
        organizationId._id ||
        organizationId.id ||
        null;
    }

    // =================================================
    // 7. DEBUG - AFTER OBJECT NORMALIZATION
    // =================================================

    console.log(
      "AFTER OBJECT NORMALIZATION:",
      organizationId
    );

    console.log(
      "AFTER TYPE:",
      typeof organizationId
    );

    console.log("=================================");

    // =================================================
    // 8. REQUIRED CHECK
    // =================================================

    if (!organizationId) {
      console.log(
        "❌ ORGANIZATION ID MISSING"
      );

      return res.status(400).json({
        success: false,
        message:
          "Organization ID is required.",
      });
    }

    // =================================================
    // 9. CONVERT TO STRING
    // =================================================

    organizationId =
      String(organizationId).trim();

    // =================================================
    // 10. VALIDATE OBJECT ID
    // =================================================

    const isValidObjectId =
      mongoose.Types.ObjectId.isValid(
        organizationId
      );

    console.log(
      "NORMALIZED organizationId:",
      organizationId
    );

    console.log(
      "OBJECT ID VALID:",
      isValidObjectId
    );

    // =================================================
    // 11. INVALID ID
    // =================================================

    if (!isValidObjectId) {
      console.log(
        "❌ INVALID ORGANIZATION ID:",
        organizationId
      );

      return res.status(400).json({
        success: false,
        message:
          "Invalid organization ID.",
      });
    }

    // =================================================
    // 12. AUTH CHECK
    // =================================================

    if (!req.user?._id) {
      console.log(
        "❌ AUTHENTICATION REQUIRED"
      );

      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    // =================================================
    // 13. FIND ORGANIZATION MEMBERSHIP
    // =================================================

    const membership =
      await OrganizationMember.findOne({
        organization: organizationId,
        user: req.user._id,
        status: "active",
      }).lean();

    // =================================================
    // 14. MEMBERSHIP CHECK
    // =================================================

    if (!membership) {
      console.log(
        "❌ ORGANIZATION MEMBERSHIP NOT FOUND"
      );

      console.log(
        "Organization:",
        organizationId
      );

      console.log(
        "User:",
        String(req.user._id)
      );

      return res.status(403).json({
        success: false,
        message:
          "You do not have access to this organization.",
      });
    }

    // =================================================
    // 15. FIND ORGANIZATION
    // =================================================

    const organization =
      await Organization.findById(
        organizationId
      );

    // =================================================
    // 16. ORGANIZATION CHECK
    // =================================================

    if (!organization) {
      console.log(
        "❌ ORGANIZATION NOT FOUND:",
        organizationId
      );

      return res.status(404).json({
        success: false,
        message:
          "Organization not found.",
      });
    }

    // =================================================
    // 17. ATTACH TENANT CONTEXT
    // =================================================

    // Full organization document
    req.organization =
      organization;

    // IMPORTANT:
    // ONLY ObjectId here
    //
    // req.organizationId
    // = organization._id
    //
    // NOT organization object

    req.organizationId =
      organization._id;

    // Membership document
    req.membership =
      membership;

    // Organization role
    req.organizationRole =
      membership.role;

    // =================================================
    // 18. SUCCESS DEBUG
    // =================================================

    console.log("");
    console.log("=================================");
    console.log("✅ TENANT CONTEXT READY");
    console.log("=================================");

    console.log(
      "Organization ID:",
      String(
        req.organizationId
      )
    );

    console.log(
      "Organization Name:",
      organization.name
    );

    console.log(
      "User ID:",
      String(
        req.user._id
      )
    );

    console.log(
      "Role:",
      membership.role
    );

    console.log(
      "Membership ID:",
      String(
        membership._id
      )
    );

    console.log("=================================");
    console.log("");

    // =================================================
    // 19. CONTINUE
    // =================================================

    next();

  } catch (error) {
    // =================================================
    // GLOBAL TENANT ERROR
    // =================================================

    console.error("");
    console.error(
      "================================="
    );

    console.error(
      "❌ TENANT MIDDLEWARE ERROR"
    );

    console.error(
      "================================="
    );

    console.error(
      error
    );

    console.error(
      "================================="
    );

    next(error);
  }
};

module.exports = tenantMiddleware;