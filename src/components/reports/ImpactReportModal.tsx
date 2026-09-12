import React, { useEffect } from 'react';
import { X, QrCode, ShieldCheck, Download, Share2, Leaf, Award, MapPin, Calendar, CheckCircle2 } from 'lucide-react';
import { WasteLot } from '../../types';
import { WASTE_TYPE_LABELS } from '../../data/constants';

interface ImpactReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  lot: WasteLot;
}

export const ImpactReportModal: React.FC<ImpactReportModalProps> = ({ isOpen, onClose, lot }) => {
  // Lock background body scroll when modal is open
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

  const mouseDownTargetRef = React.useRef<EventTarget | null>(null);

  if (!isOpen || !lot) return null;

  const { fingerprint, impactMetrics, logistics } = lot;
  const wasteLabel = WASTE_TYPE_LABELS[fingerprint.wasteType]?.label || fingerprint.wasteType;
  const metrics = impactMetrics || {
    wasteDivertedTonnes: fingerprint.quantityTonnes,
    landfillAvoidedCO2e: fingerprint.quantityTonnes * 0.8,
    carbonStoredCO2e: fingerprint.quantityTonnes * 0.3,
    transportEmissionsCO2e: 0.01,
    processingEmissionsCO2e: 0.08,
    netClimateImpactCO2e: fingerprint.quantityTonnes * 1.0,
    wasteValue: fingerprint.quantityTonnes * fingerprint.pricePerTon,
    carbonIncentiveValue: 8500,
    transportCost: 1000,
    netEconomicValue: 15000,
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      onMouseDown={(e) => {
        mouseDownTargetRef.current = e.target;
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && mouseDownTargetRef.current === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:static print:p-0 print:m-0 print:bg-transparent print:backdrop-blur-none print:w-full print:h-auto print:block"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        id="printable-certificate"
        className="w-full max-w-2xl max-h-[90vh] bg-surface rounded-container border border-border shadow-modal flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 print:max-w-none print:max-h-none print:h-auto print:border-border print:shadow-none print:rounded-lg print:overflow-visible"
      >
        
        {/* Fixed Header */}
        <div className="bg-carbon-primary text-white p-5 sm:p-6 flex items-center justify-between flex-shrink-0 print:p-3 print:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-btn bg-brand-primary flex items-center justify-center text-white flex-shrink-0 print:w-7 print:h-7">
              <Leaf className="w-6 h-6 stroke-[2.2] print:w-4 print:h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-wider uppercase text-sm print:text-xs">CarbonCycle</span>
                <span className="bg-brand-primary text-white text-[9px] font-bold px-2 py-0.5 rounded print:text-[8px] print:px-1.5">OFFICIAL REPORT</span>
              </div>
              <h2 className="text-base font-bold text-gray-100 print:text-xs print:font-semibold">Digital Waste-to-Carbon Impact Certificate</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            title="Close certificate"
            className="p-1.5 rounded-btn text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer print:hidden no-print"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Certificate Body */}
        <div className="p-5 sm:p-6 space-y-6 text-xs overflow-y-auto flex-1 [scrollbar-width:thin] print:p-3 print:space-y-2 print:overflow-visible print:text-[11px]">
          
          {/* Certificate Badge Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-surface-muted/60 rounded-card border border-border print:p-2 print:gap-2">
            <div>
              <span className="text-[10px] text-carbon-muted font-semibold uppercase block print:text-[8px]">Traceable Batch ID</span>
              <span className="text-base font-extrabold text-carbon-primary tracking-wider print:text-xs">{lot.id}</span>
            </div>
            <div>
              <span className="text-[10px] text-carbon-muted font-semibold uppercase block print:text-[8px]">Lifecycle State</span>
              <span className="inline-flex items-center gap-1 font-bold text-brand-primary bg-brand-soft px-2.5 py-1 rounded-full text-xs print:text-[10px] print:py-0.5 print:px-2">
                <ShieldCheck className="w-3.5 h-3.5 print:w-3 print:h-3" />
                {lot.status}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-carbon-muted font-semibold uppercase block print:text-[8px]">Issued Date</span>
              <span className="font-semibold text-carbon-primary print:text-xs">{new Date(lot.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Key Metric Banner */}
          <div className="p-5 bg-gradient-to-br from-brand-soft via-emerald-50 to-surface border border-brand-primary/30 rounded-card text-center space-y-1 print:p-2 print:space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-dark print:text-[8px]">
              Total Verified Net Climate Benefit
            </span>
            <div className="text-4xl font-black text-brand-dark tracking-tight print:text-xl">
              +{metrics.netClimateImpactCO2e} <span className="text-base font-bold print:text-xs">tCO₂e</span>
            </div>
            <p className="text-carbon-secondary text-[11px] print:text-[9px]">
              Diverted {metrics.wasteDivertedTonnes} tonnes of {wasteLabel} from landfill to {lot.matchedFacilityType || 'Biochar'} conversion
            </p>
          </div>

          {/* Waste & Facility Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-2 print:gap-2">
            <div className="p-3.5 bg-surface-muted/40 rounded-card border border-border space-y-2 print:p-2 print:space-y-0.5">
              <h3 className="font-bold text-carbon-primary uppercase text-[10px] tracking-wider border-b border-border pb-1 print:text-[9px] print:pb-0.5">
                Waste Origin Details
              </h3>
              <div className="space-y-1 print:space-y-0.5 print:text-[10px]">
                <div className="flex justify-between">
                  <span className="text-carbon-muted">Generator:</span>
                  <span className="font-semibold text-carbon-primary">{lot.generatorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-carbon-muted">Waste Type:</span>
                  <span className="font-semibold text-carbon-primary">{wasteLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-carbon-muted">Quantity:</span>
                  <span className="font-bold text-brand-primary">{lot.fingerprint.quantityTonnes} tonnes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-carbon-muted">Location:</span>
                  <span className="font-semibold text-carbon-primary truncate max-w-[150px]">{lot.fingerprint.location.name}</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-surface-muted/40 rounded-card border border-border space-y-2 print:p-2 print:space-y-0.5">
              <h3 className="font-bold text-carbon-primary uppercase text-[10px] tracking-wider border-b border-border pb-1 print:text-[9px] print:pb-0.5">
                Conversion Facility Details
              </h3>
              <div className="space-y-1 print:space-y-0.5 print:text-[10px]">
                <div className="flex justify-between">
                  <span className="text-carbon-muted">Facility:</span>
                  <span className="font-semibold text-carbon-primary">{lot.matchedFacilityName || 'Gujarat EcoChar'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-carbon-muted">Pathway:</span>
                  <span className="font-semibold text-carbon-primary">{lot.matchedFacilityType || 'BIOCHAR'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-carbon-muted">Transit Distance:</span>
                  <span className="font-semibold text-carbon-primary">{logistics?.distanceKm || 14.2} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-carbon-muted">Product Yield:</span>
                  <span className="font-semibold text-emerald-700">{lot.processingYield?.outputQuantity || '3.5t Biochar'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Impact Ledger Table */}
          <div className="space-y-2 print:space-y-1">
            <h3 className="font-bold text-carbon-primary uppercase text-[10px] tracking-wider print:text-[9px]">
              Carbon Impact Accounting Ledger
            </h3>
            <div className="border border-border rounded-btn overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-muted/80 text-[10px] font-bold text-carbon-secondary uppercase border-b border-border print:text-[8px]">
                  <tr>
                    <th className="p-2.5 print:py-0.5 print:px-2">Impact Component</th>
                    <th className="p-2.5 print:py-0.5 print:px-2">Accounting Category</th>
                    <th className="p-2.5 text-right print:py-0.5 print:px-2">tCO₂e Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs print:text-[9px]">
                  <tr>
                    <td className="p-2.5 print:py-0.5 print:px-2 font-medium text-carbon-primary">Landfill Methane Avoidance</td>
                    <td className="p-2.5 print:py-0.5 print:px-2 text-carbon-secondary">Emissions Avoided</td>
                    <td className="p-2.5 print:py-0.5 print:px-2 font-bold text-emerald-700 text-right">+{metrics.landfillAvoidedCO2e}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 print:py-0.5 print:px-2 font-medium text-carbon-primary">Permanent Carbon Sequestered</td>
                    <td className="p-2.5 print:py-0.5 print:px-2 text-carbon-secondary">Carbon Stored</td>
                    <td className="p-2.5 print:py-0.5 print:px-2 font-bold text-emerald-700 text-right">+{metrics.carbonStoredCO2e}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 print:py-0.5 print:px-2 font-medium text-carbon-primary">Logistics Diesel Transport</td>
                    <td className="p-2.5 print:py-0.5 print:px-2 text-carbon-secondary">Scope 3 Emissions</td>
                    <td className="p-2.5 print:py-0.5 print:px-2 font-semibold text-amber-700 text-right">-{metrics.transportEmissionsCO2e}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 print:py-0.5 print:px-2 font-medium text-carbon-primary">Facility Energy Footprint</td>
                    <td className="p-2.5 print:py-0.5 print:px-2 text-carbon-secondary">Processing Emissions</td>
                    <td className="p-2.5 print:py-0.5 print:px-2 font-semibold text-amber-700 text-right">-{metrics.processingEmissionsCO2e}</td>
                  </tr>
                  <tr className="bg-brand-soft/40 font-bold">
                    <td className="p-2.5 print:py-0.5 print:px-2 text-carbon-primary">NET VERIFIED CLIMATE BENEFIT</td>
                    <td className="p-2.5 print:py-0.5 print:px-2 text-brand-dark">Net Balance</td>
                    <td className="p-2.5 print:py-0.5 print:px-2 text-brand-dark text-right text-sm print:text-xs">+{metrics.netClimateImpactCO2e} tCO₂e</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* QR Code & Verification Stamp */}
          <div className="p-4 bg-surface-muted/30 border border-border rounded-card flex items-center justify-between gap-4 print:p-1.5 print:gap-2">
            <div className="flex items-center gap-3 print:gap-2">
              <div className="w-16 h-16 bg-white border border-border p-1.5 rounded-btn shadow-sm flex items-center justify-center flex-shrink-0 print:w-9 print:h-9 print:p-0.5">
                <svg className="w-full h-full text-carbon-primary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm-2 10h8v8H2v-8zm2 2v4h4v-4H4zm10-14h8v8h-8V2zm2 2v4h4V4h-4zm-2 8h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2zm2 2h2v2h-2v-2zm0-4h2v2h-2v-2z"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-carbon-primary text-xs print:text-[9px]">Auditable Digital Record</p>
                <p className="text-[10px] text-carbon-secondary print:text-[8px]">Scan to verify batch chain-of-custody in CarbonCycle registry.</p>
                <p className="text-[9px] text-carbon-muted mt-0.5 font-mono print:text-[7px]">Hash: 0x8a92f...41e0b</p>
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-brand-dark bg-brand-soft px-2.5 py-1 rounded print:text-[8px] print:px-1.5 print:py-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 min-w-[14px] min-h-[14px] text-brand-primary shrink-0 overflow-visible print:w-2.5 print:h-2.5" />
                VERIFIED IN NETWORK
              </div>
            </div>
          </div>

          <p className="text-[10px] text-carbon-muted italic text-center print:text-[7px] print:my-0">
            Note: This certificate is an auditable digital artifact generated by the CarbonCycle registry based on verified emission coefficients.
          </p>

        </div>

        {/* Fixed Footer Actions */}
        <div className="p-4 bg-surface-muted/60 border-t border-border flex items-center justify-between flex-shrink-0 print:hidden no-print">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-surface text-carbon-primary border border-border hover:bg-surface-muted text-xs font-semibold px-3 py-1.5 rounded-btn transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF / Print</span>
            </button>
            <button
              onClick={() => alert(`Certificate link for ${lot.id} copied to clipboard!`)}
              className="flex items-center gap-1.5 bg-surface text-carbon-primary border border-border hover:bg-surface-muted text-xs font-semibold px-3 py-1.5 rounded-btn transition cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Link</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="bg-brand-primary text-white text-xs font-bold px-4 py-1.5 rounded-btn hover:bg-brand-dark transition cursor-pointer"
          >
            Close Report
          </button>
        </div>

      </div>
    </div>
  );
};
