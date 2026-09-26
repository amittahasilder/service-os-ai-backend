const PERMISSIONS = {
  // Organization
  ORGANIZATION_VIEW: "organization:view",
  ORGANIZATION_UPDATE: "organization:update",
  ORGANIZATION_DELETE: "organization:delete",

  // Customers
  CUSTOMER_CREATE: "customer:create",
  CUSTOMER_VIEW: "customer:view",
  CUSTOMER_UPDATE: "customer:update",
  CUSTOMER_DELETE: "customer:delete",

  // Services
  SERVICE_CREATE: "service:create",
  SERVICE_VIEW: "service:view",
  SERVICE_UPDATE: "service:update",
  SERVICE_DELETE: "service:delete",

  // Staff
  STAFF_CREATE: "staff:create",
  STAFF_VIEW: "staff:view",
  STAFF_UPDATE: "staff:update",
  STAFF_DELETE: "staff:delete",

  // Bookings
  BOOKING_CREATE: "booking:create",
  BOOKING_VIEW: "booking:view",
  BOOKING_UPDATE: "booking:update",
  BOOKING_DELETE: "booking:delete",

  // Jobs
  JOB_CREATE: "job:create",
  JOB_VIEW: "job:view",
  JOB_UPDATE: "job:update",
  JOB_DELETE: "job:delete",

  // Quotes
  QUOTE_CREATE: "quote:create",
  QUOTE_VIEW: "quote:view",
  QUOTE_UPDATE: "quote:update",
  QUOTE_DELETE: "quote:delete",

  // Invoices
  INVOICE_CREATE: "invoice:create",
  INVOICE_VIEW: "invoice:view",
  INVOICE_UPDATE: "invoice:update",
  INVOICE_DELETE: "invoice:delete",

  // Payments
  PAYMENT_CREATE: "payment:create",
  PAYMENT_VIEW: "payment:view",

  // Analytics
  ANALYTICS_VIEW: "analytics:view",
};

module.exports = PERMISSIONS;