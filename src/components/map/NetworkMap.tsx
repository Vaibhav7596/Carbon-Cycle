import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Facility, WasteLot } from '../../types';
import { createFacilityIcon, createSourceIcon } from '../../utils/mapIcons';
import { calculateHaversineDistanceKm, calculateTravelTimeMinutes, calculateTransportEmissionsCO2e } from '../../utils/haversine';
import { MapPin, Factory, ArrowRight, Truck, Leaf, ChevronRight, Navigation, Clock, ShieldCheck } from 'lucide-react';

interface NetworkMapProps {
  wasteLots: WasteLot[];
  facilities: Facility[];
  selectedLotId?: string;
  onSelectLot?: (lotId: string) => void;
  onSelectFacility?: (facilityId: string) => void;
  height?: string;
}

export const NetworkMap: React.FC<NetworkMapProps> = ({
  wasteLots,
  facilities,
  selectedLotId,
  onSelectLot,
  onSelectFacility,
  height = '440px',
}) => {
  // Center map on Gujarat region (Gandhinagar / Ahmedabad)
  const centerLat = 23.1000;
  const centerLng = 72.5800;

  // Selected or first matched lot for prototype route visualization
  const activeLot = (selectedLotId && wasteLots.find((l) => l.id === selectedLotId)) ||
    wasteLots.find((l) => l.matchedFacilityLocation && l.fingerprint?.location) ||
    wasteLots[0];

  // Active route calculation using Haversine formula
  let routeSummary: {
    sourceName: string;
    facilityName: string;
    distanceKm: number;
    travelTimeMins: number;
    transportEmissions: number;
    sourceCoords: [number, number];
    facilityCoords: [number, number];
  } | null = null;

  if (activeLot && activeLot.fingerprint?.location && activeLot.matchedFacilityLocation) {
    const sLat = activeLot.fingerprint.location.lat;
    const sLng = activeLot.fingerprint.location.lng;
    const fLat = activeLot.matchedFacilityLocation.lat;
    const fLng = activeLot.matchedFacilityLocation.lng;

    const dist = calculateHaversineDistanceKm(sLat, sLng, fLat, fLng) || activeLot.logistics?.distanceKm || 18.4;
    const mins = calculateTravelTimeMinutes(dist);
    const emissions = calculateTransportEmissionsCO2e(dist, activeLot.fingerprint.quantityTonnes || 10);

    routeSummary = {
      sourceName: activeLot.generatorName || activeLot.fingerprint.location.name || 'Ahmedabad Farm',
      facilityName: activeLot.matchedFacilityName || 'GreenBio Biochar Plant',
      distanceKm: dist,
      travelTimeMins: mins,
      transportEmissions: emissions,
      sourceCoords: [sLat, sLng],
      facilityCoords: [fLat, fLng],
    };
  }

  // Filter all active routes for rendering polylines
  const activeRoutes = wasteLots
    .filter((lot) => lot.matchedFacilityLocation && lot.fingerprint?.location)
    .map((lot) => {
      const sLat = lot.fingerprint.location.lat;
      const sLng = lot.fingerprint.location.lng;
      const fLat = lot.matchedFacilityLocation!.lat;
      const fLng = lot.matchedFacilityLocation!.lng;
      const dist = calculateHaversineDistanceKm(sLat, sLng, fLat, fLng);

      return {
        lotId: lot.id,
        lotStatus: lot.status,
        sourceName: lot.generatorName || lot.fingerprint.location.name,
        sourceCoords: [sLat, sLng] as [number, number],
        facilityName: lot.matchedFacilityName || 'Facility',
        facilityCoords: [fLat, fLng] as [number, number],
        quantity: lot.fingerprint.quantityTonnes,
        wasteType: lot.fingerprint.wasteType,
        distanceKm: dist,
      };
    });

  return (
    <div className="relative w-full rounded-card border border-border overflow-hidden bg-surface shadow-subtle">
      {/* Map Header Overlay Bar */}
      <div className="absolute top-3 left-3 z-[1000] bg-surface/90 backdrop-blur-md px-3 py-1.5 rounded-btn border border-border shadow-sm flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-carbon-primary">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>OpenStreetMap GIS Tracker (No API Key Required)</span>
        </div>
        <span className="text-carbon-muted">|</span>
        <div className="flex items-center gap-3 text-[11px] text-carbon-secondary">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-600"></span> Waste Sources ({wasteLots.length})</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-700"></span> Biochar Hubs</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-700"></span> Biogas Plants</span>
        </div>
      </div>

      {/* Floating Prototype Route Visualization Summary Badge */}
      {routeSummary && (
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto z-[1000] bg-surface/95 backdrop-blur-md border border-border p-3 rounded-card shadow-modal max-w-md space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-border pb-1.5">
            <span className="font-extrabold text-carbon-primary flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-brand-primary" />
              <span>Haversine GIS Route Visualization</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded font-bold">
              Direct Polyline
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-[10px] text-carbon-muted font-bold block uppercase">Waste Source</span>
              <span className="font-bold text-carbon-primary truncate block">{routeSummary.sourceName}</span>
            </div>
            <div>
              <span className="text-[10px] text-carbon-muted font-bold block uppercase">Conversion Facility</span>
              <span className="font-bold text-brand-dark truncate block">{routeSummary.facilityName}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-surface-muted/70 p-2 rounded-btn text-center text-[11px]">
            <div>
              <span className="text-[10px] text-carbon-muted block">Distance</span>
              <span className="font-extrabold text-carbon-primary">{routeSummary.distanceKm} km</span>
            </div>
            <div>
              <span className="text-[10px] text-carbon-muted block">Estimated Travel Time</span>
              <span className="font-extrabold text-blue-700">{routeSummary.travelTimeMins} mins</span>
            </div>
            <div>
              <span className="text-[10px] text-carbon-muted block">Transport Emissions</span>
              <span className="font-extrabold text-amber-700">{routeSummary.transportEmissions} tCO₂e</span>
            </div>
          </div>
        </div>
      )}

      <div style={{ height }}>
        <MapContainer
          center={[centerLat, centerLng]}
          zoom={10}
          scrollWheelZoom={false}
          style={{ width: '100%', height: '100%' }}
        >
          {/* OpenStreetMap Base Layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Active Routes (Polylines) */}
          {activeRoutes.map((route) => {
            const isSelected = selectedLotId === route.lotId;
            return (
              <Polyline
                key={`route-${route.lotId}`}
                positions={[route.sourceCoords, route.facilityCoords]}
                pathOptions={{
                  color: isSelected ? '#16794A' : '#2563EB',
                  weight: isSelected ? 4 : 2.5,
                  dashArray: route.lotStatus === 'MATCHED' ? '6, 6' : undefined,
                  opacity: 0.85,
                }}
              />
            );
          })}

          {/* Waste Source Markers */}
          {wasteLots.map((lot) => {
            const loc = lot.fingerprint.location;
            if (!loc || !loc.lat || !loc.lng) return null;

            return (
              <Marker
                key={`source-${lot.id}`}
                position={[loc.lat, loc.lng]}
                icon={createSourceIcon()}
                eventHandlers={{
                  click: () => onSelectLot && onSelectLot(lot.id),
                }}
              >
                <Popup className="custom-leaflet-popup">
                  <div className="p-1 space-y-1.5 max-w-xs text-xs">
                    <div className="flex items-center justify-between border-b border-border pb-1">
                      <span className="font-bold text-carbon-primary">{lot.id}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        {lot.status}
                      </span>
                    </div>
                    <p className="font-semibold text-carbon-primary">{lot.generatorName}</p>
                    <p className="text-carbon-secondary text-[11px]">{loc.address}</p>
                    <div className="grid grid-cols-2 gap-1 pt-1 bg-surface-muted/60 p-1.5 rounded text-[11px]">
                      <div>
                        <span className="text-carbon-muted block">Quantity:</span>
                        <span className="font-bold text-carbon-primary">{lot.fingerprint.quantityTonnes} tonnes</span>
                      </div>
                      <div>
                        <span className="text-carbon-muted block">Moisture:</span>
                        <span className="font-semibold text-carbon-primary">{lot.fingerprint.moisturePercent}%</span>
                      </div>
                    </div>
                    {lot.matchedFacilityName && (
                      <div className="text-[11px] text-brand-dark pt-1 flex items-center justify-between font-medium">
                        <span>Destination:</span>
                        <span className="truncate max-w-[130px] font-semibold">{lot.matchedFacilityName}</span>
                      </div>
                    )}
                    {onSelectLot && (
                      <button
                        onClick={() => onSelectLot(lot.id)}
                        className="w-full mt-2 bg-brand-primary text-white text-[11px] py-1 rounded font-medium hover:bg-brand-dark transition"
                      >
                        View Waste Details →
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Facility Markers */}
          {facilities.map((fac) => {
            if (!fac.location || !fac.location.lat || !fac.location.lng) return null;

            return (
              <Marker
                key={`facility-${fac.id}`}
                position={[fac.location.lat, fac.location.lng]}
                icon={createFacilityIcon(fac.type)}
                eventHandlers={{
                  click: () => onSelectFacility && onSelectFacility(fac.id),
                }}
              >
                <Popup>
                  <div className="p-1 space-y-1.5 max-w-xs text-xs">
                    <div className="flex items-center justify-between border-b border-border pb-1">
                      <span className="font-bold text-carbon-primary">{fac.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-soft text-brand-dark">
                        {fac.type}
                      </span>
                    </div>
                    <p className="text-carbon-secondary text-[11px]">{fac.location.address}</p>
                    <div className="grid grid-cols-2 gap-1 bg-surface-muted/60 p-1.5 rounded text-[11px]">
                      <div>
                        <span className="text-carbon-muted block">Available Cap:</span>
                        <span className="font-bold text-brand-primary">{fac.availableCapacityTonnes} t/day</span>
                      </div>
                      <div>
                        <span className="text-carbon-muted block">Cost / Ton:</span>
                        <span className="font-semibold text-carbon-primary">₹{fac.processingCostPerTon}</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-carbon-secondary">
                      <span className="font-semibold">Accepts: </span>
                      {fac.acceptedWasteTypes.join(', ')}
                    </div>
                    {onSelectFacility && (
                      <button
                        onClick={() => onSelectFacility(fac.id)}
                        className="w-full mt-2 bg-carbon-primary text-white text-[11px] py-1 rounded font-medium hover:bg-carbon-secondary transition"
                      >
                        Facility Directory →
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};
