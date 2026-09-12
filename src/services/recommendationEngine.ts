import { DEFAULT_EMISSION_FACTORS, PATHWAY_DEFINITIONS, WASTE_TYPE_LABELS } from '../data/constants';
import { Facility, FacilityMatchResult, PathwaySuitability, PathwayType, WasteFingerprint } from '../types';

// Haversine formula to compute geographical distance in km between two lat/lng points
export function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // 1 decimal place
}

export function evaluatePathwaySuitability(fingerprint: WasteFingerprint): PathwaySuitability[] {
  const { wasteType, moisturePercent, organicFractionPercent, contaminationPercent } = fingerprint;

  const pathways: PathwayType[] = ['BIOCHAR', 'BIOGAS', 'COMPOSTING', 'SYNTHETICS'];

  const results: PathwaySuitability[] = pathways.map((pKey) => {
    const baseDef = PATHWAY_DEFINITIONS[pKey];
    let score = 50;

    // Rule-based logic according to moisture, organic %, contamination & waste type
    if (pKey === 'BIOCHAR') {
      if (wasteType === 'AGRICULTURAL_RESIDUE' || wasteType === 'BIOMASS_WOOD') score += 35;
      if (moisturePercent <= 25) score += 15;
      else if (moisturePercent > 40) score -= 30; // Biochar needs dry feedstock
      if (organicFractionPercent >= 85) score += 10;
    } else if (pKey === 'BIOGAS') {
      if (wasteType === 'FOOD_WASTE' || wasteType === 'ANIMAL_MANURE' || wasteType === 'MUNICIPAL_ORGANIC') score += 35;
      if (moisturePercent >= 50) score += 15; // Biogas loves moist organic waste
      if (contaminationPercent < 5) score += 10;
      else score -= 25;
    } else if (pKey === 'COMPOSTING') {
      if (wasteType === 'FOOD_WASTE' || wasteType === 'ANIMAL_MANURE' || wasteType === 'AGRICULTURAL_RESIDUE') score += 25;
      if (moisturePercent >= 30 && moisturePercent <= 65) score += 15;
      if (contaminationPercent < 8) score += 10;
    } else if (pKey === 'SYNTHETICS') {
      if (wasteType === 'BIOMASS_WOOD' || wasteType === 'AGRICULTURAL_RESIDUE') score += 30;
      if (moisturePercent <= 20) score += 15;
      else score -= 20;
    }

    // Clamp score 0 - 100
    score = Math.max(10, Math.min(99, Math.round(score)));

    return {
      ...baseDef,
      suitabilityScore: score,
      recommended: score >= 85,
    };
  });

  // Sort descending by score
  return results.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
}

export function matchFacilitiesForWaste(
  fingerprint: WasteFingerprint,
  facilities: Facility[],
  preferredPathway?: PathwayType
): FacilityMatchResult[] {
  // Evaluate suitability first
  const pathwayScores = evaluatePathwaySuitability(fingerprint);
  const topPathway = preferredPathway || pathwayScores[0].pathway;

  const matches: FacilityMatchResult[] = facilities.map((fac) => {
    // 1. Compatibility score (40% weight)
    const isExactTypeMatch = fac.type === topPathway;
    const isWasteAccepted = fac.acceptedWasteTypes.includes(fingerprint.wasteType);
    let compatibilityScore = 0;

    if (isExactTypeMatch && isWasteAccepted) compatibilityScore = 100;
    else if (isWasteAccepted) compatibilityScore = 75;
    else if (isExactTypeMatch) compatibilityScore = 60;
    else compatibilityScore = 20;

    // 2. Distance score (25% weight)
    const distanceKm = calculateHaversineDistance(
      fingerprint.location.lat,
      fingerprint.location.lng,
      fac.location.lat,
      fac.location.lng
    );

    // Distance decay: < 10km = 100, 10-50km = linear decay, > 100km = 20
    let distanceScore = 100;
    if (distanceKm > 100) distanceScore = 20;
    else if (distanceKm > 10) distanceScore = Math.round(100 - ((distanceKm - 10) / 90) * 80);

    // 3. Capacity score (20% weight)
    const capacityRatio = fac.availableCapacityTonnes / fingerprint.quantityTonnes;
    let capacityScore = 0;
    if (capacityRatio >= 2.0) capacityScore = 100;
    else if (capacityRatio >= 1.0) capacityScore = 90;
    else if (capacityRatio >= 0.5) capacityScore = 50;
    else capacityScore = 10;

    // 4. Carbon benefit score (15% weight)
    const landfillAvoided = fingerprint.quantityTonnes * (DEFAULT_EMISSION_FACTORS.landfillAvoidancePerTon[fingerprint.wasteType] || 0.8);
    const carbonStored = fingerprint.quantityTonnes * (DEFAULT_EMISSION_FACTORS.pathwayCarbonStoredPerTon[fac.type] || 0.3);
    const transportEmissions = distanceKm * fingerprint.quantityTonnes * DEFAULT_EMISSION_FACTORS.transportEmissionsPerKmTon;
    const processingEmissions = fingerprint.quantityTonnes * (DEFAULT_EMISSION_FACTORS.pathwayProcessingEmissionsPerTon[fac.type] || 0.05);

    const netCarbon = Math.max(0, landfillAvoided + carbonStored - transportEmissions - processingEmissions);
    // Normalize netCarbon (e.g. 1 ton net CO2e per ton waste = 100%)
    const carbonScore = Math.min(100, Math.round((netCarbon / fingerprint.quantityTonnes) * 80));

    // Weighted Total Score (PRD Formula)
    // Score = Compatibility x 40% + Distance x 25% + Capacity x 20% + Carbon x 15%
    const totalMatchScore = Math.round(
      compatibilityScore * 0.40 +
      distanceScore * 0.25 +
      capacityScore * 0.20 +
      carbonScore * 0.15
    );

    // Economic & transport metrics
    const estimatedTransportCost = Math.round(distanceKm * fingerprint.quantityTonnes * DEFAULT_EMISSION_FACTORS.transportCostPerKmTon);
    const wasteVal = fingerprint.quantityTonnes * fingerprint.pricePerTon;
    const carbonInc = Math.round(netCarbon * DEFAULT_EMISSION_FACTORS.carbonIncentiveRatePerTonCO2e);
    const netEconomicVal = wasteVal + carbonInc - estimatedTransportCost;

    // Explainability reasoning bullet points
    const reasoning: string[] = [];
    if (isWasteAccepted) reasoning.push(`Directly accepts ${WASTE_TYPE_LABELS[fingerprint.wasteType]?.label || fingerprint.wasteType}`);
    else reasoning.push(`Requires feedstock pre-treatment for ${fingerprint.wasteType}`);

    if (distanceKm <= 10) reasoning.push(`Proximity advantage: Only ${distanceKm} km transit distance`);
    else reasoning.push(`Transit distance: ${distanceKm} km from waste origin`);

    if (capacityRatio >= 1.0) reasoning.push(`Ample processing capacity available (${fac.availableCapacityTonnes} t available vs ${fingerprint.quantityTonnes} t batch)`);
    else reasoning.push(`Limited capacity: Facility only has ${fac.availableCapacityTonnes} t remaining capacity`);

    reasoning.push(`Estimated net climate impact: +${netCarbon.toFixed(2)} tCO₂e avoided/stored`);

    return {
      facility: fac,
      matchScore: totalMatchScore,
      scoreBreakdown: {
        compatibility: compatibilityScore,
        distance: distanceScore,
        capacity: capacityScore,
        carbonBenefit: carbonScore,
      },
      distanceKm,
      estimatedTransportCost,
      transportCO2e: Math.round(transportEmissions * 10000) / 10000,
      netCO2eBenefit: Math.round(netCarbon * 100) / 100,
      netEconomicValue: netEconomicVal,
      reasoning,
      rank: 0,
    };
  });

  // Sort descending by match score and set rank
  const sorted = matches.sort((a, b) => b.matchScore - a.matchScore);
  sorted.forEach((m, idx) => {
    m.rank = idx + 1;
  });

  return sorted;
}
