const Facility = require('../models/Facility');
const { SEEDED_FACILITIES } = require('../data/seedData');

// @desc    Get all facilities (auto-seeds if empty)
// @route   GET /api/facilities
// @access  Public
exports.getFacilities = async (req, res, next) => {
  try {
    let count = await Facility.countDocuments();
    if (count === 0) {
      console.log('[Facility Controller]: Collection empty, seeding initial Gujarat facilities...');
      await Facility.insertMany(SEEDED_FACILITIES);
    }

    const facilities = await Facility.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: facilities.length,
      facilities,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single facility by ID
// @route   GET /api/facilities/:id
// @access  Public
exports.getFacilityById = async (req, res, next) => {
  try {
    const query = req.params.id.startsWith('FAC-') ? { id: req.params.id } : { _id: req.params.id };
    const facility = await Facility.findOne(query);

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: `Facility with ID ${req.params.id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      facility,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new facility
// @route   POST /api/facilities
// @access  Protected (admin / facility_operator)
exports.createFacility = async (req, res, next) => {
  try {
    const {
      name,
      type,
      acceptedWasteTypes,
      maxCapacityTonnes,
      availableCapacityTonnes,
      location,
      processingCostPerTon,
      carbonFactorPerTon,
      rating,
      contactEmail,
    } = req.body;

    const count = await Facility.countDocuments();
    const facilityId = `FAC-${String(count + 1).padStart(3, '0')}`;

    const newFacility = await Facility.create({
      id: facilityId,
      name,
      type,
      acceptedWasteTypes: acceptedWasteTypes || ['AGRICULTURAL_RESIDUE', 'BIOMASS_WOOD'],
      maxCapacityTonnes: maxCapacityTonnes || 50,
      availableCapacityTonnes: availableCapacityTonnes || maxCapacityTonnes || 50,
      location,
      processingCostPerTon: processingCostPerTon || 1000,
      carbonFactorPerTon: carbonFactorPerTon || 0.4,
      rating: rating || 4.8,
      contactEmail: contactEmail || req.user?.email || 'operations@carboncycle.io',
      operatorId: req.user?._id,
      status: 'ACTIVE',
    });

    res.status(201).json({
      success: true,
      message: 'Conversion facility successfully registered',
      facility: newFacility,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update facility
// @route   PUT /api/facilities/:id
// @access  Protected (admin / facility_operator)
exports.updateFacility = async (req, res, next) => {
  try {
    const query = req.params.id.startsWith('FAC-') ? { id: req.params.id } : { _id: req.params.id };
    const facility = await Facility.findOneAndUpdate(query, req.body, {
      new: true,
      runValidators: true,
    });

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: `Facility with ID ${req.params.id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      facility,
    });
  } catch (error) {
    next(error);
  }
};
