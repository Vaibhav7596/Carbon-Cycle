import React, { useState } from 'react';
import { FacilityMatchResult, WasteStatus } from '../../types';
import { CheckCircle2, ChevronDown, ChevronUp, MapPin, Gauge, Leaf, IndianRupee, Award, ArrowRight, Clock, AlertTriangle, Send } from 'lucide-react';

interface ExplainableMatchCardProps {
  match: FacilityMatchResult;
  isTopMatch?: boolean;
  onSelectFacility: (facilityId: string) => void;
  lotStatus?: WasteStatus;
  isRequested?: boolean;
  isMatched?: boolean;
  isRejected?: boolean;
  rejectionReason?: string;
}

export const ExplainableMatchCard: React.FC<ExplainableMatchCardProps> = ({
  match,
  isTopMatch = false,
  onSelectFacility,
  lotStatus,
  isRequested = false,
  isMatched = false,
  isRejected = false,
  rejectionReason,
}) => {
  const [showExplanation, setShowExplanation] = useState(isTopMatch);

  const { facility, matchScore, scoreBreakdown, distanceKm, estimatedTransportCost, netCO2eBenefit, netEconomicValue, reasoning } = match;

  return (
    <div className={`rounded-card border transition-all ${
      isTopMatch
        ? 'border-brand-primary/60 bg-surface shadow-float ring-1 ring-brand-primary/30'
        : 'border-border bg-surface hover:border-carbon-muted'
    }`}>
      {/* Top Tag Header */}
      {isTopMatch && (
        <div className="bg-brand-primary text-white text-[11px] font-bold px-3 py-1 rounded-t-card flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" />
            <span>#1 RECOMMENDED CONVERSION FACILITY</span>
          </div>
          <span className="bg-white/20 text-white px-2 py-0.5 rounded text-[10px] font-bold">
            Best Circular Fit
          </span>
        </div>
      )}

      <div className="p-5 space-y-4">
        {/* Title & Score Bar */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-carbon-primary">{facility.name}</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-soft text-brand-dark">
                {facility.type}
              </span>
            </div>
            <p className="text-xs text-carbon-secondary mt-0.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-carbon-muted" />
              <span>{facility.location.name} · {facility.location.address}</span>
            </p>
          </div>

          {/* Match Score Display */}
          <div className="text-right flex-shrink-0">
            <div className="text-2xl font-extrabold text-brand-primary tracking-tight">
              {matchScore}%
            </div>
            <span className="text-[10px] font-semibold text-carbon-muted uppercase tracking-wider">
              Match Score
            </span>
          </div>
        </div>

        {/* Score Progress Bar */}
        <div className="w-full bg-surface-muted rounded-full h-2 overflow-hidden">
          <div
            className="bg-brand-primary h-full rounded-full transition-all duration-500"
            style={{ width: `${matchScore}%` }}
          />
        </div>

        {/* Quick Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-surface-muted/60 p-3 rounded-btn text-xs">
          <div>
            <span className="text-carbon-muted text-[10px] block font-medium">Distance</span>
            <span className="font-bold text-carbon-primary">{distanceKm} km</span>
          </div>
          <div>
            <span className="text-carbon-muted text-[10px] block font-medium">Available Cap</span>
            <span className="font-bold text-brand-primary">{facility.availableCapacityTonnes} t/day</span>
          </div>
          <div>
            <span className="text-carbon-muted text-[10px] block font-medium">Transport Cost</span>
            <span className="font-semibold text-carbon-primary">₹{estimatedTransportCost.toLocaleString('en-IN')}</span>
          </div>
          <div>
            <span className="text-carbon-muted text-[10px] block font-medium">Net CO₂e Benefit</span>
            <span className="font-bold text-emerald-700">+{netCO2eBenefit} tCO₂e</span>
          </div>
        </div>

        {/* Reasoning Bullet Points */}
        <div className="space-y-1.5 pt-1">
          {reasoning.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-carbon-secondary">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary flex-shrink-0" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Explainability Accordion Toggle */}
        <div className="border-t border-border/80 pt-3">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="flex items-center justify-between w-full text-xs font-semibold text-carbon-secondary hover:text-carbon-primary transition"
          >
            <div className="flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-brand-primary" />
              <span>Why this match? (Score Breakdown)</span>
            </div>
            {showExplanation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showExplanation && (
            <div className="mt-3 p-3 bg-surface-muted/40 rounded-btn space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between text-[11px] font-medium mb-1">
                  <span className="text-carbon-secondary">Compatibility (40% Weight)</span>
                  <span className="font-bold text-carbon-primary">{scoreBreakdown.compatibility} / 100</span>
                </div>
                <div className="w-full bg-surface-muted rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${scoreBreakdown.compatibility}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-medium mb-1">
                  <span className="text-carbon-secondary">Proximity / Distance (25% Weight)</span>
                  <span className="font-bold text-carbon-primary">{scoreBreakdown.distance} / 100</span>
                </div>
                <div className="w-full bg-surface-muted rounded-full h-1.5 overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${scoreBreakdown.distance}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-medium mb-1">
                  <span className="text-carbon-secondary">Available Capacity (20% Weight)</span>
                  <span className="font-bold text-carbon-primary">{scoreBreakdown.capacity} / 100</span>
                </div>
                <div className="w-full bg-surface-muted rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${scoreBreakdown.capacity}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-medium mb-1">
                  <span className="text-carbon-secondary">Indicative Carbon Benefit (15% Weight)</span>
                  <span className="font-bold text-carbon-primary">{scoreBreakdown.carbonBenefit} / 100</span>
                </div>
                <div className="w-full bg-surface-muted rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${scoreBreakdown.carbonBenefit}%` }} />
                </div>
              </div>

              <p className="text-[10px] text-carbon-muted italic pt-1 border-t border-border/50">
                Formula: Match Score = (Compatibility × 40%) + (Distance × 25%) + (Capacity × 20%) + (Carbon Benefit × 15%)
              </p>
            </div>
          )}
        </div>

        {/* Select Action CTA */}
        <div className="pt-2">
          {isMatched ? (
            <div className="w-full py-2.5 px-4 rounded-btn text-xs font-bold flex items-center justify-center gap-2 bg-emerald-600 text-white shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Intake Accepted & Scheduled</span>
            </div>
          ) : isRequested ? (
            <div className="w-full py-2.5 px-4 rounded-btn text-xs font-bold flex items-center justify-center gap-2 bg-amber-500 text-white shadow-sm animate-pulse">
              <Clock className="w-4 h-4" />
              <span>Intake Request Pending Facility Operator Review</span>
            </div>
          ) : (
            <button
              onClick={() => onSelectFacility(facility.id)}
              className={`w-full py-2.5 px-4 rounded-btn text-xs font-bold flex items-center justify-center gap-2 transition ${
                isTopMatch
                  ? 'bg-brand-primary text-white hover:bg-brand-dark shadow-sm'
                  : 'bg-carbon-primary text-white hover:bg-black'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Intake Request to Facility</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
