const Job     = require('../models/Job');
const Company = require('../models/Company');

// ─── GET /api/jobs ────────────────────────────────────────────────────────────
exports.getJobs = async (req, res) => {
  try {
    const { search, category, type, location, page = 1, limit = 10 } = req.query;
    const filter = { isActive: true };

    if (category && category !== 'All') filter.category = category;
    if (type)     filter.type     = type;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (search)   filter.$or = [
      { title:       { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Job.countDocuments(filter);
    const jobs  = await Job.find(filter)
      .populate('company', 'name industry location logo')
      .populate('postedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      jobs,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/jobs/:id ────────────────────────────────────────────────────────
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('company', 'name industry location website logo description')
      .populate('postedBy', 'name email');
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.status(200).json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/jobs ───────────────────────────────────────────────────────────
exports.createJob = async (req, res) => {
  try {
    const { title, description, requirements, salary, type, location, category, companyId } = req.body;

    // Validate company ownership
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

    if (company.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorised to post jobs for this company' });
    }

    const job = await Job.create({
      title, description, requirements, salary, type, location, category,
      company: companyId,
      postedBy: req.user._id,
    });

    res.status(201).json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/jobs/:id ────────────────────────────────────────────────────────
exports.updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorised' });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE /api/jobs/:id ─────────────────────────────────────────────────────
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorised' });
    }

    await job.deleteOne();
    res.status(200).json({ success: true, message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
