const Company = require('../models/Company');

// ─── GET /api/companies ───────────────────────────────────────────────────────
exports.getCompanies = async (req, res) => {
  try {
    const { search, industry, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (industry) filter.industry = { $regex: industry, $options: 'i' };
    if (search)   filter.$or = [
      { name:        { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Company.countDocuments(filter);
    const companies = await Company.find(filter)
      .populate('openPositions')
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), companies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/companies/:id ───────────────────────────────────────────────────
exports.getCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate('openPositions')
      .populate('owner', 'name email');
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    res.status(200).json({ success: true, company });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/companies ──────────────────────────────────────────────────────
exports.createCompany = async (req, res) => {
  try {
    const company = await Company.create({ ...req.body, owner: req.user._id });
    res.status(201).json({ success: true, company });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/companies/:id ───────────────────────────────────────────────────
exports.updateCompany = async (req, res) => {
  try {
    let company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });

    if (company.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorised' });
    }

    company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, company });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE /api/companies/:id (admin) ───────────────────────────────────────
exports.deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return res.status(404).json({ success: false, message: 'Company not found' });
    res.status(200).json({ success: true, message: 'Company deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/companies/:id/logo ─────────────────────────────────────────────
exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const logoUrl = `/${req.file.path.replace(/\\/g, '/')}`;
    const company = await Company.findByIdAndUpdate(req.params.id, { logo: logoUrl }, { new: true });
    res.status(200).json({ success: true, logo: logoUrl, company });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
