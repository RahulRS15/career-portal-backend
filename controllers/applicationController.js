const Application = require('../models/Application');
const Job         = require('../models/Job');

// ─── POST /api/applications ───────────────────────────────────────────────────
exports.applyForJob = async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;

    const job = await Job.findById(jobId);
    if (!job || !job.isActive) {
      return res.status(404).json({ success: false, message: 'Job not found or no longer active' });
    }

    // Check duplicate
    const existing = await Application.findOne({ job: jobId, applicant: req.user._id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already applied for this job' });
    }

    const resumeUrl = req.file ? `/${req.file.path.replace(/\\/g, '/')}` : undefined;

    const application = await Application.create({
      job:        jobId,
      applicant:  req.user._id,
      coverLetter,
      resumeUrl,
    });

    res.status(201).json({ success: true, application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/applications/my ─────────────────────────────────────────────────
exports.getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ applicant: req.user._id })
      .populate({
        path: 'job',
        populate: { path: 'company', select: 'name logo location' },
      })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/applications/job/:jobId ────────────────────────────────────────
exports.getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorised' });
    }

    const applications = await Application.find({ job: req.params.jobId })
      .populate('applicant', 'name email phone skills education status profilePhoto')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: applications.length, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/applications/:id ────────────────────────────────────────────────
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('applicant', 'name email');

    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });
    res.status(200).json({ success: true, application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE /api/applications/:id ────────────────────────────────────────────
exports.deleteApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

    if (application.applicant.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorised' });
    }

    await application.deleteOne();
    res.status(200).json({ success: true, message: 'Application withdrawn' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
