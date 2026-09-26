const ROLE_PERMISSIONS = require("../utils/rolePermissions");

const requirePermission = (permission) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        const error = new Error("Authentication required");
        error.statusCode = 401;
        throw error;
      }

      if (!req.membership) {
        const error = new Error("Organization membership required");
        error.statusCode = 403;
        throw error;
      }

      const role = req.organizationRole;

      const permissions = ROLE_PERMISSIONS[role] || [];

      if (!permissions.includes(permission)) {
        const error = new Error(
          "You do not have permission to perform this action"
        );

        error.statusCode = 403;
        throw error;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = requirePermission;