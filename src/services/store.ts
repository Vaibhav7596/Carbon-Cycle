import { SEEDED_FACILITIES, SEEDED_WASTE_LOTS } from '../data/constants';
import { Facility, PathwayType, WasteFingerprint, WasteLot, WasteStatus } from '../types';
import { calculateBatchImpact } from './carbonCalculator';
import { calculateHaversineDistance, evaluatePathwaySuitability, matchFacilitiesForWaste } from './recommendationEngine';

const STORAGE_KEY_LOTS = 'carboncycle_waste_lots_v1';
const STORAGE_KEY_FACILITIES = 'carboncycle_facilities_v1';

export function getStoredWasteLots(): WasteLot[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_LOTS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load waste lots from local storage', e);
  }
  return SEEDED_WASTE_LOTS;
}

export function saveStoredWasteLots(lots: WasteLot[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_LOTS, JSON.stringify(lots));
  } catch (e) {
    console.error('Failed to save waste lots to local storage', e);
  }
}

export function getStoredFacilities(): Facility[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_FACILITIES);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load facilities from local storage', e);
  }
  return SEEDED_FACILITIES;
}

export function saveStoredFacilities(facilities: Facility[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_FACILITIES, JSON.stringify(facilities));
  } catch (e) {
    console.error('Failed to save facilities to local storage', e);
  }
}

export function resetDemoData(): { lots: WasteLot[]; facilities: Facility[] } {
  localStorage.removeItem(STORAGE_KEY_LOTS);
  localStorage.removeItem(STORAGE_KEY_FACILITIES);
  return {
    lots: SEEDED_WASTE_LOTS,
    facilities: SEEDED_FACILITIES,
  };
}

export function createNewWasteLot(
  generatorName: string,
  generatorType: string,
  fingerprint: WasteFingerprint
): WasteLot {
  const currentLots = getStoredWasteLots();
  const nextNum = currentLots.length + 126;
  const newId = `W2C-2026-${String(nextNum).padStart(5, '0')}`;

  const suitablePathways = evaluatePathwaySuitability(fingerprint);
  const recommendedPathway = suitablePathways[0].pathway;

  const now = new Date();
  const dateStr = now.toISOString().replace('T', ' ').slice(0, 16);

  const newLot: WasteLot = {
    id: newId,
    createdAt: now.toISOString(),
    generatorName: generatorName || 'Regional Agro Source',
    generatorType: generatorType || 'Agricultural Enterprise',
    fingerprint,
    status: 'LISTED',
    selectedPathway: recommendedPathway,
    timeline: [
      {
        status: 'LISTED',
        timestamp: dateStr,
        note: `Waste batch listed by ${generatorName || 'Generator'}`,
      },
      {
        status: 'ANALYZED',
        timestamp: dateStr,
        note: `Fingerprint generated. Recommended pathway: ${recommendedPathway}`,
      }
    ],
  };

  const updatedLots = [newLot, ...currentLots];
  saveStoredWasteLots(updatedLots);
  return newLot;
}

export function matchAndSelectFacilityForLot(
  lotId: string,
  facilityId: string
): WasteLot | null {
  const lots = getStoredWasteLots();
  const facilities = getStoredFacilities();

  const lotIndex = lots.findIndex((l) => l.id === lotId);
  const targetFacility = facilities.find((f) => f.id === facilityId);

  if (lotIndex === -1 || !targetFacility) return null;

  const lot = lots[lotIndex];
  const distance = calculateHaversineDistance(
    lot.fingerprint.location.lat,
    lot.fingerprint.location.lng,
    targetFacility.location.lat,
    targetFacility.location.lng
  );

  const pathway = targetFacility.type;
  const impact = calculateBatchImpact(lot.fingerprint, pathway, distance);

  const dateStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

  lot.matchedFacilityId = targetFacility.id;
  lot.matchedFacilityName = targetFacility.name;
  lot.matchedFacilityType = targetFacility.type;
  lot.matchedFacilityLocation = targetFacility.location;
  lot.selectedPathway = pathway;
  lot.status = 'MATCHED';

  lot.logistics = {
    driverName: 'Vikram Patel',
    truckNumber: `GJ-18-W2C-${Math.floor(1000 + Math.random() * 9000)}`,
    distanceKm: distance,
    estimatedHours: Math.round((distance / 40) * 10) / 10 || 0.2,
    transportCost: impact.transportCost,
    transportCO2e: impact.transportEmissionsCO2e,
    pickupTime: `${dateStr} (Scheduled)`,
  };

  lot.impactMetrics = impact;

  lot.processingYield = {
    outputType: pathway === 'BIOCHAR' ? 'Biochar & Process Heat' : pathway === 'BIOGAS' ? 'Biomethane (CBG) & Bio-slurry' : 'Organic Soil Amendment',
    outputQuantity: pathway === 'BIOCHAR' ? `${(lot.fingerprint.quantityTonnes * 0.35).toFixed(1)} tonnes Biochar` : `${Math.round(lot.fingerprint.quantityTonnes * 80)} m³ Biogas`,
    progressPercent: 0,
    startedAt: 'Pending Arrival',
    estimatedCompletionAt: '24h post-delivery',
  };

  lot.timeline.push({
    status: 'MATCHED',
    timestamp: dateStr,
    note: `Facility match confirmed with ${targetFacility.name}`,
  });

  saveStoredWasteLots(lots);
  return lot;
}

export function updateLotLifecycleStatus(
  lotId: string,
  newStatus: WasteStatus,
  customNote?: string
): WasteLot | null {
  const lots = getStoredWasteLots();
  const lotIndex = lots.findIndex((l) => l.id === lotId);
  if (lotIndex === -1) return null;

  const lot = lots[lotIndex];
  lot.status = newStatus;

  const dateStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

  let defaultNote = `Status updated to ${newStatus}`;
  if (newStatus === 'PICKUP') defaultNote = 'Collection truck dispatched to waste location';
  if (newStatus === 'IN_TRANSIT') defaultNote = 'Waste loaded and en-route to conversion facility';
  if (newStatus === 'DELIVERED') defaultNote = 'Weighed, verified and delivered at facility intake';
  if (newStatus === 'PROCESSING') {
    defaultNote = 'Feedstock loaded into processing reactor / digester';
    if (lot.processingYield) {
      lot.processingYield.progressPercent = 45;
      lot.processingYield.startedAt = dateStr;
    }
  }
  if (newStatus === 'COMPLETED') {
    defaultNote = 'Conversion completed. Carbon impact & economic value recorded';
    if (lot.processingYield) {
      lot.processingYield.progressPercent = 100;
    }
  }

  lot.timeline.push({
    status: newStatus,
    timestamp: dateStr,
    note: customNote || defaultNote,
  });

  saveStoredWasteLots(lots);
  return lot;
}
