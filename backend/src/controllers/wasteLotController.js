const WasteLot = require('../models/WasteLot');
const Facility = require('../models/Facility');
const { SEEDED_WASTE_LOTS, SEEDED_FACILITIES } = require('../data/seedData');
const { calculateHaversineDistance, calculateBatchImpact } = require('../utils/calculator');

// Helper to determine recommended pathway based on fingerprint
function getRecommendedPathway(fingerprint) {
  const moisture = fingerprint.moisturePercent || 20;
  const wasteType = fingerprint.wasteType || 'AGRICULTURAL_RESIDUE';

  if (moisture <= 30 && (wasteType === 'AGRICULTURAL_RESIDUE' || wasteType === 'BIOMASS_WOOD')) {
    return 'BIOCHAR';
  }
  if (moisture > 50 || wasteType === 'FOOD_WASTE' || wasteType === 'ANIMAL_MANURE') {
    return 'BIOGAS';
  }
  if (wasteType === 'MUNICIPAL_ORGANIC') {
    return 'COMPOSTING';
  }
  return 'BIOCHAR';
}

// @desc    Get all waste lots (auto-seeds if empty)
// @route   GET /api/waste-lots
// @access  Public
exports.getWasteLots = async (req, res, next) => {
  try {
    let count = await WasteLot.countDocuments();
    if (count === 0) {
      console.log('[WasteLot Controller]: Collection empty, seeding initial Gujarat waste lots...');
      await WasteLot.insertMany(SEEDED_WASTE_LOTS);
    }

    const query = {};
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.generatorId) {
      query.generatorId = req.query.generatorId;
    }

    const lots = await WasteLot.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: lots.length,
      lots,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single waste lot by ID
// @route   GET /api/waste-lots/:id
// @access  Public
exports.getWasteLotById = async (req, res, next) => {
  try {
    const query = req.params.id.startsWith('W2C-') ? { id: req.params.id } : { _id: req.params.id };
    const lot = await WasteLot.findOne(query);

    if (!lot) {
      return res.status(404).json({
        success: false,
        message: `Waste batch with ID ${req.params.id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      lot,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new waste lot
// @route   POST /api/waste-lots
// @access  Public / Protected
exports.createWasteLot = async (req, res, next) => {
  try {
    const { generatorName, generatorType, fingerprint } = req.body;

    if (!fingerprint || !fingerprint.location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide complete waste fingerprint and location point.',
      });
    }

    const totalLots = await WasteLot.countDocuments();
    const nextNum = totalLots + 126;
    const newId = `W2C-2026-${String(nextNum).padStart(5, '0')}`;

    const recommendedPathway = getRecommendedPathway(fingerprint);
    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').slice(0, 16);

    const initialTimeline = [
      {
        status: 'LISTED',
        timestamp: dateStr,
        note: `Waste batch listed by ${generatorName || 'Waste Generator'}`,
      },
      {
        status: 'ANALYZED',
        timestamp: dateStr,
        note: `Fingerprint analyzed. Recommended conversion pathway: ${recommendedPathway}`,
      },
    ];

    const newLot = await WasteLot.create({
      id: newId,
      generatorId: req.user?._id,
      generatorName: generatorName || req.user?.organizationName || 'Regional Agro Generator',
      generatorType: generatorType || req.user?.organizationType || 'Agricultural Enterprise',
      fingerprint,
      status: 'LISTED',
      selectedPathway: recommendedPathway,
      timeline: initialTimeline,
    });

    res.status(201).json({
      success: true,
      message: `Waste batch ${newId} created successfully in database`,
      lot: newLot,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Match and confirm facility for a waste lot
// @route   PUT /api/waste-lots/:id/match
// @access  Public / Protected
exports.matchFacility = async (req, res, next) => {
  try {
    const { facilityId } = req.body;

    if (!facilityId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide facilityId to match with',
      });
    }

    const lotQuery = req.params.id.startsWith('W2C-') ? { id: req.params.id } : { _id: req.params.id };
    const lot = await WasteLot.findOne(lotQuery);

    if (!lot) {
      return res.status(404).json({
        success: false,
        message: `Waste batch ${req.params.id} not found`,
      });
    }

    const facQuery = facilityId.startsWith('FAC-') ? { id: facilityId } : { _id: facilityId };
    const targetFacility = await Facility.findOne(facQuery);

    if (!targetFacility) {
      return res.status(404).json({
        success: false,
        message: `Facility ${facilityId} not found`,
      });
    }

    const distance = calculateHaversineDistance(
      lot.fingerprint.location.lat,
      lot.fingerprint.location.lng,
      targetFacility.location.lat,
      targetFacility.location.lng
    );

    const pathway = targetFacility.type;
    const impact = calculateBatchImpact(lot.fingerprint, pathway, distance);
    const dateStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    lot.matchedFacilityId = targetFacility.id;
    lot.matchedFacilityName = targetFacility.name;
    lot.matchedFacilityType = targetFacility.type;
    lot.matchedFacilityLocation = targetFacility.location;
    lot.selectedPathway = pathway;
    lot.status = 'MATCHED';

    lot.logistics = {
      driverName: 'Vikram Patel',
      truckNumber: `GJ-18-W2C-${Math.floor(1000 + Math.random() * 9000)}`,
      distanceKm: distance,
      estimatedHours: Math.round((distance / 40) * 10) / 10 || 0.3,
      transportCost: impact.transportCost,
      transportCO2e: impact.transportEmissionsCO2e,
      pickupTime: `${dateStr} (Scheduled)`,
      deliveryTime: '',
    };

    lot.impactMetrics = impact;

    lot.processingYield = {
      outputType:
        pathway === 'BIOCHAR'
          ? 'Biochar & Process Heat'
          : pathway === 'BIOGAS'
          ? 'Biomethane (CBG) & Bio-slurry'
          : 'Organic Soil Amendment',
      outputQuantity:
        pathway === 'BIOCHAR'
          ? `${(lot.fingerprint.quantityTonnes * 0.35).toFixed(1)} tonnes Biochar`
          : `${Math.round(lot.fingerprint.quantityTonnes * 80)} m³ Biogas`,
      progressPercent: 0,
      startedAt: 'Pending Arrival',
      estimatedCompletionAt: '24h post-delivery',
    };

    lot.timeline.push({
      status: 'MATCHED',
      timestamp: dateStr,
      note: `Facility match confirmed with ${targetFacility.name}`,
    });

    await lot.save();

    // Deduct available capacity on target facility
    if (targetFacility.availableCapacityTonnes >= lot.fingerprint.quantityTonnes) {
      targetFacility.availableCapacityTonnes = Math.max(
        0,
        Math.round((targetFacility.availableCapacityTonnes - lot.fingerprint.quantityTonnes) * 10) / 10
      );
      targetFacility.activeBatchesCount = (targetFacility.activeBatchesCount || 0) + 1;
      await targetFacility.save();
    }

    res.status(200).json({
      success: true,
      message: `Batch ${lot.id} successfully matched with ${targetFacility.name}`,
      lot,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update waste lot lifecycle status
// @route   PUT /api/waste-lots/:id/status
// @access  Public / Protected
exports.updateLotStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide status to update',
      });
    }

    const lotQuery = req.params.id.startsWith('W2C-') ? { id: req.params.id } : { _id: req.params.id };
    const lot = await WasteLot.findOne(lotQuery);

    if (!lot) {
      return res.status(404).json({
        success: false,
        message: `Waste batch ${req.params.id} not found`,
      });
    }

    const dateStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    lot.status = status;

    const defaultNotes = {
      PICKUP: `Transit scheduled: Pickup vehicle dispatched`,
      IN_TRANSIT: `Waste loaded and in-transit to ${lot.matchedFacilityName || 'facility'}`,
      DELIVERED: `Delivered and verified at ${lot.matchedFacilityName || 'facility'} gate`,
      PROCESSING: `Feedstock entered conversion processing cycle`,
      COMPLETED: `Batch conversion complete. Certified Digital Impact Report generated.`,
    };

    lot.timeline.push({
      status,
      timestamp: dateStr,
      note: note || defaultNotes[status] || `Status updated to ${status}`,
    });

    if (status === 'DELIVERED' && lot.logistics) {
      lot.logistics.deliveryTime = dateStr;
    }

    if (status === 'PROCESSING' && lot.processingYield) {
      lot.processingYield.progressPercent = 40;
      lot.processingYield.startedAt = dateStr;
    }

    if (status === 'COMPLETED' && lot.processingYield) {
      lot.processingYield.progressPercent = 100;
      lot.processingYield.estimatedCompletionAt = dateStr;
    }

    await lot.save();

    res.status(200).json({
      success: true,
      message: `Batch ${lot.id} status updated to ${status}`,
      lot,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset all waste lots and facilities to initial demo dataset
// @route   POST /api/waste-lots/reset
// @access  Public / Protected
exports.resetDemoData = async (req, res, next) => {
  try {
    await WasteLot.deleteMany({});
    await Facility.deleteMany({});

    await Facility.insertMany(SEEDED_FACILITIES);
    await WasteLot.insertMany(SEEDED_WASTE_LOTS);

    const lots = await WasteLot.find().sort({ createdAt: -1 });
    const facilities = await Facility.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Demo scenario reset to initial baseline dataset',
      lots,
      facilities,
    });
  } catch (error) {
    next(error);
  }
};
