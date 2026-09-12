const express = require('express');
const router = express.Router();
const {
  getWasteLots,
  getWasteLotById,
  createWasteLot,
  matchFacility,
  updateLotStatus,
  resetDemoData,
} = require('../controllers/wasteLotController');

router.route('/').get(getWasteLots).post(createWasteLot);
router.route('/reset').post(resetDemoData);
router.route('/:id').get(getWasteLotById);
router.route('/:id/match').put(matchFacility);
router.route('/:id/status').put(updateLotStatus);

module.exports = router;
