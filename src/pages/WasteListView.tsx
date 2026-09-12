import React, { useState } from 'react';
import { WasteLot } from '../types';
import { WASTE_TYPE_LABELS } from '../data/constants';
import { NavTab } from '../components/layout/Sidebar';
import { Plus, Search, Filter, Trash2, ArrowRight, Eye, FileText, CheckCircle2 } from 'lucide-react';
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

  const isFacilityOperator = user?.role === 'facility_operator';

  const filteredLots = wasteLots.filter((lot) => {
    const matchesSearch = 
      lot.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lot.generatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lot.matchedFacilityName && lot.matchedFacilityName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === 'ALL' || lot.fingerprint.wasteType === filterType;
    const matchesStatus = filterStatus === 'ALL' || lot.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      LISTED: 'bg-surface-muted text-carbon-secondary border-border',
      ANALYZED: 'bg-blue-50 text-blue-700 border-blue-200',
      MATCHED: 'bg-brand-soft text-brand-dark border-brand-primary/30',
      PICKUP: 'bg-amber-50 text-amber-700 border-amber-200',
      IN_TRANSIT: 'bg-blue-50 text-blue-700 border-blue-200',
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

        {/* Hide + List Waste Batch button for facility operators */}
        {!isFacilityOperator && (
          <button
            onClick={() => onSelectTab('ADD_WASTE')}
            className="flex items-center gap-1.5 bg-brand-primary hover:bg-brand-dark text-white text-xs font-bold px-4 py-2 rounded-btn shadow-sm transition"
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
            className="bg-surface-muted/60 border border-border rounded-control px-2.5 py-1.5 text-xs text-carbon-primary focus:outline-none"
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
            className="bg-surface-muted/60 border border-border rounded-control px-2.5 py-1.5 text-xs text-carbon-primary focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="LISTED">LISTED</option>
            <option value="MATCHED">MATCHED</option>
            <option value="IN_TRANSIT">IN_TRANSIT</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="COMPLETED">COMPLETED</option>
          </select>
        </div>

        <span className="text-carbon-muted text-xs">
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
                      ) : (
                        <span className="text-carbon-muted italic">Unmatched</span>
                      )}
                    </td>
                    <td className="p-3.5 font-bold text-emerald-700 text-right">
                      {netCO2e > 0 ? `+${netCO2e}` : '-'} tCO₂e
                    </td>
                    <td className="p-3.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] border ${getStatusBadge(lot.status)}`}>
                        {lot.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => onSelectLot(lot.id)}
                        className="inline-flex items-center gap-1 text-brand-primary hover:text-brand-dark font-semibold px-2 py-1 bg-brand-soft rounded"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>

                      <button
                        onClick={() => onOpenReport(lot)}
                        className="inline-flex items-center gap-1 text-carbon-secondary hover:text-carbon-primary font-medium px-2 py-1 border border-border rounded"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Report</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
