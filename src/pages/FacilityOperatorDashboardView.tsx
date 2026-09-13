import React, { useState } from 'react';
import { Facility, WasteLot, WasteStatus, WasteType } from '../types';
import { NavTab } from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';
import { 
  Factory, 
  Cpu, 
  Flame, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Sliders, 
  ShieldCheck, 
  Scale, 
  Thermometer, 
  Leaf, 
  TrendingUp, 
  RotateCw, 
  AlertCircle, 
  Truck, 
  FileText, 
  Sparkles, 
  ChevronRight, 
  Play,
  Settings,
  ArrowUpRight,
  Filter,
  X,
  Send,
  AlertTriangle
} from 'lucide-react';
import { WASTE_TYPE_LABELS } from '../data/constants';

interface FacilityOperatorDashboardViewProps {
  wasteLots: WasteLot[];
  facilities: Facility[];
  onSelectTab: (tab: NavTab) => void;
  onSelectLot: (lotId: string) => void;
  onUpdateLotStatus: (lotId: string, newStatus: WasteStatus) => void;
  onRespondToMatchRequest?: (lotId: string, action: 'ACCEPT' | 'REJECT', rejectionReason?: string, facilityId?: string) => Promise<void>;
  onNotifyGateArrival?: (lotId: string) => Promise<void>;
  onOpenReport: (lot: WasteLot) => void;
}

export const FacilityOperatorDashboardView: React.FC<FacilityOperatorDashboardViewProps> = ({
  wasteLots,
  facilities,
  onSelectTab,
  onSelectLot,
  onUpdateLotStatus,
  onRespondToMatchRequest,
  onNotifyGateArrival,
  onOpenReport,
}) => {
  const { user } = useAuth();

  const isDemoFacilityUser = user?.email?.toLowerCase() === 'facility@carboncycle.io';

  // Find the logged-in operator's facility
  // For demo account: falls back to EcoChar. For newly registered operators: strictly matches their own facility or provides clean zero-state
  const myFacility: Facility = (
    facilities.find((f) => user?.email && f.contactEmail?.toLowerCase() === user.email.toLowerCase()) ||
    facilities.find((f) => (user?.id || (user as any)?._id) && (f.operatorId === user?.id || f.operatorId === (user as any)?._id)) ||
    facilities.find((f) => user?.organizationName && (f.name.toLowerCase().includes(user.organizationName.toLowerCase().trim()) || user.organizationName.toLowerCase().includes(f.name.toLowerCase().trim()))) ||
    (isDemoFacilityUser ? (facilities.find((f) => f.name.toLowerCase().includes('ecochar')) || facilities[0]) : null) ||
    {
      id: (user as any)?.facilityId || `FAC-${String(user?.id || user?.email || 'NEW').slice(-4).toUpperCase()}`,
      name: user?.organizationName || `${user?.name || 'Operator'}'s Conversion Center`,
      type: 'BIOCHAR',
      acceptedWasteTypes: ['AGRICULTURAL_RESIDUE', 'BIOMASS_WOOD'],
      maxCapacityTonnes: 50.0,
      availableCapacityTonnes: 50.0,
      location: {
        name: user?.organizationName || 'Regional Conversion Center',
        address: user?.location || 'Gandhinagar Bio-Industrial Zone, Gujarat',
        lat: 23.2156,
        lng: 72.6369,
      },
      processingCostPerTon: 950,
      carbonFactorPerTon: 0.45,
      rating: 5.0,
      contactEmail: user?.email,
      operatorId: user?.id || (user as any)?._id,
      activeBatchesCount: 0,
      status: 'ACTIVE',
    }
  );

  // Local interactive states for facility operator controls
  const [operationalStatus, setOperationalStatus] = useState<'ACTIVE' | 'FULL' | 'MAINTENANCE'>(
    myFacility?.status || 'ACTIVE'
  );
  const [dailyCapacity, setDailyCapacity] = useState<number>(myFacility?.maxCapacityTonnes || 50.0);
  const [isEditingCapacity, setIsEditingCapacity] = useState<boolean>(false);
  const [inboundFilter, setInboundFilter] = useState<'ALL' | 'AVAILABLE' | 'IN_TRANSIT' | 'DELIVERED' | 'PROCESSING'>('ALL');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [busyLotId, setBusyLotId] = useState<string | null>(null);

  // Rejection modal state
  const [rejectingLot, setRejectingLot] = useState<WasteLot | null>(null);
  const [selectedReason, setSelectedReason] = useState<string>('Exceeds maximum allowable moisture content (>25%)');
  const [customReason, setCustomReason] = useState<string>('');

  // Accepted waste types local toggle
  const [acceptedTypes, setAcceptedTypes] = useState<WasteType[]>(
    myFacility?.acceptedWasteTypes || ['AGRICULTURAL_RESIDUE', 'BIOMASS_WOOD']
  );

  const myFacilityType = myFacility?.type;

  // Pending intake requests: ONLY match requests explicitly sent to THIS facility
  const pendingRequests = wasteLots.filter((l) => {
    if (l.status === 'MATCH_REQUESTED') {
      if (l.requestedFacilityId === myFacility?.id) return true;
      if (l.requestedFacilities && l.requestedFacilities.some((r) => r.facilityId === myFacility?.id && r.status === 'PENDING')) return true;
    }
    return false;
  });

  // All lots strictly scoped to THIS facility (matched to it or pending request specifically to it)
  const facilityLots = wasteLots.filter((l) => {
    if (l.matchedFacilityId === myFacility?.id) return true;
    if (l.status === 'MATCH_REQUESTED') {
      if (l.requestedFacilityId === myFacility?.id) return true;
      if (l.requestedFacilities && l.requestedFacilities.some((r) => r.facilityId === myFacility?.id && r.status === 'PENDING')) return true;
    }
    return false;
  });

  const deliveredLots = facilityLots.filter((l) => l.status === 'DELIVERED' || l.status === 'AT_GATE');
  const processingLots = facilityLots.filter((l) => l.status === 'PROCESSING');
  const completedLots = facilityLots.filter((l) => l.status === 'COMPLETED');
  const inTransitLots = facilityLots.filter((l) => l.status === 'IN_TRANSIT' || l.status === 'PICKUP' || l.status === 'MATCHED' || l.status === 'AT_GATE');
  const availableLots = facilityLots.filter((l) => l.status === 'MATCH_REQUESTED');

  // Filtered list based on selected filter tab
  const displayedLots = facilityLots.filter((lot) => {
    if (inboundFilter === 'ALL') return true;
    if (inboundFilter === 'AVAILABLE') return lot.status === 'MATCH_REQUESTED';
    if (inboundFilter === 'IN_TRANSIT') return lot.status === 'IN_TRANSIT' || lot.status === 'PICKUP' || lot.status === 'MATCHED';
    if (inboundFilter === 'DELIVERED') return lot.status === 'DELIVERED';
    if (inboundFilter === 'PROCESSING') return lot.status === 'PROCESSING';
    return true;
  });

  // Calculate live capacity utilization
  const activeProcessingTonnes = processingLots.reduce((sum, l) => sum + l.fingerprint.quantityTonnes, 0);
  const deliveredAwaitingTonnes = deliveredLots.reduce((sum, l) => sum + l.fingerprint.quantityTonnes, 0);
  const currentUtilizedTonnes = activeProcessingTonnes + deliveredAwaitingTonnes;
  const availableRemainingCapacity = Math.max(0, dailyCapacity - currentUtilizedTonnes);
  const utilizationPercent = Math.min(100, Math.round((currentUtilizedTonnes / dailyCapacity) * 100));

  // Calculate carbon & output stats directly from database records (no hardcoded offset)
  const totalCompletedTonnes = completedLots.reduce((sum, l) => sum + l.fingerprint.quantityTonnes, 0);
  const biocharYieldTonnes = (totalCompletedTonnes * 0.35).toFixed(1);
  const netCarbonSequestrationCO2e = (totalCompletedTonnes * 1.2).toFixed(1);
  const estimatedCarbonValueINR = Math.round(Number(netCarbonSequestrationCO2e) * 1200);

  const triggerToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3200);
  };

  const handleStatusChange = async (status: 'ACTIVE' | 'FULL' | 'MAINTENANCE') => {
    setOperationalStatus(status);
    triggerToast(`Facility operational status set to ${status}`);
    if (myFacility?.id) {
      try {
        const { updateFacilityApi } = await import('../services/store');
        await updateFacilityApi(myFacility.id, { status });
      } catch (err) {
        console.warn('Could not persist status change to backend:', err);
      }
    }
  };

  const handleToggleWasteType = async (type: WasteType) => {
    let nextTypes = acceptedTypes;
    if (acceptedTypes.includes(type)) {
      if (acceptedTypes.length > 1) {
        nextTypes = acceptedTypes.filter((t) => t !== type);
        setAcceptedTypes(nextTypes);
        triggerToast(`Removed ${WASTE_TYPE_LABELS[type]?.label || type} from accepted intake`);
      }
    } else {
      nextTypes = [...acceptedTypes, type];
      setAcceptedTypes(nextTypes);
      triggerToast(`Added ${WASTE_TYPE_LABELS[type]?.label || type} to accepted intake`);
    }

    if (myFacility?.id) {
      try {
        const { updateFacilityApi } = await import('../services/store');
        await updateFacilityApi(myFacility.id, { acceptedWasteTypes: nextTypes });
      } catch (err) {
        console.warn('Could not persist accepted types to backend:', err);
      }
    }
  };

  const handleAcceptIntake = async (lot: WasteLot) => {
    if (busyLotId) return;
    setBusyLotId(lot.id);
    const targetFacId = myFacility?.id || 'FAC-ECOCHAR-01';
    try {
      if (onRespondToMatchRequest) {
        await onRespondToMatchRequest(lot.id, 'ACCEPT', undefined, targetFacId);
      } else {
        const { respondToMatchRequestApi } = await import('../services/store');
        await respondToMatchRequestApi(lot.id, 'ACCEPT', undefined, targetFacId);
        onUpdateLotStatus(lot.id, 'MATCHED');
      }
    } finally {
      setBusyLotId(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingLot || busyLotId) return;
    setBusyLotId(rejectingLot.id);
    const finalReason = selectedReason === 'Other' && customReason.trim() ? customReason.trim() : selectedReason;
    const targetFacId = myFacility?.id || 'FAC-ECOCHAR-01';
    try {
      if (onRespondToMatchRequest) {
        await onRespondToMatchRequest(rejectingLot.id, 'REJECT', finalReason, targetFacId);
      } else {
        const { respondToMatchRequestApi } = await import('../services/store');
        await respondToMatchRequestApi(rejectingLot.id, 'REJECT', finalReason, targetFacId);
        onUpdateLotStatus(rejectingLot.id, 'REJECTED');
      }
    } finally {
      setRejectingLot(null);
      setCustomReason('');
      setBusyLotId(null);
    }
  };

  const handleProgressStep = async (lotId: string, nextStatus: WasteStatus) => {
    if (busyLotId) return;
    setBusyLotId(lotId);
    try {
      if (nextStatus === 'AT_GATE') {
        if (onNotifyGateArrival) {
          await onNotifyGateArrival(lotId);
        } else {
          const { notifyGateArrivalApi } = await import('../services/store');
          await notifyGateArrivalApi(lotId);
          onUpdateLotStatus(lotId, 'AT_GATE');
        }
      } else {
        await onUpdateLotStatus(lotId, nextStatus);
      }
    } catch (err) {
      console.error('Failed to progress lot lifecycle:', err);
    } finally {
      setBusyLotId(null);
    }
  };

  return (
    <>
      {/* Toast Notification - Floating outside layout container so it never causes space-y margin shift */}
      {actionSuccessMsg && (
        <div className="fixed top-20 right-6 z-50 pointer-events-none">
          <div className="bg-brand-dark/95 text-white px-4 py-2.5 rounded-btn shadow-modal border border-emerald-500/40 flex items-center gap-2.5 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        </div>
      )}

      <div className="p-6 space-y-6 max-w-7xl mx-auto">

      {/* Facility Hero Banner & Operational Status Control */}
      <div className="bg-surface border border-border rounded-card p-6 shadow-subtle space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="p-2 rounded-btn bg-brand-soft text-brand-primary">
                <Factory className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-carbon-primary tracking-tight">
                {myFacility.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                {myFacility.type} Conversion Center
              </span>
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                ★ {myFacility.rating || 4.9} Rating
              </span>
            </div>

            <p className="text-xs text-carbon-secondary flex flex-wrap items-center gap-2">
              <span>{myFacility.location.address}</span>
              <span>•</span>
              <span className="font-semibold text-carbon-primary">
                Plant Operator: {user?.name || 'Suresh Kumar'}
              </span>
              <span>•</span>
              <span className="font-mono text-carbon-muted">Facility ID: {myFacility.id}</span>
            </p>
          </div>

          {/* Operational Status Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-surface-muted/60 p-2 rounded-btn border border-border">
            <span className="text-[11px] font-bold text-carbon-secondary px-2">Operational State:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleStatusChange('ACTIVE')}
                className={`px-3 py-1.5 rounded text-xs font-extrabold transition flex items-center gap-1.5 ${
                  operationalStatus === 'ACTIVE'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-surface text-carbon-secondary hover:text-carbon-primary hover:bg-surface-muted'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                <span>Active & Accepting</span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange('FULL')}
                className={`px-3 py-1.5 rounded text-xs font-extrabold transition ${
                  operationalStatus === 'FULL'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-surface text-carbon-secondary hover:text-carbon-primary hover:bg-surface-muted'
                }`}
              >
                <span>At Capacity</span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange('MAINTENANCE')}
                className={`px-3 py-1.5 rounded text-xs font-extrabold transition ${
                  operationalStatus === 'MAINTENANCE'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'bg-surface text-carbon-secondary hover:text-carbon-primary hover:bg-surface-muted'
                }`}
              >
                <span>Maintenance</span>
              </button>
            </div>
          </div>
        </div>

        {/* Facility Technology Tagline */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/70 text-xs">
          <div className="flex items-center gap-2 text-carbon-secondary">
            <Sparkles className="w-4 h-4 text-brand-primary" />
            <span>Thermochemical continuous rotary pyrolyzers with syngas energy recapture & biochar sequestering</span>
          </div>
        </div>
      </div>

      {/* Pending Intake Requests Alert (Awaiting Facility Operator Decision) */}
      {pendingRequests.length > 0 && (
        <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-card p-5 space-y-4 shadow-subtle animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-btn bg-amber-500 text-white shadow-sm animate-pulse">
                <AlertCircle className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-base font-black text-carbon-primary flex items-center gap-2">
                  <span>Inbound Waste Intake & Available Feedstock Batches</span>
                  <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    {pendingRequests.length} Ready for Intake
                  </span>
                </h2>
                <p className="text-xs text-carbon-secondary">
                  Review feedstock specifications, claimed requests, and open batches. Choose to Accept Intake or Reject.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((lot) => {
              const wasteMeta = WASTE_TYPE_LABELS[lot.fingerprint.wasteType] || { label: lot.fingerprint.wasteType };
              const isMoistureHigh = lot.fingerprint.moisturePercent > 25;
              const isContamHigh = lot.fingerprint.contaminationPercent > 5;
              const isDirectRequest = lot.status === 'MATCH_REQUESTED';

              return (
                <div
                  key={lot.id}
                  className={`bg-surface border rounded-btn p-4 shadow-sm space-y-3 ${
                    isDirectRequest ? 'border-amber-400 bg-amber-50/20' : 'border-emerald-300 bg-emerald-50/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-carbon-primary">{lot.id}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-soft text-brand-dark uppercase">
                          {wasteMeta.label}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                          isDirectRequest
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}>
                          {isDirectRequest ? '⚡ Intake Requested' : '🌱 Available Batch'}
                        </span>
                      </div>
                      <p className="text-xs text-carbon-secondary mt-0.5">
                        Generator: <span className="font-semibold text-carbon-primary">{lot.generatorName}</span> ({lot.generatorType})
                      </p>
                      <p className="text-[11px] text-carbon-muted">
                        Origin: {lot.fingerprint.location.address}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-brand-primary">
                        {lot.fingerprint.quantityTonnes} t
                      </span>
                      <span className="text-[10px] text-carbon-muted block">Biomass Volume</span>
                    </div>
                  </div>

                  {/* Fingerprint Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-surface-muted/60 p-2.5 rounded text-xs border border-border">
                    <div>
                      <span className="text-[10px] text-carbon-muted block">Moisture</span>
                      <span className={`font-bold ${isMoistureHigh ? 'text-amber-700 font-black' : 'text-emerald-700'}`}>
                        {lot.fingerprint.moisturePercent}% {isMoistureHigh ? '⚠ High' : '✓ Good'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-carbon-muted block">Impurities</span>
                      <span className={`font-bold ${isContamHigh ? 'text-rose-700 font-black' : 'text-emerald-700'}`}>
                        {lot.fingerprint.contaminationPercent}% {isContamHigh ? '⚠ Impure' : '✓ Clean'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-carbon-muted block">Window</span>
                      <span className="font-semibold text-carbon-primary truncate block">
                        {lot.fingerprint.availabilityWindow}
                      </span>
                    </div>
                  </div>

                  {/* Accept / Reject Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/60">
                    <button
                      type="button"
                      onClick={() => {
                        setRejectingLot(lot);
                        setSelectedReason('Exceeds maximum allowable moisture content (>25%)');
                      }}
                      className="px-3 py-1.5 rounded-btn text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-300 transition flex items-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject Request</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAcceptIntake(lot)}
                      className="px-4 py-1.5 rounded-btn text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Accept Intake</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4 Core Operator Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Daily Capacity Utilization */}
        <div className="p-5 bg-surface border border-border rounded-card shadow-subtle space-y-3">
          <div className="flex items-center justify-between text-xs text-carbon-secondary">
            <span className="font-semibold">Daily Intake Capacity</span>
            <button 
              onClick={() => setIsEditingCapacity(!isEditingCapacity)}
              className="text-brand-primary hover:text-brand-dark"
              title="Configure capacity"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-black text-carbon-primary tracking-tight">
                {currentUtilizedTonnes} <span className="text-xs text-carbon-muted font-normal">/ {dailyCapacity} t/d</span>
              </span>
            </div>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
              utilizationPercent > 80 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {utilizationPercent}% Utilized
            </span>
          </div>

          {/* Visual Utilization Meter */}
          <div className="space-y-1">
            <div className="w-full bg-surface-muted rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  utilizationPercent > 85 ? 'bg-amber-500' : 'bg-brand-primary'
                }`}
                style={{ width: `${utilizationPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-carbon-muted font-medium">
              <span>{availableRemainingCapacity} t available headroom</span>
              <span>Max: {dailyCapacity} t</span>
            </div>
          </div>

          {isEditingCapacity && (
            <div className="pt-2 border-t border-border space-y-2 text-xs">
              <label className="text-[11px] font-bold text-carbon-secondary block">
                Adjust Max Daily Intake (t/day):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={5}
                  max={200}
                  value={dailyCapacity}
                  onChange={(e) => setDailyCapacity(Math.max(5, Number(e.target.value)))}
                  className="w-20 px-2 py-1 border border-border rounded text-xs font-bold"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingCapacity(false);
                    triggerToast(`Facility capacity updated to ${dailyCapacity} tonnes/day`);
                  }}
                  className="px-2.5 py-1 bg-brand-primary text-white font-bold rounded text-[11px]"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Metric 2: Inbound Pipeline */}
        <div className="p-5 bg-surface border border-border rounded-card shadow-subtle space-y-3">
          <div className="flex items-center justify-between text-xs text-carbon-secondary">
            <span className="font-semibold">Inbound Feedstock Pipeline</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-blue-700 tracking-tight">
              {inTransitLots.length + deliveredLots.length} <span className="text-xs text-carbon-muted font-normal">batches</span>
            </span>
            <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {deliveredLots.length} At Gate
            </span>
          </div>

          <div className="text-[11px] text-carbon-secondary space-y-1">
            <div className="flex justify-between">
              <span>Awaiting Gate Check-in:</span>
              <span className="font-bold text-carbon-primary">{deliveredLots.length} batches</span>
            </div>
            <div className="flex justify-between">
              <span>En Route (In Transit):</span>
              <span className="font-bold text-blue-600">{inTransitLots.length} trucks</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Active Pyrolysis Reactors */}
        <div className="p-5 bg-surface border border-border rounded-card shadow-subtle space-y-3">
          <div className="flex items-center justify-between text-xs text-carbon-secondary">
            <span className="font-semibold">In-Conversion Throughput</span>
            <Flame className="w-4 h-4 text-amber-600 animate-pulse" />
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-700 tracking-tight">
              {processingLots.length} <span className="text-xs text-carbon-muted font-normal">kilns active</span>
            </span>
            <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {processingLots.length > 0 ? '485°C Optimal' : 'Standby / Ready'}
            </span>
          </div>

          <div className="text-[11px] text-carbon-secondary space-y-1">
            <div className="flex justify-between">
              <span>Feedstock in Kilns:</span>
              <span className="font-bold text-carbon-primary">{activeProcessingTonnes} Tonnes</span>
            </div>
            <div className="flex justify-between">
              <span>Reactor Cycle:</span>
              <span className="font-bold text-emerald-700">Continuous Thermochemical</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Durable Biochar & Carbon Generated */}
        <div className="p-5 bg-surface border border-border rounded-card shadow-subtle space-y-3">
          <div className="flex items-center justify-between text-xs text-carbon-secondary">
            <span className="font-semibold">Biochar Output & Carbon Benefit</span>
            <Leaf className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-700 tracking-tight">
              {Number(netCarbonSequestrationCO2e) > 0 ? `+${netCarbonSequestrationCO2e}` : '0.0'} <span className="text-xs text-carbon-muted font-normal">tCO₂e</span>
            </span>
            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {Number(biocharYieldTonnes) > 0 ? `+${biocharYieldTonnes}t Biochar` : '0.0t Biochar'}
            </span>
          </div>

          <div className="text-[11px] text-carbon-secondary space-y-1">
            <div className="flex justify-between">
              <span>Permanence Rating:</span>
              <span className="font-bold text-carbon-primary">100+ Years Stored</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Carbon Incentive:</span>
              <span className="font-bold text-emerald-700">₹{estimatedCarbonValueINR.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Inbound Intake Pipeline & Reactor Hardware Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Section (8 cols): Inbound Feedstock Batches Queue */}
        <div className="lg:col-span-8 bg-surface border border-border rounded-card p-5 space-y-4 shadow-subtle">
          
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
            <div>
              <h2 className="font-extrabold text-sm text-carbon-primary flex items-center gap-2">
                <Scale className="w-4 h-4 text-brand-primary" />
                <span>Inbound Feedstock Batches & Quality Verification</span>
              </h2>
              <p className="text-xs text-carbon-secondary">
                Review moisture content, contamination level, and log arrivals into reactor feed hoppers.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-btn text-xs">
              <button
                onClick={() => setInboundFilter('ALL')}
                className={`px-2.5 py-1 rounded font-bold text-[11px] transition ${
                  inboundFilter === 'ALL' ? 'bg-surface text-carbon-primary shadow-xs' : 'text-carbon-secondary hover:text-carbon-primary'
                }`}
              >
                All ({facilityLots.length})
              </button>
              <button
                onClick={() => setInboundFilter('AVAILABLE')}
                className={`px-2.5 py-1 rounded font-bold text-[11px] transition ${
                  inboundFilter === 'AVAILABLE' ? 'bg-surface text-emerald-700 shadow-xs' : 'text-carbon-secondary hover:text-carbon-primary'
                }`}
              >
                Available ({availableLots.length})
              </button>
              <button
                onClick={() => setInboundFilter('IN_TRANSIT')}
                className={`px-2.5 py-1 rounded font-bold text-[11px] transition ${
                  inboundFilter === 'IN_TRANSIT' ? 'bg-surface text-blue-600 shadow-xs' : 'text-carbon-secondary hover:text-carbon-primary'
                }`}
              >
                In Transit ({inTransitLots.length})
              </button>
              <button
                onClick={() => setInboundFilter('DELIVERED')}
                className={`px-2.5 py-1 rounded font-bold text-[11px] transition ${
                  inboundFilter === 'DELIVERED' ? 'bg-surface text-emerald-700 shadow-xs' : 'text-carbon-secondary hover:text-carbon-primary'
                }`}
              >
                At Gate ({deliveredLots.length})
              </button>
              <button
                onClick={() => setInboundFilter('PROCESSING')}
                className={`px-2.5 py-1 rounded font-bold text-[11px] transition ${
                  inboundFilter === 'PROCESSING' ? 'bg-surface text-amber-700 shadow-xs' : 'text-carbon-secondary hover:text-carbon-primary'
                }`}
              >
                In Reactor ({processingLots.length})
              </button>
            </div>
          </div>

          {/* Batches List */}
          <div className="space-y-3">
            {displayedLots.length === 0 ? (
              <div className="p-8 text-center text-xs text-carbon-muted bg-surface-muted/30 rounded-btn border border-dashed border-border">
                No waste batches currently match the "{inboundFilter}" filter.
              </div>
            ) : (
              displayedLots.map((lot) => {
                const isMoistureOptimal = lot.fingerprint.moisturePercent <= 25;
                const isContaminationClean = lot.fingerprint.contaminationPercent <= 5;

                return (
                  <div
                    key={lot.id}
                    className="p-4 bg-surface border border-border hover:border-brand-primary/40 rounded-card transition shadow-xs space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-carbon-primary">{lot.id}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-soft text-brand-dark uppercase">
                          {WASTE_TYPE_LABELS[lot.fingerprint.wasteType]?.label || lot.fingerprint.wasteType}
                        </span>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                          lot.status === 'AT_GATE'
                            ? 'bg-blue-100 text-blue-900 border-blue-300 animate-pulse'
                            : lot.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : lot.status === 'PROCESSING'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : lot.status === 'DELIVERED'
                            ? 'bg-purple-100 text-purple-800 border-purple-300'
                            : lot.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : 'bg-surface-muted text-carbon-secondary border-border'
                        }`}>
                          {lot.status === 'AT_GATE' ? 'WAITING AT GATE' : lot.status}
                        </span>
                      </div>

                      <span className="text-xs font-black text-brand-primary">
                        {lot.fingerprint.quantityTonnes} Tonnes
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-surface-muted/40 p-2.5 rounded-btn text-xs border border-border/60">
                      <div>
                        <span className="text-carbon-muted text-[10px] block">Generator</span>
                        <span className="font-semibold text-carbon-primary truncate block">{lot.generatorName}</span>
                      </div>

                      <div>
                        <span className="text-carbon-muted text-[10px] block">Quality Fingerprint</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[11px] font-bold ${isMoistureOptimal ? 'text-emerald-700' : 'text-amber-700'}`}>
                            {lot.fingerprint.moisturePercent}% Moisture
                          </span>
                          <span>•</span>
                          <span className={`text-[11px] font-bold ${isContaminationClean ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {lot.fingerprint.contaminationPercent}% Impurity
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-carbon-muted text-[10px] block">Pyrolysis Fit</span>
                        <span className="font-extrabold text-brand-primary text-xs">
                          {isMoistureOptimal && isContaminationClean ? '✓ Grade-A Biochar Feedstock' : '⚠ Requires Pre-Drying'}
                        </span>
                      </div>
                    </div>

                    {/* Interactive Lifecycle Progress Stepper */}
                    <div className="bg-surface-muted/40 border border-border/70 rounded-btn p-2 text-[10px] space-y-1">
                      <div className="flex items-center justify-between text-carbon-secondary text-[10px] font-semibold">
                        <span>Intake-to-Carbon Stage:</span>
                        <span className="font-extrabold text-brand-dark">
                          {lot.status === 'MATCH_REQUESTED' && '⏳ Awaiting Facility Acceptance'}
                          {(lot.status === 'LISTED' || lot.status === 'ANALYZED') && '🌱 Available Feedstock Batch'}
                          {lot.status === 'MATCHED' && 'Step 1/5: Accepted – Ready to Dispatch Vehicle'}
                          {lot.status === 'PICKUP' && 'Step 1/5: Vehicle Dispatched for Pickup'}
                          {lot.status === 'IN_TRANSIT' && 'Step 2/5: Waste In Transit to Facility'}
                          {lot.status === 'AT_GATE' && 'Step 3/5: Arrived at Gate – Awaiting Weighbridge'}
                          {lot.status === 'DELIVERED' && 'Step 3/5: Weighed & Admitted to Feedstock Yard'}
                          {lot.status === 'PROCESSING' && 'Step 4/5: Active in Conversion Reactor'}
                          {lot.status === 'COMPLETED' && 'Step 5/5: Conversion Complete & MRV Certified'}
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-1 pt-1">
                        {[
                          { step: 1, label: 'Accepted', done: ['MATCHED', 'PICKUP', 'IN_TRANSIT', 'AT_GATE', 'DELIVERED', 'PROCESSING', 'COMPLETED'].includes(lot.status), current: lot.status === 'MATCHED' || lot.status === 'PICKUP' },
                          { step: 2, label: 'Transit', done: ['IN_TRANSIT', 'AT_GATE', 'DELIVERED', 'PROCESSING', 'COMPLETED'].includes(lot.status), current: lot.status === 'IN_TRANSIT' },
                          { step: 3, label: 'At Gate', done: ['AT_GATE', 'DELIVERED', 'PROCESSING', 'COMPLETED'].includes(lot.status), current: lot.status === 'AT_GATE' || lot.status === 'DELIVERED' },
                          { step: 4, label: 'Reactor', done: ['PROCESSING', 'COMPLETED'].includes(lot.status), current: lot.status === 'PROCESSING' },
                          { step: 5, label: 'Certified', done: lot.status === 'COMPLETED', current: lot.status === 'COMPLETED' },
                        ].map((s) => (
                          <div
                            key={s.step}
                            className={`text-center py-1 px-0.5 rounded font-bold text-[9px] truncate transition ${
                              s.current
                                ? 'bg-amber-100 text-amber-900 border border-amber-400 shadow-xs animate-pulse'
                                : s.done
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-surface text-carbon-muted border border-border/50'
                            }`}
                          >
                            {s.done && !s.current ? '✓ ' : ''}{s.step}. {s.label}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Operator Workflow Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="text-[11px] text-carbon-muted flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Window: {lot.fingerprint.availabilityWindow}</span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {lot.status === 'MATCH_REQUESTED' && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={busyLotId === lot.id}
                              onClick={() => handleAcceptIntake(lot)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-btn flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
                              title="Accept this waste batch for facility intake"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{busyLotId === lot.id ? 'Accepting...' : 'Accept Intake Request'}</span>
                            </button>
                            <button
                              type="button"
                              disabled={busyLotId === lot.id}
                              onClick={() => {
                                setRejectingLot(lot);
                                setSelectedReason('Exceeds maximum allowable moisture content (>25%)');
                              }}
                              className="px-2.5 py-1.5 rounded-btn text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition"
                            >
                              Decline
                            </button>
                          </div>
                        )}

                        {(lot.status === 'MATCHED' || lot.status === 'PICKUP' || lot.status === 'IN_TRANSIT') && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-btn flex items-center gap-1.5">
                              <Truck className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                              <span>In Transit from Generator</span>
                            </span>
                            <button
                              type="button"
                              disabled={busyLotId === lot.id}
                              onClick={() => handleProgressStep(lot.id, 'AT_GATE')}
                              className="bg-carbon-primary hover:bg-black text-white font-bold text-xs px-3 py-1.5 rounded-btn flex items-center gap-1 transition shadow-xs disabled:opacity-50"
                              title="Record arrival at facility gate"
                            >
                              <span>{busyLotId === lot.id ? 'Logging...' : 'Mark Gate Arrival →'}</span>
                            </button>
                          </div>
                        )}

                        {lot.status === 'AT_GATE' && (
                          <button
                            type="button"
                            disabled={busyLotId === lot.id}
                            onClick={() => handleProgressStep(lot.id, 'DELIVERED')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-btn flex items-center gap-1.5 transition shadow-xs animate-pulse disabled:opacity-50"
                          >
                            <Scale className="w-3.5 h-3.5" />
                            <span>{busyLotId === lot.id ? 'Weighing...' : 'Gate Check-In & Weighbridge Intake →'}</span>
                          </button>
                        )}

                        {lot.status === 'DELIVERED' && (
                          <button
                            type="button"
                            disabled={busyLotId === lot.id}
                            onClick={() => handleProgressStep(lot.id, 'PROCESSING')}
                            className="bg-brand-primary hover:bg-brand-dark text-white font-bold text-xs px-3.5 py-1.5 rounded-btn flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
                          >
                            <Flame className="w-3.5 h-3.5" />
                            <span>{busyLotId === lot.id ? 'Loading...' : `Load into ${myFacility.type || 'Conversion'} Reactor →`}</span>
                          </button>
                        )}

                        {lot.status === 'PROCESSING' && (
                          <button
                            type="button"
                            disabled={busyLotId === lot.id}
                            onClick={() => handleProgressStep(lot.id, 'COMPLETED')}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-btn flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{busyLotId === lot.id ? 'Certifying...' : 'Complete Conversion & Issue Certificate →'}</span>
                          </button>
                        )}

                        {lot.status === 'COMPLETED' && (
                          <button
                            type="button"
                            onClick={() => onOpenReport(lot)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-btn flex items-center gap-1.5 transition shadow-xs"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View Digital Impact Certificate →</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Section (4 cols): Live Equipment Telemetry & Feedstock Specs */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Live Kiln & Hardware Telemetry */}
          <div className="bg-surface border border-border rounded-card p-5 space-y-4 shadow-subtle">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h2 className="font-extrabold text-xs uppercase tracking-wider text-carbon-primary flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-amber-600" />
                <span>Reactor Telemetry & State</span>
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Kiln 1 */}
              <div className="p-3 bg-surface-muted/50 rounded-btn border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-carbon-primary">Kiln Retort #1 (Rotary)</span>
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                    processingLots.length > 0 ? 'text-emerald-800 bg-emerald-100' : 'text-carbon-secondary bg-surface-muted'
                  }`}>
                    {processingLots.length > 0 ? 'Running (485°C)' : 'Standby (28°C)'}
                  </span>
                </div>
                <div className="flex justify-between text-carbon-secondary text-[11px]">
                  <span>Feed Rate: {processingLots.length > 0 ? '1.2 t/hr' : '0.0 t/hr'}</span>
                  <span>Syngas Draft: {processingLots.length > 0 ? 'Normal' : 'Idle'}</span>
                </div>
                <div className="w-full bg-surface-muted rounded-full h-1.5 overflow-hidden">
                  <div className={`h-full ${processingLots.length > 0 ? 'bg-emerald-600 w-[82%]' : 'bg-carbon-muted/40 w-[0%]'}`} />
                </div>
              </div>

              {/* Kiln 2 */}
              <div className="p-3 bg-surface-muted/50 rounded-btn border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-carbon-primary">Kiln Retort #2 (Batch Bed)</span>
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                    processingLots.length > 1 ? 'text-blue-800 bg-blue-100' : 'text-carbon-secondary bg-surface-muted'
                  }`}>
                    {processingLots.length > 1 ? 'Pre-Heating (280°C)' : 'Standby (28°C)'}
                  </span>
                </div>
                <div className="flex justify-between text-carbon-secondary text-[11px]">
                  <span>Bed Space: {dailyCapacity}t Available</span>
                  <span>Target: 520°C</span>
                </div>
                <div className="w-full bg-surface-muted rounded-full h-1.5 overflow-hidden">
                  <div className={`h-full ${processingLots.length > 1 ? 'bg-blue-600 w-[55%]' : 'bg-carbon-muted/40 w-[0%]'}`} />
                </div>
              </div>

              {/* Pre-Dryer */}
              <div className="p-3 bg-surface-muted/50 rounded-btn border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-carbon-primary">Flue-Gas Pre-Dryer</span>
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                    processingLots.length > 0 ? 'text-emerald-800 bg-emerald-100' : 'text-carbon-secondary bg-surface-muted'
                  }`}>
                    {processingLots.length > 0 ? 'Online (18% MC)' : 'Standby (0% Load)'}
                  </span>
                </div>
                <div className="flex justify-between text-carbon-secondary text-[11px]">
                  <span>Waste Heat Reclaim: {processingLots.length > 0 ? '85kW' : '0kW'}</span>
                  <span>Exhaust: Normal</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feedstock Acceptance Specifications Config */}
          <div className="bg-surface border border-border rounded-card p-5 space-y-4 shadow-subtle">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h2 className="font-extrabold text-xs uppercase tracking-wider text-carbon-primary flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-brand-primary" />
                <span>Intake Specifications</span>
              </h2>
              <span className="text-[10px] text-carbon-muted">Configurable</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-bold text-carbon-secondary text-[11px] block mb-1.5">
                  Accepted Feedstock Categories:
                </span>
                <div className="space-y-1.5">
                  {(['AGRICULTURAL_RESIDUE', 'BIOMASS_WOOD', 'FOOD_WASTE', 'ANIMAL_MANURE'] as WasteType[]).map((type) => {
                    const isAccepted = acceptedTypes.includes(type);
                    return (
                      <div
                        key={type}
                        onClick={() => handleToggleWasteType(type)}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer border transition text-xs ${
                          isAccepted
                            ? 'bg-brand-soft/60 border-brand-primary/40 font-bold text-brand-dark'
                            : 'bg-surface border-border text-carbon-muted hover:bg-surface-muted'
                        }`}
                      >
                        <span>{WASTE_TYPE_LABELS[type]?.label || type}</span>
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                          isAccepted ? 'bg-brand-primary text-white' : 'bg-surface-muted text-carbon-muted'
                        }`}>
                          {isAccepted ? 'Accepting' : 'Disabled'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 border-t border-border space-y-2 text-[11px] text-carbon-secondary">
                <div className="flex justify-between">
                  <span>Max Moisture Content:</span>
                  <span className="font-bold text-carbon-primary">≤ 25% Moisture</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Contamination Limit:</span>
                  <span className="font-bold text-carbon-primary">≤ 5% Inorganics</span>
                </div>
                <div className="flex justify-between">
                  <span>Standard Gate Fee:</span>
                  <span className="font-bold text-brand-primary">₹{myFacility.processingCostPerTon} / Tonne</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Rejection Modal Dialog */}
      {rejectingLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface border border-border rounded-card max-w-md w-full p-5 space-y-4 shadow-modal text-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h3 className="font-extrabold text-sm text-carbon-primary">
                  Decline Waste Batch Intake ({rejectingLot.id})
                </h3>
              </div>
              <button
                onClick={() => setRejectingLot(null)}
                className="text-carbon-muted hover:text-carbon-primary p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-carbon-secondary leading-relaxed">
              Please specify the reason for declining this intake request from <span className="font-semibold text-carbon-primary">{rejectingLot.generatorName}</span>. The generator will receive a live notification in MongoDB and will be provided alternative facilities.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-carbon-secondary block">
                Primary Reason:
              </label>
              {[
                'Exceeds maximum allowable moisture content (>25%)',
                'Feedstock impurities / contamination exceeds limits (>5%)',
                'Rotary kiln lines currently at 100% daily capacity',
                'Pickup window conflicts with planned plant maintenance',
                'Other',
              ].map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition ${
                    selectedReason === reason
                      ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold'
                      : 'bg-surface border-border text-carbon-secondary hover:bg-surface-muted'
                  }`}
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}

              {selectedReason === 'Other' && (
                <div className="pt-2">
                  <textarea
                    rows={2}
                    placeholder="Enter custom rejection reason..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="w-full p-2 border border-border rounded text-xs focus:border-rose-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setRejectingLot(null)}
                className="px-3 py-1.5 border border-border rounded-btn text-carbon-secondary font-semibold hover:bg-surface-muted"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-btn shadow-sm transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirm & Send Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};
