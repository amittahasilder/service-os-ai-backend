
const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  sendTestEmail,
} = require("../controllers/emailController");

const router = express.Router();

// All email routes require authentication
router.use(protect);

// Send test email to logged-in user's email
router.post("/test", sendTestEmail);

module.exports = router;