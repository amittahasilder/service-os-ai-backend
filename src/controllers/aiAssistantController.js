
const {
  createConversation,
  getConversations,
  getConversationById,
  sendMessage,
  archiveConversation,
  deleteConversation,
} = require("../services/aiAssistantService");

// =====================================
// CREATE CONVERSATION
// =====================================

const createConversationController = async (req, res, next) => {
  try {
    const conversation = await createConversation({
      organizationId: req.organizationId,
      userId: req.user._id,
      title: req.body.title,
    });

    return res.status(201).json({
      success: true,
      message: "AI conversation created successfully.",
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// GET ALL CONVERSATIONS
// =====================================

const getConversationsController = async (req, res, next) => {
  try {
    const result = await getConversations({
      organizationId: req.organizationId,
      userId: req.user._id,
      page: req.query.page,
      limit: req.query.limit,
    });

    return res.status(200).json({
      success: true,
      message: "AI conversations fetched successfully.",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// GET SINGLE CONVERSATION
// =====================================

const getConversationController = async (req, res, next) => {
  try {
    const conversation = await getConversationById({
      conversationId: req.params.conversationId,
      organizationId: req.organizationId,
      userId: req.user._id,
    });

    return res.status(200).json({
      success: true,
      message: "AI conversation fetched successfully.",
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// SEND AI MESSAGE
// =====================================

const sendMessageController = async (req, res, next) => {
  try {
    const result = await sendMessage({
      conversationId: req.params.conversationId,
      organizationId: req.organizationId,
      userId: req.user._id,
      message: req.body.message,
    });

    return res.status(200).json({
      success: true,
      message: "AI response generated successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// ARCHIVE CONVERSATION
// =====================================

const archiveConversationController = async (req, res, next) => {
  try {
    const conversation = await archiveConversation({
      conversationId: req.params.conversationId,
      organizationId: req.organizationId,
      userId: req.user._id,
    });

    return res.status(200).json({
      success: true,
      message: "AI conversation archived successfully.",
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// DELETE CONVERSATION
// =====================================

const deleteConversationController = async (req, res, next) => {
  try {
    await deleteConversation({
      conversationId: req.params.conversationId,
      organizationId: req.organizationId,
      userId: req.user._id,
    });

    return res.status(200).json({
      success: true,
      message: "AI conversation deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// EXPORTS
// =====================================

module.exports = {
  createConversationController,
  getConversationsController,
  getConversationController,
  sendMessageController,
  archiveConversationController,
  deleteConversationController,
};
