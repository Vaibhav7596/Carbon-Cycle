import React, { useState } from 'react';
import { WasteLot } from '../types';
import { CalculationDrawer } from '../components/carbon/CalculationDrawer';
import { Leaf, Calculator, ArrowUpRight, ShieldCheck, Factory, Truck, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, ReferenceLine } from 'recharts';
import { useAuth } from '../context/AuthContext';

interface CarbonImpactViewProps {
  wasteLots: WasteLot[];
  onOpenReport: (lot: WasteLot) => void;
}

export const CarbonImpactView: React.FC<CarbonImpactViewProps> = ({ wasteLots, onOpenReport }) => {
  const { user } = useAuth();
  const [selectedDrawerLot, setSelectedDrawerLot] = useState<WasteLot | null>(null);

  const totalLandfillAvoided = Number((wasteLots.reduce((acc, l) => acc + (l.impactMetrics?.landfillAvoidedCO2e || 0), 0)).toFixed(1));
  const totalCarbonStored = Number((wasteLots.reduce((acc, l) => acc + (l.impactMetrics?.carbonStoredCO2e || 0), 0)).toFixed(1));
  const totalTransportCO2e = Number((wasteLots.reduce((acc, l) => acc + (l.impactMetrics?.transportEmissionsCO2e || 0), 0)).toFixed(1));
  const totalProcessingCO2e = Number((wasteLots.reduce((acc, l) => acc + (l.impactMetrics?.processingEmissionsCO2e || 0), 0)).toFixed(1));
  const netTotalCO2e = Number((totalLandfillAvoided + totalCarbonStored - totalTransportCO2e - totalProcessingCO2e).toFixed(1));

  const waterfallData = [
    { category: 'Landfill Avoided', value: totalLandfillAvoided, color: '#16794A' },
    { category: 'Carbon Stored', value: totalCarbonStored, color: '#25A866' },
    { category: 'Transport', value: -totalTransportCO2e, color: '#D99422' },
    { category: 'Processing', value: -totalProcessingCO2e, color: '#C95151' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      

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
          {netTotalCO2e > 0 ? `+${Math.round(netTotalCO2e).toLocaleString('en-IN')}` : '0'}{' '}
          <span className="text-xl font-bold text-carbon-secondary">tCO₂e</span>
        </div>

        <p className="text-xs text-carbon-secondary max-w-lg mx-auto">
          {user?.role === 'facility_operator'
            ? 'Combined avoided methane emissions and permanent biochar carbon storage for feedstock processed at your facility.'
            : 'Combined avoided methane emissions and permanent biochar carbon storage across all active batches in Gujarat network.'}
        </p>
      </div>

      {/* Waterfall Contribution Breakdown Chart & Accounting Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: CO2e Waterfall Bar Chart */}
        <div className="lg:col-span-7 bg-surface border border-border rounded-card p-5 shadow-subtle flex flex-col justify-between h-full min-h-[420px]">
          <div className="flex items-center justify-between border-b border-border pb-3 flex-shrink-0">
            <div>
              <h2 className="font-bold text-sm text-carbon-primary">CO₂e Contribution Waterfall</h2>
              <p className="text-xs text-carbon-secondary">Positive diversion gains vs logistics penalties</p>
            </div>
            <span className="text-[11px] font-semibold text-carbon-secondary bg-surface-muted px-2.5 py-0.5 rounded-full border border-border/60">
              Net Impact View
            </span>
          </div>

          <div className="w-full flex-1 min-h-[290px] pt-3 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={290}>
              <BarChart data={waterfallData} margin={{ top: 15, right: 15, left: -5, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ECEFEC" vertical={false} />
                <XAxis 
                  dataKey="category" 
                  stroke="#89928C" 
                  fontSize={11} 
                  tickLine={false}
                  tick={{ fill: '#68736C' }}
                  dy={4}
                />
                <YAxis 
                  stroke="#89928C" 
                  fontSize={11} 
                  tickLine={false}
                  tick={{ fill: '#68736C' }}
                  tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}t`}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    borderColor: '#E3E7E3', 
                    borderRadius: '10px', 
                    fontSize: '11px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.08)' 
                  }}
                  formatter={(val: any) => [`${Number(val) > 0 ? '+' : ''}${Math.round(Number(val)).toLocaleString('en-IN')} tCO₂e`, 'Net Impact']}
                />
                <ReferenceLine y={0} stroke="#89928C" strokeDasharray="2 2" />
                <Bar dataKey="value" radius={[4, 4, 4, 4]} maxBarSize={56}>
                  {waterfallData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Symmetrical Bottom Legend Footer */}
          <div className="pt-3 border-t border-border flex items-center justify-between text-xs flex-shrink-0">
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold text-carbon-secondary">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#16794A]" />Avoided</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#25A866]" />Stored</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#D99422]" />Transit</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-[#C95151]" />Processing</span>
            </div>
            <span className="text-[11px] font-bold text-brand-dark">Net: {netTotalCO2e > 0 ? `+${Math.round(netTotalCO2e).toLocaleString('en-IN')}` : '0'} tCO₂e</span>
          </div>
        </div>

        {/* Right Column: Accounting Components Summary */}
        <div className="lg:col-span-5 bg-surface border border-border rounded-card p-5 shadow-subtle flex flex-col justify-between h-full min-h-[420px]">
          <div>
            <div className="flex items-center justify-between border-b border-border pb-3 flex-shrink-0">
              <h2 className="font-bold text-sm text-carbon-primary">
                Accounting Components
              </h2>
              <span className="text-[11px] font-semibold text-carbon-secondary bg-surface-muted px-2.5 py-0.5 rounded-full border border-border/60">
                Factor Ledger
              </span>
            </div>

            <div className="space-y-3 mt-3 text-xs">
              <div className="p-3 bg-surface-muted/50 rounded-btn flex justify-between items-center">
                <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                  <Leaf className="w-4 h-4 text-emerald-600" />
                  Landfill Methane Avoided
                </span>
                <span className="font-bold text-emerald-700">{totalLandfillAvoided > 0 ? `+${Math.round(totalLandfillAvoided)}` : '0'} tCO₂e</span>
              </div>

              <div className="p-3 bg-surface-muted/50 rounded-btn flex justify-between items-center">
                <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                  <Factory className="w-4 h-4 text-emerald-600" />
                  Carbon Sequestered (Biochar)
                </span>
                <span className="font-bold text-emerald-700">{totalCarbonStored > 0 ? `+${Math.round(totalCarbonStored)}` : '0'} tCO₂e</span>
              </div>

              <div className="p-3 bg-surface-muted/50 rounded-btn flex justify-between items-center">
                <span className="font-semibold text-amber-800 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-amber-600" />
                  Logistics Transport Emissions
                </span>
                <span className="font-bold text-amber-700">{totalTransportCO2e > 0 ? `-${Math.round(totalTransportCO2e)}` : '0'} tCO₂e</span>
              </div>

              <div className="p-3 bg-surface-muted/50 rounded-btn flex justify-between items-center">
                <span className="font-semibold text-amber-800 flex items-center gap-1.5">
                  <Factory className="w-4 h-4 text-amber-600" />
                  Facility Processing Emissions
                </span>
                <span className="font-bold text-amber-700">{totalProcessingCO2e > 0 ? `-${Math.round(totalProcessingCO2e)}` : '0'} tCO₂e</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-border flex-shrink-0">
            <button
              disabled={wasteLots.length === 0}
              onClick={() => wasteLots.length > 0 && setSelectedDrawerLot(wasteLots[0])}
              className={`w-full bg-brand-primary hover:bg-brand-dark text-white font-bold text-xs py-2.5 rounded-btn shadow-sm flex items-center justify-center gap-2 transition ${
                wasteLots.length === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
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
              {wasteLots.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-carbon-secondary">
                    No carbon accounting records found. Register or process waste batches to generate auditable CO₂e entries.
                  </td>
                </tr>
              ) : (
                wasteLots.map((lot) => {
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
                })
              )}
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
