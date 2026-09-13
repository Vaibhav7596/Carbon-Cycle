export type WasteType = 
  | 'AGRICULTURAL_RESIDUE'
  | 'FOOD_WASTE'
  | 'ANIMAL_MANURE'
  | 'BIOMASS_WOOD'
  | 'MUNICIPAL_ORGANIC';

export type PathwayType = 
  | 'BIOCHAR'
  | 'BIOGAS'
  | 'COMPOSTING'
  | 'SYNTHETICS';

export type WasteStatus = 
  | 'LISTED'
  | 'ANALYZED'
  | 'MATCH_REQUESTED'
  | 'MATCHED'
  | 'REJECTED'
  | 'PICKUP'
  | 'IN_TRANSIT'
  | 'AT_GATE'
  | 'DELIVERED'
  | 'PROCESSING'
  | 'COMPLETED';

export interface LocationPoint {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export interface WasteFingerprint {
  wasteType: WasteType;
  quantityTonnes: number;
  moisturePercent: number;
  organicFractionPercent: number;
  contaminationPercent: number;
  location: LocationPoint;
  availabilityWindow: string;
  pricePerTon: number;
}

export interface Facility {
  id: string;
  name: string;
  type: PathwayType;
  acceptedWasteTypes: WasteType[];
  maxCapacityTonnes: number;
  availableCapacityTonnes: number;
  location: LocationPoint;
  processingCostPerTon: number;
  carbonFactorPerTon: number;
  rating: number;
  contactEmail?: string;
  activeBatchesCount: number;
  status: 'ACTIVE' | 'FULL' | 'MAINTENANCE';
  operatorId?: string;
}

export interface PathwaySuitability {
  pathway: PathwayType;
  title: string;
  suitabilityScore: number; // 0 to 100
  description: string;
  recommended: boolean;
  pros: string[];
  cons: string[];
  expectedYield: string;
  landfillAvoidanceFactor: number; // tCO2e per tonne
  carbonStoredFactor: number; // tCO2e per tonne
  processingEmissionFactor: number; // tCO2e per tonne
}

export interface MatchScoreBreakdown {
  compatibility: number; // out of 100
  distance: number;       // out of 100
  capacity: number;       // out of 100
  carbonBenefit: number;  // out of 100
}

export interface FacilityMatchResult {
  facility: Facility;
  matchScore: number; // 0 - 100 weighted
  scoreBreakdown: MatchScoreBreakdown;
  distanceKm: number;
  estimatedTransportCost: number;
  transportCO2e: number;
  netCO2eBenefit: number;
  netEconomicValue: number;
  reasoning: string[];
  rank: number;
}

export interface TimelineEntry {
  status: WasteStatus;
  timestamp: string;
  note: string;
}

export interface LogisticsInfo {
  driverName: string;
  truckNumber: string;
  distanceKm: number;
  estimatedHours: number;
  transportCost: number;
  transportCO2e: number;
  pickupTime: string;
  deliveryTime?: string;
}

export interface ImpactMetrics {
  wasteDivertedTonnes: number;
  landfillAvoidedCO2e: number;
  carbonStoredCO2e: number;
  transportEmissionsCO2e: number;
  processingEmissionsCO2e: number;
  netClimateImpactCO2e: number; // LandfillAvoided + Stored - Transport - Processing
  wasteValue: number;           // ₹
  carbonIncentiveValue: number; // ₹
  transportCost: number;        // ₹
  netEconomicValue: number;     // ₹
}

export interface ProcessingYield {
  outputType: string;
  outputQuantity: string;
  progressPercent: number;
  startedAt: string;
  estimatedCompletionAt: string;
}

export interface RequestedFacilityEntry {
  facilityId: string;
  facilityName: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'SUPERSEDED';
  requestedAt: string;
  rejectionReason?: string;
}

export interface FacilityRegistrationProfile {
  name?: string;
  type: PathwayType;
  maxCapacityTonnes: number;
  processingCostPerTon: number;
  acceptedWasteTypes: WasteType[];
  location?: LocationPoint;
}

export interface WasteLot {
  id: string; // e.g. W2C-2026-00125
  createdAt: string;
  generatorId?: string;
  generatorContact?: string;
  generatorName: string;
  generatorType: string;
  fingerprint: WasteFingerprint;
  status: WasteStatus;
  selectedPathway?: PathwayType;
  requestedFacilityId?: string;
  requestedFacilityName?: string;
  requestedFacilities?: RequestedFacilityEntry[];
  rejectionReason?: string;
  gateArrivalTime?: string;
  matchedFacilityId?: string;
  matchedFacilityName?: string;
  matchedFacilityType?: PathwayType;
  matchedFacilityLocation?: LocationPoint;
  timeline: TimelineEntry[];
  logistics?: LogisticsInfo;
  impactMetrics?: ImpactMetrics;
  processingYield?: ProcessingYield;
}

export interface NotificationItem {
  id: string;
  recipientRole?: 'ALL' | 'WASTE_GENERATOR' | 'FACILITY_OPERATOR';
  recipientEmail?: string;
  facilityId?: string;
  lotId?: string;
  lotDisplayId?: string;
  title: string;
  message: string;
  type: 'INTAKE_REQUEST' | 'REQUEST_ACCEPTED' | 'REQUEST_REJECTED' | 'GATE_ARRIVAL' | 'STATUS_CHANGE' | 'SYSTEM';
  read: boolean;
  actionTab?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface EmissionFactors {
  landfillAvoidancePerTon: Record<WasteType, number>; // tCO2e per ton diverted
  transportEmissionsPerKmTon: number;                 // tCO2e per km-ton
  transportCostPerKmTon: number;                      // INR per km-ton
  pathwayCarbonStoredPerTon: Record<PathwayType, number>; // tCO2e per ton processed
  pathwayProcessingEmissionsPerTon: Record<PathwayType, number>; // tCO2e per ton
  carbonIncentiveRatePerTonCO2e: number;             // INR per tCO2e indicative benefit
}
