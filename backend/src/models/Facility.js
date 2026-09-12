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

const facilitySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide facility name'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['BIOCHAR', 'BIOGAS', 'COMPOSTING', 'SYNTHETICS'],
      required: true,
    },
    acceptedWasteTypes: [
      {
        type: String,
        enum: [
          'AGRICULTURAL_RESIDUE',
          'FOOD_WASTE',
          'ANIMAL_MANURE',
          'BIOMASS_WOOD',
          'MUNICIPAL_ORGANIC',
        ],
      },
    ],
    maxCapacityTonnes: {
      type: Number,
      required: true,
      default: 50.0,
    },
    availableCapacityTonnes: {
      type: Number,
      required: true,
      default: 25.0,
    },
    location: {
      type: locationPointSchema,
      required: true,
    },
    processingCostPerTon: {
      type: Number,
      required: true,
      default: 1000,
    },
    carbonFactorPerTon: {
      type: Number,
      required: true,
      default: 0.4,
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    contactEmail: {
      type: String,
      trim: true,
      default: 'operations@carboncycle.io',
    },
    activeBatchesCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'FULL', 'MAINTENANCE'],
      default: 'ACTIVE',
    },
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Facility', facilitySchema);
