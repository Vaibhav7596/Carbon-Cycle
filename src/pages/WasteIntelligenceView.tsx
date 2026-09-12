import React, { useState } from 'react';
import { Facility, WasteLot } from '../types';
import { evaluatePathwaySuitability, matchFacilitiesForWaste } from '../services/recommendationEngine';
import { ExplainableMatchCard } from '../components/matching/ExplainableMatchCard';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';
import { WASTE_TYPE_LABELS } from '../data/constants';
import { Sparkles, MapPin, Scale, Leaf, ArrowLeft, CheckCircle2, Factory, ChevronRight, Award } from 'lucide-react';

interface WasteIntelligenceViewProps {
  lot: WasteLot;
  facilities: Facility[];
  onConfirmMatch: (lotId: string, facilityId: string) => void;
  onBack: () => void;
}

export const WasteIntelligenceView: React.FC<WasteIntelligenceViewProps> = ({
  lot,
  facilities,
  onConfirmMatch,
  onBack,
}) => {
  const { fingerprint } = lot;
  const wasteMeta = WASTE_TYPE_LABELS[fingerprint.wasteType] || { label: fingerprint.wasteType };

  // Run Recommendation Engine
  const pathwaySuitabilities = evaluatePathwaySuitability(fingerprint);
  const [selectedPathway, setSelectedPathway] = useState(pathwaySuitabilities[0].pathway);

  // Run Facility Matcher for selected pathway
  const matchedResults = matchFacilitiesForWaste(fingerprint, facilities, selectedPathway);

  const topMatch = matchedResults[0];
  const alternativeMatches = matchedResults.slice(1);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-btn border border-border text-carbon-secondary hover:text-carbon-primary hover:bg-surface-muted transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-carbon-primary">{lot.id}</span>
              <span className="bg-brand-soft text-brand-dark px-2 py-0.5 rounded text-[10px] font-bold">
                ANALYZED & FINGERPRINTED
              </span>
            </div>
            <p className="text-xs text-carbon-secondary">
              {lot.generatorName} · {fingerprint.quantityTonnes} tonnes {wasteMeta.label}
            </p>
          </div>
        </div>
      </div>

      <DisclaimerBanner />

      {/* 2-Column Grid: Left Fingerprint & Pathway Suitability / Right Facility Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (5 cols): Waste Fingerprint & Pathway Scores */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Fingerprint Card */}
          <div className="bg-surface border border-border rounded-card p-5 space-y-4 shadow-subtle">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h2 className="font-bold text-xs uppercase tracking-wider text-carbon-muted">
                Structured Waste Fingerprint
              </h2>
              <span className="text-[10px] font-mono text-brand-primary bg-brand-soft px-2 py-0.5 rounded font-semibold">
                Input Parameters
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-carbon-muted">Waste Classification:</span>
                <span className="font-bold text-carbon-primary">{wasteMeta.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-carbon-muted">Quantity:</span>
                <span className="font-extrabold text-brand-primary">{fingerprint.quantityTonnes} Tonnes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-carbon-muted">Moisture Content:</span>
                <span className="font-bold text-carbon-primary">{fingerprint.moisturePercent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-carbon-muted">Organic Fraction:</span>
                <span className="font-semibold text-carbon-primary">{fingerprint.organicFractionPercent}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-carbon-muted">Contamination:</span>
                <span className="font-semibold text-carbon-primary">{fingerprint.contaminationPercent}%</span>
              </div>
              <div className="flex justify-between border-t border-border/60 pt-2">
                <span className="text-carbon-muted">Origin Location:</span>
                <span className="font-semibold text-carbon-primary truncate max-w-[180px]">{fingerprint.location.name}</span>
              </div>
            </div>
          </div>

          {/* Candidate Pathways Ranking */}
          <div className="bg-surface border border-border rounded-card p-5 space-y-4 shadow-subtle">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h2 className="font-bold text-xs uppercase tracking-wider text-carbon-muted">
                Evaluated Conversion Pathways
              </h2>
              <span className="text-[10px] text-carbon-secondary">Rule-Based Fit</span>
            </div>

            <div className="space-y-3">
              {pathwaySuitabilities.map((path) => {
                const isSelected = selectedPathway === path.pathway;

                return (
                  <div
                    key={path.pathway}
                    onClick={() => setSelectedPathway(path.pathway)}
                    className={`p-3 rounded-btn border cursor-pointer transition ${
                      isSelected
                        ? 'border-brand-primary bg-brand-soft/60 ring-1 ring-brand-primary'
                        : 'border-border bg-surface hover:bg-surface-muted/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-carbon-primary">{path.title}</span>
                      <span className={`font-extrabold ${path.suitabilityScore >= 85 ? 'text-brand-primary' : 'text-carbon-secondary'}`}>
                        {path.suitabilityScore}% Fit
                      </span>
                    </div>

                    <div className="w-full bg-surface-muted rounded-full h-1.5 overflow-hidden mb-2">
                      <div
                        className={`h-full rounded-full ${path.suitabilityScore >= 85 ? 'bg-brand-primary' : 'bg-carbon-muted'}`}
                        style={{ width: `${path.suitabilityScore}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-carbon-secondary leading-snug">{path.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column (7 cols): Facility Recommendation & Ranking */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-base text-carbon-primary">Facility Matching Engine</h2>
              <p className="text-xs text-carbon-secondary">Ranked by Compatibility, Distance, Capacity, and Carbon Benefit.</p>
            </div>
            <span className="text-xs text-carbon-muted">
              Found {matchedResults.length} Compatible Facilities
            </span>
          </div>

          {/* Primary #1 Recommendation Card */}
          {topMatch && (
            <ExplainableMatchCard
              match={topMatch}
              isTopMatch={true}
              onSelectFacility={(facId) => onConfirmMatch(lot.id, facId)}
            />
          )}

          {/* Alternative Facilities Comparison */}
          {alternativeMatches.length > 0 && (
            <div className="space-y-4 pt-2">
              <h3 className="font-bold text-xs text-carbon-muted uppercase tracking-wider">
                Alternative Compatible Facilities
              </h3>

              <div className="space-y-4">
                {alternativeMatches.map((altMatch) => (
                  <ExplainableMatchCard
                    key={altMatch.facility.id}
                    match={altMatch}
                    isTopMatch={false}
                    onSelectFacility={(facId) => onConfirmMatch(lot.id, facId)}
                  />
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
