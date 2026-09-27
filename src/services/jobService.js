const mongoose = require("mongoose");

const Job = require("../models/Job");
const Booking = require("../models/Booking");
const Customer = require("../models/Customer");
const Service = require("../models/Service");
const Staff = require("../models/Staff");

// =====================================
// GENERATE JOB NUMBER
// =====================================

const generateJobNumber = async () => {
  const prefix = "JOB";
  const year = new Date().getFullYear();

  const lastJob = await Job.findOne({
    jobNumber: new RegExp(`^${prefix}-${year}-`),
  })
    .sort({ createdAt: -1 })
    .select("jobNumber");

  let nextNumber = 1;

  if (lastJob) {
    const parts = lastJob.jobNumber.split("-");
    nextNumber = Number(parts[2]) + 1;
  }

  return `${prefix}-${year}-${String(nextNumber).padStart(5, "0")}`;
};

// =====================================
// CREATE JOB
// =====================================

const createJob = async ({
  organizationId,
  userId,
  data,
}) => {
  // -----------------------------------
  // Validate Organization ID
  // -----------------------------------

  if (!mongoose.Types.ObjectId.isValid(organizationId)) {
    throw new Error("Invalid organization ID");
  }

  // -----------------------------------
  // Check Booking
  // -----------------------------------

  const booking = await Booking.findOne({
    _id: data.booking,
    organization: organizationId,
    isActive: true,
  });

  if (!booking) {
    throw new Error(
      "Booking not found or does not belong to this organization"
    );
  }

  // -----------------------------------
  // Check Customer
  // -----------------------------------

  const customer = await Customer.findOne({
    _id: data.customer,
    organization: organizationId,
    isActive: true,
  });

  if (!customer) {
    throw new Error(
      "Customer not found or does not belong to this organization"
    );
  }

  // -----------------------------------
  // Check Service
  // -----------------------------------

  const service = await Service.findOne({
    _id: data.service,
    organization: organizationId,
    isActive: true,
    status: "active",
  });

  if (!service) {
    throw new Error(
      "Service not found or does not belong to this organization"
    );
  }

  // -----------------------------------
  // Check Staff
  // -----------------------------------

  let staff = null;

  if (data.staff) {
    staff = await Staff.findOne({
      _id: data.staff,
      organization: organizationId,
      isActive: true,
      status: "active",
    });

    if (!staff) {
      throw new Error(
        "Staff not found or does not belong to this organization"
      );
    }
  }

  // -----------------------------------
  // Prevent Duplicate Job
  // -----------------------------------

  const existingJob = await Job.findOne({
    booking: data.booking,
    organization: organizationId,
    isActive: true,
  });

  if (existingJob) {
    throw new Error(
      "A job already exists for this booking"
    );
  }

  // -----------------------------------
  // Validate Scheduled Date
  // -----------------------------------

  const scheduledDate = new Date(data.scheduledDate);

  if (Number.isNaN(scheduledDate.getTime())) {
    throw new Error("Invalid scheduled date");
  }

  // -----------------------------------
  // Generate Job Number
  // -----------------------------------

  const jobNumber = await generateJobNumber();

  // -----------------------------------
  // Create Job
  // -----------------------------------

  const job = await Job.create({
    organization: organizationId,

    booking: booking._id,

    customer: customer._id,

    service: service._id,

    staff: staff ? staff._id : null,

    jobNumber,

    title: data.title,

    description: data.description || "",

    scheduledDate,

    startTime: data.startTime,

    endTime: data.endTime,

    status: data.status || "pending",

    priority: data.priority || "medium",

    location: data.location || {},

    price: data.price,

    taxRate: data.taxRate || 0,

    notes: data.notes || "",

    createdBy: userId,

    isActive: true,
  });

  // -----------------------------------
  // Populate Response
  // -----------------------------------

  await job.populate([
    {
      path: "booking",
    },
    {
      path: "customer",
    },
    {
      path: "service",
    },
    {
      path: "staff",
    },
    {
      path: "createdBy",
      select: "name email",
    },
  ]);

  return job;
};

// =====================================
// GET ORGANIZATION JOBS
// =====================================

const getOrganizationJobs = async ({
  organizationId,
  query = {},
}) => {
  const filter = {
    organization: organizationId,
    isActive: true,
  };

  // -----------------------------------
  // Status Filter
  // -----------------------------------

  if (query.status) {
    filter.status = query.status;
  }

  // -----------------------------------
  // Priority Filter
  // -----------------------------------

  if (query.priority) {
    filter.priority = query.priority;
  }

  // -----------------------------------
  // Staff Filter
  // -----------------------------------

  if (query.staff) {
    filter.staff = query.staff;
  }

  // -----------------------------------
  // Customer Filter
  // -----------------------------------

  if (query.customer) {
    filter.customer = query.customer;
  }

  // -----------------------------------
  // Booking Filter
  // -----------------------------------

  if (query.booking) {
    filter.booking = query.booking;
  }

  // -----------------------------------
  // Date Filter
  // -----------------------------------

  if (query.date) {
    const start = new Date(query.date);

    if (!Number.isNaN(start.getTime())) {
      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      filter.scheduledDate = {
        $gte: start,
        $lt: end,
      };
    }
  }

  // -----------------------------------
  // Get Jobs
  // -----------------------------------

  const jobs = await Job.find(filter)
    .populate("booking")
    .populate("customer")
    .populate("service")
    .populate("staff")
    .populate("createdBy", "name email")
    .sort({
      scheduledDate: 1,
      createdAt: -1,
    });

  return jobs;
};

// =====================================
// GET SINGLE JOB
// =====================================

const getJobById = async ({
  organizationId,
  jobId,
}) => {
  const job = await Job.findOne({
    _id: jobId,
    organization: organizationId,
    isActive: true,
  })
    .populate("booking")
    .populate("customer")
    .populate("service")
    .populate("staff")
    .populate("createdBy", "name email");

  if (!job) {
    throw new Error("Job not found");
  }

  return job;
};

// =====================================
// UPDATE JOB
// =====================================

const updateJob = async ({
  organizationId,
  jobId,
  data,
}) => {
  const job = await Job.findOne({
    _id: jobId,
    organization: organizationId,
    isActive: true,
  });

  if (!job) {
    throw new Error("Job not found");
  }

  // -----------------------------------
  // Validate Staff
  // -----------------------------------

  if (data.staff) {
    const staff = await Staff.findOne({
      _id: data.staff,
      organization: organizationId,
      isActive: true,
      status: "active",
    });

    if (!staff) {
      throw new Error(
        "Staff not found or does not belong to this organization"
      );
    }
  }

  // -----------------------------------
  // Validate Customer
  // -----------------------------------

  if (data.customer) {
    const customer = await Customer.findOne({
      _id: data.customer,
      organization: organizationId,
      isActive: true,
    });

    if (!customer) {
      throw new Error(
        "Customer not found or does not belong to this organization"
      );
    }
  }

  // -----------------------------------
  // Validate Service
  // -----------------------------------

  if (data.service) {
    const service = await Service.findOne({
      _id: data.service,
      organization: organizationId,
      isActive: true,
      status: "active",
    });

    if (!service) {
      throw new Error(
        "Service not found or does not belong to this organization"
      );
    }
  }

  // -----------------------------------
  // Validate Booking
  // -----------------------------------

  if (data.booking) {
    const booking = await Booking.findOne({
      _id: data.booking,
      organization: organizationId,
      isActive: true,
    });

    if (!booking) {
      throw new Error(
        "Booking not found or does not belong to this organization"
      );
    }

    const duplicateJob = await Job.findOne({
      booking: data.booking,
      organization: organizationId,
      isActive: true,
      _id: { $ne: jobId },
    });

    if (duplicateJob) {
      throw new Error(
        "Another job already exists for this booking"
      );
    }
  }

  // -----------------------------------
  // Validate Date
  // -----------------------------------

  if (data.scheduledDate) {
    const scheduledDate = new Date(
      data.scheduledDate
    );

    if (Number.isNaN(scheduledDate.getTime())) {
      throw new Error("Invalid scheduled date");
    }

    data.scheduledDate = scheduledDate;
  }

  // -----------------------------------
  // Update
  // -----------------------------------

  Object.assign(job, data);

  await job.save();

  await job.populate([
    {
      path: "booking",
    },
    {
      path: "customer",
    },
    {
      path: "service",
    },
    {
      path: "staff",
    },
    {
      path: "createdBy",
      select: "name email",
    },
  ]);

  return job;
};

// =====================================
// DELETE / CANCEL JOB
// =====================================

const deleteJob = async ({
  organizationId,
  jobId,
}) => {
  const job = await Job.findOne({
    _id: jobId,
    organization: organizationId,
    isActive: true,
  });

  if (!job) {
    throw new Error("Job not found");
  }

  job.status = "cancelled";
  job.isActive = false;

  await job.save();

  return job;
};

// =====================================
// JOB STATS
// =====================================

const getJobStats = async ({
  organizationId,
}) => {
  const stats = await Job.aggregate([
    {
      $match: {
        organization: new mongoose.Types.ObjectId(
          organizationId
        ),
      },
    },

    {
      $group: {
        _id: "$status",
        count: {
          $sum: 1,
        },
        totalValue: {
          $sum: "$price",
        },
      },
    },

    {
      $sort: {
        _id: 1,
      },
    },
  ]);

  const totalJobs = await Job.countDocuments({
    organization: organizationId,
  });

  const activeJobs = await Job.countDocuments({
    organization: organizationId,
    isActive: true,
  });

  const completedJobs = await Job.countDocuments({
    organization: organizationId,
    status: "completed",
  });

  const cancelledJobs = await Job.countDocuments({
    organization: organizationId,
    status: "cancelled",
  });

  return {
    totalJobs,
    activeJobs,
    completedJobs,
    cancelledJobs,
    byStatus: stats,
  };
};

// =====================================
// EXPORT
// =====================================

module.exports = {
  createJob,
  getOrganizationJobs,
  getJobById,
  updateJob,
  deleteJob,
  getJobStats,
};