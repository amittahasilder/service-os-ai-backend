
const errorMiddleware = (err, req, res, next) => {
  // Log error details on the server
  console.error("ServiceOS Error:", {
    message: err.message,
    method: req.method,
    url: req.originalUrl,
    stack: process.env.NODE_ENV === "development"
      ? err.stack
      : undefined,
  });

  // If response has already started, delegate to Express
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal server error";
  let errors;

  // Mongoose invalid ObjectId / cast error
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource ID";
  }

  // Mongoose document validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Database validation failed";

    errors = Object.values(err.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];

    message = field
      ? `${field} already exists`
      : "Duplicate record";
  }

  // Zod validation error, if passed to error handler
  if (err.name === "ZodError") {
    statusCode = 400;
    message = "Validation failed";

    errors = err.issues?.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
  }

  // Avoid exposing internal server details in production
  if (statusCode >= 500 && process.env.NODE_ENV === "production") {
    message = "Internal server error";
    errors = undefined;
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...(process.env.NODE_ENV === "development" && statusCode >= 500
      ? { stack: err.stack }
      : {}),
  });
};

module.exports = errorMiddleware;
