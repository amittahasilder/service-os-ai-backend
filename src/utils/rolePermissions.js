const PERMISSIONS = require("./permissions");


// =====================================
// ROLE → PERMISSION MAPPING
// ServiceOS
// =====================================

const ROLE_PERMISSIONS = {

  // ===================================
  // OWNER
  // ===================================
  // Owner gets every permission
  // defined inside permissions.js

  owner: Object.values(PERMISSIONS),


  // ===================================
  // ADMIN
  // ===================================

  admin: [

    // ---------------------------------
    // ORGANIZATION
    // ---------------------------------

    PERMISSIONS.ORGANIZATION_VIEW,
    PERMISSIONS.ORGANIZATION_UPDATE,


    // ---------------------------------
    // LEADS
    // ---------------------------------

    PERMISSIONS.LEAD_CREATE,
    PERMISSIONS.LEAD_VIEW,
    PERMISSIONS.LEAD_UPDATE,
    PERMISSIONS.LEAD_DELETE,


    // ---------------------------------
    // CUSTOMERS
    // ---------------------------------

    PERMISSIONS.CUSTOMER_CREATE,
    PERMISSIONS.CUSTOMER_VIEW,
    PERMISSIONS.CUSTOMER_UPDATE,
    PERMISSIONS.CUSTOMER_DELETE,


    // ---------------------------------
    // SERVICES
    // ---------------------------------

    PERMISSIONS.SERVICE_CREATE,
    PERMISSIONS.SERVICE_VIEW,
    PERMISSIONS.SERVICE_UPDATE,
    PERMISSIONS.SERVICE_DELETE,


    // ---------------------------------
    // STAFF
    // ---------------------------------

    PERMISSIONS.STAFF_CREATE,
    PERMISSIONS.STAFF_VIEW,
    PERMISSIONS.STAFF_UPDATE,
    PERMISSIONS.STAFF_DELETE,


    // ---------------------------------
    // BOOKINGS
    // ---------------------------------

    PERMISSIONS.BOOKING_CREATE,
    PERMISSIONS.BOOKING_VIEW,
    PERMISSIONS.BOOKING_UPDATE,
    PERMISSIONS.BOOKING_DELETE,


    // ---------------------------------
    // JOBS
    // ---------------------------------

    PERMISSIONS.JOB_CREATE,
    PERMISSIONS.JOB_VIEW,
    PERMISSIONS.JOB_UPDATE,
    PERMISSIONS.JOB_DELETE,


    // ---------------------------------
    // QUOTES
    // ---------------------------------

    PERMISSIONS.QUOTE_CREATE,
    PERMISSIONS.QUOTE_VIEW,
    PERMISSIONS.QUOTE_UPDATE,
    PERMISSIONS.QUOTE_DELETE,


    // ---------------------------------
    // INVOICES
    // ---------------------------------

    PERMISSIONS.INVOICE_CREATE,
    PERMISSIONS.INVOICE_VIEW,
    PERMISSIONS.INVOICE_UPDATE,
    PERMISSIONS.INVOICE_DELETE,


    // ---------------------------------
    // PAYMENTS
    // ---------------------------------

    PERMISSIONS.PAYMENT_CREATE,
    PERMISSIONS.PAYMENT_VIEW,


    // ---------------------------------
    // ANALYTICS
    // ---------------------------------

    PERMISSIONS.ANALYTICS_VIEW,
  ],


  // ===================================
  // MANAGER
  // ===================================

  manager: [

    // ---------------------------------
    // ORGANIZATION
    // ---------------------------------

    PERMISSIONS.ORGANIZATION_VIEW,


    // ---------------------------------
    // LEADS
    // ---------------------------------

    PERMISSIONS.LEAD_CREATE,
    PERMISSIONS.LEAD_VIEW,
    PERMISSIONS.LEAD_UPDATE,


    // ---------------------------------
    // CUSTOMERS
    // ---------------------------------

    PERMISSIONS.CUSTOMER_CREATE,
    PERMISSIONS.CUSTOMER_VIEW,
    PERMISSIONS.CUSTOMER_UPDATE,


    // ---------------------------------
    // SERVICES
    // ---------------------------------

    PERMISSIONS.SERVICE_VIEW,


    // ---------------------------------
    // STAFF
    // ---------------------------------

    PERMISSIONS.STAFF_VIEW,


    // ---------------------------------
    // BOOKINGS
    // ---------------------------------

    PERMISSIONS.BOOKING_CREATE,
    PERMISSIONS.BOOKING_VIEW,
    PERMISSIONS.BOOKING_UPDATE,


    // ---------------------------------
    // JOBS
    // ---------------------------------

    PERMISSIONS.JOB_CREATE,
    PERMISSIONS.JOB_VIEW,
    PERMISSIONS.JOB_UPDATE,


    // ---------------------------------
    // QUOTES
    // ---------------------------------

    PERMISSIONS.QUOTE_CREATE,
    PERMISSIONS.QUOTE_VIEW,
    PERMISSIONS.QUOTE_UPDATE,


    // ---------------------------------
    // INVOICES
    // ---------------------------------

    PERMISSIONS.INVOICE_VIEW,


    // ---------------------------------
    // PAYMENTS
    // ---------------------------------

    PERMISSIONS.PAYMENT_VIEW,


    // ---------------------------------
    // ANALYTICS
    // ---------------------------------

    PERMISSIONS.ANALYTICS_VIEW,
  ],


  // ===================================
  // STAFF
  // ===================================

  staff: [

    // ---------------------------------
    // LEADS
    // ---------------------------------

    PERMISSIONS.LEAD_VIEW,
    PERMISSIONS.LEAD_UPDATE,


    // ---------------------------------
    // CUSTOMERS
    // ---------------------------------

    PERMISSIONS.CUSTOMER_VIEW,


    // ---------------------------------
    // SERVICES
    // ---------------------------------

    PERMISSIONS.SERVICE_VIEW,


    // ---------------------------------
    // BOOKINGS
    // ---------------------------------

    PERMISSIONS.BOOKING_VIEW,
    PERMISSIONS.BOOKING_UPDATE,


    // ---------------------------------
    // JOBS
    // ---------------------------------

    PERMISSIONS.JOB_VIEW,
    PERMISSIONS.JOB_UPDATE,


    // ---------------------------------
    // QUOTES
    // ---------------------------------

    PERMISSIONS.QUOTE_VIEW,


    // ---------------------------------
    // INVOICES
    // ---------------------------------

    PERMISSIONS.INVOICE_VIEW,
  ],


  // ===================================
  // VIEWER
  // ===================================

  viewer: [

    // ---------------------------------
    // ORGANIZATION
    // ---------------------------------

    PERMISSIONS.ORGANIZATION_VIEW,


    // ---------------------------------
    // LEADS
    // ---------------------------------

    PERMISSIONS.LEAD_VIEW,


    // ---------------------------------
    // CUSTOMERS
    // ---------------------------------

    PERMISSIONS.CUSTOMER_VIEW,


    // ---------------------------------
    // SERVICES
    // ---------------------------------

    PERMISSIONS.SERVICE_VIEW,


    // ---------------------------------
    // STAFF
    // ---------------------------------

    PERMISSIONS.STAFF_VIEW,


    // ---------------------------------
    // BOOKINGS
    // ---------------------------------

    PERMISSIONS.BOOKING_VIEW,


    // ---------------------------------
    // JOBS
    // ---------------------------------

    PERMISSIONS.JOB_VIEW,


    // ---------------------------------
    // QUOTES
    // ---------------------------------

    PERMISSIONS.QUOTE_VIEW,


    // ---------------------------------
    // INVOICES
    // ---------------------------------

    PERMISSIONS.INVOICE_VIEW,


    // ---------------------------------
    // PAYMENTS
    // ---------------------------------

    PERMISSIONS.PAYMENT_VIEW,


    // ---------------------------------
    // ANALYTICS
    // ---------------------------------

    PERMISSIONS.ANALYTICS_VIEW,
  ],
};


// =====================================
// EXPORT
// =====================================

module.exports = ROLE_PERMISSIONS;