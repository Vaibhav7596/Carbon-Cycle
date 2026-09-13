import React from 'react';
import { WasteLot } from '../types';
import { FileText, Download, Eye, ShieldCheck, Share2 } from 'lucide-react';

interface ReportsViewProps {
  wasteLots: WasteLot[];
  onOpenReport: (lot: WasteLot) => void;
  searchQuery?: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ wasteLots, onOpenReport, searchQuery = '' }) => {
  const q = searchQuery.toLowerCase().trim();
  const filteredLots = wasteLots.filter((lot) => {
    if (!q) return true;
    return (
      lot.id.toLowerCase().includes(q) ||
      lot.generatorName.toLowerCase().includes(q) ||
      lot.fingerprint.wasteType.toLowerCase().includes(q) ||
      (lot.matchedFacilityName && lot.matchedFacilityName.toLowerCase().includes(q)) ||
      (lot.matchedFacilityType && lot.matchedFacilityType.toLowerCase().includes(q)) ||
      lot.status.toLowerCase().includes(q)
    );
  });

  const exportCSV = () => {
    const headers = ['Batch ID', 'Generator', 'Waste Type', 'Quantity Tonnes', 'Facility', 'Pathway', 'Net CO2e', 'Status'];
    const rows = filteredLots.map((l) => [
      l.id,
      `"${l.generatorName}"`,
      l.fingerprint.wasteType,
      l.fingerprint.quantityTonnes,
      `"${l.matchedFacilityName || ''}"`,
      l.matchedFacilityType || '',
      l.impactMetrics?.netClimateImpactCO2e || 0,
      l.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CarbonCycle_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-carbon-primary tracking-tight">Digital Impact Reports Registry</h1>
          <p className="text-xs text-carbon-secondary">Auditable digital certificates and exportable waste-to-carbon traceability reports.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            title="Download CSV report"
            className="flex items-center gap-1.5 bg-surface hover:bg-surface-muted text-carbon-primary border border-border text-xs font-semibold px-3.5 py-2 rounded-xl transition cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-carbon-secondary" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Reports List Cards */}
      <div className="space-y-4">
        {filteredLots.length === 0 ? (
          <div className="p-8 text-center text-xs text-carbon-muted bg-surface rounded-xl border border-dashed border-border">
            {searchQuery
              ? `No impact certificates matching "${searchQuery}".`
              : 'No impact certificates generated yet. Complete waste-to-conversion batches to issue digital MRV certificates.'}
          </div>
        ) : (
          filteredLots.map((lot) => {
            const netCO2e = lot.impactMetrics?.netClimateImpactCO2e || 0;

            return (
              <div 
                key={lot.id} 
                className="bg-surface border border-border rounded-xl p-5 shadow-subtle flex flex-wrap items-center justify-between gap-4 hover:border-brand-primary/40 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand-dark flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-carbon-primary">{lot.id}</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-soft text-brand-dark">
                        {lot.status}
                      </span>
                    </div>
                    <p className="text-xs text-carbon-secondary">
                      {lot.generatorName} · {lot.fingerprint.quantityTonnes}t {lot.fingerprint.wasteType} → {lot.matchedFacilityName || 'Matched Facility'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-[10px] text-carbon-muted font-bold block uppercase">Net Climate Impact</span>
                    <span className="text-base font-extrabold text-emerald-700">+{netCO2e} tCO₂e</span>
                  </div>

                  <button
                    onClick={() => onOpenReport(lot)}
                    title="View digital certificate"
                    className="flex items-center gap-1.5 bg-brand-primary hover:bg-brand-dark text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Certificate</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
