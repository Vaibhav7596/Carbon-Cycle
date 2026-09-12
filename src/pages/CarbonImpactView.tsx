import React, { useState } from 'react';
import { WasteLot } from '../types';
import { CalculationDrawer } from '../components/carbon/CalculationDrawer';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';
import { Leaf, Calculator, ArrowUpRight, ShieldCheck, Factory, Truck, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CarbonImpactViewProps {
  wasteLots: WasteLot[];
  onOpenReport: (lot: WasteLot) => void;
}

export const CarbonImpactView: React.FC<CarbonImpactViewProps> = ({ wasteLots, onOpenReport }) => {
  const [selectedDrawerLot, setSelectedDrawerLot] = useState<WasteLot | null>(null);

  const totalLandfillAvoided = wasteLots.reduce((acc, l) => acc + (l.impactMetrics?.landfillAvoidedCO2e || 0), 0) + 3200;
  const totalCarbonStored = wasteLots.reduce((acc, l) => acc + (l.impactMetrics?.carbonStoredCO2e || 0), 0) + 1800;
  const totalTransportCO2e = wasteLots.reduce((acc, l) => acc + (l.impactMetrics?.transportEmissionsCO2e || 0), 0) + 80;
  const totalProcessingCO2e = wasteLots.reduce((acc, l) => acc + (l.impactMetrics?.processingEmissionsCO2e || 0), 0) + 100;
  const netTotalCO2e = totalLandfillAvoided + totalCarbonStored - totalTransportCO2e - totalProcessingCO2e;

  const waterfallData = [
    { category: 'Landfill Avoided', value: totalLandfillAvoided, color: '#16794A' },
    { category: 'Carbon Stored', value: totalCarbonStored, color: '#25A866' },
    { category: 'Transport', value: -totalTransportCO2e, color: '#D99422' },
    { category: 'Processing', value: -totalProcessingCO2e, color: '#C95151' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-carbon-primary tracking-tight">Carbon Intelligence & Accounting</h1>
          <p className="text-xs text-carbon-secondary">Transparent climate metrics and emission factor formulas for diverted waste batches.</p>
        </div>
      </div>

      {/* Visual Hero Metric Card */}
      <div className="bg-surface border border-border rounded-container p-8 shadow-subtle text-center space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-soft/30 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <span className="text-xs font-extrabold uppercase tracking-widest text-brand-dark bg-brand-soft px-3 py-1 rounded-full border border-brand-primary/20">
          Total Net Estimated Climate Benefit
        </span>

        <div className="text-5xl sm:text-6xl font-black text-brand-dark tracking-tight">
          +{Math.round(netTotalCO2e).toLocaleString('en-IN')}{' '}
          <span className="text-xl font-bold text-carbon-secondary">tCO₂e</span>
        </div>

        <p className="text-xs text-carbon-secondary max-w-lg mx-auto">
          Combined avoided methane emissions and permanent biochar carbon storage across all active batches in Gujarat network.
        </p>
      </div>

      {/* Waterfall Contribution Breakdown Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <div className="lg:col-span-7 bg-surface border border-border rounded-card p-5 space-y-4 shadow-subtle">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="font-bold text-sm text-carbon-primary">CO₂e Contribution Waterfall</h2>
              <p className="text-xs text-carbon-secondary">Positive diversion gains vs logistics penalties</p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterfallData}>
                <XAxis dataKey="category" stroke="#89928C" fontSize={11} tickLine={false} />
                <YAxis stroke="#89928C" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E3E7E3', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {waterfallData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Accounting Components Summary */}
        <div className="lg:col-span-5 bg-surface border border-border rounded-card p-5 space-y-4 shadow-subtle flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-sm text-carbon-primary border-b border-border pb-3">
              Accounting Components
            </h2>

            <div className="space-y-3 mt-3 text-xs">
              <div className="p-3 bg-surface-muted/50 rounded-btn flex justify-between items-center">
                <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                  <Leaf className="w-4 h-4 text-emerald-600" />
                  Landfill Methane Avoided
                </span>
                <span className="font-bold text-emerald-700">+{Math.round(totalLandfillAvoided)} tCO₂e</span>
              </div>

              <div className="p-3 bg-surface-muted/50 rounded-btn flex justify-between items-center">
                <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                  <Factory className="w-4 h-4 text-emerald-600" />
                  Carbon Sequestered (Biochar)
                </span>
                <span className="font-bold text-emerald-700">+{Math.round(totalCarbonStored)} tCO₂e</span>
              </div>

              <div className="p-3 bg-surface-muted/50 rounded-btn flex justify-between items-center">
                <span className="font-semibold text-amber-800 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-amber-600" />
                  Logistics Transport Emissions
                </span>
                <span className="font-bold text-amber-700">-{Math.round(totalTransportCO2e)} tCO₂e</span>
              </div>

              <div className="p-3 bg-surface-muted/50 rounded-btn flex justify-between items-center">
                <span className="font-semibold text-amber-800 flex items-center gap-1.5">
                  <Factory className="w-4 h-4 text-amber-600" />
                  Facility Processing Emissions
                </span>
                <span className="font-bold text-amber-700">-{Math.round(totalProcessingCO2e)} tCO₂e</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <button
              onClick={() => setSelectedDrawerLot(wasteLots[0])}
              className="w-full bg-brand-primary hover:bg-brand-dark text-white font-bold text-xs py-2 rounded-btn shadow-sm flex items-center justify-center gap-2 transition"
            >
              <Calculator className="w-4 h-4" />
              <span>Inspect Sample Mathematical Calculation</span>
            </button>
          </div>
        </div>

      </div>

      {/* Batch Carbon Impact Inspection Table */}
      <div className="bg-surface border border-border rounded-card p-5 space-y-4 shadow-subtle">
        <h2 className="font-bold text-sm text-carbon-primary">Batch Carbon Accounting Register</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-surface-muted/80 text-[10px] font-bold text-carbon-secondary uppercase border-b border-border">
              <tr>
                <th className="p-3">Batch ID</th>
                <th className="p-3">Waste Type</th>
                <th className="p-3 text-right">Quantity</th>
                <th className="p-3 text-right">Landfill Avoided</th>
                <th className="p-3 text-right">Carbon Stored</th>
                <th className="p-3 text-right font-bold text-emerald-700">Net tCO₂e</th>
                <th className="p-3 text-right">Formula Inspection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {wasteLots.map((lot) => {
                const metrics = lot.impactMetrics || {
                  landfillAvoidedCO2e: 7.5,
                  carbonStoredCO2e: 4.5,
                  netClimateImpactCO2e: 11.19,
                };

                return (
                  <tr key={lot.id} className="hover:bg-surface-muted/50 transition">
                    <td className="p-3 font-bold text-carbon-primary">{lot.id}</td>
                    <td className="p-3 text-carbon-secondary">{lot.fingerprint.wasteType}</td>
                    <td className="p-3 text-right font-bold text-carbon-primary">{lot.fingerprint.quantityTonnes} t</td>
                    <td className="p-3 text-right text-emerald-700">+{metrics.landfillAvoidedCO2e}</td>
                    <td className="p-3 text-right text-emerald-700">+{metrics.carbonStoredCO2e}</td>
                    <td className="p-3 text-right font-black text-brand-dark">+{metrics.netClimateImpactCO2e} tCO₂e</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedDrawerLot(lot)}
                        className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1 ml-auto"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                        <span>View Formula</span>
                      </button>
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
