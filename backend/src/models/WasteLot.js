const mongoose = require('mongoose');

const locationPointSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
);

const timelineEntrySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    timestamp: { type: String, required: true },
    note: { type: String, required: true },
  },
  { _id: false }
);

const requestedFacilitySchema = new mongoose.Schema(
  {
    facilityId: { type: String, required: true },
    facilityName: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'SUPERSEDED'],
      default: 'PENDING',
    },
    requestedAt: { type: String, required: true },
    rejectionReason: { type: String },
  },
  { _id: false }
);

const logisticsSchema = new mongoose.Schema(
  {
    driverName: { type: String, default: 'Unassigned' },
    truckNumber: { type: String, default: '' },
    distanceKm: { type: Number, default: 0 },
    estimatedHours: { type: Number, default: 0 },
    transportCost: { type: Number, default: 0 },
    transportCO2e: { type: Number, default: 0 },
    pickupTime: { type: String, default: '' },
    deliveryTime: { type: String, default: '' },
  },
  { _id: false }
);

const impactMetricsSchema = new mongoose.Schema(
  {
    wasteDivertedTonnes: { type: Number, default: 0 },
    landfillAvoidedCO2e: { type: Number, default: 0 },
    carbonStoredCO2e: { type: Number, default: 0 },
    transportEmissionsCO2e: { type: Number, default: 0 },
    processingEmissionsCO2e: { type: Number, default: 0 },
    netClimateImpactCO2e: { type: Number, default: 0 },
    wasteValue: { type: Number, default: 0 },
    carbonIncentiveValue: { type: Number, default: 0 },
    transportCost: { type: Number, default: 0 },
    netEconomicValue: { type: Number, default: 0 },
  },
  { _id: false }
);

const processingYieldSchema = new mongoose.Schema(
  {
    outputType: { type: String, default: 'Biochar & Process Heat' },
    outputQuantity: { type: String, default: 'Pending' },
    progressPercent: { type: Number, default: 0 },
    startedAt: { type: String, default: 'Pending Arrival' },
    estimatedCompletionAt: { type: String, default: '24h post-delivery' },
  },
  { _id: false }
);

const wasteFingerprintSchema = new mongoose.Schema(
  {
    wasteType: {
      type: String,
      enum: [
        'AGRICULTURAL_RESIDUE',
        'FOOD_WASTE',
        'ANIMAL_MANURE',
        'BIOMASS_WOOD',
        'MUNICIPAL_ORGANIC',
      ],
      required: true,
    },
    quantityTonnes: { type: Number, required: true },
    moisturePercent: { type: Number, required: true },
    organicFractionPercent: { type: Number, required: true },
    contaminationPercent: { type: Number, required: true },
    location: { type: locationPointSchema, required: true },
    availabilityWindow: { type: String, default: 'Immediate Pickup' },
    pricePerTon: { type: Number, default: 1000 },
  },
  { _id: false }
);

const wasteLotSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    generatorId: {
      type: mongoose.Schema.Types.Mixed,
      ref: 'User',
    },
    generatorContact: {
      type: String,
      trim: true,
    },
    generatorName: {
      type: String,
      required: [true, 'Please provide generator name'],
      trim: true,
    },
    generatorType: {
      type: String,
      default: 'Agricultural Enterprise',
      trim: true,
    },
    fingerprint: {
      type: wasteFingerprintSchema,
      required: true,
    },
    status: {
      type: String,
      enum: [
        'LISTED',
        'ANALYZED',
        'MATCH_REQUESTED',
        'REJECTED',
        'MATCHED',
        'PICKUP',
        'IN_TRANSIT',
        'AT_GATE',
        'DELIVERED',
        'PROCESSING',
        'COMPLETED',
      ],
      default: 'LISTED',
    },
    selectedPathway: {
      type: String,
      enum: ['BIOCHAR', 'BIOGAS', 'COMPOSTING', 'SYNTHETICS'],
    },
    requestedFacilityId: { type: String },
    requestedFacilityName: { type: String },
    requestedFacilities: [requestedFacilitySchema],
    rejectionReason: { type: String },
    gateArrivalTime: { type: String },
    matchedFacilityId: { type: String },
    matchedFacilityName: { type: String },
    matchedFacilityType: { type: String },
    matchedFacilityLocation: { type: locationPointSchema },
    timeline: [timelineEntrySchema],
    logistics: { type: logisticsSchema },
    impactMetrics: { type: impactMetricsSchema },
    processingYield: { type: processingYieldSchema },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('WasteLot', wasteLotSchema);
