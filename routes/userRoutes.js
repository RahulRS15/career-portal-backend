const express  = require('express');
const router   = express.Router();
const { protect, authorize } = require('../middleware/auth');
const upload   = require('../middleware/upload');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  uploadProfilePhoto,
} = require('../controllers/userController');

// Admin only: Get all users
router.get('/',      protect, authorize('admin'), getAllUsers);

// Self or Admin: Get/Update user
router.get('/:id',   protect, getUserById);
router.put('/:id',   protect, updateUser);

// Admin only: Delete user
router.delete('/:id', protect, authorize('admin'), deleteUser);

// Self or Admin: Upload photo
router.post('/:id/photo', protect, upload.single('profilePhoto'), uploadProfilePhoto);

module.exports = router;

