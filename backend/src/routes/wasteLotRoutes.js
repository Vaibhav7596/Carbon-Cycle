const express = require('express');
const router = express.Router();
const { optionalProtect } = require('../middleware/authMiddleware');
const {
  getWasteLots,
  getWasteLotById,
  createWasteLot,
  matchFacility,
  respondToMatchRequest,
  notifyGateArrival,
  updateLotStatus,
  resetDemoData,
} = require('../controllers/wasteLotController');

router.route('/').get(getWasteLots).post(optionalProtect, createWasteLot);
router.route('/reset').post(resetDemoData);
router.route('/:id').get(getWasteLotById);
router.route('/:id/match').put(matchFacility);
router.route('/:id/respond-match').put(respondToMatchRequest);
router.route('/:id/gate-arrival').put(notifyGateArrival);
router.route('/:id/status').put(updateLotStatus);

module.exports = router;
