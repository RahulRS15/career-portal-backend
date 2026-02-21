const User   = require('../models/User');
const crypto = require('crypto');
const jwt    = require('jsonwebtoken');

// ─── Token helpers ────────────────────────────────────────────────────────────
const signAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRE || '15m',
  });

const signRefreshToken = (id) =>
  jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET + '_refresh', {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '7d',
  });

const sendTokens = (user, statusCode, res) => {
  const accessToken  = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);
  const userObj = user.toObject();
  delete userObj.password;

  // Send refresh token in httpOnly cookie (more secure)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(statusCode).json({
    success: true,
    accessToken,
    refreshToken, // also in body for clients that can't use cookies
    expiresIn: 15 * 60, // 15 minutes in seconds
    user: userObj,
  });
};

// ─── POST /api/auth/register ─────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role, status } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const userData = { name, email, password, phone, role: role || 'student' };
    if (role === 'student' && status) userData.status = status;

    const user = await User.create(userData);
    sendTokens(user, 201, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    sendTokens(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/auth/refresh-token ─────────────────────────────────────────────
// Accepts refreshToken from cookie OR body
exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
      return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }

    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET + '_refresh'
      );
    } catch {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Issue new access token (token rotation)
    const newAccessToken  = signAccessToken(user._id);
    const newRefreshToken = signRefreshToken(user._id);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresIn: 15 * 60,
      user: userObj,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
exports.logout = async (req, res) => {
  res.clearCookie('refreshToken');
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

// ─── POST /api/auth/forgot-password ──────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken   = crypto.createHash('sha256').update(token).digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
    console.log(`🔑 Password reset link (dev only): ${resetUrl}`);

    res.status(200).json({
      success: true,
      message: 'If that email exists, a reset link has been sent.',
      devToken: token, // Remove in production
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/auth/reset-password/:token ────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    user.password             = newPassword;
    user.resetPasswordToken   = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    sendTokens(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
