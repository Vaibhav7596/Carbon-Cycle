import { DEFAULT_EMISSION_FACTORS } from '../data/constants';
import { Facility, ImpactMetrics, PathwayType, WasteFingerprint } from '../types';

export function calculateBatchImpact(
  fingerprint: WasteFingerprint,
  facilityType: PathwayType,
  distanceKm: number
): ImpactMetrics {
  const quantity = fingerprint.quantityTonnes;
  const wasteType = fingerprint.wasteType;

  // Landfill avoidance factor (tCO2e per ton)
  const landfillFactor = DEFAULT_EMISSION_FACTORS.landfillAvoidancePerTon[wasteType] || 0.8;
  const landfillAvoidedCO2e = quantity * landfillFactor;

  // Carbon stored factor (tCO2e per ton)
  const carbonStoredFactor = DEFAULT_EMISSION_FACTORS.pathwayCarbonStoredPerTon[facilityType] || 0.3;
  const carbonStoredCO2e = quantity * carbonStoredFactor;

  // Transport emissions (tCO2e = km * quantity * factor)
  const transportEmissionsCO2e = distanceKm * quantity * DEFAULT_EMISSION_FACTORS.transportEmissionsPerKmTon;

  // Processing emissions (tCO2e = quantity * factor)
  const processingFactor = DEFAULT_EMISSION_FACTORS.pathwayProcessingEmissionsPerTon[facilityType] || 0.05;
  const processingEmissionsCO2e = quantity * processingFactor;

  // Net Climate Impact (PRD Equation)
  // Landfill Avoided + Carbon Stored - Transport - Processing
  const netClimateImpactCO2e = landfillAvoidedCO2e + carbonStoredCO2e - transportEmissionsCO2e - processingEmissionsCO2e;

  // Economic calculation
  const wasteValue = quantity * fingerprint.pricePerTon;
  const transportCost = Math.round(distanceKm * quantity * DEFAULT_EMISSION_FACTORS.transportCostPerKmTon);
  const carbonIncentiveValue = Math.round(netClimateImpactCO2e * DEFAULT_EMISSION_FACTORS.carbonIncentiveRatePerTonCO2e);
  const netEconomicValue = wasteValue + carbonIncentiveValue - transportCost;

  return {
    wasteDivertedTonnes: quantity,
    landfillAvoidedCO2e: Math.round(landfillAvoidedCO2e * 1000) / 1000,
    carbonStoredCO2e: Math.round(carbonStoredCO2e * 1000) / 1000,
    transportEmissionsCO2e: Math.round(transportEmissionsCO2e * 10000) / 10000,
    processingEmissionsCO2e: Math.round(processingEmissionsCO2e * 1000) / 1000,
    netClimateImpactCO2e: Math.round(netClimateImpactCO2e * 1000) / 1000,
    wasteValue,
    carbonIncentiveValue,
    transportCost,
    netEconomicValue,
  };
}
