import React, { useState } from 'react';
import { Facility } from '../types';
import { WASTE_TYPE_LABELS } from '../data/constants';
import { Factory, MapPin, Search, Filter, Gauge, IndianRupee, CheckCircle2, ChevronRight } from 'lucide-react';

interface FacilityDirectoryViewProps {
  facilities: Facility[];
  onSelectFacility?: (facilityId: string) => void;
  searchQuery: string;
}

export const FacilityDirectoryView: React.FC<FacilityDirectoryViewProps> = ({
  facilities,
  onSelectFacility,
  searchQuery,
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');

  const filtered = facilities.filter((fac) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      fac.name.toLowerCase().includes(q) ||
      fac.location.name.toLowerCase().includes(q) ||
      fac.location.address.toLowerCase().includes(q) ||
      fac.type.toLowerCase().includes(q) ||
      fac.acceptedWasteTypes.some(
        (wType) =>
          wType.toLowerCase().includes(q) ||
          (WASTE_TYPE_LABELS[wType]?.label && WASTE_TYPE_LABELS[wType].label.toLowerCase().includes(q))
      );

    const matchesType = filterType === 'ALL' || fac.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-carbon-primary tracking-tight">Conversion Facilities Directory</h1>
          <p className="text-xs text-carbon-secondary">Active circular processing hubs accepting agricultural, organic, and wood biomass waste.</p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface border border-border p-3 rounded-card text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-carbon-secondary">
            <Filter className="w-3.5 h-3.5" />
            <span>Process Type:</span>
          </div>

          {['ALL', 'BIOCHAR', 'BIOGAS', 'COMPOSTING'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-full font-semibold transition cursor-pointer ${
                filterType === type
                  ? 'bg-brand-primary text-white'
                  : 'bg-surface-muted text-carbon-secondary hover:text-carbon-primary'
              }`}
            >
              {type === 'ALL' ? 'All Processes' : type}
            </button>
          ))}
        </div>

        <span className="text-carbon-muted text-xs font-medium">
          {filtered.length} Active Processing Facilities
        </span>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((fac) => {
          const capPercent = Math.round((fac.availableCapacityTonnes / fac.maxCapacityTonnes) * 100);

          return (
            <div key={fac.id} className="bg-surface border border-border rounded-card p-5 space-y-4 shadow-subtle hover:border-brand-primary/50 transition">
              
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-carbon-primary">{fac.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-soft text-brand-dark">
                      {fac.type}
                    </span>
                  </div>
                  <p className="text-xs text-carbon-secondary mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-carbon-muted" />
                    <span>{fac.location.name}</span>
                  </p>
                </div>
              </div>

              {/* Capacity Bar */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-[11px] font-medium">
                  <span className="text-carbon-secondary">Available Capacity</span>
                  <span className="font-bold text-brand-primary">
                    {fac.availableCapacityTonnes} t / {fac.maxCapacityTonnes} t per day
                  </span>
                </div>
                <div className="w-full bg-surface-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-brand-primary h-full rounded-full"
                    style={{ width: `${capPercent}%` }}
                  />
                </div>
              </div>

              {/* Accepts Tags */}
              <div className="space-y-1.5 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-carbon-muted">
                  Accepted Feedstock Types
                </span>
                <div className="flex flex-wrap gap-1">
                  {fac.acceptedWasteTypes.map((wType) => (
                    <span key={wType} className="px-2 py-0.5 rounded bg-surface-muted text-carbon-secondary text-[10px] font-medium">
                      {WASTE_TYPE_LABELS[wType]?.label || wType}
                    </span>
                  ))}
                </div>
              </div>

              {/* Details Footer */}
              <div className="border-t border-border pt-3 flex items-center justify-between text-xs">
                <div>
                  <span className="text-carbon-muted text-[10px] block">Processing Fee</span>
                  <span className="font-bold text-carbon-primary">₹{fac.processingCostPerTon} / ton</span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  Active Intake Hub
                </span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
