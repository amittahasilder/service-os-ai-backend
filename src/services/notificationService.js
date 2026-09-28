const Notification = require("../models/Notification");

// =====================================
// CREATE NOTIFICATION
// =====================================

const createNotification = async ({
  organizationId,
  recipient,
  type,
  title,
  message,
  link = null,
  entityType = null,
  entityId = null,
  priority = "normal",
  metadata = {},
}) => {
  const notification = await Notification.create({
    organization: organizationId,
    recipient,
    type,
    title,
    message,
    link,
    entityType,
    entityId,
    priority,
    metadata,
  });

  return notification;
};

// =====================================
// GET USER NOTIFICATIONS
// =====================================

const getUserNotifications = async ({
  organizationId,
  recipient,
  page = 1,
  limit = 20,
  unreadOnly = false,
}) => {
  const skip = (page - 1) * limit;

  const filter = {
    organization: organizationId,
    recipient,
  };

  if (unreadOnly) {
    filter.isRead = false;
  }

  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Notification.countDocuments(filter),
  ]);

  return {
    notifications,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// =====================================
// GET UNREAD COUNT
// =====================================

const getUnreadCount = async ({
  organizationId,
  recipient,
}) => {
  return Notification.countDocuments({
    organization: organizationId,
    recipient,
    isRead: false,
  });
};

// =====================================
// MARK AS READ
// =====================================

const markNotificationAsRead = async ({
  notificationId,
  organizationId,
  recipient,
}) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: notificationId,
      organization: organizationId,
      recipient,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    },
    {
      new: true,
    }
  );

  return notification;
};

// =====================================
// MARK ALL AS READ
// =====================================

const markAllNotificationsAsRead = async ({
  organizationId,
  recipient,
}) => {
  const result = await Notification.updateMany(
    {
      organization: organizationId,
      recipient,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    }
  );

  return result;
};

// =====================================
// DELETE NOTIFICATION
// =====================================

const deleteNotification = async ({
  notificationId,
  organizationId,
  recipient,
}) => {
  return Notification.findOneAndDelete({
    _id: notificationId,
    organization: organizationId,
    recipient,
  });
};

module.exports = {
  createNotification,
  getUserNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
};