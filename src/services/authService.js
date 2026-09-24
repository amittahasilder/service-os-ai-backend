
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const {
  createOrganization,
} = require("./organizationService");

// =====================================
// GENERATE JWT TOKEN
// =====================================

const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    const error = new Error(
      "JWT_SECRET is missing in environment variables"
    );

    error.statusCode = 500;

    throw error;
  }

  return jwt.sign(
    {
      userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn:
        process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

// =====================================
// SIGNUP USER
// =====================================

const signupUser = async ({
  name,
  email,
  password,
  businessName,
  businessType,
}) => {
  // ===================================
  // CHECK EXISTING USER
  // ===================================

  const existingUser = await User.findOne({
    email,
  });

  if (existingUser) {
    const error = new Error(
      "Email is already registered"
    );

    error.statusCode = 409;

    throw error;
  }

  // ===================================
  // HASH PASSWORD
  // ===================================

  const hashedPassword =
    await bcrypt.hash(password, 12);

  // ===================================
  // CREATE USER
  // ===================================

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "owner",
  });

  try {
    // =================================
    // CREATE FIRST BUSINESS
    // =================================

    const organization =
      await createOrganization({
        userId: user._id,
        name: businessName,
        businessType,
      });

    // =================================
    // GENERATE JWT
    // =================================

    const token = generateToken(
      user._id.toString()
    );

    // =================================
    // RETURN SIGNUP RESULT
    // =================================

    return {
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },

      organization: {
        id: organization._id,
        name: organization.name,
        slug: organization.slug,
        businessType:
          organization.businessType,
        subscriptionPlan:
          organization.subscriptionPlan,
      },
    };
  } catch (error) {
    // =================================
    // ROLLBACK USER
    // =================================
    //
    // If organization creation fails,
    // remove the newly-created user too.
    //

    await User.findByIdAndDelete(
      user._id
    );

    throw error;
  }
};

// =====================================
// LOGIN USER
// =====================================

const loginUser = async ({
  email,
  password,
}) => {
  // ===================================
  // FIND USER
  // ===================================

  // +password because User model
  // has select: false

  const user = await User.findOne({
    email,
  }).select("+password");

  // ===================================
  // USER NOT FOUND
  // ===================================

  if (!user) {
    const error = new Error(
      "Invalid email or password"
    );

    error.statusCode = 401;

    throw error;
  }

  // ===================================
  // CHECK ACCOUNT STATUS
  // ===================================

  if (!user.isActive) {
    const error = new Error(
      "Your account is inactive"
    );

    error.statusCode = 403;

    throw error;
  }

  // ===================================
  // COMPARE PASSWORD
  // ===================================

  const isPasswordCorrect =
    await bcrypt.compare(
      password,
      user.password
    );

  if (!isPasswordCorrect) {
    const error = new Error(
      "Invalid email or password"
    );

    error.statusCode = 401;

    throw error;
  }

  // ===================================
  // GENERATE JWT
  // ===================================

  const token = generateToken(
    user._id.toString()
  );

  // ===================================
  // RETURN LOGIN RESULT
  // ===================================

  return {
    token,

    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
    },
  };
};

// =====================================
// EXPORT
// =====================================

module.exports = {
  signupUser,
  loginUser,
  generateToken,
};

