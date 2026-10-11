
// =====================================
// SERVICEOS PERMISSIONS
// =====================================

const PERMISSIONS = {
  // =====================================
  // ORGANIZATION
  // =====================================

  ORGANIZATION_VIEW: "organization:view",
  ORGANIZATION_UPDATE: "organization:update",
  ORGANIZATION_DELETE: "organization:delete",
  ORGANIZATION_MANAGE_MEMBERS: "organization:manage_members",

  // =====================================
  // LEADS
  // =====================================

  LEAD_CREATE: "lead:create",
  LEAD_VIEW: "lead:view",
  LEAD_UPDATE: "lead:update",
  LEAD_DELETE: "lead:delete",

  // =====================================
  // CUSTOMERS
  // =====================================

  CUSTOMER_CREATE: "customer:create",
  CUSTOMER_VIEW: "customer:view",
  CUSTOMER_UPDATE: "customer:update",
  CUSTOMER_DELETE: "customer:delete",

  // =====================================
  // SERVICES
  // =====================================

  SERVICE_CREATE: "service:create",
  SERVICE_VIEW: "service:view",
  SERVICE_UPDATE: "service:update",
  SERVICE_DELETE: "service:delete",

  // =====================================
  // STAFF
  // =====================================

  STAFF_CREATE: "staff:create",
  STAFF_VIEW: "staff:view",
  STAFF_UPDATE: "staff:update",
  STAFF_DELETE: "staff:delete",

  // =====================================
  // BOOKINGS
  // =====================================

  BOOKING_CREATE: "booking:create",
  BOOKING_VIEW: "booking:view",
  BOOKING_UPDATE: "booking:update",
  BOOKING_DELETE: "booking:delete",

  // =====================================
  // JOBS
  // =====================================

  JOB_CREATE: "job:create",
  JOB_VIEW: "job:view",
  JOB_UPDATE: "job:update",
  JOB_DELETE: "job:delete",

  // =====================================
  // QUOTES
  // =====================================

  QUOTE_CREATE: "quote:create",
  QUOTE_VIEW: "quote:view",
  QUOTE_UPDATE: "quote:update",
  QUOTE_DELETE: "quote:delete",

  // =====================================
  // INVOICES
  // =====================================

  INVOICE_CREATE: "invoice:create",
  INVOICE_VIEW: "invoice:view",
  INVOICE_UPDATE: "invoice:update",
  INVOICE_DELETE: "invoice:delete",

  // =====================================
  // PAYMENTS
  // =====================================

  PAYMENT_CREATE: "payment:create",
  PAYMENT_VIEW: "payment:view",
  PAYMENT_UPDATE: "payment:update",
  PAYMENT_REFUND: "payment:refund",

  // =====================================
  // EXPENSES
  // =====================================

  EXPENSE_CREATE: "expense:create",
  EXPENSE_VIEW: "expense:view",
  EXPENSE_UPDATE: "expense:update",
  EXPENSE_DELETE: "expense:delete",

  // =====================================
  // INVENTORY
  // =====================================

  INVENTORY_CREATE: "inventory:create",
  INVENTORY_VIEW: "inventory:view",
  INVENTORY_UPDATE: "inventory:update",
  INVENTORY_DELETE: "inventory:delete",

  // =====================================
  // NOTIFICATIONS
  // =====================================

  NOTIFICATION_CREATE: "notification:create",
  NOTIFICATION_VIEW: "notification:view",
  NOTIFICATION_UPDATE: "notification:update",
  NOTIFICATION_DELETE: "notification:delete",

  // =====================================
  // COMMUNICATION
  // =====================================

  COMMUNICATION_SEND: "communication:send",
  COMMUNICATION_VIEW: "communication:view",

  // =====================================
  // REVIEWS
  // =====================================

  REVIEW_CREATE: "review:create",
  REVIEW_VIEW: "review:view",
  REVIEW_UPDATE: "review:update",
  REVIEW_DELETE: "review:delete",

  // =====================================
  // CUSTOMER PORTAL
  // =====================================

  CUSTOMER_PORTAL_VIEW: "customer_portal:view",
  CUSTOMER_PORTAL_MANAGE: "customer_portal:manage",

  // =====================================
  // DASHBOARD
  // =====================================

  DASHBOARD_VIEW: "dashboard:view",

  // =====================================
  // ANALYTICS
  // =====================================

  ANALYTICS_VIEW: "analytics:view",

  // =====================================
  // AI ASSISTANT
  // =====================================

  AI_ASSISTANT_USE: "ai_assistant:use",
  AI_ASSISTANT_VIEW: "ai_assistant:view",

  // =====================================
  // AI AUTOMATION
  // =====================================

  AI_AUTOMATION_CREATE: "ai_automation:create",
  AI_AUTOMATION_VIEW: "ai_automation:view",
  AI_AUTOMATION_UPDATE: "ai_automation:update",
  AI_AUTOMATION_DELETE: "ai_automation:delete",

  // =====================================
  // SUBSCRIPTION / BILLING
  // =====================================

  SUBSCRIPTION_VIEW: "subscription:view",
  SUBSCRIPTION_MANAGE: "subscription:manage",

  // =====================================
  // AUDIT LOGS
  // =====================================

  AUDIT_LOG_VIEW: "audit_log:view",

  // =====================================
  // SECURITY
  // =====================================

  SECURITY_VIEW: "security:view",
  SECURITY_MANAGE: "security:manage",

  // =====================================
  // SUPER ADMIN
  // =====================================

  SUPER_ADMIN_VIEW: "super_admin:view",
  SUPER_ADMIN_MANAGE: "super_admin:manage",
};

// =====================================
// EXPORT
// =====================================
//
// Supports BOTH:
//
// const { PERMISSIONS } = require(...);
//
// and:
//
// const {
//   CUSTOMER_VIEW,
//   CUSTOMER_CREATE,
// } = require(...);
//

module.exports = {
  ...PERMISSIONS,
  PERMISSIONS,
};
