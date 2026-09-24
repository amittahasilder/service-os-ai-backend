
// =====================================
// ROLE-BASED ACCESS CONTROL (RBAC)
// =====================================

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // =====================================
      // CHECK AUTHENTICATED USER
      // =====================================

      if (!req.user) {
        const error = new Error(
          "Authentication required"
        );

        error.statusCode = 401;

        throw error;
      }

      // =====================================
      // CHECK USER ROLE
      // =====================================

      if (!req.user.role) {
        const error = new Error(
          "User role is not defined"
        );

        error.statusCode = 403;

        throw error;
      }

      // =====================================
      // CHECK ALLOWED ROLES
      // =====================================

      if (!allowedRoles.includes(req.user.role)) {
        const error = new Error(
          "You do not have permission to access this resource"
        );

        error.statusCode = 403;

        throw error;
      }

      // =====================================
      // ACCESS GRANTED
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

