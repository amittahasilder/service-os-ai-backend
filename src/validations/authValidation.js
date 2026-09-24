const { z } = require("zod");

// =====================================
// SIGNUP VALIDATION
// =====================================

const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters"),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password cannot exceed 100 characters"),
});

// =====================================
// LOGIN VALIDATION
// =====================================

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email"),

  password: z
    .string()
    .min(1, "Password is required"),
});

// =====================================
// EXPORT
// =====================================

module.exports = {
  signupSchema,
  loginSchema,
};