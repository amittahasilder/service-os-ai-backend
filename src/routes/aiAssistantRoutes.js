
const express = require("express");

const router = express.Router();

// =====================================
// CONTROLLERS
// =====================================

const {
  createConversationController,
  getConversationsController,
  getConversationController,
  sendMessageController,
  archiveConversationController,
  deleteConversationController,
} = require("../controllers/aiAssistantController");

// =====================================
// MIDDLEWARE
// =====================================

const protect = require("../middleware/authMiddleware");
const tenantMiddleware = require("../middleware/tenantMiddleware");
const requirePermission = require("../middleware/permissionMiddleware");

const { PERMISSIONS } = require("../utils/permissions");

// =====================================
// ORGANIZATION CONTEXT
// =====================================

const setOrganization = (req, res, next) => {
  req.headers["x-organization-id"] = req.params.organizationId;
  next();
};

// =====================================
// COMMON MIDDLEWARE
// =====================================

router.use(protect);
router.use(setOrganization);
router.use(tenantMiddleware);

// =====================================
// GET ALL CONVERSATIONS
// GET /api/organizations/:organizationId/ai-assistant/conversations
// =====================================

router.get(
  "/:organizationId/ai-assistant/conversations",
  requirePermission(PERMISSIONS.AI_ASSISTANT_VIEW),
  getConversationsController
);

// =====================================
// CREATE CONVERSATION
// POST /api/organizations/:organizationId/ai-assistant/conversations
// =====================================

router.post(
  "/:organizationId/ai-assistant/conversations",
  requirePermission(PERMISSIONS.AI_ASSISTANT_USE),
  createConversationController
);

// =====================================
// GET SINGLE CONVERSATION
// GET /api/organizations/:organizationId/ai-assistant/conversations/:conversationId
// =====================================

router.get(
  "/:organizationId/ai-assistant/conversations/:conversationId",
  requirePermission(PERMISSIONS.AI_ASSISTANT_VIEW),
  getConversationController
);

// =====================================
// SEND MESSAGE
// POST /api/organizations/:organizationId/ai-assistant/conversations/:conversationId/messages
// =====================================

router.post(
  "/:organizationId/ai-assistant/conversations/:conversationId/messages",
  requirePermission(PERMISSIONS.AI_ASSISTANT_USE),
  sendMessageController
);

// =====================================
// ARCHIVE CONVERSATION
// PATCH /api/organizations/:organizationId/ai-assistant/conversations/:conversationId/archive
// =====================================

router.patch(
  "/:organizationId/ai-assistant/conversations/:conversationId/archive",
  requirePermission(PERMISSIONS.AI_ASSISTANT_USE),
  archiveConversationController
);

// =====================================
// DELETE CONVERSATION
// DELETE /api/organizations/:organizationId/ai-assistant/conversations/:conversationId
// =====================================

router.delete(
  "/:organizationId/ai-assistant/conversations/:conversationId",
  requirePermission(PERMISSIONS.AI_ASSISTANT_USE),
  deleteConversationController
);

// =====================================
// EXPORT
// =====================================

module.exports = router;
