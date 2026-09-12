import React from 'react';
import { Facility, WasteLot } from '../types';
import { NetworkMap } from '../components/map/NetworkMap';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';
import { NavTab } from '../components/layout/Sidebar';
import { Trash2, Factory, Leaf, ArrowUpRight, TrendingUp, CheckCircle2, Truck, Plus, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardViewProps {
  wasteLots: WasteLot[];
  facilities: Facility[];
  onSelectTab: (tab: NavTab) => void;
  onSelectLot: (lotId: string) => void;
  onSelectFacility: (facilityId: string) => void;
}

const trendData = [
  { month: 'Apr', total: 7200, diverted: 4500, co2e: 2400 },
  { month: 'May', total: 8500, diverted: 5400, co2e: 3100 },
  { month: 'Jun', total: 9800, diverted: 6200, co2e: 3700 },
  { month: 'Jul', total: 10400, diverted: 6800, co2e: 4100 },
  { month: 'Aug', total: 11600, diverted: 7600, co2e: 4400 },
  { month: 'Sep', total: 12840, diverted: 8420, co2e: 4820 },
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  wasteLots,
  facilities,
  onSelectTab,
  onSelectLot,
  onSelectFacility,
}) => {
  // Aggregate live metrics
  const totalWasteTonnes = wasteLots.reduce((acc, l) => acc + l.fingerprint.quantityTonnes, 0) + 12800;
  const totalNetCO2e = wasteLots.reduce((acc, l) => acc + (l.impactMetrics?.netClimateImpactCO2e || 0), 0) + 4800;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Disclaimer Notice */}
      <DisclaimerBanner />

      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-carbon-primary tracking-tight">Ecosystem Overview</h1>
          <p className="text-xs text-carbon-secondary">Monitor live waste streams, facility intake capacities, and net carbon benefits.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('ADD_WASTE')}
            className="flex items-center gap-1.5 bg-brand-primary hover:bg-brand-dark text-white text-xs font-bold px-4 py-2 rounded-btn shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>List Waste Batch</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Total Waste */}
        <div className="p-4 bg-surface border border-border rounded-card shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-carbon-secondary">
            <span>Total Waste Registered</span>
            <Trash2 className="w-4 h-4 text-carbon-muted" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-carbon-primary tracking-tight">
              {totalWasteTonnes.toLocaleString('en-IN')} <span className="text-xs font-normal">t</span>
            </span>
            <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              <ArrowUpRight className="w-3 h-3" /> +12.4%
            </span>
          </div>
          <p className="text-[10px] text-carbon-muted">vs last month across Gujarat region</p>
        </div>

        {/* KPI 2: Waste Diverted */}
        <div className="p-4 bg-surface border border-border rounded-card shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-carbon-secondary">
            <span>Waste Diverted</span>
            <TrendingUp className="w-4 h-4 text-brand-primary" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-brand-primary tracking-tight">
              8,420 <span className="text-xs font-normal">t</span>
            </span>
            <span className="inline-flex items-center text-[10px] font-bold text-brand-dark bg-brand-soft px-1.5 py-0.5 rounded">
              65.5% Diverted
            </span>
          </div>
          <p className="text-[10px] text-carbon-muted">Diverted from open landfills & burning</p>
        </div>

        {/* KPI 3: Net CO2e Benefit */}
        <div className="p-4 bg-surface border border-border rounded-card shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-carbon-secondary">
            <span>Indicative Net CO₂e Benefit</span>
            <Leaf className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-700 tracking-tight">
              {Math.round(totalNetCO2e).toLocaleString('en-IN')} <span className="text-xs font-normal">tCO₂e</span>
            </span>
            <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              <ArrowUpRight className="w-3 h-3" /> +18.2%
            </span>
          </div>
          <p className="text-[10px] text-carbon-muted">Landfill avoided + biochar stored</p>
        </div>

        {/* KPI 4: Active Facilities */}
        <div className="p-4 bg-surface border border-border rounded-card shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-carbon-secondary">
            <span>Active Facilities</span>
            <Factory className="w-4 h-4 text-carbon-muted" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-carbon-primary tracking-tight">
              {facilities.length + 31}
            </span>
            <span className="inline-flex items-center text-[10px] font-bold text-carbon-secondary bg-surface-muted px-1.5 py-0.5 rounded">
              +4 new
            </span>
          </div>
          <p className="text-[10px] text-carbon-muted">Biochar, Biogas & Composting hubs</p>
        </div>

      </div>

      {/* Main Hero Visual — Interactive GIS Network Map */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-carbon-primary uppercase tracking-wider">
          <span>Regional Circular Waste Network Map</span>
          <button
            onClick={() => onSelectTab('LOGISTICS')}
            className="text-brand-primary hover:underline font-semibold flex items-center gap-1 normal-case text-xs"
          >
            <span>Open Logistics Map View</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <NetworkMap
          wasteLots={wasteLots}
          facilities={facilities}
          onSelectLot={onSelectLot}
          onSelectFacility={onSelectFacility}
          height="450px"
        />
      </div>

      {/* Secondary Row: Diversion Trend & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Diversion Trend Chart (2 cols) */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-card p-5 space-y-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-sm text-carbon-primary">Waste Diversion & CO₂e Trend</h2>
              <p className="text-xs text-carbon-secondary">Monthly volume diverted vs indicative climate impact</p>
            </div>
            <span className="text-[10px] font-semibold text-carbon-secondary bg-surface-muted px-2 py-0.5 rounded">
              Apr – Sep 2026
            </span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorDiverted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16794A" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#16794A" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCo2e" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#89928C" fontSize={11} tickLine={false} />
                <YAxis stroke="#89928C" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E3E7E3', borderRadius: '8px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="diverted" name="Diverted (tonnes)" stroke="#16794A" fillOpacity={1} fill="url(#colorDiverted)" strokeWidth={2} />
                <Area type="monotone" dataKey="co2e" name="Net CO2e (tCO2e)" stroke="#3B82F6" fillOpacity={1} fill="url(#colorCo2e)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity Feed (1 col) */}
        <div className="bg-surface border border-border rounded-card p-5 space-y-4 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="font-bold text-sm text-carbon-primary">Live Activity Stream</h2>
              <span className="w-2 h-2 rounded-full bg-brand-primary animate-ping"></span>
            </div>

            <div className="space-y-3 mt-3 overflow-y-auto max-h-64 pr-1 text-xs">
              {wasteLots.slice(0, 4).map((lot) => (
                <div key={lot.id} className="flex items-start gap-2.5 p-2 rounded-btn bg-surface-muted/40 hover:bg-surface-muted/80 transition">
                  <div className="w-6 h-6 rounded-full bg-brand-soft text-brand-dark flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-[10px]">
                    ✓
                  </div>
                  <div className="space-y-0.5 truncate">
                    <p className="font-semibold text-carbon-primary truncate">
                      {lot.id} · {lot.generatorName}
                    </p>
                    <p className="text-[11px] text-carbon-secondary truncate">
                      {lot.fingerprint.quantityTonnes}t {lot.fingerprint.wasteType} → <span className="font-medium text-brand-dark">{lot.matchedFacilityName || 'Matched'}</span>
                    </p>
                    <span className="text-[9px] text-carbon-muted block">
                      Status: <strong className="text-carbon-primary">{lot.status}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onSelectTab('WASTE')}
            className="w-full text-center text-xs font-semibold text-brand-primary hover:text-brand-dark pt-2 border-t border-border"
          >
            View All Waste Batches →
          </button>
        </div>

      </div>

      {/* Waste Flow Ecosystem Diagram */}
      <div className="bg-surface border border-border rounded-card p-5 space-y-4 shadow-subtle">
        <h2 className="font-bold text-sm text-carbon-primary">Waste Source to Conversion Facility Flow</h2>
        <p className="text-xs text-carbon-secondary">Visual representation of active circular pathways across generators and processing destinations.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center p-4 bg-surface-muted/30 rounded-btn border border-border/60 text-xs">
          
          {/* Sources */}
          <div className="space-y-2">
            <span className="font-bold uppercase text-[10px] text-carbon-muted">Waste Generators</span>
            <div className="p-2.5 bg-surface border border-border rounded-btn font-semibold text-carbon-primary shadow-xs">
              🌾 Agricultural Farms (Gandhinagar)
            </div>
            <div className="p-2.5 bg-surface border border-border rounded-btn font-semibold text-carbon-primary shadow-xs">
              🍏 Wholesale Food Markets (Ahmedabad)
            </div>
            <div className="p-2.5 bg-surface border border-border rounded-btn font-semibold text-carbon-primary shadow-xs">
              🐄 Livestock Cooperatives (Kheda)
            </div>
          </div>

          {/* Decision Engine Connector */}
          <div className="text-center py-4 space-y-2">
            <div className="inline-block p-3 bg-brand-primary text-white rounded-full shadow-md font-bold text-xs">
              CarbonCycle Decision Engine
            </div>
            <p className="text-[10px] text-carbon-secondary font-medium">
              40% Compatibility + 25% Distance + 20% Capacity + 15% Carbon
            </p>
          </div>

          {/* Facilities */}
          <div className="space-y-2">
            <span className="font-bold uppercase text-[10px] text-carbon-muted">Conversion Hubs</span>
            <div className="p-2.5 bg-brand-soft border border-brand-primary/30 rounded-btn font-semibold text-brand-dark shadow-xs flex justify-between">
              <span>🔥 Gujarat EcoChar Center</span>
              <span className="font-bold">Biochar</span>
            </div>
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-btn font-semibold text-emerald-800 shadow-xs flex justify-between">
              <span>⚡ GreenBio Energy Plant</span>
              <span className="font-bold">Biogas</span>
            </div>
            <div className="p-2.5 bg-surface border border-border rounded-btn font-semibold text-carbon-primary shadow-xs flex justify-between">
              <span>🌱 Sabarmati Organic Hub</span>
              <span className="font-bold">Compost</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
