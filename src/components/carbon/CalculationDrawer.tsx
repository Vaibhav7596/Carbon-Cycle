import React from 'react';
import { X, Calculator, Leaf, Truck, Factory, ShieldAlert, ArrowRight } from 'lucide-react';
import { DEFAULT_EMISSION_FACTORS, WASTE_TYPE_LABELS } from '../../data/constants';
import { ImpactMetrics, WasteLot } from '../../types';

interface CalculationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lot: WasteLot;
}

export const CalculationDrawer: React.FC<CalculationDrawerProps> = ({ isOpen, onClose, lot }) => {
  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-surface h-full border-l border-border shadow-modal flex flex-col justify-between animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-btn bg-brand-soft text-brand-dark flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-carbon-primary">Carbon & Economic Math</h2>
              <p className="text-[11px] text-carbon-secondary">Batch ID: {lot.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-btn text-carbon-muted hover:text-carbon-primary hover:bg-surface-muted transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Main Net Result Card */}
          <div className="p-4 bg-brand-soft/80 border border-brand-primary/30 rounded-card text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-brand-dark tracking-wider">
              Indicative Net Climate Benefit
            </span>
            <div className="text-3xl font-extrabold text-brand-dark tracking-tight">
              +{metrics.netClimateImpactCO2e} <span className="text-sm font-semibold">tCO₂e</span>
            </div>
            <p className="text-[11px] text-carbon-secondary">
              Net CO₂e avoided & sequestered for {metrics.wasteDivertedTonnes} tonnes {wasteLabel}
            </p>
          </div>

          {/* Equation Breakdown */}
          <div className="space-y-3">
            <h3 className="font-bold text-carbon-primary uppercase text-[10px] tracking-wider border-b border-border pb-1">
              Climate Calculation Breakdown
            </h3>

            {/* Item 1: Landfill Avoided */}
            <div className="p-3 bg-surface-muted/50 rounded-btn border border-border/60 space-y-1">
              <div className="flex justify-between font-bold text-carbon-primary">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <Leaf className="w-3.5 h-3.5" />
                  Landfill Emissions Avoided
                </span>
                <span className="text-emerald-700">+{metrics.landfillAvoidedCO2e} tCO₂e</span>
              </div>
              <p className="text-[11px] text-carbon-secondary font-mono">
                Formula: {metrics.wasteDivertedTonnes} tonnes × {landfillFactor} tCO₂e/ton factor
              </p>
            </div>

            {/* Item 2: Carbon Stored */}
            <div className="p-3 bg-surface-muted/50 rounded-btn border border-border/60 space-y-1">
              <div className="flex justify-between font-bold text-carbon-primary">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <Factory className="w-3.5 h-3.5" />
                  Carbon Stored / Sequestered
                </span>
                <span className="text-emerald-700">+{metrics.carbonStoredCO2e} tCO₂e</span>
              </div>
              <p className="text-[11px] text-carbon-secondary font-mono">
                Formula: {metrics.wasteDivertedTonnes} tonnes × {storedFactor} tCO₂e/ton factor ({matchedFacilityType || 'BIOCHAR'})
              </p>
            </div>

            {/* Item 3: Transport Penalty */}
            <div className="p-3 bg-surface-muted/50 rounded-btn border border-border/60 space-y-1">
              <div className="flex justify-between font-bold text-carbon-primary">
                <span className="flex items-center gap-1.5 text-amber-700">
                  <Truck className="w-3.5 h-3.5" />
                  Transport Emissions (Diesel Transit)
                </span>
                <span className="text-amber-700">-{metrics.transportEmissionsCO2e} tCO₂e</span>
              </div>
              <p className="text-[11px] text-carbon-secondary font-mono">
                Formula: {logistics?.distanceKm || 14.2} km × {metrics.wasteDivertedTonnes} tonnes × 0.00012 tCO₂e/km-ton
              </p>
            </div>

            {/* Item 4: Processing Penalty */}
            <div className="p-3 bg-surface-muted/50 rounded-btn border border-border/60 space-y-1">
              <div className="flex justify-between font-bold text-carbon-primary">
                <span className="flex items-center gap-1.5 text-amber-700">
                  <Factory className="w-3.5 h-3.5" />
                  Facility Processing Emissions
                </span>
                <span className="text-amber-700">-{metrics.processingEmissionsCO2e} tCO₂e</span>
              </div>
              <p className="text-[11px] text-carbon-secondary font-mono">
                Formula: {metrics.wasteDivertedTonnes} tonnes × {processingFactor} tCO₂e/ton facility factor
              </p>
            </div>
          </div>

          {/* Economic Breakdown */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-carbon-primary uppercase text-[10px] tracking-wider border-b border-border pb-1">
              Indicative Economic Outcome
            </h3>

            <div className="p-3 bg-surface-muted/50 rounded-btn border border-border/60 space-y-2">
              <div className="flex justify-between">
                <span className="text-carbon-secondary">Waste Feedstock Value:</span>
                <span className="font-semibold text-carbon-primary">₹{metrics.wasteValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-carbon-secondary">Carbon Impact Incentive:</span>
                <span className="font-semibold text-emerald-700">+₹{metrics.carbonIncentiveValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-carbon-secondary">Transport Cost:</span>
                <span className="font-semibold text-amber-700">-₹{metrics.transportCost.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-border/80 pt-2 flex justify-between font-bold text-sm text-carbon-primary">
                <span>Indicative Net Value:</span>
                <span className="text-brand-primary">₹{metrics.netEconomicValue.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Disclaimer Box */}
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-btn text-[10px] text-amber-800 space-y-1">
            <div className="font-bold flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Methodology & Credibility Note</span>
            </div>
            <p>
              Calculations are based on default regional emission coefficients. These estimates are designed for waste-to-carbon decision modeling and hackathon demonstration, not certified carbon credit issuance.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-surface-muted/30">
          <button
            onClick={onClose}
            className="w-full bg-carbon-primary text-white py-2 rounded-btn font-semibold text-xs hover:bg-black transition"
          >
            Close Calculation View
          </button>
        </div>
      </div>
    </div>
  );
};
