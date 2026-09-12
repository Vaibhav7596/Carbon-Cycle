import { EmissionFactors, Facility, PathwaySuitability, WasteLot, WasteType } from '../types';

export const DEFAULT_EMISSION_FACTORS: EmissionFactors = {
  landfillAvoidancePerTon: {
    AGRICULTURAL_RESIDUE: 0.75, // tCO2e avoided per ton diverted from open burning / landfill
    FOOD_WASTE: 1.15,          // tCO2e avoided per ton (prevents methane CH4 generation)
    ANIMAL_MANURE: 0.95,       // tCO2e avoided per ton
    BIOMASS_WOOD: 0.65,        // tCO2e avoided per ton
    MUNICIPAL_ORGANIC: 0.85,   // tCO2e avoided per ton
  },
  transportEmissionsPerKmTon: 0.00012, // 0.12 kgCO2e per km-ton (diesel truck assumption)
  transportCostPerKmTon: 12,          // ₹12 per km-ton
  pathwayCarbonStoredPerTon: {
    BIOCHAR: 0.45,    // 450 kgCO2e permanent carbon sequestered per ton biochar output
    BIOGAS: 0.25,     // 250 kgCO2e displaced fossil fuels per ton
    COMPOSTING: 0.12, // 120 kgCO2e soil organic carbon boost per ton
    SYNTHETICS: 0.30  // 300 kgCO2e stored
  },
  pathwayProcessingEmissionsPerTon: {
    BIOCHAR: 0.08,    // 80 kgCO2e processing footprint per ton
    BIOGAS: 0.05,     // 50 kgCO2e processing footprint per ton
    COMPOSTING: 0.03, // 30 kgCO2e processing footprint per ton
    SYNTHETICS: 0.10  // 100 kgCO2e processing footprint per ton
  },
  carbonIncentiveRatePerTonCO2e: 850, // ₹850 indicative carbon incentive value per tCO2e benefit
};

export const WASTE_TYPE_LABELS: Record<WasteType, { label: string; description: string; defaultMoisture: number; defaultPrice: number }> = {
  AGRICULTURAL_RESIDUE: {
    label: "Agricultural Residue",
    description: "Crop stalks, straw, husk, sugarcane bagasse, and stubble",
    defaultMoisture: 18,
    defaultPrice: 1200,
  },
  FOOD_WASTE: {
    label: "Food Waste",
    description: "Commercial kitchen waste, market organic prep waste, spoilt produce",
    defaultMoisture: 72,
    defaultPrice: 500,
  },
  ANIMAL_MANURE: {
    label: "Animal Manure",
    description: "Cattle dung, poultry litter, livestock waste",
    defaultMoisture: 80,
    defaultPrice: 350,
  },
  BIOMASS_WOOD: {
    label: "Biomass & Wood Waste",
    description: "Prunings, sawdust, timber scraps, forestry waste",
    defaultMoisture: 15,
    defaultPrice: 1500,
  },
  MUNICIPAL_ORGANIC: {
    label: "Municipal Organic Waste",
    description: "Segregated household food prep & yard waste",
    defaultMoisture: 65,
    defaultPrice: 400,
  },
};

export const PATHWAY_DEFINITIONS: Record<string, PathwaySuitability> = {
  BIOCHAR: {
    pathway: 'BIOCHAR',
    title: 'Biochar Pyrolysis',
    suitabilityScore: 95,
    description: 'High-temperature thermochemical conversion in low-oxygen environment creating highly stable carbon biochar for soil enhancement and carbon sequestration.',
    recommended: true,
    pros: [
      'High long-term carbon sequestration (hundreds of years)',
      'Improves soil moisture retention and soil fertility',
      'Ideal for low-moisture dry biomass residue'
    ],
    cons: [
      'Requires low moisture content (< 25%)',
      'Higher capital investment for pyrolysis equipment'
    ],
    expectedYield: '0.35 tonnes Biochar per tonne dry input + Process Heat',
    landfillAvoidanceFactor: 0.75,
    carbonStoredFactor: 0.45,
    processingEmissionFactor: 0.08,
  },
  BIOGAS: {
    pathway: 'BIOGAS',
    title: 'Anaerobic Digestion / Biogas',
    suitabilityScore: 90,
    description: 'Biological breakdown of organic matter producing biomethane for clean electricity, cooking fuel, or vehicle compressed bio-gas (CBG) plus bio-slurry fertilizer.',
    recommended: true,
    pros: [
      'Excellent for high-moisture organic waste (> 60%)',
      'Generates direct renewable energy & bio-fertilizer',
      'Displaces fossil natural gas usage'
    ],
    cons: [
      'Requires steady feedstock supply',
      'Sensitive to chemical contamination'
    ],
    expectedYield: '65–85 m³ Biogas per tonne wet waste + Bio-fertilizer',
    landfillAvoidanceFactor: 1.15,
    carbonStoredFactor: 0.25,
    processingEmissionFactor: 0.05,
  },
  COMPOSTING: {
    pathway: 'COMPOSTING',
    title: 'Aerobic Composting',
    suitabilityScore: 78,
    description: 'Decomposition of organic waste by aerobic microorganisms to produce nutrient-rich humus soil amendment.',
    recommended: false,
    pros: [
      'Low capital expense & easy operational deployment',
      'Produces valuable soil amendment for local agriculture',
      'Handles varied organic fractions'
    ],
    cons: [
      'Slower processing cycle (21–45 days)',
      'Lower direct carbon sequestration compared to Biochar'
    ],
    expectedYield: '0.40 tonnes Organic Compost per tonne waste',
    landfillAvoidanceFactor: 0.85,
    carbonStoredFactor: 0.12,
    processingEmissionFactor: 0.03,
  },
  SYNTHETICS: {
    pathway: 'SYNTHETICS',
    title: 'Biomass Densification / Pellets',
    suitabilityScore: 70,
    description: 'Mechanical compression into high-density solid biofuel pellets for industrial boilers.',
    recommended: false,
    pros: [
      'Standardized fuel specification with high energy density',
      'Easy long-distance transportation and storage'
    ],
    cons: [
      'Carbon is ultimately released during combustion',
      'Requires strict drying and particle sizing'
    ],
    expectedYield: '0.85 tonnes Biomass Pellets per tonne dry feedstock',
    landfillAvoidanceFactor: 0.65,
    carbonStoredFactor: 0.10,
    processingEmissionFactor: 0.06,
  }
};

export const SEEDED_FACILITIES: Facility[] = [
  {
    id: 'FAC-001',
    name: 'Gujarat EcoChar Pyrolysis Center',
    type: 'BIOCHAR',
    acceptedWasteTypes: ['AGRICULTURAL_RESIDUE', 'BIOMASS_WOOD'],
    maxCapacityTonnes: 50.0,
    availableCapacityTonnes: 25.0,
    location: {
      name: 'Gandhinagar Bio-Park',
      address: 'Plot 42, GIDC Sector 28, Gandhinagar, Gujarat',
      lat: 23.2450,
      lng: 72.6520,
    },
    processingCostPerTon: 1200,
    carbonFactorPerTon: 0.45,
    rating: 4.9,
    contactEmail: 'operations@ecochar.in',
    activeBatchesCount: 8,
    status: 'ACTIVE',
  },
  {
    id: 'FAC-002',
    name: 'GreenBio Energy & Biogas Plant',
    type: 'BIOGAS',
    acceptedWasteTypes: ['FOOD_WASTE', 'ANIMAL_MANURE', 'MUNICIPAL_ORGANIC'],
    maxCapacityTonnes: 40.0,
    availableCapacityTonnes: 18.5,
    location: {
      name: 'Naroda Industrial Estate',
      address: 'GIDC Phase 3, Naroda, Ahmedabad, Gujarat',
      lat: 23.0850,
      lng: 72.5950,
    },
    processingCostPerTon: 850,
    carbonFactorPerTon: 0.25,
    rating: 4.8,
    contactEmail: 'supply@greenbioenergy.co.in',
    activeBatchesCount: 12,
    status: 'ACTIVE',
  },
  {
    id: 'FAC-003',
    name: 'Sabarmati Organic Composting Hub',
    type: 'COMPOSTING',
    acceptedWasteTypes: ['FOOD_WASTE', 'AGRICULTURAL_RESIDUE', 'ANIMAL_MANURE', 'MUNICIPAL_ORGANIC'],
    maxCapacityTonnes: 60.0,
    availableCapacityTonnes: 35.0,
    location: {
      name: 'Sanand Agro Park',
      address: 'Sanand GIDC Agro Zone, Ahmedabad, Gujarat',
      lat: 22.9950,
      lng: 72.4050,
    },
    processingCostPerTon: 600,
    carbonFactorPerTon: 0.12,
    rating: 4.6,
    contactEmail: 'intake@sabarmatiorganics.org',
    activeBatchesCount: 15,
    status: 'ACTIVE',
  },
  {
    id: 'FAC-004',
    name: 'TerraCarbon Advanced Pyrolysis Plant',
    type: 'BIOCHAR',
    acceptedWasteTypes: ['AGRICULTURAL_RESIDUE', 'BIOMASS_WOOD'],
    maxCapacityTonnes: 30.0,
    availableCapacityTonnes: 12.0,
    location: {
      name: 'Kalol Clean Tech Zone',
      address: 'Highway 41, Kalol, Gandhinagar District, Gujarat',
      lat: 23.2400,
      lng: 72.5100,
    },
    processingCostPerTon: 1400,
    carbonFactorPerTon: 0.48,
    rating: 4.7,
    contactEmail: 'plant@terracarbon.io',
    activeBatchesCount: 5,
    status: 'ACTIVE',
  },
  {
    id: 'FAC-005',
    name: 'CleanGas Biomethanation Plant',
    type: 'BIOGAS',
    acceptedWasteTypes: ['ANIMAL_MANURE', 'FOOD_WASTE'],
    maxCapacityTonnes: 50.0,
    availableCapacityTonnes: 22.0,
    location: {
      name: 'Kheda Agri Bio Complex',
      address: 'National Highway 8, Kheda, Gujarat',
      lat: 22.7600,
      lng: 72.7000,
    },
    processingCostPerTon: 900,
    carbonFactorPerTon: 0.28,
    rating: 4.5,
    contactEmail: 'operations@cleangas.in',
    activeBatchesCount: 7,
    status: 'ACTIVE',
  }
];

export const SEEDED_WASTE_LOTS: WasteLot[] = [
  {
    id: 'W2C-2026-00125',
    createdAt: '2026-09-12T08:30:00Z',
    generatorName: 'Gandhinagar Farmers Co-op',
    generatorType: 'Agricultural Farm',
    fingerprint: {
      wasteType: 'AGRICULTURAL_RESIDUE',
      quantityTonnes: 10.0,
      moisturePercent: 15,
      organicFractionPercent: 92,
      contaminationPercent: 2,
      location: {
        name: 'Gandhinagar Farm Belt',
        address: 'Sector 30 Agriculture Area, Gandhinagar, Gujarat',
        lat: 23.2156,
        lng: 72.6369,
      },
      availabilityWindow: 'Immediate Pickup',
      pricePerTon: 1200,
    },
    status: 'MATCHED',
    selectedPathway: 'BIOCHAR',
    matchedFacilityId: 'FAC-001',
    matchedFacilityName: 'Gujarat EcoChar Pyrolysis Center',
    matchedFacilityType: 'BIOCHAR',
    matchedFacilityLocation: {
      name: 'Gandhinagar Bio-Park',
      address: 'Plot 42, GIDC Sector 28, Gandhinagar, Gujarat',
      lat: 23.2450,
      lng: 72.6520,
    },
    timeline: [
      { status: 'LISTED', timestamp: '2026-09-12 08:30', note: 'Waste registered by Gandhinagar Farmers Co-op' },
      { status: 'ANALYZED', timestamp: '2026-09-12 08:32', note: 'Fingerprint generated: Biochar recommended (94% score)' },
      { status: 'MATCHED', timestamp: '2026-09-12 08:35', note: 'Matched & confirmed with Gujarat EcoChar Pyrolysis Center' },
    ],
    logistics: {
      driverName: 'Ramesh Patel',
      truckNumber: 'GJ-18-BC-4092',
      distanceKm: 4.8,
      estimatedHours: 0.3,
      transportCost: 576,
      transportCO2e: 0.0058,
      pickupTime: '2026-09-12 11:00',
    },
    impactMetrics: {
      wasteDivertedTonnes: 10.0,
      landfillAvoidedCO2e: 7.5,
      carbonStoredCO2e: 4.5,
      transportEmissionsCO2e: 0.0058,
      processingEmissionsCO2e: 0.8,
      netClimateImpactCO2e: 11.1942,
      wasteValue: 12000,
      carbonIncentiveValue: 9515,
      transportCost: 576,
      netEconomicValue: 20939,
    },
    processingYield: {
      outputType: 'Biochar & Bio-oil',
      outputQuantity: '3.5 tonnes Biochar',
      progressPercent: 0,
      startedAt: 'Pending Arrival',
      estimatedCompletionAt: '2026-09-12 18:00',
    }
  },
  {
    id: 'W2C-2026-00124',
    createdAt: '2026-09-11T14:15:00Z',
    generatorName: 'Ahmedabad APMC Produce Market',
    generatorType: 'Commercial Wholesale Market',
    fingerprint: {
      wasteType: 'FOOD_WASTE',
      quantityTonnes: 8.5,
      moisturePercent: 74,
      organicFractionPercent: 96,
      contaminationPercent: 1,
      location: {
        name: 'Ahmedabad APMC Yard',
        address: 'Vasna Market Road, Ahmedabad, Gujarat',
        lat: 23.0225,
        lng: 72.5714,
      },
      availabilityWindow: 'Daily Collection',
      pricePerTon: 500,
    },
    status: 'PROCESSING',
    selectedPathway: 'BIOGAS',
    matchedFacilityId: 'FAC-002',
    matchedFacilityName: 'GreenBio Energy & Biogas Plant',
    matchedFacilityType: 'BIOGAS',
    matchedFacilityLocation: {
      name: 'Naroda Industrial Estate',
      address: 'GIDC Phase 3, Naroda, Ahmedabad, Gujarat',
      lat: 23.0850,
      lng: 72.5950,
    },
    timeline: [
      { status: 'LISTED', timestamp: '2026-09-11 14:15', note: 'Waste registered by APMC Market' },
      { status: 'ANALYZED', timestamp: '2026-09-11 14:18', note: 'Fingerprint generated: Biogas recommended (96% score)' },
      { status: 'MATCHED', timestamp: '2026-09-11 14:25', note: 'Facility match approved by GreenBio Energy' },
      { status: 'PICKUP', timestamp: '2026-09-11 16:00', note: 'Truck assigned and en-route to APMC yard' },
      { status: 'IN_TRANSIT', timestamp: '2026-09-11 17:10', note: 'Picked up 8.5 tonnes food waste' },
      { status: 'DELIVERED', timestamp: '2026-09-11 18:30', note: 'Weighed & delivered at Naroda plant' },
      { status: 'PROCESSING', timestamp: '2026-09-11 19:00', note: 'Fed into Anaerobic Digester #2' },
    ],
    logistics: {
      driverName: 'Suresh Kumar',
      truckNumber: 'GJ-01-CV-9821',
      distanceKm: 11.2,
      estimatedHours: 0.6,
      transportCost: 1142,
      transportCO2e: 0.0114,
      pickupTime: '2026-09-11 16:00',
      deliveryTime: '2026-09-11 18:30',
    },
    impactMetrics: {
      wasteDivertedTonnes: 8.5,
      landfillAvoidedCO2e: 9.775,
      carbonStoredCO2e: 2.125,
      transportEmissionsCO2e: 0.0114,
      processingEmissionsCO2e: 0.425,
      netClimateImpactCO2e: 11.4636,
      wasteValue: 4250,
      carbonIncentiveValue: 9744,
      transportCost: 1142,
      netEconomicValue: 12852,
    },
    processingYield: {
      outputType: 'Biomethane (CBG) & Bio-slurry',
      outputQuantity: '680 m³ Biogas',
      progressPercent: 78,
      startedAt: '2026-09-11 19:00',
      estimatedCompletionAt: '2026-09-12 19:00',
    }
  },
  {
    id: 'W2C-2026-00120',
    createdAt: '2026-09-10T10:00:00Z',
    generatorName: 'Sanand Agro Processing Ltd',
    generatorType: 'Food Processing Industry',
    fingerprint: {
      wasteType: 'BIOMASS_WOOD',
      quantityTonnes: 15.0,
      moisturePercent: 12,
      organicFractionPercent: 98,
      contaminationPercent: 0.5,
      location: {
        name: 'Sanand Industrial Estate',
        address: 'GIDC Phase 2, Sanand, Gujarat',
        lat: 22.9897,
        lng: 72.3810,
      },
      availabilityWindow: 'Scheduled Weekly',
      pricePerTon: 1500,
    },
    status: 'COMPLETED',
    selectedPathway: 'BIOCHAR',
    matchedFacilityId: 'FAC-001',
    matchedFacilityName: 'Gujarat EcoChar Pyrolysis Center',
    matchedFacilityType: 'BIOCHAR',
    matchedFacilityLocation: {
      name: 'Gandhinagar Bio-Park',
      address: 'Plot 42, GIDC Sector 28, Gandhinagar, Gujarat',
      lat: 23.2450,
      lng: 72.6520,
    },
    timeline: [
      { status: 'LISTED', timestamp: '2026-09-10 10:00', note: '15.0 tonnes biomass waste listed' },
      { status: 'ANALYZED', timestamp: '2026-09-10 10:05', note: 'Fingerprint complete: High pyrolysis value' },
      { status: 'MATCHED', timestamp: '2026-09-10 10:30', note: 'Matched with Gujarat EcoChar Facility' },
      { status: 'PICKUP', timestamp: '2026-09-10 12:00', note: 'Heavy logistics vehicle dispatched' },
      { status: 'IN_TRANSIT', timestamp: '2026-09-10 13:30', note: 'Transit in progress' },
      { status: 'DELIVERED', timestamp: '2026-09-10 15:15', note: 'Delivered and weight verified' },
      { status: 'PROCESSING', timestamp: '2026-09-10 16:00', note: 'Pyrolysis kiln batch run #402' },
      { status: 'COMPLETED', timestamp: '2026-09-11 12:00', note: 'Biochar extracted & certified in platform' },
    ],
    logistics: {
      driverName: 'Vikram Singh',
      truckNumber: 'GJ-18-TT-1002',
      distanceKm: 42.5,
      estimatedHours: 1.2,
      transportCost: 7650,
      transportCO2e: 0.0765,
      pickupTime: '2026-09-10 12:00',
      deliveryTime: '2026-09-10 15:15',
    },
    impactMetrics: {
      wasteDivertedTonnes: 15.0,
      landfillAvoidedCO2e: 9.75,
      carbonStoredCO2e: 6.75,
      transportEmissionsCO2e: 0.0765,
      processingEmissionsCO2e: 1.2,
      netClimateImpactCO2e: 15.2235,
      wasteValue: 22500,
      carbonIncentiveValue: 12940,
      transportCost: 7650,
      netEconomicValue: 27790,
    },
    processingYield: {
      outputType: 'Agricultural Grade Biochar',
      outputQuantity: '5.25 tonnes Biochar',
      progressPercent: 100,
      startedAt: '2026-09-10 16:00',
      estimatedCompletionAt: '2026-09-11 12:00',
    }
  },
  {
    id: 'W2C-2026-00118',
    createdAt: '2026-09-09T09:00:00Z',
    generatorName: 'Kheda Dairy Cooperative',
    generatorType: 'Livestock Cooperative',
    fingerprint: {
      wasteType: 'ANIMAL_MANURE',
      quantityTonnes: 12.0,
      moisturePercent: 82,
      organicFractionPercent: 90,
      contaminationPercent: 1,
      location: {
        name: 'Kheda Dairy Sector',
        address: 'Station Road, Kheda, Gujarat',
        lat: 22.7533,
        lng: 72.6868,
      },
      availabilityWindow: 'Immediate',
      pricePerTon: 350,
    },
    status: 'IN_TRANSIT',
    selectedPathway: 'BIOGAS',
    matchedFacilityId: 'FAC-005',
    matchedFacilityName: 'CleanGas Biomethanation Plant',
    matchedFacilityType: 'BIOGAS',
    matchedFacilityLocation: {
      name: 'Kheda Agri Bio Complex',
      address: 'National Highway 8, Kheda, Gujarat',
      lat: 22.7600,
      lng: 72.7000,
    },
    timeline: [
      { status: 'LISTED', timestamp: '2026-09-09 09:00', note: '12 tonnes manure listed' },
      { status: 'ANALYZED', timestamp: '2026-09-09 09:05', note: 'Biogas pathway chosen' },
      { status: 'MATCHED', timestamp: '2026-09-09 09:20', note: 'CleanGas Plant accepted' },
      { status: 'PICKUP', timestamp: '2026-09-09 10:30', note: 'Tanker truck assigned' },
      { status: 'IN_TRANSIT', timestamp: '2026-09-09 11:15', note: 'En route to biomethanation unit' },
    ],
    logistics: {
      driverName: 'Manish Shah',
      truckNumber: 'GJ-07-BL-3310',
      distanceKm: 2.1,
      estimatedHours: 0.15,
      transportCost: 302,
      transportCO2e: 0.003,
      pickupTime: '2026-09-09 10:30',
    },
    impactMetrics: {
      wasteDivertedTonnes: 12.0,
      landfillAvoidedCO2e: 11.4,
      carbonStoredCO2e: 3.0,
      transportEmissionsCO2e: 0.003,
      processingEmissionsCO2e: 0.6,
      netClimateImpactCO2e: 13.797,
      wasteValue: 4200,
      carbonIncentiveValue: 11727,
      transportCost: 302,
      netEconomicValue: 15625,
    },
    processingYield: {
      outputType: 'Biomethane & Organic Liquid Fertilizer',
      outputQuantity: '960 m³ Biogas',
      progressPercent: 0,
      startedAt: 'Pending Delivery',
      estimatedCompletionAt: '2026-09-13 11:00',
    }
  }
];
