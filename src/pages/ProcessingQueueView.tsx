import React, { useState } from 'react';
import { WasteLot, WasteStatus } from '../types';
import { Cpu, CheckCircle2, Clock, Play, ChevronDown, ChevronUp, FileText, ArrowUpRight } from 'lucide-react';

interface ProcessingQueueViewProps {
  wasteLots: WasteLot[];
  onUpdateLotStatus: (lotId: string, newStatus: WasteStatus) => void;
  onOpenReport: (lot: WasteLot) => void;
  searchQuery?: string;
}

export const ProcessingQueueView: React.FC<ProcessingQueueViewProps> = ({
  wasteLots,
  onUpdateLotStatus,
  onOpenReport,
  searchQuery = '',
}) => {
  const [expanded, setExpanded] = useState<{
    incoming: boolean;
    processing: boolean;
    completed: boolean;
  }>({
    incoming: true,
    processing: true,
    completed: true,
  });

  const toggleSection = (section: 'incoming' | 'processing' | 'completed') => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const q = searchQuery.toLowerCase().trim();
  const matchesQuery = (l: WasteLot) => {
    if (!q) return true;
    return (
      l.id.toLowerCase().includes(q) ||
      l.generatorName.toLowerCase().includes(q) ||
      l.fingerprint.wasteType.toLowerCase().includes(q) ||
      (l.matchedFacilityName && l.matchedFacilityName.toLowerCase().includes(q)) ||
      (l.matchedFacilityType && l.matchedFacilityType.toLowerCase().includes(q)) ||
      l.status.toLowerCase().includes(q)
    );
  };

  const filtered = wasteLots.filter(matchesQuery);
  const incoming = filtered.filter((l) => l.status === 'DELIVERED');
  const processing = filtered.filter((l) => l.status === 'PROCESSING');
  const completed = filtered.filter((l) => l.status === 'COMPLETED');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Metrics Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-carbon-primary tracking-tight">Facility Processing Queue</h1>
          <p className="text-xs text-carbon-secondary">Real-time operations queue for active biochar pyrolysis kilns & biomethanation digesters.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-surface border border-border rounded-xl text-xs font-semibold">
            <span className="text-carbon-muted">Incoming Intake: </span>
            <span className="text-blue-600 font-bold">{incoming.length}</span>
          </div>
          <div className="px-3 py-1.5 bg-brand-soft border border-brand-primary/30 rounded-xl text-xs font-semibold">
            <span className="text-brand-dark">In Conversion: </span>
            <span className="text-brand-primary font-bold">{processing.length}</span>
          </div>
          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold">
            <span className="text-emerald-800">Completed: </span>
            <span className="text-emerald-700 font-bold">{completed.length}</span>
          </div>
        </div>
      </div>

      {/* 3 Collapsible Compact Sections */}
      <div className="space-y-4 pt-1">
        
        {/* Section 1: Incoming Intake */}
        <div className="bg-surface border border-border rounded-xl shadow-subtle overflow-hidden">
          <button
            onClick={() => toggleSection('incoming')}
            className="w-full flex items-center justify-between p-4 bg-surface hover:bg-surface-muted/60 transition cursor-pointer text-left select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-bold text-sm text-carbon-primary">Incoming Intake</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  {incoming.length}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-carbon-secondary">
              <span className="hidden sm:inline font-medium">
                {expanded.incoming ? 'Collapse' : 'Expand'}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expanded.incoming ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {expanded.incoming && (
            <div className="p-5 border-t border-border/60 bg-surface-muted/20">
              {incoming.length === 0 ? (
                <div className="p-6 text-center text-xs text-carbon-muted bg-surface rounded-xl border border-dashed border-border">
                  No batches currently pending reactor intake.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {incoming.map((lot) => (
                    <div key={lot.id} className="p-4 bg-surface border border-border rounded-xl space-y-3 shadow-subtle hover:border-brand-primary/40 transition">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-carbon-primary">{lot.id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                          Delivered
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-xs text-carbon-primary">{lot.generatorName}</p>
                        <p className="text-[11px] text-carbon-secondary">{lot.fingerprint.quantityTonnes}t {lot.fingerprint.wasteType}</p>
                      </div>
                      <div className="text-[10px] text-carbon-muted">
                        Destination: <span className="font-semibold text-carbon-primary">{lot.matchedFacilityName || 'Assigned Hub'}</span>
                      </div>
                      <button
                        onClick={() => onUpdateLotStatus(lot.id, 'PROCESSING')}
                        className="w-full bg-brand-primary hover:bg-brand-dark text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Load into Reactor / Digester</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 2: Active Conversion */}
        <div className="bg-surface border border-border rounded-xl shadow-subtle overflow-hidden">
          <button
            onClick={() => toggleSection('processing')}
            className="w-full flex items-center justify-between p-4 bg-surface hover:bg-surface-muted/60 transition cursor-pointer text-left select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-soft text-brand-dark flex items-center justify-center flex-shrink-0">
                <Cpu className="w-4 h-4 animate-pulse" />
              </div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-bold text-sm text-carbon-primary">Active Conversion</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-soft text-brand-dark border border-brand-primary/30">
                  {processing.length}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-carbon-secondary">
              <span className="hidden sm:inline font-medium">
                {expanded.processing ? 'Collapse' : 'Expand'}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expanded.processing ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {expanded.processing && (
            <div className="p-5 border-t border-border/60 bg-surface-muted/20">
              {processing.length === 0 ? (
                <div className="p-6 text-center text-xs text-carbon-muted bg-surface rounded-xl border border-dashed border-border">
                  No batches currently undergoing active conversion.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {processing.map((lot) => {
                    const yieldInfo = lot.processingYield || {
                      outputType: 'Biomethane',
                      outputQuantity: '680 m³ Biogas',
                      progressPercent: 78,
                    };

                    return (
                      <div key={lot.id} className="p-4 bg-surface border border-brand-primary/40 rounded-xl space-y-3 shadow-subtle ring-1 ring-brand-primary/20 hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-carbon-primary">{lot.id}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-soft text-brand-dark">
                            {lot.matchedFacilityType || 'BIOCHAR'}
                          </span>
                        </div>

                        <div>
                          <p className="font-bold text-xs text-carbon-primary">{lot.matchedFacilityName}</p>
                          <p className="text-[11px] text-carbon-secondary">{lot.fingerprint.quantityTonnes}t Feedstock</p>
                        </div>

                        {/* Yield Preview */}
                        <div className="p-2.5 bg-brand-soft/50 rounded-lg text-xs space-y-1 border border-brand-primary/20">
                          <span className="text-[10px] font-bold uppercase text-brand-dark">Expected Output Yield</span>
                          <p className="font-bold text-emerald-800">{yieldInfo.outputQuantity}</p>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-carbon-secondary">Conversion Progress</span>
                            <span className="text-brand-primary">{yieldInfo.progressPercent}%</span>
                          </div>
                          <div className="w-full bg-surface-muted rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-brand-primary h-full rounded-full transition-all duration-500"
                              style={{ width: `${yieldInfo.progressPercent}%` }}
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => onUpdateLotStatus(lot.id, 'COMPLETED')}
                          className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Complete & Record Impact</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Section 3: Completed Conversions */}
        <div className="bg-surface border border-border rounded-xl shadow-subtle overflow-hidden">
          <button
            onClick={() => toggleSection('completed')}
            className="w-full flex items-center justify-between p-4 bg-surface hover:bg-surface-muted/60 transition cursor-pointer text-left select-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2.5">
                <h2 className="font-bold text-sm text-carbon-primary">Completed Conversions</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {completed.length}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-carbon-secondary">
              <span className="hidden sm:inline font-medium">
                {expanded.completed ? 'Collapse' : 'Expand'}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expanded.completed ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {expanded.completed && (
            <div className="p-5 border-t border-border/60 bg-surface-muted/20">
              {completed.length === 0 ? (
                <div className="p-6 text-center text-xs text-carbon-muted bg-surface rounded-xl border border-dashed border-border">
                  No completed conversions yet in this filter.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completed.map((lot) => (
                    <div key={lot.id} className="p-4 bg-surface border border-border rounded-xl space-y-3 shadow-subtle hover:border-emerald-300 transition">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-carbon-primary">{lot.id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          COMPLETED
                        </span>
                      </div>

                      <div>
                        <p className="font-bold text-xs text-carbon-primary">{lot.matchedFacilityName}</p>
                        <p className="text-[11px] text-emerald-700 font-bold">
                          +{lot.impactMetrics?.netClimateImpactCO2e || 0} tCO₂e Net Benefit
                        </p>
                      </div>

                      <button
                        onClick={() => onOpenReport(lot)}
                        className="w-full bg-surface hover:bg-surface-muted text-carbon-primary border border-border text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-carbon-secondary" />
                        <span>View Impact Certificate</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-carbon-muted" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
