const express  = require('express');
const router   = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload   = require('../middleware/upload');
const {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  deleteApplication,
} = require('../controllers/applicationController');

// Student applies for a job
router.post('/',         protect, authorize('student'), upload.single('resume'), applyForJob);

// Student views their own applications
router.get('/my',        protect, authorize('student'), getMyApplications);

// Company views applications for their job
router.get('/job/:jobId',protect, authorize('company', 'admin'), getJobApplications);

// Company / Admin updates application status
router.put('/:id',       protect, authorize('company', 'admin'), updateApplicationStatus);

// Delete application
router.delete('/:id',    protect, authorize('student', 'admin'), deleteApplication);

module.exports = router;
