const express = require('express');
const { getDrivingRoute } = require('../controllers/routeController');

const router = express.Router();

// GET /api/routes/route?sourceLat=...&sourceLng=...&destinationLat=...&destinationLng=...
router.get('/route', getDrivingRoute);

module.exports = router;
