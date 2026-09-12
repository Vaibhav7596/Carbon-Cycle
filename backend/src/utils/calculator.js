const LANDFILL_FACTORS = {
  AGRICULTURAL_RESIDUE: 0.75,
  FOOD_WASTE: 1.15,
  ANIMAL_MANURE: 0.95,
  BIOMASS_WOOD: 0.65,
  MUNICIPAL_ORGANIC: 0.85,
};

const STORED_FACTORS = {
  BIOCHAR: 0.45,
  BIOGAS: 0.25,
  COMPOSTING: 0.12,
  SYNTHETICS: 0.30,
};

const PROCESSING_FACTORS = {
  BIOCHAR: 0.08,
  BIOGAS: 0.05,
  COMPOSTING: 0.03,
  SYNTHETICS: 0.10,
};

function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = Math.round(R * c * 10) / 10;
  return dist || 1.0;
}

function calculateBatchImpact(fingerprint, pathway, distanceKm = 10) {
  const quantity = fingerprint.quantityTonnes || 10;
  const wasteType = fingerprint.wasteType || 'AGRICULTURAL_RESIDUE';

  const landfillAvoidanceFactor = LANDFILL_FACTORS[wasteType] || 0.75;
  const carbonStoredFactor = STORED_FACTORS[pathway] || 0.45;
  const processingFactor = PROCESSING_FACTORS[pathway] || 0.08;

  const landfillAvoidedCO2e = Math.round(quantity * landfillAvoidanceFactor * 1000) / 1000;
  const carbonStoredCO2e = Math.round(quantity * carbonStoredFactor * 1000) / 1000;
  const transportEmissionsCO2e = Math.round(distanceKm * quantity * 0.00012 * 10000) / 10000;
  const processingEmissionsCO2e = Math.round(quantity * processingFactor * 1000) / 1000;

  const netClimateImpactCO2e =
    Math.round(
      (landfillAvoidedCO2e + carbonStoredCO2e - transportEmissionsCO2e - processingEmissionsCO2e) *
        10000
    ) / 10000;

  const wasteValue = Math.round(quantity * (fingerprint.pricePerTon || 1000));
  const carbonIncentiveValue = Math.round(netClimateImpactCO2e * 850);
  const transportCost = Math.round(distanceKm * quantity * 12);
  const netEconomicValue = wasteValue + carbonIncentiveValue - transportCost;

  return {
    wasteDivertedTonnes: quantity,
    landfillAvoidedCO2e,
    carbonStoredCO2e,
    transportEmissionsCO2e,
    processingEmissionsCO2e,
    netClimateImpactCO2e,
    wasteValue,
    carbonIncentiveValue,
    transportCost,
    netEconomicValue,
  };
}

module.exports = {
  calculateHaversineDistance,
  calculateBatchImpact,
};
