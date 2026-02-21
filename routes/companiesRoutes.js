const express  = require('express');
const router   = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload   = require('../middleware/upload');
const {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  uploadLogo,
} = require('../controllers/companyController');

// Public
router.get('/',    getCompanies);
router.get('/:id', getCompany);

// Company / Admin
router.post('/',     protect, authorize('company', 'admin'), createCompany);
router.put('/:id',   protect, authorize('company', 'admin'), updateCompany);
router.delete('/:id',protect, authorize('admin'),            deleteCompany);
router.post('/:id/logo', protect, authorize('company', 'admin'), upload.single('logo'), uploadLogo);

module.exports = router;
