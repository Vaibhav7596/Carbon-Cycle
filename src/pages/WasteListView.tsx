import React, { useState } from 'react';
import { WasteLot } from '../types';
import { WASTE_TYPE_LABELS } from '../data/constants';
import { NavTab } from '../components/layout/Sidebar';
import { Plus, Search, Filter, Trash2, ArrowRight, Eye, FileText, CheckCircle2, Calculator } from 'lucide-react';
import { CalculationDrawer } from '../components/carbon/CalculationDrawer';
import { useAuth } from '../context/AuthContext';

interface WasteListViewProps {
  wasteLots: WasteLot[];
  onSelectLot: (lotId: string) => void;
  onSelectTab: (tab: NavTab) => void;
  onOpenReport: (lot: WasteLot) => void;
  searchQuery: string;
}

export const WasteListView: React.FC<WasteListViewProps> = ({
  wasteLots,
  onSelectLot,
  onSelectTab,
  onOpenReport,
  searchQuery,
}) => {
  const { user } = useAuth();
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedDrawerLot, setSelectedDrawerLot] = useState<WasteLot | null>(null);

  const isFacilityOperator = user?.role === 'facility_operator';

  const filteredLots = wasteLots.filter((lot) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = 
      !q ||
      lot.id.toLowerCase().includes(q) ||
      lot.generatorName.toLowerCase().includes(q) ||
      lot.fingerprint.wasteType.toLowerCase().includes(q) ||
      (WASTE_TYPE_LABELS[lot.fingerprint.wasteType]?.label &&
        WASTE_TYPE_LABELS[lot.fingerprint.wasteType].label.toLowerCase().includes(q)) ||
      (lot.fingerprint.location?.name && lot.fingerprint.location.name.toLowerCase().includes(q)) ||
      (lot.fingerprint.location?.address && lot.fingerprint.location.address.toLowerCase().includes(q)) ||
      (lot.matchedFacilityName && lot.matchedFacilityName.toLowerCase().includes(q)) ||
      lot.status.toLowerCase().includes(q);

    const matchesType = filterType === 'ALL' || lot.fingerprint.wasteType === filterType;
    const matchesStatus = filterStatus === 'ALL' || lot.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      LISTED: 'bg-surface-muted text-carbon-secondary border-border',
      ANALYZED: 'bg-blue-50 text-blue-700 border-blue-200',
      MATCH_REQUESTED: 'bg-amber-50 text-amber-800 border-amber-300 font-bold',
      MATCHED: 'bg-brand-soft text-brand-dark border-brand-primary/30 font-bold',
      REJECTED: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
      PICKUP: 'bg-amber-50 text-amber-700 border-amber-200',
      IN_TRANSIT: 'bg-blue-50 text-blue-700 border-blue-200',
      AT_GATE: 'bg-blue-100 text-blue-800 border-blue-300 font-bold animate-pulse',
      DELIVERED: 'bg-purple-50 text-purple-700 border-purple-200',
      PROCESSING: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      COMPLETED: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold',
    };
    return styles[status] || 'bg-surface-muted text-carbon-secondary border-border';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-carbon-primary tracking-tight">
            {isFacilityOperator ? 'Inbound Feedstock Registry' : 'Waste Lots Registry'}
          </h1>
          <p className="text-xs text-carbon-secondary">
            {isFacilityOperator
              ? 'Track incoming feedstock batches routed for facility intake and reactor loading.'
              : 'Track all registered waste batches entering the CarbonCycle decision network.'}
          </p>
        </div>

        {/* List Waste Batch button for waste generators */}
        {!isFacilityOperator && (
          <button
            onClick={() => onSelectTab('ADD_WASTE')}
            className="flex items-center gap-1.5 bg-brand-primary hover:bg-brand-dark text-white text-xs font-bold px-4 py-2 rounded-btn shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>List Waste Batch</span>
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface border border-border p-3 rounded-card text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-carbon-secondary">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-surface-muted/60 border border-border rounded-control px-2.5 py-1.5 text-xs text-carbon-primary focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Waste Types</option>
            <option value="AGRICULTURAL_RESIDUE">Agricultural Residue</option>
            <option value="FOOD_WASTE">Food Waste</option>
            <option value="ANIMAL_MANURE">Animal Manure</option>
            <option value="BIOMASS_WOOD">Biomass & Wood</option>
            <option value="MUNICIPAL_ORGANIC">Municipal Organic</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-surface-muted/60 border border-border rounded-control px-2.5 py-1.5 text-xs text-carbon-primary focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="LISTED">LISTED</option>
            <option value="ANALYZED">ANALYZED</option>
            <option value="MATCH_REQUESTED">MATCH_REQUESTED</option>
            <option value="MATCHED">MATCHED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="PICKUP">PICKUP</option>
            <option value="IN_TRANSIT">IN_TRANSIT</option>
            <option value="AT_GATE">AT_GATE</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </div>

        <span className="text-carbon-muted text-xs font-medium">
          Showing {filteredLots.length} of {wasteLots.length} batches
        </span>
      </div>

      {/* Data Table */}
      <div className="bg-surface border border-border rounded-card overflow-hidden shadow-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-surface-muted/80 text-[10px] font-bold text-carbon-secondary uppercase border-b border-border">
              <tr>
                <th className="p-3.5">Batch ID</th>
                <th className="p-3.5">Waste Type</th>
                <th className="p-3.5 text-right">Quantity</th>
                <th className="p-3.5">Generator</th>
                <th className="p-3.5">Matched Facility</th>
                <th className="p-3.5 text-right">Net CO₂e</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLots.map((lot) => {
                const wasteLabel = WASTE_TYPE_LABELS[lot.fingerprint.wasteType]?.label || lot.fingerprint.wasteType;
                const netCO2e = lot.impactMetrics?.netClimateImpactCO2e || 0;

                return (
                  <tr key={lot.id} className="hover:bg-surface-muted/50 transition">
                    <td className="p-3.5 font-bold text-carbon-primary">{lot.id}</td>
                    <td className="p-3.5 text-carbon-secondary">{wasteLabel}</td>
                    <td className="p-3.5 font-extrabold text-carbon-primary text-right">
                      {lot.fingerprint.quantityTonnes} t
                    </td>
                    <td className="p-3.5 font-medium text-carbon-primary">{lot.generatorName}</td>
                    <td className="p-3.5 text-carbon-secondary">
                      {lot.matchedFacilityName ? (
                        <span className="font-semibold text-brand-dark">{lot.matchedFacilityName}</span>
                      ) : lot.requestedFacilityName ? (
                        <span className="text-amber-700 font-medium">Pending: {lot.requestedFacilityName}</span>
                      ) : (
                        <span className="text-carbon-muted italic">Unmatched</span>
                      )}
                    </td>
                    <td className="p-3.5 font-bold text-emerald-700 text-right">
                      {netCO2e > 0 ? `+${netCO2e}` : '-'} tCO₂e
                    </td>
                    <td className="p-3.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] border ${getStatusBadge(lot.status)}`}>
                        {lot.status === 'MATCH_REQUESTED'
                          ? 'REQUESTED'
                          : lot.status === 'AT_GATE'
                          ? 'AT GATE'
                          : lot.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {lot.status === 'REJECTED' ? (
                          <button
                            onClick={() => onSelectLot(lot.id)}
                            className="inline-flex items-center gap-1 text-rose-700 hover:text-rose-900 font-bold text-xs px-2.5 py-1 bg-rose-50 border border-rose-200 rounded-lg shadow-xs cursor-pointer"
                            title="Select an alternative facility"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Select Alternative</span>
                          </button>
                        ) : (
                          <div className="relative group">
                            <button
                              onClick={() => onSelectLot(lot.id)}
                              title="Inspect batch & AI match"
                              className="w-8 h-8 rounded-lg bg-brand-soft text-brand-dark hover:bg-brand-primary hover:text-white flex items-center justify-center transition cursor-pointer shadow-xs"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <div className="absolute bottom-full right-0 mb-1.5 px-2 py-1 bg-carbon-primary text-white text-[10px] font-semibold rounded shadow-modal whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition z-20">
                              Inspect & Match
                            </div>
                          </div>
                        )}

                        {/* View Formula Icon Button */}
                        <div className="relative group">
                          <button
                            onClick={() => setSelectedDrawerLot(lot)}
                            title="View formula & carbon calculation"
                            className="w-8 h-8 rounded-lg bg-surface border border-border text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 flex items-center justify-center transition cursor-pointer shadow-xs"
                          >
                            <Calculator className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-full right-0 mb-1.5 px-2 py-1 bg-carbon-primary text-white text-[10px] font-semibold rounded shadow-modal whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition z-20">
                            View Formula
                          </div>
                        </div>

                        {/* Report Icon Button */}
                        <div className="relative group">
                          <button
                            onClick={() => onOpenReport(lot)}
                            title="View digital impact certificate"
                            className="w-8 h-8 rounded-lg bg-surface border border-border text-carbon-secondary hover:text-carbon-primary hover:bg-surface-muted flex items-center justify-center transition cursor-pointer shadow-xs"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-full right-0 mb-1.5 px-2 py-1 bg-carbon-primary text-white text-[10px] font-semibold rounded shadow-modal whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition z-20">
                            Impact Certificate
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Calculation Drawer */}
      {selectedDrawerLot && (
        <CalculationDrawer
          isOpen={!!selectedDrawerLot}
          onClose={() => setSelectedDrawerLot(null)}
          lot={selectedDrawerLot}
        />
      )}

    </div>
  );
};
