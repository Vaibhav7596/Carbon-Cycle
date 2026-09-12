const express = require('express');
const router = express.Router();
const { lookupPincode } = require('../controllers/locationController');

// @route   GET /api/location/pincode/:pincode
// @desc    Auto-detect location, address and coordinates from 6-digit Indian PIN code
// @access  Public
router.get('/pincode/:pincode', lookupPincode);

module.exports = router;
