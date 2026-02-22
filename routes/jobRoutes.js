const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
} = require('../controllers/jobController');

// Public
router.get('/', getJobs);

// Protected
router.get('/my', protect, getMyJobs);
router.get('/:id', getJob);

// Company / Admin only
router.post('/', protect, authorize('company', 'admin'), createJob);
router.put('/:id', protect, authorize('company', 'admin'), updateJob);
router.delete('/:id', protect, authorize('company', 'admin'), deleteJob);

module.exports = router;
