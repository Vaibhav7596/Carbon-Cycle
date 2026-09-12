import React from 'react';
import { WasteLot, WasteStatus } from '../types';
import { Cpu, CheckCircle2, Clock, Factory, Play, ArrowRight } from 'lucide-react';

interface ProcessingQueueViewProps {
  wasteLots: WasteLot[];
  onUpdateLotStatus: (lotId: string, newStatus: WasteStatus) => void;
  onOpenReport: (lot: WasteLot) => void;
}

export const ProcessingQueueView: React.FC<ProcessingQueueViewProps> = ({
  wasteLots,
  onUpdateLotStatus,
  onOpenReport,
}) => {
  const incoming = wasteLots.filter((l) => l.status === 'DELIVERED');
  const processing = wasteLots.filter((l) => l.status === 'PROCESSING');
  const completed = wasteLots.filter((l) => l.status === 'COMPLETED');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header Metrics Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-carbon-primary tracking-tight">Facility Processing Queue</h1>
          <p className="text-xs text-carbon-secondary">Real-time operations queue for active biochar pyrolysis kilns & biomethanation digesters.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-surface border border-border rounded-btn text-xs font-semibold">
            <span className="text-carbon-muted">Incoming Intake: </span>
            <span className="text-blue-600 font-bold">{incoming.length}</span>
          </div>
          <div className="px-3 py-1.5 bg-brand-soft border border-brand-primary/30 rounded-btn text-xs font-semibold">
            <span className="text-brand-dark">In Conversion: </span>
            <span className="text-brand-primary font-bold">{processing.length}</span>
          </div>
          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-btn text-xs font-semibold">
            <span className="text-emerald-800">Completed: </span>
            <span className="text-emerald-700 font-bold">{completed.length}</span>
          </div>
        </div>
      </div>

      {/* 3 Column Operations Boards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Incoming Intake */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="font-bold text-xs uppercase tracking-wider text-carbon-muted flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>Incoming Intake ({incoming.length})</span>
            </h2>
          </div>

          <div className="space-y-3">
            {incoming.length === 0 ? (
              <div className="p-4 bg-surface border border-border rounded-card text-center text-xs text-carbon-muted">
                No batches pending intake.
              </div>
            ) : (
              incoming.map((lot) => (
                <div key={lot.id} className="p-4 bg-surface border border-border rounded-card space-y-3 shadow-subtle">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-carbon-primary">{lot.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      Delivered
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-xs text-carbon-primary">{lot.generatorName}</p>
                    <p className="text-[11px] text-carbon-secondary">{lot.fingerprint.quantityTonnes}t {lot.fingerprint.wasteType}</p>
                  </div>
                  <button
                    onClick={() => onUpdateLotStatus(lot.id, 'PROCESSING')}
                    className="w-full bg-brand-primary hover:bg-brand-dark text-white text-xs font-bold py-1.5 rounded-btn flex items-center justify-center gap-1 transition"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Load into Reactor / Digester</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Active Conversion (Processing) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="font-bold text-xs uppercase tracking-wider text-brand-dark flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-brand-primary animate-pulse" />
              <span>Active Conversion ({processing.length})</span>
            </h2>
          </div>

          <div className="space-y-3">
            {processing.length === 0 ? (
              <div className="p-4 bg-surface border border-border rounded-card text-center text-xs text-carbon-muted">
                No batches currently in conversion.
              </div>
            ) : (
              processing.map((lot) => {
                const yieldInfo = lot.processingYield || {
                  outputType: 'Biomethane',
                  outputQuantity: '680 m³ Biogas',
                  progressPercent: 78,
                };

                return (
                  <div key={lot.id} className="p-4 bg-surface border border-brand-primary/40 rounded-card space-y-3 shadow-float ring-1 ring-brand-primary/20">
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
                    <div className="p-2.5 bg-brand-soft/50 rounded-btn text-xs space-y-1 border border-brand-primary/20">
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
                      className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-1.5 rounded-btn flex items-center justify-center gap-1 transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Complete & Record Impact</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 3: Completed Conversions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 className="font-bold text-xs uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Completed ({completed.length})</span>
            </h2>
          </div>

          <div className="space-y-3">
            {completed.map((lot) => (
              <div key={lot.id} className="p-4 bg-surface border border-border rounded-card space-y-3 shadow-subtle">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-carbon-primary">{lot.id}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    COMPLETED
                  </span>
                </div>

                <div>
                  <p className="font-semibold text-xs text-carbon-primary">{lot.matchedFacilityName}</p>
                  <p className="text-[11px] text-emerald-700 font-bold">
                    +{lot.impactMetrics?.netClimateImpactCO2e} tCO₂e Net Benefit
                  </p>
                </div>

                <button
                  onClick={() => onOpenReport(lot)}
                  className="w-full bg-surface hover:bg-surface-muted text-carbon-primary border border-border text-xs font-semibold py-1.5 rounded-btn flex items-center justify-center gap-1 transition"
                >
                  <span>View Impact Certificate →</span>
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
