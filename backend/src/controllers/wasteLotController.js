const WasteLot = require('../models/WasteLot');
const Facility = require('../models/Facility');
const Notification = require('../models/Notification');
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
// @desc    Request facility match for a waste lot (Sends request to Facility Operator)
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

    // Update lot state to MATCH_REQUESTED
    lot.requestedFacilityId = targetFacility.id;
    lot.requestedFacilityName = targetFacility.name;
    lot.selectedPathway = pathway;
    lot.status = 'MATCH_REQUESTED';
    lot.rejectionReason = undefined;
    lot.impactMetrics = impact;

    lot.timeline.push({
      status: 'MATCH_REQUESTED',
      timestamp: dateStr,
      note: `Intake match request sent to ${targetFacility.name}`,
    });

    await lot.save();

    // Create Notification for the Facility Operator
    await Notification.create({
      recipientRole: 'facility_operator',
      recipientFacilityId: targetFacility.id,
      lotId: lot.id,
      title: 'New Waste Intake Request',
      message: `Generator ${lot.generatorName} requested intake for ${lot.fingerprint.quantityTonnes}t ${lot.fingerprint.wasteType} at ${targetFacility.name}. Review and accept/reject.`,
      type: 'MATCH_REQUEST',
      actionTab: 'DASHBOARD',
      metadata: {
        generatorName: lot.generatorName,
        quantityTonnes: lot.fingerprint.quantityTonnes,
        wasteType: lot.fingerprint.wasteType,
        moisturePercent: lot.fingerprint.moisturePercent,
        contaminationPercent: lot.fingerprint.contaminationPercent,
        facilityId: targetFacility.id,
        facilityName: targetFacility.name,
      },
    });

    // Create Notification for the Generator
    await Notification.create({
      recipientRole: 'generator',
      lotId: lot.id,
      title: 'Intake Request Submitted',
      message: `Intake request for batch ${lot.id} sent to ${targetFacility.name}. Awaiting facility operator acceptance.`,
      type: 'INFO',
      actionTab: 'WASTE',
    });

    res.status(200).json({
      success: true,
      message: `Intake request for batch ${lot.id} successfully sent to ${targetFacility.name}`,
      lot,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Facility operator accepts or rejects an intake match request
// @route   PUT /api/waste-lots/:id/respond-match
// @access  Public / Protected
exports.respondToMatchRequest = async (req, res, next) => {
  try {
    const { action, rejectionReason, facilityId } = req.body; // action: 'ACCEPT' | 'REJECT'

    if (!action || !['ACCEPT', 'REJECT'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be ACCEPT or REJECT',
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

    // Guard: don't re-accept lots already in processing or completed
    if (['PROCESSING', 'COMPLETED', 'IN_TRANSIT', 'PICKUP', 'DELIVERED'].includes(lot.status)) {
      return res.status(400).json({
        success: false,
        message: `Batch ${lot.id} is already in status ${lot.status} and cannot be re-accepted.`,
      });
    }

    const facId = facilityId || lot.requestedFacilityId || lot.matchedFacilityId;
    const targetFacility = facId ? await Facility.findOne({ id: facId }) : null;
    const dateStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    if (action === 'ACCEPT') {
      const distance = targetFacility
        ? calculateHaversineDistance(
            lot.fingerprint.location.lat,
            lot.fingerprint.location.lng,
            targetFacility.location.lat,
            targetFacility.location.lng
          )
        : 12;

      const pathway = targetFacility?.type || lot.selectedPathway || 'BIOCHAR';
      const impact = calculateBatchImpact(lot.fingerprint, pathway, distance);

      lot.status = 'MATCHED';
      lot.matchedFacilityId = targetFacility?.id || facId;
      lot.matchedFacilityName = targetFacility?.name || lot.requestedFacilityName;
      lot.matchedFacilityType = pathway;
      lot.matchedFacilityLocation = targetFacility?.location;
      lot.selectedPathway = pathway;
      lot.rejectionReason = undefined;
      // Clear the pending request once accepted
      lot.requestedFacilityId = undefined;
      lot.requestedFacilityName = undefined;

      const randomTruckSuffix = Math.floor(1000 + Math.random() * 9000);
      lot.logistics = {
        driverName: 'Vikram Patel',
        truckNumber: `GJ-18-W2C-${randomTruckSuffix}`,
        distanceKm: distance,
        estimatedHours: Math.round((distance / 40) * 10) / 10 || 0.3,
        transportCost: impact.transportCost,
        transportCO2e: impact.transportEmissionsCO2e,
        pickupTime: `${dateStr} (Scheduled Today)`,
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
        note: `Intake confirmed by ${lot.matchedFacilityName}. Pickup vehicle GJ-18-W2C-${randomTruckSuffix} scheduled.`,
      });

      if (targetFacility && targetFacility.availableCapacityTonnes >= lot.fingerprint.quantityTonnes) {
        targetFacility.availableCapacityTonnes = Math.max(
          0,
          Math.round((targetFacility.availableCapacityTonnes - lot.fingerprint.quantityTonnes) * 10) / 10
        );
        targetFacility.activeBatchesCount = (targetFacility.activeBatchesCount || 0) + 1;
        await targetFacility.save();
      }

      await lot.save();

      // Notify Generator of Acceptance
      await Notification.create({
        recipientRole: 'generator',
        lotId: lot.id,
        title: 'Intake Request Accepted!',
        message: `${lot.matchedFacilityName} confirmed batch ${lot.id}. Pickup scheduled for ${lot.logistics.pickupTime} with Driver Vikram Patel (${lot.logistics.truckNumber}).`,
        type: 'MATCH_ACCEPTED',
        actionTab: 'LOGISTICS',
        metadata: {
          driverName: lot.logistics.driverName,
          truckNumber: lot.logistics.truckNumber,
          pickupTime: lot.logistics.pickupTime,
          facilityName: lot.matchedFacilityName,
        },
      });

      // Notify Facility Operator
      await Notification.create({
        recipientRole: 'facility_operator',
        recipientFacilityId: lot.matchedFacilityId,
        lotId: lot.id,
        title: 'Batch Scheduled for Intake',
        message: `Batch ${lot.id} accepted and assigned to Inbound Pipeline. Scheduled pickup with Driver Vikram Patel.`,
        type: 'INFO',
        actionTab: 'DASHBOARD',
      });

      return res.status(200).json({
        success: true,
        message: `Batch ${lot.id} accepted by facility`,
        lot,
      });
    }

    if (action === 'REJECT') {
      const reason = rejectionReason || 'Facility intake capacity limits reached';

      lot.status = 'REJECTED';
      lot.rejectionReason = reason;
      lot.matchedFacilityId = undefined;
      lot.matchedFacilityName = undefined;

      lot.timeline.push({
        status: 'REJECTED',
        timestamp: dateStr,
        note: `Intake request declined by ${lot.requestedFacilityName || 'Facility'}: ${reason}`,
      });

      await lot.save();

      // Notify Generator of Rejection with alternative selection prompt
      await Notification.create({
        recipientRole: 'generator',
        lotId: lot.id,
        title: 'Intake Request Declined',
        message: `${lot.requestedFacilityName || 'Facility'} declined batch ${lot.id} (${reason}). You can now select an alternative compatible facility.`,
        type: 'MATCH_REJECTED',
        actionTab: 'RECOMMENDATION',
        metadata: {
          rejectionReason: reason,
          declinedBy: lot.requestedFacilityName,
        },
      });

      // Notify Facility Operator
      await Notification.create({
        recipientRole: 'facility_operator',
        recipientFacilityId: lot.requestedFacilityId,
        lotId: lot.id,
        title: 'Intake Request Declined',
        message: `You declined batch ${lot.id} (${reason}). Generator has been notified to select an alternative facility.`,
        type: 'INFO',
        actionTab: 'DASHBOARD',
      });

      return res.status(200).json({
        success: true,
        message: `Batch ${lot.id} declined by facility`,
        lot,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Report that truck has arrived at facility gate and is waiting for weighbridge/inspection
// @route   PUT /api/waste-lots/:id/gate-arrival
// @access  Public / Protected
exports.notifyGateArrival = async (req, res, next) => {
  try {
    const lotQuery = req.params.id.startsWith('W2C-') ? { id: req.params.id } : { _id: req.params.id };
    const lot = await WasteLot.findOne(lotQuery);

    if (!lot) {
      return res.status(404).json({
        success: false,
        message: `Waste batch ${req.params.id} not found`,
      });
    }

    const dateStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    lot.status = 'AT_GATE';
    lot.gateArrivalTime = dateStr;

    const truckNum = lot.logistics?.truckNumber || 'GJ-18-W2C-4821';
    const facName = lot.matchedFacilityName || 'Conversion Facility';

    lot.timeline.push({
      status: 'AT_GATE',
      timestamp: dateStr,
      note: `Truck ${truckNum} arrived at ${facName} gate. Waiting for weighbridge check-in and moisture inspection.`,
    });

    await lot.save();

    // Broadcast notification to Generator
    await Notification.create({
      recipientRole: 'generator',
      lotId: lot.id,
      title: 'Truck Arrived at Facility Gate',
      message: `Truck ${truckNum} carrying batch ${lot.id} has arrived at ${facName} gate and is waiting for weighbridge inspection.`,
      type: 'GATE_ARRIVAL',
      actionTab: 'LOGISTICS',
      metadata: {
        truckNumber: truckNum,
        facilityName: facName,
        gateArrivalTime: dateStr,
      },
    });

    // Broadcast notification to Facility Operator
    await Notification.create({
      recipientRole: 'facility_operator',
      recipientFacilityId: lot.matchedFacilityId,
      lotId: lot.id,
      title: 'Truck Waiting at Gate 1',
      message: `Truck ${truckNum} is waiting at Gate 1 with ${lot.fingerprint.quantityTonnes}t ${lot.fingerprint.wasteType} for weighbridge check-in and moisture verification.`,
      type: 'GATE_ARRIVAL',
      actionTab: 'DASHBOARD',
      metadata: {
        truckNumber: truckNum,
        quantityTonnes: lot.fingerprint.quantityTonnes,
        generatorName: lot.generatorName,
      },
    });

    res.status(200).json({
      success: true,
      message: `Gate arrival logged for batch ${lot.id}`,
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
      AT_GATE: `Truck arrived at facility gate. Waiting for weighbridge check-in.`,
      DELIVERED: `Delivered and verified at ${lot.matchedFacilityName || 'facility'} gate`,
      PROCESSING: `Feedstock entered conversion processing cycle`,
      COMPLETED: `Batch conversion complete. Certified Digital Impact Report generated.`,
    };

    const lastEntry = lot.timeline[lot.timeline.length - 1];
    if (!lastEntry || lastEntry.status !== status) {
      lot.timeline.push({
        status,
        timestamp: dateStr,
        note: note || defaultNotes[status] || `Status updated to ${status}`,
      });
    }

    if (status === 'DELIVERED' && lot.logistics) {
      lot.logistics.deliveryTime = dateStr;

      // Notify Generator of successful gate weighbridge unload
      await Notification.create({
        recipientRole: 'generator',
        lotId: lot.id,
        title: 'Feedstock Weighed & Unloaded',
        message: `Batch ${lot.id} successfully weighed and unloaded into feed hoppers at ${lot.matchedFacilityName || 'facility'}.`,
        type: 'INFO',
        actionTab: 'LOGISTICS',
      });
    }

    if (status === 'PROCESSING' && lot.processingYield) {
      lot.processingYield.progressPercent = 40;
      lot.processingYield.startedAt = dateStr;

      // Notify Generator that conversion reactor has started
      await Notification.create({
        recipientRole: 'generator',
        lotId: lot.id,
        title: 'Conversion Processing Active',
        message: `Batch ${lot.id} has entered the pyrolysis kiln / conversion reactor at ${lot.matchedFacilityName}.`,
        type: 'CONVERSION_STARTED',
        actionTab: 'PROCESSING',
      });
    }

    if (status === 'COMPLETED' && lot.processingYield) {
      lot.processingYield.progressPercent = 100;
      lot.processingYield.estimatedCompletionAt = dateStr;

      const netImpact = lot.impactMetrics?.netClimateImpactCO2e || 11.2;
      const outputDesc = lot.processingYield.outputQuantity || 'High-grade Biochar';

      // Notify Both Generator and Facility Operator
      await Notification.create({
        recipientRole: 'generator',
        lotId: lot.id,
        title: 'Conversion Complete & Certified!',
        message: `Batch ${lot.id} conversion complete! Yield: ${outputDesc}, +${netImpact} tCO₂e net climate benefit verified. Digital Certificate is now available.`,
        type: 'CERTIFICATE_READY',
        actionTab: 'REPORTS',
      });

      await Notification.create({
        recipientRole: 'facility_operator',
        recipientFacilityId: lot.matchedFacilityId,
        lotId: lot.id,
        title: 'Conversion Yield Certified',
        message: `Batch ${lot.id} finished conversion. +${netImpact} tCO₂e permanence sequestered. Digital certificate published.`,
        type: 'CERTIFICATE_READY',
        actionTab: 'REPORTS',
      });
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
