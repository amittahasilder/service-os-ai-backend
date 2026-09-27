const {
  createJob,
  getOrganizationJobs,
  getJobById,
  updateJob,
  deleteJob,
  getJobStats,
} = require("../services/jobService");

// =====================================
// CREATE JOB
// =====================================

const createJobController = async (req, res, next) => {
  try {
    const job = await createJob({
      organizationId: req.organizationId,
      userId: req.user._id,
      data: req.validatedData || req.body,
    });

    res.status(201).json({
      success: true,
      message: "Job created successfully",
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// GET JOBS
// =====================================

const getJobs = async (req, res, next) => {
  try {
    const jobs = await getOrganizationJobs({
      organizationId: req.organizationId,
      query: req.query,
    });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// GET SINGLE JOB
// =====================================

const getJob = async (req, res, next) => {
  try {
    const job = await getJobById({
      organizationId: req.organizationId,
      jobId: req.params.jobId,
    });

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// UPDATE JOB
// =====================================

const updateJobController = async (req, res, next) => {
  try {
    const job = await updateJob({
      organizationId: req.organizationId,
      jobId: req.params.jobId,
      data: req.validatedData || req.body,
    });

    res.status(200).json({
      success: true,
      message: "Job updated successfully",
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// DELETE / CANCEL JOB
// =====================================

const removeJob = async (req, res, next) => {
  try {
    const job = await deleteJob({
      organizationId: req.organizationId,
      jobId: req.params.jobId,
    });

    res.status(200).json({
      success: true,
      message: "Job cancelled successfully",
      data: job,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// JOB STATS
// =====================================

const jobStats = async (req, res, next) => {
  try {
    const stats = await getJobStats({
      organizationId: req.organizationId,
    });

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

// =====================================
// EXPORT
// =====================================

module.exports = {
  createJobController,
  getJobs,
  getJob,
  updateJobController,
  removeJob,
  jobStats,
};