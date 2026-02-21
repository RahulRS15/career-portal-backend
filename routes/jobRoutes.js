const express  = require('express');
const router   = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');

// Public
router.get('/',    getJobs);
router.get('/:id', getJob);

// Company / Admin only
router.post('/',    protect, authorize('company', 'admin'), createJob);
router.put('/:id',  protect, authorize('company', 'admin'), updateJob);
router.delete('/:id', protect, authorize('company', 'admin'), deleteJob);

module.exports = router;
