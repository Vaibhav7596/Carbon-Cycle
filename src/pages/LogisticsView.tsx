import React from 'react';
import { Facility, WasteLot, WasteStatus } from '../types';
import { NetworkMap } from '../components/map/NetworkMap';
import { updateLotLifecycleStatus } from '../services/store';
import { calculateHaversineDistanceKm, calculateTravelTimeMinutes, calculateTransportEmissionsCO2e } from '../utils/haversine';
import { Truck, MapPin, Navigation, Clock, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LogisticsViewProps {
  wasteLots: WasteLot[];
  facilities: Facility[];
  selectedLotId?: string;
  onSelectLot: (lotId: string) => void;
  onUpdateLotStatus: (lotId: string, newStatus: WasteStatus) => void;
}

export const LogisticsView: React.FC<LogisticsViewProps> = ({
  wasteLots,
  facilities,
  selectedLotId,
  onSelectLot,
  onUpdateLotStatus,
}) => {
  const { user } = useAuth();
  const isFacilityOperator = user?.role === 'facility_operator';

  // Select active lot (or default to first matched lot)
  const activeLot = wasteLots.find((l) => l.id === selectedLotId) || wasteLots.find((l) => l.matchedFacilityName) || wasteLots[0];

  if (!activeLot) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h1 className="text-xl font-extrabold text-carbon-primary tracking-tight">Real-Time Waste Logistics & Transit</h1>
            <p className="text-xs text-carbon-secondary">Telemetry, GIS route navigation, and weighbridge gate logs.</p>
          </div>
        </div>

        <div className="p-12 text-center bg-surface border border-dashed border-border rounded-card space-y-4 max-w-xl mx-auto my-12">
          <div className="w-12 h-12 rounded-full bg-surface-muted text-carbon-muted flex items-center justify-center mx-auto">
            <Truck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-carbon-primary">No Batches in Transit</h3>
            <p className="text-xs text-carbon-secondary leading-relaxed">
              No waste batches are currently logged or routed for logistics transit. Once a batch is registered and matched with a destination facility, real-time GPS transit tracking and weighbridge gate updates will appear here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { fingerprint, matchedFacilityName, matchedFacilityLocation, logistics, status } = activeLot;

  const distanceKm = (fingerprint?.location && matchedFacilityLocation)
    ? (calculateHaversineDistanceKm(
        fingerprint.location.lat,
        fingerprint.location.lng,
        matchedFacilityLocation.lat,
        matchedFacilityLocation.lng
      ) || 18.4)
    : (logistics?.distanceKm || 18.4);

  const [isUpdating, setIsUpdating] = React.useState(false);

  const travelTimeMins = calculateTravelTimeMinutes(distanceKm);
  const transportEmissions = calculateTransportEmissionsCO2e(distanceKm, fingerprint?.quantityTonnes || 10);

  // Moves from and after transit (IN_TRANSIT, AT_GATE, DELIVERED, PROCESSING) are restricted to facility operators only
  const isFacilityControlledStatus = status === 'IN_TRANSIT' || status === 'AT_GATE' || status === 'DELIVERED' || status === 'PROCESSING';

  const handleNextStatus = async () => {
    if (isUpdating) return;
    if (!isFacilityOperator && isFacilityControlledStatus) return;

    let nextSt: WasteStatus = 'PICKUP';
    if (status === 'MATCHED') nextSt = 'PICKUP';
    else if (status === 'PICKUP') nextSt = 'IN_TRANSIT';
    else if (status === 'IN_TRANSIT') nextSt = 'AT_GATE';
    else if (status === 'AT_GATE') nextSt = 'DELIVERED';
    else if (status === 'DELIVERED') nextSt = 'PROCESSING';
    else if (status === 'PROCESSING') nextSt = 'COMPLETED';
    else return;

    setIsUpdating(true);
    try {
      await onUpdateLotStatus(activeLot.id, nextSt);
    } finally {
      setTimeout(() => setIsUpdating(false), 500);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-carbon-primary tracking-tight">Logistics & GIS Route Tracker</h1>
          <p className="text-xs text-carbon-secondary">Source-to-facility transit route planning and pickup lifecycle controls.</p>
        </div>

        {/* Lot Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-carbon-secondary">Select Active Batch:</span>
          <select
            value={activeLot.id}
            onChange={(e) => onSelectLot(e.target.value)}
            className="bg-surface border border-border rounded-btn px-3 py-1.5 text-xs font-bold text-carbon-primary focus:outline-none"
          >
            {wasteLots.map((l) => (
              <option key={l.id} value={l.id}>
                {l.id} ({l.generatorName} - {l.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Split Screen Layout (3 cols left details / 5 cols right map) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 cols): Pickup Details & Lifecycle Controls */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Batch Summary Card */}
          <div className="bg-surface border border-border rounded-card p-5 space-y-4 shadow-subtle">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <span className="font-extrabold text-sm text-carbon-primary">{activeLot.id}</span>
                <p className="text-xs text-carbon-secondary">{activeLot.generatorName}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-soft text-brand-dark">
                {activeLot.status}
              </span>
            </div>

            {/* Source & Destination */}
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                  A
                </div>
                <div>
                  <span className="text-[10px] text-carbon-muted uppercase font-bold block">Waste Source Origin</span>
                  <span className="font-bold text-carbon-primary">{fingerprint.location.name}</span>
                  <p className="text-[11px] text-carbon-secondary">{fingerprint.location.address}</p>
                </div>
              </div>

              <div className="pl-3 border-l-2 border-dashed border-border ml-3 my-1 py-1.5 flex items-center justify-between text-[11px]">
                <span className="font-bold text-brand-primary">
                  {distanceKm} km Haversine Distance
                </span>
                <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  ⏱ {travelTimeMins} mins est. travel time
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                  B
                </div>
                <div>
                  <span className="text-[10px] text-carbon-muted uppercase font-bold block">Conversion Destination</span>
                  <span className="font-bold text-carbon-primary">{matchedFacilityName || 'Gujarat EcoChar Center'}</span>
                  <p className="text-[11px] text-carbon-secondary">{matchedFacilityLocation?.address || 'Gandhinagar Bio-Park'}</p>
                </div>
              </div>
            </div>

            {/* Vehicle & Logistics Details */}
            <div className="grid grid-cols-2 gap-2 bg-surface-muted/60 p-3 rounded-btn text-xs">
              <div>
                <span className="text-[10px] text-carbon-muted block">Assigned Driver</span>
                <span className="font-bold text-carbon-primary">{logistics?.driverName || 'Ramesh Patel'}</span>
              </div>
              <div>
                <span className="text-[10px] text-carbon-muted block">Vehicle Plate</span>
                <span className="font-mono font-bold text-carbon-primary">{logistics?.truckNumber || 'GJ-18-BC-4092'}</span>
              </div>
              <div>
                <span className="text-[10px] text-carbon-muted block">Estimated Travel Time</span>
                <span className="font-bold text-blue-700">{travelTimeMins} minutes</span>
              </div>
              <div>
                <span className="text-[10px] text-carbon-muted block">Transport Emissions</span>
                <span className="font-semibold text-amber-700">{transportEmissions} tCO₂e</span>
              </div>
            </div>

            {/* Lifecycle Action Button */}
            <div className="pt-2">
              {status === 'COMPLETED' ? (
                <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-btn text-center font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Batch Conversion Completed & Certified</span>
                </div>
              ) : isFacilityControlledStatus && !isFacilityOperator ? (
                <div className="p-3 bg-surface-muted/90 border border-border/80 rounded-btn text-center space-y-1 shadow-xs">
                  <div className="flex items-center justify-center gap-1.5 font-bold text-xs text-carbon-primary">
                    <ShieldCheck className="w-4 h-4 text-brand-primary" />
                    <span>Next Phase Controlled by Facility Hub</span>
                  </div>
                  <p className="text-[11px] text-carbon-secondary leading-relaxed">
                    {status === 'IN_TRANSIT' && `Truck is in transit. Gate arrival will be recorded by ${matchedFacilityName || 'the facility operator'}.`}
                    {status === 'AT_GATE' && `Truck is at gate. Weighbridge check-in and moisture verification are performed by ${matchedFacilityName || 'the facility operator'}.`}
                    {status === 'DELIVERED' && `Feedstock delivered. Reactor feeding is initiated by ${matchedFacilityName || 'the facility operator'}.`}
                    {status === 'PROCESSING' && `Conversion in progress. Digital impact certificate will be issued by ${matchedFacilityName || 'the facility operator'}.`}
                  </p>
                </div>
              ) : (
                <button
                  disabled={isUpdating}
                  onClick={handleNextStatus}
                  className={`w-full bg-brand-primary hover:bg-brand-dark text-white font-bold text-xs py-2.5 px-4 rounded-btn shadow-sm flex items-center justify-center gap-2 transition ${
                    isUpdating ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <span>
                    {isUpdating ? 'Updating Status...' : (
                      <>
                        {status === 'MATCHED' && 'Start Pickup Dispatch →'}
                        {status === 'PICKUP' && 'Mark Picked Up & In-Transit →'}
                        {status === 'IN_TRANSIT' && 'Mark Truck Arrived at Facility Gate →'}
                        {status === 'AT_GATE' && 'Complete Weighbridge Check-In & Intake →'}
                        {status === 'DELIVERED' && 'Load Feedstock into Conversion Reactor →'}
                        {status === 'PROCESSING' && 'Mark Conversion Completed & Issue Certificate →'}
                      </>
                    )}
                  </span>
                </button>
              )}
            </div>

          </div>

          {/* Timeline Stepper Trail */}
          <div className="bg-surface border border-border rounded-card p-5 space-y-3 shadow-subtle">
            <h3 className="font-bold text-xs uppercase tracking-wider text-carbon-muted">
              Lifecycle Event Audit Log
            </h3>
            <div className="space-y-2 text-xs">
              {activeLot.timeline
                .filter((entry, idx, arr) => idx === 0 || entry.status !== arr[idx - 1].status)
                .map((entry, idx) => (
                <div key={idx} className="flex items-start gap-2.5 border-b border-border/40 pb-2 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-brand-primary mt-1.5 flex-shrink-0"></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-carbon-primary">{entry.status}</span>
                      <span className="text-[10px] text-carbon-muted">{entry.timestamp}</span>
                    </div>
                    <p className="text-carbon-secondary text-[11px]">{entry.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (7 cols): Route Map Visualization */}
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-carbon-primary uppercase tracking-wider">
            <span>Source to Facility GIS Transit Line</span>
          </div>

          <NetworkMap
            wasteLots={[activeLot]}
            facilities={facilities}
            selectedLotId={activeLot.id}
            height="560px"
          />
        </div>

      </div>

    </div>
  );
};
