

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
const validate = require("../middleware/validationMiddleware");

const { PERMISSIONS } = require("../utils/permissions");

// =====================================
// VALIDATION SCHEMAS
// =====================================

const {
  createConversationSchema,
  sendMessageSchema,
} = require("../validations/aiAssistantValidation");

// =====================================
// ORGANIZATION CONTEXT
// =====================================

const setOrganization = (req, res, next) => {
  req.headers["x-organization-id"] =
    req.params.organizationId;

  next();
};

// =====================================
// GET ALL CONVERSATIONS
// GET /:organizationId/ai-assistant/conversations
// =====================================

router.get(
  "/:organizationId/ai-assistant/conversations",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.AI_ASSISTANT_VIEW),
  getConversationsController
);

// =====================================
// CREATE CONVERSATION
// POST /:organizationId/ai-assistant/conversations
// =====================================

router.post(
  "/:organizationId/ai-assistant/conversations",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.AI_ASSISTANT_USE),
  validate(createConversationSchema),
  createConversationController
);

// =====================================
// GET SINGLE CONVERSATION
// GET /:organizationId/ai-assistant/conversations/:conversationId
// =====================================

router.get(
  "/:organizationId/ai-assistant/conversations/:conversationId",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.AI_ASSISTANT_VIEW),
  getConversationController
);

// =====================================
// SEND MESSAGE
// POST /:organizationId/ai-assistant/conversations/:conversationId/messages
// =====================================

router.post(
  "/:organizationId/ai-assistant/conversations/:conversationId/messages",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.AI_ASSISTANT_USE),
  validate(sendMessageSchema),
  sendMessageController
);

// =====================================
// ARCHIVE CONVERSATION
// PATCH /:organizationId/ai-assistant/conversations/:conversationId/archive
// =====================================

router.patch(
  "/:organizationId/ai-assistant/conversations/:conversationId/archive",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.AI_ASSISTANT_USE),
  archiveConversationController
);

// =====================================
// DELETE CONVERSATION
// DELETE /:organizationId/ai-assistant/conversations/:conversationId
// =====================================

router.delete(
  "/:organizationId/ai-assistant/conversations/:conversationId",
  protect,
  setOrganization,
  tenantMiddleware,
  requirePermission(PERMISSIONS.AI_ASSISTANT_USE),
  deleteConversationController
);

// =====================================
// EXPORT
// =====================================

module.exports = router;
