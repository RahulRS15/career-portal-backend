const express = require('express');
const router  = express.Router();
const {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/refresh-token  — get new accessToken using refreshToken
router.post('/refresh-token', refreshToken);

// POST /api/auth/logout
router.post('/logout', logout);

// GET  /api/auth/me  — requires valid accessToken
router.get('/me', protect, getMe);

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password/:token
router.post('/reset-password/:token', resetPassword);

module.exports = router;
