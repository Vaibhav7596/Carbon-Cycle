import React, { useState } from 'react';
import { Facility, WasteLot } from '../types';
import { evaluatePathwaySuitability, matchFacilitiesForWaste } from '../services/recommendationEngine';
import { ExplainableMatchCard } from '../components/matching/ExplainableMatchCard';
import { WASTE_TYPE_LABELS } from '../data/constants';
import { Sparkles, MapPin, Scale, Leaf, ArrowLeft, CheckCircle2, Factory, ChevronRight, Award, ChevronDown, ChevronUp, PanelLeftClose, PanelLeftOpen, AlertCircle, Clock } from 'lucide-react';

interface WasteIntelligenceViewProps {
  lot: WasteLot;
  facilities: Facility[];
  onConfirmMatch: (lotId: string, facilityId: string) => void;
  onBack: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const WasteIntelligenceView: React.FC<WasteIntelligenceViewProps> = ({
  lot,
  facilities,
  onConfirmMatch,
  onBack,
  isSidebarCollapsed = false,
  onToggleSidebar,
}) => {
  const { fingerprint } = lot;
  const wasteMeta = WASTE_TYPE_LABELS[fingerprint.wasteType] || { label: fingerprint.wasteType };

  // Run Recommendation Engine
  const pathwaySuitabilities = evaluatePathwaySuitability(fingerprint);
  const [selectedPathway, setSelectedPathway] = useState(lot.selectedPathway || pathwaySuitabilities[0].pathway);

  // Collapsible toggle states to declutter the viewport (auto-open alternatives if previously rejected)
  const [showAllPathways, setShowAllPathways] = useState(false);
  const [showAllAlternatives, setShowAllAlternatives] = useState(lot.status === 'REJECTED');

  // Run Facility Matcher for selected pathway
  const matchedResults = matchFacilitiesForWaste(fingerprint, facilities, selectedPathway);

  const topMatch = matchedResults[0];
  const alternativeMatches = matchedResults.slice(1);

  // Pathways to show based on toggle
  const visiblePathways = showAllPathways
    ? pathwaySuitabilities
    : pathwaySuitabilities.filter((p) => p.pathway === selectedPathway).length > 0
    ? pathwaySuitabilities.filter((p) => p.pathway === selectedPathway)
    : [pathwaySuitabilities[0]];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Top Header Row with Viewport & Sidebar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            title="Back to Waste Batches"
            className="p-2.5 rounded-xl border border-border bg-surface text-carbon-primary hover:bg-surface-muted transition cursor-pointer shadow-xs flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
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

        {/* Sidebar Expansion / Widescreen Mode Toggle */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-btn border border-border bg-surface hover:bg-surface-muted text-carbon-primary shadow-xs transition"
            title={isSidebarCollapsed ? "Expand navigation sidebar" : "Hide sidebar to widen view"}
          >
            {isSidebarCollapsed ? (
              <>
                <PanelLeftOpen className="w-4 h-4 text-brand-primary" />
                <span>Show Sidebar</span>
              </>
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4 text-carbon-muted" />
                <span>Widescreen (Hide Sidebar)</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Rejection Notification Banner */}
      {lot.status === 'REJECTED' && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-card flex items-start gap-3.5 text-xs text-rose-900 shadow-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-rose-950">
                Intake Request Declined by {lot.requestedFacilityName || 'Selected Facility'}
              </span>
              <span className="text-[10px] font-bold uppercase bg-rose-200/80 text-rose-900 px-2 py-0.5 rounded">
                Alternative Required
              </span>
            </div>
            <p className="text-rose-800">
              Reason provided by facility: <span className="font-semibold italic">"{lot.rejectionReason || 'Facility intake capacity limits or quality parameters'}"</span>
            </p>
            <p className="text-[11px] text-rose-700 font-medium">
              We've unlocked all alternative compatible conversion centers below. Review ranking scores and send an intake request to an available facility.
            </p>
          </div>
        </div>
      )}

      {/* Pending Intake Notification Banner */}
      {lot.status === 'MATCH_REQUESTED' && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-card flex items-start gap-3.5 text-xs text-amber-900 shadow-sm animate-fadeIn">
          <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5 animate-spin" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-amber-950">
                Intake Request Pending Facility Review ({lot.requestedFacilityName || 'Facility'})
              </span>
              <span className="text-[10px] font-bold uppercase bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded">
                Awaiting Operator
              </span>
            </div>
            <p className="text-amber-800">
              The facility manager at {lot.requestedFacilityName || 'the conversion facility'} has received your waste fingerprint. Once accepted, logistics dispatch and pickup windows will be confirmed automatically.
            </p>
          </div>
        </div>
      )}

      {/* 2-Column Grid: Left Fingerprint, Pathways & Alternatives / Right Hero Facility Match */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (5 cols): Waste Fingerprint, Evaluated Pathways & Alternative Facilities */}
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

          {/* Candidate Pathways Ranking with Show More / Show Less */}
          <div className="bg-surface border border-border rounded-card p-5 space-y-3 shadow-subtle">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h2 className="font-bold text-xs uppercase tracking-wider text-carbon-muted">
                Evaluated Conversion Pathways
              </h2>
              <span className="text-[10px] text-carbon-secondary font-medium">Rule-Based Fit</span>
            </div>

            <div className="space-y-2.5">
              {visiblePathways.map((path) => {
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

            {/* Show More / Less Pathways Button */}
            {pathwaySuitabilities.length > 1 && (
              <button
                type="button"
                onClick={() => setShowAllPathways(!showAllPathways)}
                className="w-full py-2 text-xs font-bold text-brand-primary bg-brand-soft/50 hover:bg-brand-soft rounded-btn border border-brand-primary/20 transition flex items-center justify-center gap-1.5 mt-1"
              >
                <span>
                  {showAllPathways
                    ? 'Show Less Pathways'
                    : `Show More Pathways (+${pathwaySuitabilities.length - visiblePathways.length} options)`}
                </span>
                {showAllPathways ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>

        </div>

        {/* Right Column (7 cols): Primary Hero Facility Recommendation & Alternative Facilities */}
        <div className="lg:col-span-7 space-y-5">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-base text-carbon-primary">Facility Matching Engine</h2>
              <p className="text-xs text-carbon-secondary">Ranked by Compatibility, Distance, Capacity, and Carbon Benefit.</p>
            </div>
            <span className="text-xs text-carbon-muted bg-surface-muted px-2.5 py-1 rounded-full border border-border font-medium">
              Found {matchedResults.length} Compatible Facilities
            </span>
          </div>

          {/* Primary #1 Recommendation Hero Card (Contains Confirm & Select Facility) */}
          {topMatch ? (
            <ExplainableMatchCard
              match={topMatch}
              isTopMatch={true}
              lotStatus={lot.status}
              isRequested={lot.status === 'MATCH_REQUESTED' && (lot.requestedFacilityId === topMatch.facility.id || lot.requestedFacilityName === topMatch.facility.name)}
              isMatched={lot.matchedFacilityId === topMatch.facility.id && lot.status !== 'REJECTED'}
              isRejected={lot.status === 'REJECTED' && lot.requestedFacilityId === topMatch.facility.id}
              rejectionReason={lot.rejectionReason}
              onSelectFacility={(facId) => onConfirmMatch(lot.id, facId)}
            />
          ) : (
            <div className="p-8 bg-surface border border-border rounded-card text-center text-xs text-carbon-muted">
              No matching facility found for the selected pathway.
            </div>
          )}

          {/* Alternative Compatible Facilities: Only show button initially below confirm & select facility */}
          {alternativeMatches.length > 0 && (
            <div className="space-y-3 pt-1">
              <button
                type="button"
                onClick={() => setShowAllAlternatives(!showAllAlternatives)}
                className="w-full py-3 px-4 text-xs font-bold text-carbon-primary bg-surface hover:bg-surface-muted rounded-btn border border-border shadow-xs hover:border-brand-primary/40 transition flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
                  <span className="font-bold text-carbon-primary">
                    Alternative Compatible Facilities
                  </span>
                  <span className="text-[11px] text-carbon-muted font-medium ml-1">
                    ({alternativeMatches.length} options available)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-brand-primary font-bold text-xs">
                  <span>{showAllAlternatives ? 'Hide Alternatives' : 'Show Alternatives'}</span>
                  {showAllAlternatives ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </button>

              {/* Cards appear only when the button is opened */}
              {showAllAlternatives && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="font-bold text-xs text-carbon-muted uppercase tracking-wider">
                      Alternative Ranked Facilities
                    </h3>
                    <span className="text-[11px] text-carbon-secondary">
                      {alternativeMatches.length} facilities
                    </span>
                  </div>

                  <div className="space-y-3">
                    {alternativeMatches.map((altMatch) => (
                      <ExplainableMatchCard
                        key={altMatch.facility.id}
                        match={altMatch}
                        isTopMatch={false}
                        lotStatus={lot.status}
                        isRequested={lot.status === 'MATCH_REQUESTED' && (lot.requestedFacilityId === altMatch.facility.id || lot.requestedFacilityName === altMatch.facility.name)}
                        isMatched={lot.matchedFacilityId === altMatch.facility.id && lot.status !== 'REJECTED'}
                        isRejected={lot.status === 'REJECTED' && lot.requestedFacilityId === altMatch.facility.id}
                        rejectionReason={lot.rejectionReason}
                        onSelectFacility={(facId) => onConfirmMatch(lot.id, facId)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
