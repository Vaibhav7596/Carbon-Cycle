import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calculator, Leaf, Truck, Factory, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { DEFAULT_EMISSION_FACTORS, WASTE_TYPE_LABELS } from '../../data/constants';
import { WasteLot } from '../../types';

interface CalculationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lot: WasteLot;
}

export const CalculationDrawer: React.FC<CalculationDrawerProps> = ({ isOpen, onClose, lot }) => {
  // Lock background body scroll when drawer is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !lot) return null;

  const { fingerprint, matchedFacilityType, logistics, impactMetrics } = lot;
  const metrics = impactMetrics || {
    wasteDivertedTonnes: fingerprint.quantityTonnes,
    landfillAvoidedCO2e: fingerprint.quantityTonnes * 0.8,
    carbonStoredCO2e: fingerprint.quantityTonnes * 0.3,
    transportEmissionsCO2e: 0.05,
    processingEmissionsCO2e: 0.08,
    netClimateImpactCO2e: fingerprint.quantityTonnes * 1.0,
    wasteValue: fingerprint.quantityTonnes * fingerprint.pricePerTon,
    carbonIncentiveValue: 8500,
    transportCost: 1000,
    netEconomicValue: 15000,
  };

  const wasteLabel = WASTE_TYPE_LABELS[fingerprint.wasteType]?.label || fingerprint.wasteType;
  const landfillFactor = DEFAULT_EMISSION_FACTORS.landfillAvoidancePerTon[fingerprint.wasteType] || 0.8;
  const storedFactor = matchedFacilityType ? (DEFAULT_EMISSION_FACTORS.pathwayCarbonStoredPerTon[matchedFacilityType] || 0.3) : 0.3;
  const processingFactor = matchedFacilityType ? (DEFAULT_EMISSION_FACTORS.pathwayProcessingEmissionsPerTon[matchedFacilityType] || 0.05) : 0.05;

  return createPortal(
    <div className="fixed inset-0 z-[999] flex justify-end">
      {/* Backdrop overlay - clicking closes the drawer */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out Sidebar Panel - takes entire viewport height from top 0 to bottom 100vh */}
      <aside 
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-lg sm:max-w-xl bg-surface h-screen max-h-screen border-l border-border shadow-2xl flex flex-col overflow-hidden"
      >
        
        {/* Header - fixed at top */}
        <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between bg-surface flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand-dark flex items-center justify-center shadow-xs flex-shrink-0">
              <Calculator className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-sm text-carbon-primary tracking-tight">Carbon & Economic Math Formula</h2>
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-brand-soft text-brand-dark uppercase">
                  Auditable
                </span>
              </div>
              <p className="text-[11px] text-carbon-secondary">
                Batch ID: <span className="font-mono font-bold text-carbon-primary">{lot.id}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            title="Close panel"
            className="w-9 h-9 aspect-square flex items-center justify-center rounded-xl text-carbon-secondary hover:text-carbon-primary hover:bg-surface-muted transition cursor-pointer border border-transparent hover:border-border/70"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body - scrollable through entire vertical height */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs [scrollbar-width:thin] pb-10">
          
          {/* Main Net Result Hero Card */}
          <div className="p-5 bg-gradient-to-br from-brand-soft via-emerald-50 to-surface border border-brand-primary/30 rounded-card text-center space-y-1.5 shadow-subtle flex-shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark bg-white/80 px-2.5 py-0.5 rounded-full border border-brand-primary/20 inline-block">
              Total Verified Net Climate Benefit
            </span>
            <div className="text-4xl font-black text-brand-dark tracking-tight">
              +{metrics.netClimateImpactCO2e} <span className="text-base font-semibold">tCO₂e</span>
            </div>
            <p className="text-xs text-carbon-secondary max-w-md mx-auto">
              Net CO₂e avoided & permanently sequestered for <span className="font-bold text-carbon-primary">{metrics.wasteDivertedTonnes} tonnes</span> {wasteLabel}
            </p>
          </div>

          {/* Equation Breakdown */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between border-b border-border pb-1.5">
              <h3 className="font-bold text-carbon-primary uppercase text-[10px] tracking-wider">
                Climate Calculation Breakdown
              </h3>
              <span className="text-[10px] text-carbon-muted font-medium">IPCC Tier 1 Emission Factors</span>
            </div>

            {/* Item 1: Landfill Avoided */}
            <div className="p-4 bg-surface-muted/60 rounded-card border border-border/80 space-y-2.5">
              <div className="flex justify-between items-center font-bold text-xs">
                <span className="flex items-center gap-2 text-emerald-800">
                  <Leaf className="w-4 h-4 text-emerald-600" />
                  Landfill Emissions Avoided
                </span>
                <span className="text-emerald-700 font-extrabold text-sm">+{metrics.landfillAvoidedCO2e} tCO₂e</span>
              </div>
              <div className="p-2.5 bg-surface rounded-lg border border-border/60 font-mono text-[11px] text-carbon-secondary flex flex-wrap items-center justify-between gap-2">
                <span className="text-carbon-muted uppercase text-[10px] font-bold">Formula</span>
                <span className="font-semibold text-carbon-primary">
                  {metrics.wasteDivertedTonnes} tonnes × {landfillFactor} tCO₂e/t factor
                </span>
              </div>
            </div>

            {/* Item 2: Carbon Stored */}
            <div className="p-4 bg-surface-muted/60 rounded-card border border-border/80 space-y-2.5">
              <div className="flex justify-between items-center font-bold text-xs">
                <span className="flex items-center gap-2 text-emerald-800">
                  <Factory className="w-4 h-4 text-emerald-600" />
                  Carbon Stored / Sequestered
                </span>
                <span className="text-emerald-700 font-extrabold text-sm">+{metrics.carbonStoredCO2e} tCO₂e</span>
              </div>
              <div className="p-2.5 bg-surface rounded-lg border border-border/60 font-mono text-[11px] text-carbon-secondary flex flex-wrap items-center justify-between gap-2">
                <span className="text-carbon-muted uppercase text-[10px] font-bold">Formula ({matchedFacilityType || 'BIOCHAR'})</span>
                <span className="font-semibold text-carbon-primary">
                  {metrics.wasteDivertedTonnes} tonnes × {storedFactor} tCO₂e/t factor
                </span>
              </div>
            </div>

            {/* Item 3: Transport Penalty */}
            <div className="p-4 bg-surface-muted/60 rounded-card border border-border/80 space-y-2.5">
              <div className="flex justify-between items-center font-bold text-xs">
                <span className="flex items-center gap-2 text-amber-800">
                  <Truck className="w-4 h-4 text-amber-600" />
                  Transport Emissions (Diesel Transit)
                </span>
                <span className="text-amber-700 font-extrabold text-sm">-{metrics.transportEmissionsCO2e} tCO₂e</span>
              </div>
              <div className="p-2.5 bg-surface rounded-lg border border-border/60 font-mono text-[11px] text-carbon-secondary flex flex-wrap items-center justify-between gap-2">
                <span className="text-carbon-muted uppercase text-[10px] font-bold">Formula</span>
                <span className="font-semibold text-carbon-primary">
                  {logistics?.distanceKm || 14.2} km × {metrics.wasteDivertedTonnes} tonnes × 0.00012 tCO₂e/km-t
                </span>
              </div>
            </div>

            {/* Item 4: Processing Penalty */}
            <div className="p-4 bg-surface-muted/60 rounded-card border border-border/80 space-y-2.5">
              <div className="flex justify-between items-center font-bold text-xs">
                <span className="flex items-center gap-2 text-amber-800">
                  <Factory className="w-4 h-4 text-amber-600" />
                  Facility Processing Emissions
                </span>
                <span className="text-amber-700 font-extrabold text-sm">-{metrics.processingEmissionsCO2e} tCO₂e</span>
              </div>
              <div className="p-2.5 bg-surface rounded-lg border border-border/60 font-mono text-[11px] text-carbon-secondary flex flex-wrap items-center justify-between gap-2">
                <span className="text-carbon-muted uppercase text-[10px] font-bold">Formula</span>
                <span className="font-semibold text-carbon-primary">
                  {metrics.wasteDivertedTonnes} tonnes × {processingFactor} tCO₂e/t facility factor
                </span>
              </div>
            </div>
          </div>

          {/* Economic Breakdown */}
          <div className="space-y-3.5 pt-2">
            <h3 className="font-bold text-carbon-primary uppercase text-[10px] tracking-wider border-b border-border pb-1.5">
              Economic Outcome Breakdown
            </h3>

            <div className="p-4 bg-surface-muted/60 rounded-card border border-border space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-carbon-secondary font-medium">Waste Feedstock Value:</span>
                <span className="font-bold text-carbon-primary">₹{metrics.wasteValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-carbon-secondary font-medium">Carbon Impact Incentive:</span>
                <span className="font-bold text-emerald-700">+₹{metrics.carbonIncentiveValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-carbon-secondary font-medium">Transport Cost:</span>
                <span className="font-bold text-amber-700">-₹{metrics.transportCost.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-border pt-2.5 flex justify-between items-center font-bold text-sm text-carbon-primary">
                <span>Net Economic Value:</span>
                <span className="text-brand-primary text-base font-extrabold">₹{metrics.netEconomicValue.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Regional Reference Factor Badges */}
          <div className="p-3.5 bg-surface rounded-card border border-border/80 space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-carbon-secondary uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" />
              <span>Standard Baseline Factor Coefficients</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
              <div className="p-2 bg-surface-muted/60 rounded-lg text-center">
                <span className="text-carbon-muted block">Landfill Avoid</span>
                <span className="font-bold text-carbon-primary">{landfillFactor} t/t</span>
              </div>
              <div className="p-2 bg-surface-muted/60 rounded-lg text-center">
                <span className="text-carbon-muted block">Carbon Stored</span>
                <span className="font-bold text-carbon-primary">{storedFactor} t/t</span>
              </div>
              <div className="p-2 bg-surface-muted/60 rounded-lg text-center">
                <span className="text-carbon-muted block">Transit Diesel</span>
                <span className="font-bold text-carbon-primary">0.00012/km</span>
              </div>
              <div className="p-2 bg-surface-muted/60 rounded-lg text-center">
                <span className="text-carbon-muted block">Process Power</span>
                <span className="font-bold text-carbon-primary">{processingFactor} t/t</span>
              </div>
            </div>
          </div>

        </div>
      </aside>
    </div>,
    document.body
  );
};
