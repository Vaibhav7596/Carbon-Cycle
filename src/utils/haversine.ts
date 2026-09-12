/**
 * Haversine formula to compute straight-line distance (km) between two geographical coordinates
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Earth radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place, e.g. 18.4 km
}

/**
 * Calculate estimated transit travel time in minutes based on average 35 km/h truck speed
 */
export function calculateTravelTimeMinutes(distanceKm: number): number {
  if (!distanceKm || distanceKm <= 0) return 0;
  const hours = distanceKm / 35;
  return Math.max(5, Math.round(hours * 60)); // Minimum 5 mins
}

/**
 * Calculate estimated transport emissions (tCO2e) based on distance & payload tonnage
 */
export function calculateTransportEmissionsCO2e(
  distanceKm: number,
  quantityTonnes: number = 10
): number {
  if (!distanceKm || distanceKm <= 0) return 0;
  // 0.00012 tCO2e per km-ton (0.12 kgCO2e/km-ton diesel assumption)
  const emissions = distanceKm * quantityTonnes * 0.00012;
  return Math.round(emissions * 100) / 100; // Round to 2 decimal places e.g. 0.09
}
