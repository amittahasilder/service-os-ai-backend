const express = require("express");

const { signup } = require("../controllers/authController");

const router = express.Router();

// POST /api/auth/signup
router.post("/signup", signup);

module.exports = router;