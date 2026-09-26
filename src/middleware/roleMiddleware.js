
// =====================================
// ROLE-BASED ACCESS CONTROL (RBAC)
// ServiceOS
// =====================================

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // =====================================
      // 1. CHECK AUTHENTICATED USER
      // =====================================

      if (!req.user) {
        const error = new Error("Authentication required");
        error.statusCode = 401;

        throw error;
      }

      // =====================================
      // 2. CHECK ORGANIZATION MEMBERSHIP
      // =====================================

      if (!req.membership) {
        const error = new Error(
          "Organization membership required"
        );

        error.statusCode = 403;

        throw error;
      }

      // =====================================
      // 3. GET ORGANIZATION ROLE
      // =====================================

      const userRole = req.organizationRole;

      if (!userRole) {
        const error = new Error(
          "Organization role is not defined"
        );

        error.statusCode = 403;

        throw error;
      }

      // =====================================
      // 4. CHECK ALLOWED ROLES
      // =====================================

      if (!allowedRoles.includes(userRole)) {
        const error = new Error(
          "You do not have permission to access this resource"
        );

        error.statusCode = 403;

        throw error;
      }

      // =====================================
      // 5. ACCESS GRANTED
      // =====================================

      next();
    } catch (error) {
      next(error);
    }
  };
};

// =====================================
// EXPORT
// =====================================

module.exports = authorize;