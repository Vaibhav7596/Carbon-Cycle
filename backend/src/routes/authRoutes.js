const express = require('express');
const router = express.Router();
const { register, login, getMe, logout, getAllUsers } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// Health Check Endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CarbonCycle API is running',
    timestamp: new Date().toISOString(),
  });
});

// Authentication Routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', protect, getMe);
router.post('/auth/logout', logout);

// Admin-Only Routes
router.get('/admin/users', protect, requireRole('admin'), getAllUsers);

router.get('/admin/dashboard', protect, requireRole('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the CarbonCycle Dedicated Admin Dashboard',
    adminUser: req.user,
  });
});

module.exports = router;
