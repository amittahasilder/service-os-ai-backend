const notificationService = require("../services/notificationService");
const {
  createNotificationSchema,
} = require("../validations/notificationValidation");

// =====================================
// CREATE NOTIFICATION
// =====================================

const createNotification = async (req, res) => {
  try {
    const validation = createNotificationSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten(),
      });
    }

    const notification =
      await notificationService.createNotification({
        organizationId: req.organization._id,
        ...validation.data,
      });

    return res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: notification,
    });
  } catch (error) {
    console.error("Create notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create notification",
    });
  }
};

// =====================================
// GET MY NOTIFICATIONS
// =====================================

const getMyNotifications = async (req, res) => {
  try {
    const page = Math.max(
      Number.parseInt(req.query.page, 10) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number.parseInt(req.query.limit, 10) || 20,
        1
      ),
      100
    );

    const unreadOnly =
      req.query.unreadOnly === "true";

    const result =
      await notificationService.getUserNotifications({
        organizationId: req.organization._id,
        recipient: req.user._id,
        page,
        limit,
        unreadOnly,
      });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get notifications",
    });
  }
};

// =====================================
// GET UNREAD COUNT
// =====================================

const getUnreadCount = async (req, res) => {
  try {
    const count =
      await notificationService.getUnreadCount({
        organizationId: req.organization._id,
        recipient: req.user._id,
      });

    return res.status(200).json({
      success: true,
      data: {
        unreadCount: count,
      },
    });
  } catch (error) {
    console.error("Unread count error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get unread count",
    });
  }
};

// =====================================
// MARK ONE AS READ
// =====================================

const markAsRead = async (req, res) => {
  try {
    const notification =
      await notificationService.markNotificationAsRead({
        notificationId: req.params.id,
        organizationId: req.organization._id,
        recipient: req.user._id,
      });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    console.error("Mark notification read error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
    });
  }
};

// =====================================
// MARK ALL AS READ
// =====================================

const markAllAsRead = async (req, res) => {
  try {
    const result =
      await notificationService.markAllNotificationsAsRead({
        organizationId: req.organization._id,
        recipient: req.user._id,
      });

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    console.error("Mark all notifications read error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
    });
  }
};

// =====================================
// DELETE NOTIFICATION
// =====================================

const deleteNotification = async (req, res) => {
  try {
    const notification =
      await notificationService.deleteNotification({
        notificationId: req.params.id,
        organizationId: req.organization._id,
        recipient: req.user._id,
      });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete notification",
    });
  }
};

module.exports = {
  createNotification,
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};