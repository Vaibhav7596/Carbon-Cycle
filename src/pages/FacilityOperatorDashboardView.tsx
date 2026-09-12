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
  Filter
} from 'lucide-react';
import { WASTE_TYPE_LABELS } from '../data/constants';

interface FacilityOperatorDashboardViewProps {
  wasteLots: WasteLot[];
  facilities: Facility[];
  onSelectTab: (tab: NavTab) => void;
  onSelectLot: (lotId: string) => void;
  onUpdateLotStatus: (lotId: string, newStatus: WasteStatus) => void;
  onOpenReport: (lot: WasteLot) => void;
}

export const FacilityOperatorDashboardView: React.FC<FacilityOperatorDashboardViewProps> = ({
  wasteLots,
  facilities,
  onSelectTab,
  onSelectLot,
  onUpdateLotStatus,
  onOpenReport,
}) => {
  const { user } = useAuth();

  // Find the logged-in operator's facility
  const myFacility = facilities.find(
    (f) =>
      (user?.organizationName && f.name.toLowerCase().includes(user.organizationName.toLowerCase())) ||
      f.name.toLowerCase().includes('ecochar')
  ) || facilities[0];

  // Local interactive states for facility operator controls
  const [operationalStatus, setOperationalStatus] = useState<'ACTIVE' | 'FULL' | 'MAINTENANCE'>(
    myFacility?.status || 'ACTIVE'
  );
  const [dailyCapacity, setDailyCapacity] = useState<number>(myFacility?.maxCapacityTonnes || 50.0);
  const [isEditingCapacity, setIsEditingCapacity] = useState<boolean>(false);
  const [inboundFilter, setInboundFilter] = useState<'ALL' | 'IN_TRANSIT' | 'DELIVERED' | 'PROCESSING'>('ALL');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Accepted waste types local toggle
  const [acceptedTypes, setAcceptedTypes] = useState<WasteType[]>(
    myFacility?.acceptedWasteTypes || ['AGRICULTURAL_RESIDUE', 'BIOMASS_WOOD']
  );

  // Filter lots related to this facility (or matching its technology/type)
  const facilityLots = wasteLots.filter(
    (l) =>
      l.matchedFacilityId === myFacility.id ||
      l.matchedFacilityName?.toLowerCase().includes('ecochar') ||
      l.selectedPathway === myFacility.type ||
      l.fingerprint.wasteType === 'AGRICULTURAL_RESIDUE'
  );

  const deliveredLots = facilityLots.filter((l) => l.status === 'DELIVERED');
  const processingLots = facilityLots.filter((l) => l.status === 'PROCESSING');
  const completedLots = facilityLots.filter((l) => l.status === 'COMPLETED');
  const inTransitLots = facilityLots.filter((l) => l.status === 'IN_TRANSIT' || l.status === 'PICKUP' || l.status === 'MATCHED');

  // Filtered list based on selected filter tab
  const displayedLots = facilityLots.filter((lot) => {
    if (inboundFilter === 'ALL') return true;
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

  // Calculate carbon & output stats
  const totalCompletedTonnes = completedLots.reduce((sum, l) => sum + l.fingerprint.quantityTonnes, 0) + 120;
  const biocharYieldTonnes = (totalCompletedTonnes * 0.35).toFixed(1);
  const netCarbonSequestrationCO2e = (totalCompletedTonnes * 0.45 + totalCompletedTonnes * 0.75).toFixed(1);
  const estimatedCarbonValueINR = Math.round(Number(netCarbonSequestrationCO2e) * 1200);

  const triggerToast = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const handleStatusChange = (status: 'ACTIVE' | 'FULL' | 'MAINTENANCE') => {
    setOperationalStatus(status);
    triggerToast(`Facility operational status set to ${status}`);
  };

  const handleToggleWasteType = (type: WasteType) => {
    if (acceptedTypes.includes(type)) {
      if (acceptedTypes.length > 1) {
        setAcceptedTypes(acceptedTypes.filter((t) => t !== type));
        triggerToast(`Removed ${WASTE_TYPE_LABELS[type]?.label || type} from accepted intake`);
      }
    } else {
      setAcceptedTypes([...acceptedTypes, type]);
      triggerToast(`Added ${WASTE_TYPE_LABELS[type]?.label || type} to accepted intake`);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="fixed top-20 right-6 z-50 bg-brand-dark text-white px-4 py-2.5 rounded-btn shadow-lg flex items-center gap-2 text-xs font-semibold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

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

        {/* Quick Operator Nav Links */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/70 text-xs">
          <div className="flex items-center gap-2 text-carbon-secondary">
            <Sparkles className="w-4 h-4 text-brand-primary" />
            <span>Thermochemical continuous rotary pyrolyzers with syngas energy recapture</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectTab('PROCESSING')}
              className="flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-brand-dark bg-brand-soft/70 hover:bg-brand-soft px-3 py-1.5 rounded-btn border border-brand-primary/30 transition"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Launch Processing Kiln Board</span>
            </button>
            <button
              onClick={() => onSelectTab('LOGISTICS')}
              className="flex items-center gap-1.5 text-xs font-semibold text-carbon-primary hover:bg-surface-muted px-3 py-1.5 rounded-btn border border-border transition"
            >
              <Truck className="w-3.5 h-3.5 text-carbon-muted" />
              <span>Track Inbound Trucks</span>
            </button>
          </div>
        </div>
      </div>

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
              485°C Optimal
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
              +{netCarbonSequestrationCO2e} <span className="text-xs text-carbon-muted font-normal">tCO₂e</span>
            </span>
            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              +{biocharYieldTonnes}t Biochar
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
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                          lot.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : lot.status === 'PROCESSING'
                            ? 'bg-amber-100 text-amber-800'
                            : lot.status === 'DELIVERED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-surface-muted text-carbon-secondary'
                        }`}>
                          {lot.status}
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

                    {/* Operator Workflow Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="text-[11px] text-carbon-muted flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pickup/Intake window: {lot.fingerprint.availabilityWindow}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {lot.status === 'IN_TRANSIT' && (
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateLotStatus(lot.id, 'DELIVERED');
                              triggerToast(`Batch ${lot.id} logged as DELIVERED at facility gate.`);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-btn flex items-center gap-1 transition shadow-xs"
                          >
                            <Scale className="w-3.5 h-3.5" />
                            <span>Log Gate Arrival & Weigh-in</span>
                          </button>
                        )}

                        {lot.status === 'DELIVERED' && (
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateLotStatus(lot.id, 'PROCESSING');
                              triggerToast(`Batch ${lot.id} loaded into Pyrolysis Reactor.`);
                            }}
                            className="bg-brand-primary hover:bg-brand-dark text-white font-bold text-xs px-3 py-1.5 rounded-btn flex items-center gap-1 transition shadow-xs"
                          >
                            <Flame className="w-3.5 h-3.5" />
                            <span>Load into Pyrolysis Reactor</span>
                          </button>
                        )}

                        {lot.status === 'PROCESSING' && (
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateLotStatus(lot.id, 'COMPLETED');
                              triggerToast(`Batch ${lot.id} conversion completed! Carbon impact recorded.`);
                            }}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3 py-1.5 rounded-btn flex items-center gap-1 transition shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Complete & Certify Yield</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onOpenReport(lot)}
                          className="bg-surface hover:bg-surface-muted text-carbon-primary border border-border font-semibold text-xs px-2.5 py-1.5 rounded-btn transition"
                        >
                          Certificate
                        </button>
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
                  <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                    Running (485°C)
                  </span>
                </div>
                <div className="flex justify-between text-carbon-secondary text-[11px]">
                  <span>Feed Rate: 1.2 t/hr</span>
                  <span>Syngas Draft: Normal</span>
                </div>
                <div className="w-full bg-surface-muted rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-600 h-full w-[82%]" />
                </div>
              </div>

              {/* Kiln 2 */}
              <div className="p-3 bg-surface-muted/50 rounded-btn border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-carbon-primary">Kiln Retort #2 (Batch Bed)</span>
                  <span className="text-[10px] font-extrabold text-blue-800 bg-blue-100 px-1.5 py-0.5 rounded">
                    Pre-Heating (280°C)
                  </span>
                </div>
                <div className="flex justify-between text-carbon-secondary text-[11px]">
                  <span>Bed Space: 12t Available</span>
                  <span>Target: 520°C</span>
                </div>
                <div className="w-full bg-surface-muted rounded-full h-1.5 overflow-hidden">
                  <div className="bg-blue-600 h-full w-[55%]" />
                </div>
              </div>

              {/* Pre-Dryer */}
              <div className="p-3 bg-surface-muted/50 rounded-btn border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-carbon-primary">Flue-Gas Pre-Dryer</span>
                  <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                    Online (18% MC)
                  </span>
                </div>
                <div className="flex justify-between text-carbon-secondary text-[11px]">
                  <span>Waste Heat Reclaim: 85kW</span>
                  <span>Exhaust: Filtered</span>
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

    </div>
  );
};
