const express = require('express');
const router = express.Router();
const {
  getFacilities,
  getFacilityById,
  createFacility,
  updateFacility,
} = require('../controllers/facilityController');

router.route('/').get(getFacilities).post(createFacility);
router.route('/:id').get(getFacilityById).put(updateFacility);

module.exports = router;
