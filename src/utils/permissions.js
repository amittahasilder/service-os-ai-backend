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
  // AI COPILOT
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
// ROLE PERMISSIONS
// =====================================

const ROLE_PERMISSIONS = {
  // =====================================
  // OWNER
  // =====================================

  owner: Object.values(PERMISSIONS),

  // =====================================
  // ADMIN
  // =====================================

  admin: [
    // Organization
    PERMISSIONS.ORGANIZATION_VIEW,
    PERMISSIONS.ORGANIZATION_UPDATE,
    PERMISSIONS.ORGANIZATION_MANAGE_MEMBERS,

    // Leads
    PERMISSIONS.LEAD_CREATE,
    PERMISSIONS.LEAD_VIEW,
    PERMISSIONS.LEAD_UPDATE,
    PERMISSIONS.LEAD_DELETE,

    // Customers
    PERMISSIONS.CUSTOMER_CREATE,
    PERMISSIONS.CUSTOMER_VIEW,
    PERMISSIONS.CUSTOMER_UPDATE,
    PERMISSIONS.CUSTOMER_DELETE,

    // Services
    PERMISSIONS.SERVICE_CREATE,
    PERMISSIONS.SERVICE_VIEW,
    PERMISSIONS.SERVICE_UPDATE,
    PERMISSIONS.SERVICE_DELETE,

    // Staff
    PERMISSIONS.STAFF_CREATE,
    PERMISSIONS.STAFF_VIEW,
    PERMISSIONS.STAFF_UPDATE,
    PERMISSIONS.STAFF_DELETE,

    // Bookings
    PERMISSIONS.BOOKING_CREATE,
    PERMISSIONS.BOOKING_VIEW,
    PERMISSIONS.BOOKING_UPDATE,
    PERMISSIONS.BOOKING_DELETE,

    // Jobs
    PERMISSIONS.JOB_CREATE,
    PERMISSIONS.JOB_VIEW,
    PERMISSIONS.JOB_UPDATE,
    PERMISSIONS.JOB_DELETE,

    // Quotes
    PERMISSIONS.QUOTE_CREATE,
    PERMISSIONS.QUOTE_VIEW,
    PERMISSIONS.QUOTE_UPDATE,
    PERMISSIONS.QUOTE_DELETE,

    // Invoices
    PERMISSIONS.INVOICE_CREATE,
    PERMISSIONS.INVOICE_VIEW,
    PERMISSIONS.INVOICE_UPDATE,
    PERMISSIONS.INVOICE_DELETE,

    // Payments
    PERMISSIONS.PAYMENT_CREATE,
    PERMISSIONS.PAYMENT_VIEW,
    PERMISSIONS.PAYMENT_UPDATE,
    PERMISSIONS.PAYMENT_REFUND,

    // Expenses
    PERMISSIONS.EXPENSE_CREATE,
    PERMISSIONS.EXPENSE_VIEW,
    PERMISSIONS.EXPENSE_UPDATE,
    PERMISSIONS.EXPENSE_DELETE,

    // Inventory
    PERMISSIONS.INVENTORY_CREATE,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_UPDATE,
    PERMISSIONS.INVENTORY_DELETE,

    // Notifications
    PERMISSIONS.NOTIFICATION_CREATE,
    PERMISSIONS.NOTIFICATION_VIEW,
    PERMISSIONS.NOTIFICATION_UPDATE,
    PERMISSIONS.NOTIFICATION_DELETE,

    // Communication
    PERMISSIONS.COMMUNICATION_SEND,
    PERMISSIONS.COMMUNICATION_VIEW,

    // Reviews
    PERMISSIONS.REVIEW_CREATE,
    PERMISSIONS.REVIEW_VIEW,
    PERMISSIONS.REVIEW_UPDATE,
    PERMISSIONS.REVIEW_DELETE,

    // Customer Portal
    PERMISSIONS.CUSTOMER_PORTAL_VIEW,
    PERMISSIONS.CUSTOMER_PORTAL_MANAGE,

    // Dashboard
    PERMISSIONS.DASHBOARD_VIEW,

    // Analytics
    PERMISSIONS.ANALYTICS_VIEW,

    // AI
    PERMISSIONS.AI_ASSISTANT_USE,
    PERMISSIONS.AI_ASSISTANT_VIEW,

    PERMISSIONS.AI_AUTOMATION_CREATE,
    PERMISSIONS.AI_AUTOMATION_VIEW,
    PERMISSIONS.AI_AUTOMATION_UPDATE,
    PERMISSIONS.AI_AUTOMATION_DELETE,

    // Subscription
    PERMISSIONS.SUBSCRIPTION_VIEW,
    PERMISSIONS.SUBSCRIPTION_MANAGE,

    // Audit
    PERMISSIONS.AUDIT_LOG_VIEW,

    // Security
    PERMISSIONS.SECURITY_VIEW,
    PERMISSIONS.SECURITY_MANAGE,
  ],

  // =====================================
  // MANAGER
  // =====================================

  manager: [
    PERMISSIONS.ORGANIZATION_VIEW,

    // Leads
    PERMISSIONS.LEAD_CREATE,
    PERMISSIONS.LEAD_VIEW,
    PERMISSIONS.LEAD_UPDATE,

    // Customers
    PERMISSIONS.CUSTOMER_CREATE,
    PERMISSIONS.CUSTOMER_VIEW,
    PERMISSIONS.CUSTOMER_UPDATE,

    // Services
    PERMISSIONS.SERVICE_CREATE,
    PERMISSIONS.SERVICE_VIEW,
    PERMISSIONS.SERVICE_UPDATE,

    // Staff
    PERMISSIONS.STAFF_VIEW,
    PERMISSIONS.STAFF_UPDATE,

    // Bookings
    PERMISSIONS.BOOKING_CREATE,
    PERMISSIONS.BOOKING_VIEW,
    PERMISSIONS.BOOKING_UPDATE,

    // Jobs
    PERMISSIONS.JOB_CREATE,
    PERMISSIONS.JOB_VIEW,
    PERMISSIONS.JOB_UPDATE,

    // Quotes
    PERMISSIONS.QUOTE_CREATE,
    PERMISSIONS.QUOTE_VIEW,
    PERMISSIONS.QUOTE_UPDATE,

    // Invoices
    PERMISSIONS.INVOICE_CREATE,
    PERMISSIONS.INVOICE_VIEW,
    PERMISSIONS.INVOICE_UPDATE,

    // Payments
    PERMISSIONS.PAYMENT_VIEW,

    // Expenses
    PERMISSIONS.EXPENSE_CREATE,
    PERMISSIONS.EXPENSE_VIEW,
    PERMISSIONS.EXPENSE_UPDATE,

    // Inventory
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INVENTORY_UPDATE,

    // Notifications
    PERMISSIONS.NOTIFICATION_CREATE,
    PERMISSIONS.NOTIFICATION_VIEW,

    // Communication
    PERMISSIONS.COMMUNICATION_SEND,
    PERMISSIONS.COMMUNICATION_VIEW,

    // Reviews
    PERMISSIONS.REVIEW_VIEW,
    PERMISSIONS.REVIEW_UPDATE,

    // Dashboard
    PERMISSIONS.DASHBOARD_VIEW,

    // Analytics
    PERMISSIONS.ANALYTICS_VIEW,

    // AI
    PERMISSIONS.AI_ASSISTANT_USE,
    PERMISSIONS.AI_ASSISTANT_VIEW,

    // Customer Portal
    PERMISSIONS.CUSTOMER_PORTAL_VIEW,
  ],

  // =====================================
  // STAFF
  // =====================================

  staff: [
    PERMISSIONS.ORGANIZATION_VIEW,

    PERMISSIONS.LEAD_VIEW,

    PERMISSIONS.CUSTOMER_VIEW,

    PERMISSIONS.SERVICE_VIEW,

    PERMISSIONS.STAFF_VIEW,

    // Bookings
    PERMISSIONS.BOOKING_VIEW,
    PERMISSIONS.BOOKING_UPDATE,

    // Jobs
    PERMISSIONS.JOB_VIEW,
    PERMISSIONS.JOB_UPDATE,

    // Quotes
    PERMISSIONS.QUOTE_VIEW,

    // Invoices
    PERMISSIONS.INVOICE_VIEW,

    // Payments
    PERMISSIONS.PAYMENT_VIEW,

    // Inventory
    PERMISSIONS.INVENTORY_VIEW,

    // Reviews
    PERMISSIONS.REVIEW_VIEW,

    // Dashboard
    PERMISSIONS.DASHBOARD_VIEW,

    // AI
    PERMISSIONS.AI_ASSISTANT_USE,
  ],

  // =====================================
  // VIEWER
  // READ-ONLY
  // =====================================

  viewer: [
    PERMISSIONS.ORGANIZATION_VIEW,

    PERMISSIONS.LEAD_VIEW,
    PERMISSIONS.CUSTOMER_VIEW,
    PERMISSIONS.SERVICE_VIEW,
    PERMISSIONS.STAFF_VIEW,
    PERMISSIONS.BOOKING_VIEW,
    PERMISSIONS.JOB_VIEW,
    PERMISSIONS.QUOTE_VIEW,
    PERMISSIONS.INVOICE_VIEW,
    PERMISSIONS.PAYMENT_VIEW,

    PERMISSIONS.EXPENSE_VIEW,
    PERMISSIONS.INVENTORY_VIEW,

    PERMISSIONS.NOTIFICATION_VIEW,
    PERMISSIONS.COMMUNICATION_VIEW,

    PERMISSIONS.REVIEW_VIEW,

    PERMISSIONS.CUSTOMER_PORTAL_VIEW,

    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,

    PERMISSIONS.AI_ASSISTANT_VIEW,

    PERMISSIONS.SUBSCRIPTION_VIEW,

    PERMISSIONS.AUDIT_LOG_VIEW,
  ],
};

// =====================================
// EXPORT
// =====================================

module.exports = {
  PERMISSIONS,
  ROLE_PERMISSIONS,
};