import { SEEDED_FACILITIES, SEEDED_WASTE_LOTS } from '../data/constants';
import { Facility, PathwayType, WasteFingerprint, WasteLot, WasteStatus } from '../types';
import { calculateBatchImpact } from './carbonCalculator';
import { calculateHaversineDistance, evaluatePathwaySuitability } from './recommendationEngine';
import { API_BASE_URL } from './authService';

const STORAGE_KEY_LOTS = 'carboncycle_waste_lots_v1';
const STORAGE_KEY_FACILITIES = 'carboncycle_facilities_v1';

// Synchronous local cache helpers
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

// ---------------------------------------------------------------------------
// ASYNC DATABASE API METHODS (PRIMARY)
// ---------------------------------------------------------------------------

export async function fetchWasteLotsApi(): Promise<WasteLot[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/waste-lots`);
    const json = await res.json();
    if (json.success && Array.isArray(json.lots)) {
      saveStoredWasteLots(json.lots);
      return json.lots;
    }
  } catch (error) {
    console.warn('[Store API Warning]: Failed to fetch waste lots from server, using cached data.', error);
  }
  return getStoredWasteLots();
}

export async function fetchFacilitiesApi(): Promise<Facility[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/facilities`);
    const json = await res.json();
    if (json.success && Array.isArray(json.facilities)) {
      saveStoredFacilities(json.facilities);
      return json.facilities;
    }
  } catch (error) {
    console.warn('[Store API Warning]: Failed to fetch facilities from server, using cached data.', error);
  }
  return getStoredFacilities();
}

export async function createWasteLotApi(
  generatorName: string,
  generatorType: string,
  fingerprint: WasteFingerprint
): Promise<WasteLot> {
  try {
    const token = localStorage.getItem('carboncycle_auth_token_v1');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/waste-lots`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ generatorName, generatorType, fingerprint }),
    });

    const json = await res.json();
    if (json.success && json.lot) {
      const current = getStoredWasteLots();
      saveStoredWasteLots([json.lot, ...current.filter((l) => l.id !== json.lot.id)]);
      return json.lot;
    }
  } catch (error) {
    console.error('[Store API Error]: Failed to create waste lot on server, falling back to local.', error);
  }
  // Fallback to local creation if network is down
  return createNewWasteLot(generatorName, generatorType, fingerprint);
}

export async function matchAndSelectFacilityApi(
  lotId: string,
  facilityId: string
): Promise<WasteLot | null> {
  try {
    const token = localStorage.getItem('carboncycle_auth_token_v1');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/waste-lots/${lotId}/match`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ facilityId }),
    });

    const json = await res.json();
    if (json.success && json.lot) {
      const current = getStoredWasteLots();
      const updated = current.map((l) => (l.id === lotId ? json.lot : l));
      saveStoredWasteLots(updated);
      return json.lot;
    }
  } catch (error) {
    console.error('[Store API Error]: Failed to match facility on server, falling back to local.', error);
  }
  // Fallback to local matching
  return matchAndSelectFacilityForLot(lotId, facilityId);
}

export async function updateLotLifecycleStatusApi(
  lotId: string,
  newStatus: WasteStatus,
  customNote?: string
): Promise<WasteLot | null> {
  try {
    const token = localStorage.getItem('carboncycle_auth_token_v1');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/waste-lots/${lotId}/status`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ status: newStatus, note: customNote }),
    });

    const json = await res.json();
    if (json.success && json.lot) {
      const current = getStoredWasteLots();
      const updated = current.map((l) => (l.id === lotId ? json.lot : l));
      saveStoredWasteLots(updated);
      return json.lot;
    }
  } catch (error) {
    console.error('[Store API Error]: Failed to update lot status on server, falling back to local.', error);
  }
  // Fallback to local lifecycle update
  return updateLotLifecycleStatus(lotId, newStatus, customNote);
}

export async function resetDemoDataApi(): Promise<{ lots: WasteLot[]; facilities: Facility[] }> {
  try {
    const res = await fetch(`${API_BASE_URL}/waste-lots/reset`, { method: 'POST' });
    const json = await res.json();
    if (json.success && Array.isArray(json.lots) && Array.isArray(json.facilities)) {
      saveStoredWasteLots(json.lots);
      saveStoredFacilities(json.facilities);
      return { lots: json.lots, facilities: json.facilities };
    }
  } catch (error) {
    console.error('[Store API Error]: Failed to reset database on server, falling back to local.', error);
  }
  return resetDemoData();
}

// ---------------------------------------------------------------------------
// SYNCHRONOUS FALLBACK / LOCAL CREATION METHODS
// ---------------------------------------------------------------------------

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
      },
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
    outputType:
      pathway === 'BIOCHAR'
        ? 'Biochar & Process Heat'
        : pathway === 'BIOGAS'
        ? 'Biomethane (CBG) & Bio-slurry'
        : 'Organic Soil Amendment',
    outputQuantity:
      pathway === 'BIOCHAR'
        ? `${(lot.fingerprint.quantityTonnes * 0.35).toFixed(1)} tonnes Biochar`
        : `${Math.round(lot.fingerprint.quantityTonnes * 80)} m³ Biogas`,
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
