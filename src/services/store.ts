import { SEEDED_FACILITIES, SEEDED_WASTE_LOTS } from '../data/constants';
import { Facility, NotificationItem, PathwayType, WasteFingerprint, WasteLot, WasteStatus } from '../types';
import { calculateBatchImpact } from './carbonCalculator';
import { calculateHaversineDistance, evaluatePathwaySuitability } from './recommendationEngine';
import { API_BASE_URL } from './authService';

const STORAGE_KEY_LOTS = 'carboncycle_waste_lots_v1';
const STORAGE_KEY_FACILITIES = 'carboncycle_facilities_v1';
const STORAGE_KEY_NOTIFICATIONS = 'carboncycle_notifications_v1';

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

export function getStoredNotifications(): NotificationItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error('Failed to load notifications from local storage', e);
  }
  return [];
}

export function saveStoredNotifications(items: NotificationItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save notifications to local storage', e);
  }
}

// ---------------------------------------------------------------------------
// ASYNC DATABASE API METHODS (PRIMARY)
// ---------------------------------------------------------------------------

export interface PincodeLocationResult {
  success: boolean;
  message?: string;
  source?: string;
  data?: {
    areaName: string;
    district: string;
    state: string;
    formattedAddress: string;
    lat: number;
    lng: number;
    pincode?: string;
  };
}

export async function lookupPincodeApi(pincode: string): Promise<PincodeLocationResult> {
  const cleanCode = (pincode || '').replace(/\D/g, '').slice(0, 6);
  if (!/^\d{6}$/.test(cleanCode)) {
    return {
      success: false,
      message: 'PIN code must be exactly 6 digits.',
    };
  }

  // 1. Try Backend API endpoint
  try {
    const res = await fetch(`${API_BASE_URL}/location/pincode/${cleanCode}`);
    const json = await res.json();
    if (json.success && json.data) {
      return json;
    }
  } catch (error) {
    console.warn('[Pincode API Warning]: Backend lookup failed, trying direct provider fallback.', error);
  }

  // 2. Direct client-side provider fallback (Zippopotam.us)
  try {
    const zippoRes = await fetch(`https://api.zippopotam.us/in/${cleanCode}`);
    if (zippoRes.ok) {
      const zippoJson = await zippoRes.json();
      if (Array.isArray(zippoJson.places) && zippoJson.places.length > 0) {
        const place = zippoJson.places[0];
        const areaName = place['place name'] || `Sector ${cleanCode}`;
        const state = place['state'] || 'India';
        const lat = parseFloat(place['latitude']) || 23.0;
        const lng = parseFloat(place['longitude']) || 72.5;

        return {
          success: true,
          source: 'client_geocoded',
          data: {
            areaName,
            district: areaName,
            state,
            formattedAddress: `${areaName}, ${state} - ${cleanCode}`,
            lat: Number(lat.toFixed(4)),
            lng: Number(lng.toFixed(4)),
            pincode: cleanCode,
          },
        };
      }
    }
  } catch (err) {
    console.warn('Zippopotam client fallback failed', err);
  }

  // 3. Direct India Post client fallback
  try {
    const postalRes = await fetch(`https://api.postalpincode.in/pincode/${cleanCode}`);
    if (postalRes.ok) {
      const postalJson = await postalRes.json();
      if (
        Array.isArray(postalJson) &&
        postalJson[0]?.Status === 'Success' &&
        Array.isArray(postalJson[0].PostOffice) &&
        postalJson[0].PostOffice.length > 0
      ) {
        const po = postalJson[0].PostOffice[0];
        return {
          success: true,
          source: 'client_postal',
          data: {
            areaName: `${po.Name} (${po.District})`,
            district: po.District,
            state: po.State,
            formattedAddress: `${po.Name}, ${po.District}, ${po.State} - ${cleanCode}`,
            lat: 23.2156,
            lng: 72.6369,
            pincode: cleanCode,
          },
        };
      }
    }
  } catch (err) {
    console.warn('India Post client fallback failed', err);
  }

  return {
    success: false,
    message: `No active location found for PIN code ${cleanCode}. Please verify the 6-digit postal code.`,
  };
}

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

export async function updateFacilityApi(
  facilityId: string,
  updates: Partial<Facility>
): Promise<Facility | null> {
  try {
    const token = localStorage.getItem('carboncycle_auth_token_v1');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/facilities/${facilityId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updates),
    });

    const json = await res.json();
    if (json.success && json.facility) {
      const current = getStoredFacilities();
      const updated = current.map((f) => (f.id === facilityId ? json.facility : f));
      saveStoredFacilities(updated);
      return json.facility;
    }
  } catch (error) {
    console.warn('[Store API Warning]: Failed to update facility on server, falling back to local.', error);
  }
  const current = getStoredFacilities();
  const index = current.findIndex((f) => f.id === facilityId);
  if (index !== -1) {
    current[index] = { ...current[index], ...updates };
    saveStoredFacilities(current);
    return current[index];
  }
  return null;
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

    let storedUser: any = null;
    try {
      const raw = localStorage.getItem('carboncycle_auth_user_v1');
      if (raw) storedUser = JSON.parse(raw);
    } catch (e) {}

    const res = await fetch(`${API_BASE_URL}/waste-lots`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        generatorName: generatorName || storedUser?.organizationName || storedUser?.name,
        generatorType: generatorType || storedUser?.organizationType,
        generatorId: storedUser?.id || storedUser?._id,
        generatorContact: storedUser?.email,
        fingerprint,
      }),
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
  return matchAndSelectFacilityForLot(lotId, facilityId);
}

// Alias for readability
export const requestFacilityMatchApi = matchAndSelectFacilityApi;

export async function respondToMatchRequestApi(
  lotId: string,
  action: 'ACCEPT' | 'REJECT',
  rejectionReason?: string,
  facilityId?: string
): Promise<WasteLot | null> {
  try {
    const token = localStorage.getItem('carboncycle_auth_token_v1');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/waste-lots/${lotId}/respond-match`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ action, rejectionReason, facilityId }),
    });

    const json = await res.json();
    if (json.success && json.lot) {
      const current = getStoredWasteLots();
      const updated = current.map((l) => (l.id === lotId ? json.lot : l));
      saveStoredWasteLots(updated);
      return json.lot;
    }
  } catch (error) {
    console.error('[Store API Error]: Failed to respond to match request on server, falling back to local.', error);
  }
  return respondToMatchRequestForLot(lotId, action, rejectionReason);
}

export async function notifyGateArrivalApi(
  lotId: string
): Promise<WasteLot | null> {
  try {
    const token = localStorage.getItem('carboncycle_auth_token_v1');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/waste-lots/${lotId}/gate-arrival`, {
      method: 'PUT',
      headers,
    });

    const json = await res.json();
    if (json.success && json.lot) {
      const current = getStoredWasteLots();
      const updated = current.map((l) => (l.id === lotId ? json.lot : l));
      saveStoredWasteLots(updated);
      return json.lot;
    }
  } catch (error) {
    console.error('[Store API Error]: Failed to notify gate arrival on server, falling back to local.', error);
  }
  return notifyGateArrivalForLot(lotId);
}

// ---------------------------------------------------------------------------
// NOTIFICATIONS API
// ---------------------------------------------------------------------------

export async function fetchNotificationsApi(params?: {
  role?: string;
  email?: string;
  facilityId?: string;
}): Promise<NotificationItem[]> {
  try {
    const query = new URLSearchParams();
    if (params?.role) query.append('role', params.role);
    if (params?.email) query.append('email', params.email);
    if (params?.facilityId) query.append('facilityId', params.facilityId);

    const res = await fetch(`${API_BASE_URL}/notifications?${query.toString()}`);
    const json = await res.json();
    if (json.success && Array.isArray(json.notifications)) {
      saveStoredNotifications(json.notifications);
      return json.notifications;
    }
  } catch (error) {
    console.warn('[Notifications API Warning]: Failed to fetch notifications from server, using cached.', error);
  }
  return getStoredNotifications();
}

export async function markNotificationReadApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, { method: 'PUT' });
    const json = await res.json();
    if (json.success) {
      const current = getStoredNotifications();
      saveStoredNotifications(current.map((n) => (n.id === id ? { ...n, read: true } : n)));
      return true;
    }
  } catch (error) {
    console.error('[Notifications API Error]: Failed to mark notification read on server.', error);
  }
  const current = getStoredNotifications();
  saveStoredNotifications(current.map((n) => (n.id === id ? { ...n, read: true } : n)));
  return true;
}

export async function markAllNotificationsReadApi(params?: {
  role?: string;
  email?: string;
}): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params || {}),
    });
    const json = await res.json();
    if (json.success) {
      const current = getStoredNotifications();
      saveStoredNotifications(current.map((n) => ({ ...n, read: true })));
      return true;
    }
  } catch (error) {
    console.error('[Notifications API Error]: Failed to mark all notifications read on server.', error);
  }
  const current = getStoredNotifications();
  saveStoredNotifications(current.map((n) => ({ ...n, read: true })));
  return true;
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

  let storedUser: any = null;
  try {
    const raw = localStorage.getItem('carboncycle_auth_user_v1');
    if (raw) storedUser = JSON.parse(raw);
  } catch (e) {}

  const finalName = generatorName || storedUser?.organizationName || storedUser?.name || 'Regional Agro Source';
  const finalType = generatorType || storedUser?.organizationType || 'Agricultural Enterprise';

  const initialImpact = calculateBatchImpact(fingerprint, recommendedPathway, 15);

  const newLot: WasteLot = {
    id: newId,
    createdAt: now.toISOString(),
    generatorId: storedUser?.id || storedUser?._id,
    generatorContact: storedUser?.email,
    generatorName: finalName,
    generatorType: finalType,
    fingerprint,
    status: 'LISTED',
    selectedPathway: recommendedPathway,
    impactMetrics: initialImpact,
    timeline: [
      {
        status: 'LISTED',
        timestamp: dateStr,
        note: `Waste batch listed by ${finalName}`,
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

  const lastEntry = lot.timeline[lot.timeline.length - 1];
  if (!lastEntry || lastEntry.status !== newStatus) {
    lot.timeline.push({
      status: newStatus,
      timestamp: dateStr,
      note: customNote || defaultNote,
    });
  }

  saveStoredWasteLots(lots);
  return lot;
}

export function respondToMatchRequestForLot(
  lotId: string,
  action: 'ACCEPT' | 'REJECT',
  rejectionReason?: string
): WasteLot | null {
  const lots = getStoredWasteLots();
  const lotIndex = lots.findIndex((l) => l.id === lotId);
  if (lotIndex === -1) return null;

  const lot = lots[lotIndex];
  const dateStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

  if (action === 'ACCEPT') {
    lot.status = 'MATCHED';
    lot.matchedFacilityId = lot.requestedFacilityId || lot.matchedFacilityId;
    lot.matchedFacilityName = lot.requestedFacilityName || lot.matchedFacilityName;
    lot.timeline.push({
      status: 'MATCHED',
      timestamp: dateStr,
      note: `Facility intake accepted by ${lot.matchedFacilityName}. Collection scheduled.`,
    });
  } else {
    lot.status = 'REJECTED';
    lot.rejectionReason = rejectionReason || 'Capacity constraints';
    lot.timeline.push({
      status: 'REJECTED',
      timestamp: dateStr,
      note: `Intake rejected: ${lot.rejectionReason}`,
    });
  }

  saveStoredWasteLots(lots);
  return lot;
}

export function notifyGateArrivalForLot(lotId: string): WasteLot | null {
  const lots = getStoredWasteLots();
  const lotIndex = lots.findIndex((l) => l.id === lotId);
  if (lotIndex === -1) return null;

  const lot = lots[lotIndex];
  const dateStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
  lot.status = 'AT_GATE';
  lot.gateArrivalTime = new Date().toISOString();
  lot.timeline.push({
    status: 'AT_GATE',
    timestamp: dateStr,
    note: 'Truck arrived at facility intake gate. Queued for weighbridge check-in.',
  });

  saveStoredWasteLots(lots);
  return lot;
}

