import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, ZoomControl, useMap } from 'react-leaflet';
import { Facility, WasteLot } from '../../types';
import { createFacilityIcon, createSourceIcon } from '../../utils/mapIcons';
import { calculateHaversineDistanceKm, calculateTravelTimeMinutes, calculateTransportEmissionsCO2e } from '../../utils/haversine';
import { fetchRoadRouteApi, RoadRouteResult } from '../../services/store';
import { MapPin, Factory, ArrowRight, Truck, Leaf, ChevronRight, Navigation, Clock, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

interface NetworkMapProps {
  wasteLots: WasteLot[];
  facilities: Facility[];
  selectedLotId?: string;
  onSelectLot?: (lotId: string) => void;
  onSelectFacility?: (facilityId: string) => void;
  height?: string;
  onRouteCalculated?: (route: RoadRouteResult) => void;
}

/**
 * Sub-component to fit map viewport bounds to the active route geometry
 */
const MapRouteFitter: React.FC<{ positions: [number, number][] }> = ({ positions }) => {
  const map = useMap();
  const lastKey = useRef<string>('');

  useEffect(() => {
    if (!positions || positions.length < 2) return;
    const start = positions[0];
    const end = positions[positions.length - 1];
    const key = `${start[0]},${start[1]}->${end[0]},${end[1]}:${positions.length}`;
    if (lastKey.current === key) return;
    lastKey.current = key;

    try {
      let minLat = positions[0][0], maxLat = positions[0][0];
      let minLng = positions[0][1], maxLng = positions[0][1];
      for (const [lat, lng] of positions) {
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
      }
      map.fitBounds(
        [
          [minLat, minLng],
          [maxLat, maxLng],
        ],
        { padding: [50, 50], maxZoom: 14 }
      );
    } catch (err) {
      console.warn('Map fitBounds error:', err);
    }
  }, [positions, map]);

  return null;
};

export const NetworkMap: React.FC<NetworkMapProps> = ({
  wasteLots,
  facilities,
  selectedLotId,
  onSelectLot,
  onSelectFacility,
  height = '440px',
  onRouteCalculated,
}) => {
  // Center map on Gujarat region (Gandhinagar / Ahmedabad)
  const centerLat = 23.1000;
  const centerLng = 72.5800;

  // Selected or first matched lot for route visualization
  const activeLot = (selectedLotId && wasteLots.find((l) => l.id === selectedLotId)) ||
    wasteLots.find((l) => l.matchedFacilityLocation && l.fingerprint?.location) ||
    wasteLots[0];

  const sourceLoc = activeLot?.fingerprint?.location;
  const facilityLoc = activeLot?.matchedFacilityLocation;

  // OSRM Road Route state
  const [roadRoute, setRoadRoute] = useState<RoadRouteResult | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);
  const [routeError, setRouteError] = useState<string | null>(null);

  const onRouteCalculatedRef = useRef(onRouteCalculated);
  useEffect(() => {
    onRouteCalculatedRef.current = onRouteCalculated;
  });

  // Fetch road route whenever source or destination coordinates change
  useEffect(() => {
    if (!sourceLoc?.lat || !sourceLoc?.lng || !facilityLoc?.lat || !facilityLoc?.lng) {
      setRoadRoute(null);
      setRouteError(null);
      return;
    }

    let isCancelled = false;
    setIsLoadingRoute(true);
    setRouteError(null);

    fetchRoadRouteApi(sourceLoc.lat, sourceLoc.lng, facilityLoc.lat, facilityLoc.lng)
      .then((result) => {
        if (isCancelled) return;
        setRoadRoute(result);
        if (result.isFallback) {
          setRouteError(result.message || 'Road route unavailable — showing direct estimate');
        } else {
          setRouteError(null);
        }
        onRouteCalculatedRef.current?.(result);
      })
      .catch((err) => {
        if (isCancelled) return;
        console.warn('Road routing request error:', err);
        setRouteError('Road route unavailable — showing direct estimate');
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingRoute(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [sourceLoc?.lat, sourceLoc?.lng, facilityLoc?.lat, facilityLoc?.lng]);

  // Determine active route metrics (OSRM road route preferred, Haversine fallback)
  let routeSummary: {
    sourceName: string;
    facilityName: string;
    distanceKm: number;
    travelTimeMins: number;
    transportEmissions: number;
    sourceCoords: [number, number];
    facilityCoords: [number, number];
    isRoadRouted: boolean;
  } | null = null;

  let activeRoutePositions: [number, number][] = [];

  if (activeLot && sourceLoc && facilityLoc) {
    const sLat = sourceLoc.lat;
    const sLng = sourceLoc.lng;
    const fLat = facilityLoc.lat;
    const fLng = facilityLoc.lng;

    const isRoadRouted = Boolean(roadRoute && !roadRoute.isFallback && roadRoute.geometry?.coordinates?.length);

    if (isRoadRouted && roadRoute) {
      // Convert OSRM GeoJSON [longitude, latitude] to Leaflet [latitude, longitude]
      activeRoutePositions = roadRoute.geometry.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]);
      const dist = roadRoute.distanceKm;
      const mins = roadRoute.durationMinutes;
      const emissions = calculateTransportEmissionsCO2e(dist, activeLot.fingerprint.quantityTonnes || 10);

      routeSummary = {
        sourceName: activeLot.generatorName || sourceLoc.name || 'Waste Origin',
        facilityName: activeLot.matchedFacilityName || 'Selected Facility',
        distanceKm: dist,
        travelTimeMins: mins,
        transportEmissions: emissions,
        sourceCoords: [sLat, sLng],
        facilityCoords: [fLat, fLng],
        isRoadRouted: true,
      };
    } else {
      // Fallback straight-line
      activeRoutePositions = [[sLat, sLng], [fLat, fLng]];
      const dist = calculateHaversineDistanceKm(sLat, sLng, fLat, fLng) || activeLot.logistics?.distanceKm || 18.4;
      const mins = calculateTravelTimeMinutes(dist);
      const emissions = calculateTransportEmissionsCO2e(dist, activeLot.fingerprint.quantityTonnes || 10);

      routeSummary = {
        sourceName: activeLot.generatorName || sourceLoc.name || 'Waste Origin',
        facilityName: activeLot.matchedFacilityName || 'Selected Facility',
        distanceKm: dist,
        travelTimeMins: mins,
        transportEmissions: emissions,
        sourceCoords: [sLat, sLng],
        facilityCoords: [fLat, fLng],
        isRoadRouted: false,
      };
    }
  }

  // Filter other active routes for background rendering
  const backgroundRoutes = wasteLots
    .filter((lot) => lot.id !== activeLot?.id && lot.matchedFacilityLocation && lot.fingerprint?.location)
    .map((lot) => {
      const sLat = lot.fingerprint.location.lat;
      const sLng = lot.fingerprint.location.lng;
      const fLat = lot.matchedFacilityLocation!.lat;
      const fLng = lot.matchedFacilityLocation!.lng;

      return {
        lotId: lot.id,
        sourceCoords: [sLat, sLng] as [number, number],
        facilityCoords: [fLat, fLng] as [number, number],
      };
    });

  return (
    <div className="relative w-full rounded-card border border-border overflow-hidden bg-surface shadow-subtle isolate z-0">
      {/* Map Header Overlay Bar */}
      <div className="absolute top-3 left-14 z-[1000] bg-surface/90 backdrop-blur-md px-3 py-1.5 rounded-btn border border-border shadow-sm flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-carbon-primary">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>OpenStreetMap GIS Tracker</span>
        </div>
        <span className="text-carbon-muted">|</span>
        <div className="flex items-center gap-3 text-[11px] text-carbon-secondary">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-600"></span> Waste Sources ({wasteLots.length})</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-amber-700"></span> Biochar Hubs</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-emerald-700"></span> Biogas Plants</span>
        </div>
      </div>

      {/* Floating Route Visualization Summary Badge */}
      {routeSummary && (
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto z-10 bg-surface/95 backdrop-blur-md border border-border p-3.5 rounded-card shadow-modal max-w-md space-y-2.5 text-xs">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div className="flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-brand-primary" />
              <span className="font-extrabold text-carbon-primary">
                {isLoadingRoute
                  ? 'Calculating road route...'
                  : routeError || !routeSummary.isRoadRouted
                  ? 'Road route unavailable — showing direct estimate'
                  : 'OSRM Road Network Route'}
              </span>
            </div>
            {isLoadingRoute ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-brand-primary font-bold animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" /> Routing...
              </span>
            ) : routeError || !routeSummary.isRoadRouted ? (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                Direct Estimate
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span> Road Route
              </span>
            )}
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
              <span className="text-[10px] text-carbon-muted block">
                {routeSummary.isRoadRouted ? 'Road Distance' : 'Direct Distance'}
              </span>
              <span className="font-extrabold text-carbon-primary">{routeSummary.distanceKm} km</span>
            </div>
            <div>
              <span className="text-[10px] text-carbon-muted block">Estimated Travel Time</span>
              <span className="font-extrabold text-blue-700">{routeSummary.travelTimeMins} min</span>
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
          scrollWheelZoom={true}
          zoomControl={false}
          style={{ width: '100%', height: '100%' }}
        >
          <ZoomControl position="topright" />
          {/* Automatically fit map bounds to the road route */}
          {activeRoutePositions.length >= 2 && <MapRouteFitter positions={activeRoutePositions} />}

          {/* OpenStreetMap Base Layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Background Routes for other lots */}
          {backgroundRoutes.map((route) => (
            <Polyline
              key={`bg-route-${route.lotId}`}
              positions={[route.sourceCoords, route.facilityCoords]}
              pathOptions={{
                color: '#64748B',
                weight: 1.5,
                dashArray: '4, 4',
                opacity: 0.4,
              }}
            />
          ))}

          {/* Active Primary Route: OSRM Road Network or Direct Fallback */}
          {routeSummary && activeRoutePositions.length > 0 && (
            <Polyline
              positions={activeRoutePositions}
              pathOptions={{
                color: routeSummary.isRoadRouted ? '#16794A' : '#2563EB',
                weight: routeSummary.isRoadRouted ? 4.5 : 3,
                dashArray: routeSummary.isRoadRouted ? undefined : '6, 6',
                opacity: 0.9,
              }}
            />
          )}

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
