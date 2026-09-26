const { z } = require("zod");

// =====================================
// COMMON HELPERS
// =====================================

const objectIdSchema = z
  .string()
  .regex(
    /^[0-9a-fA-F]{24}$/,
    "Invalid ID format"
  );

// =====================================
// ENUMS
// =====================================

const customerStatusSchema = z.enum([
  "active",
  "inactive",
  "archived",
]);

const customerSourceSchema = z.enum([
  "lead",
  "website",
  "facebook",
  "instagram",
  "google",
  "referral",
  "phone",
  "email",
  "whatsapp",
  "walk_in",
  "other",
]);

// =====================================
// ADDRESS
// =====================================

const addressSchema = z
  .object({
    street: z
      .string()
      .trim()
      .max(
        200,
        "Street cannot exceed 200 characters"
      )
      .optional(),

    city: z
      .string()
      .trim()
      .max(
        100,
        "City cannot exceed 100 characters"
      )
      .optional(),

    state: z
      .string()
      .trim()
      .max(
        100,
        "State cannot exceed 100 characters"
      )
      .optional(),

    postalCode: z
      .string()
      .trim()
      .max(
        20,
        "Postal code cannot exceed 20 characters"
      )
      .optional(),

    country: z
      .string()
      .trim()
      .max(
        100,
        "Country cannot exceed 100 characters"
      )
      .optional(),
  })
  .optional();

// =====================================
// EMAIL
// =====================================

const optionalEmail = z.preprocess(
  (value) => {
    if (
      value === "" ||
      value === null
    ) {
      return undefined;
    }

    return value;
  },
  z
    .string()
    .email("Invalid email address")
    .optional()
);

// =====================================
// CREATE CUSTOMER
// =====================================

const createCustomerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(
      2,
      "First name must be at least 2 characters"
    )
    .max(
      50,
      "First name cannot exceed 50 characters"
    ),

  lastName: z
    .string()
    .trim()
    .max(
      50,
      "Last name cannot exceed 50 characters"
    )
    .optional(),

  email: optionalEmail,

  phone: z
    .string()
    .trim()
    .max(
      30,
      "Phone number cannot exceed 30 characters"
    )
    .optional(),

  company: z
    .string()
    .trim()
    .max(
      150,
      "Company name cannot exceed 150 characters"
    )
    .optional(),

  address: addressSchema,

  status:
    customerStatusSchema.optional(),

  source:
    customerSourceSchema.optional(),

  notes: z
    .string()
    .trim()
    .max(
      3000,
      "Notes cannot exceed 3000 characters"
    )
    .optional(),
});

// =====================================
// UPDATE CUSTOMER
// =====================================

const updateCustomerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(
        2,
        "First name must be at least 2 characters"
      )
      .max(
        50,
        "First name cannot exceed 50 characters"
      )
      .optional(),

    lastName: z
      .string()
      .trim()
      .max(
        50,
        "Last name cannot exceed 50 characters"
      )
      .optional(),

    email: optionalEmail,

    phone: z
      .string()
      .trim()
      .max(
        30,
        "Phone number cannot exceed 30 characters"
      )
      .optional(),

    company: z
      .string()
      .trim()
      .max(
        150,
        "Company name cannot exceed 150 characters"
      )
      .optional(),

    address: addressSchema,

    status:
      customerStatusSchema.optional(),

    source:
      customerSourceSchema.optional(),

    notes: z
      .string()
      .trim()
      .max(
        3000,
        "Notes cannot exceed 3000 characters"
      )
      .optional(),
  })
  .refine(
    (data) =>
      Object.keys(data).length > 0,
    {
      message:
        "At least one field is required to update the customer",
    }
  );

// =====================================
// EXPORT
// =====================================

module.exports = {
  createCustomerSchema,
  updateCustomerSchema,
};