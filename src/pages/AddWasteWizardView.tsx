import React, { useState, useEffect, useRef } from 'react';
import { WASTE_TYPE_LABELS } from '../data/constants';
import { LocationPoint, WasteFingerprint, WasteType } from '../types';
import { createWasteLotApi, lookupPincodeApi } from '../services/store';
import { useAuth } from '../context/AuthContext';
import { NavTab } from '../components/layout/Sidebar';
import { Trash2, Scale, MapPin, Calendar, CheckCircle2, ArrowRight, ArrowLeft, Sparkles, AlertCircle, Loader2, Lock, Edit3, X, Search, Check } from 'lucide-react';

interface AddWasteWizardViewProps {
  onCreatedLot: (lotId: string) => void;
  onCancel: () => void;
}

export const AddWasteWizardView: React.FC<AddWasteWizardViewProps> = ({ onCreatedLot, onCancel }) => {
  const { user } = useAuth();
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [wasteType, setWasteType] = useState<WasteType>('AGRICULTURAL_RESIDUE');
  const [quantityTonnes, setQuantityTonnes] = useState<number>(10.0);
  const [moisturePercent, setMoisturePercent] = useState<number>(18);
  const [organicFractionPercent, setOrganicFractionPercent] = useState<number>(92);
  const [contaminationPercent, setContaminationPercent] = useState<number>(2);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [generatorName, setGeneratorName] = useState<string>(
    user?.organizationName || user?.name || 'Gandhinagar Farmers Co-op'
  );
  const [generatorType, setGeneratorType] = useState<string>(
    user?.organizationType || 'Agricultural Enterprise'
  );

  useEffect(() => {
    if (user?.organizationName) {
      setGeneratorName(user.organizationName);
    }
    if (user?.organizationType) {
      setGeneratorType(user.organizationType);
    }
  }, [user]);

  const [selectedPreset, setSelectedPreset] = useState<string>('Gandhinagar Farm Belt');
  const [pincode, setPincode] = useState<string>('382030');
  const [isLookingUpPincode, setIsLookingUpPincode] = useState<boolean>(false);
  const [pincodeFeedback, setPincodeFeedback] = useState<{ status: 'idle' | 'success' | 'error'; message: string }>({
    status: 'success',
    message: 'Verified PIN 382030: Gandhinagar, Gujarat',
  });
  const [locationName, setLocationName] = useState<string>('Gandhinagar Farm Belt');
  const [address, setAddress] = useState<string>('Sector 30 Agriculture Belt, Gandhinagar, Gujarat');
  const [lat, setLat] = useState<number>(23.2156);
  const [lng, setLng] = useState<number>(72.6369);

  const [availabilityWindow, setAvailabilityWindow] = useState<string>('Pickup Today (Immediate)');
  const [pricePerTon, setPricePerTon] = useState<number>(1200);

  // Helper preset locations in Gujarat with accurate 6-digit PIN codes
  const locationPresets = [
    { name: 'Gandhinagar Farm Belt', pincode: '382030', address: 'Sector 30 Agriculture Belt, Gandhinagar, Gujarat', lat: 23.2156, lng: 72.6369 },
    { name: 'Ahmedabad APMC Market', pincode: '380007', address: 'Vasna Market Road, Vasna, Ahmedabad, Gujarat', lat: 23.0225, lng: 72.5714 },
    { name: 'Sanand Industrial Estate', pincode: '382110', address: 'GIDC Phase 2, Sanand, Gujarat', lat: 22.9897, lng: 72.3810 },
    { name: 'Kheda Livestock Sector', pincode: '387411', address: 'Station Road, Kheda, Gujarat', lat: 22.7533, lng: 72.6868 },
    { name: 'Kalol Agro Zone', pincode: '382721', address: 'Highway 41, Kalol, Gujarat', lat: 23.2323, lng: 72.4975 },
  ];

  const handleSelectType = (type: WasteType) => {
    setWasteType(type);
    const meta = WASTE_TYPE_LABELS[type];
    if (meta) {
      setMoisturePercent(meta.defaultMoisture);
      setPricePerTon(meta.defaultPrice);
    }
  };

  const handleSelectPreset = (preset: typeof locationPresets[0]) => {
    setSelectedPreset(preset.name);
    setPincode(preset.pincode);
    setLocationName(preset.name);
    setAddress(preset.address);
    setLat(preset.lat);
    setLng(preset.lng);
    setPincodeFeedback({
      status: 'success',
      message: `Verified PIN ${preset.pincode}: ${preset.name}`,
    });
    setErrorMessage(null);
  };

  const handleSelectCustom = () => {
    setSelectedPreset('custom');
    setErrorMessage(null);
  };

  const triggerPincodeLookup = async (codeToLookup: string) => {
    const cleaned = codeToLookup.trim().replace(/\D/g, '');
    if (cleaned.length !== 6) {
      setPincodeFeedback({
        status: 'error',
        message: 'Please enter a valid 6-digit numeric PIN code.',
      });
      return;
    }

    setIsLookingUpPincode(true);
    setPincodeFeedback({ status: 'idle', message: 'Locating postal area & coordinates...' });

    try {
      const response = await lookupPincodeApi(cleaned);
      if (response.success && response.data) {
        const { lat, lng, areaName, district, state, formattedAddress } = response.data;
        setLat(lat);
        setLng(lng);
        setLocationName(areaName || `${district} Regional Area`);
        setAddress(formattedAddress || `${areaName}, ${district}, ${state}`);
        setPincodeFeedback({
          status: 'success',
          message: `Detected: ${areaName}, ${district} (${state})`,
        });
        setErrorMessage(null);
      } else {
        setPincodeFeedback({
          status: 'error',
          message: response.message || 'Invalid or unrecognized 6-digit Indian PIN code. Please check.',
        });
      }
    } catch (err: any) {
      console.warn('Pincode lookup error:', err);
      setPincodeFeedback({
        status: 'error',
        message: err.message || 'Error connecting to PIN location service.',
      });
    } finally {
      setIsLookingUpPincode(false);
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const numericOnly = rawVal.replace(/\D/g, '').slice(0, 6);
    setPincode(numericOnly);

    if (selectedPreset !== 'custom') {
      setSelectedPreset('custom');
    }

    if (numericOnly.length === 6) {
      triggerPincodeLookup(numericOnly);
    } else {
      setPincodeFeedback({
        status: 'idle',
        message: numericOnly.length > 0 ? `Enter ${6 - numericOnly.length} more digits...` : '',
      });
    }
  };

  const handleContinue = () => {
    setErrorMessage(null);

    // Validation for Step 1
    if (step === 1 && !wasteType) {
      setErrorMessage('Please select a waste classification category to proceed.');
      return;
    }

    // Validation for Step 2
    if (step === 2) {
      if (!quantityTonnes || quantityTonnes <= 0 || isNaN(quantityTonnes)) {
        setErrorMessage('Please enter a valid quantity greater than 0 Tonnes.');
        return;
      }
      if (moisturePercent > 100 || moisturePercent < 0 || isNaN(moisturePercent)) {
        setErrorMessage('Enter correct percent: Moisture Content must be between 0% and 100%.');
        return;
      }
      if (organicFractionPercent > 100 || organicFractionPercent < 0 || isNaN(organicFractionPercent)) {
        setErrorMessage('Enter correct percent: Organic Fraction must be between 0% and 100%.');
        return;
      }
      if (contaminationPercent > 100 || contaminationPercent < 0 || isNaN(contaminationPercent)) {
        setErrorMessage('Enter correct percent: Contamination must be between 0% and 100%.');
        return;
      }
    }

    // Validation for Step 3 (PIN Code & Resolved Location)
    if (step === 3) {
      const cleanPin = pincode.trim().replace(/\D/g, '');
      if (cleanPin.length !== 6) {
        setErrorMessage('Please enter a valid 6-digit numeric PIN code (e.g. 382030).');
        return;
      }
      if (!locationName.trim()) {
        setErrorMessage('Please provide a pickup location name or area.');
        return;
      }
      if (isNaN(lat) || isNaN(lng) || (lat === 0 && lng === 0)) {
        setErrorMessage('Coordinates could not be resolved from this PIN code. Please enter a valid PIN code.');
        return;
      }
    }

    // Validation for Step 4
    if (step === 4) {
      if (!generatorName.trim()) {
        setErrorMessage('Please enter your generator organization name.');
        return;
      }
      if (pricePerTon < 0 || isNaN(pricePerTon)) {
        setErrorMessage('Base price per ton cannot be negative.');
        return;
      }
    }

    setStep(step + 1);
  };

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (quantityTonnes <= 0) {
      setErrorMessage('Please enter a valid quantity greater than 0 Tonnes.');
      return;
    }
    if (moisturePercent > 100 || moisturePercent < 0 || organicFractionPercent > 100 || organicFractionPercent < 0 || contaminationPercent > 100 || contaminationPercent < 0) {
      setErrorMessage('Enter correct percent: All percentage values must be between 0% and 100%.');
      return;
    }

    setIsSubmitting(true);
    try {
      const location: LocationPoint = {
        name: locationName,
        address,
        lat,
        lng,
      };

      const fingerprint: WasteFingerprint = {
        wasteType,
        quantityTonnes: Number(quantityTonnes),
        moisturePercent: Math.min(100, Math.max(0, Number(moisturePercent))),
        organicFractionPercent: Math.min(100, Math.max(0, Number(organicFractionPercent))),
        contaminationPercent: Math.min(100, Math.max(0, Number(contaminationPercent))),
        location,
        availabilityWindow,
        pricePerTon: Math.max(0, Number(pricePerTon)),
      };

      const newLot = await createWasteLotApi(generatorName, generatorType, fingerprint);
      onCreatedLot(newLot.id);
    } catch (err) {
      console.error('Failed to create waste lot:', err);
      setErrorMessage('Failed to create waste lot. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Escape key to cancel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-carbon-primary">Register New Waste Batch</h1>
          <p className="text-xs text-carbon-secondary">Progressive waste fingerprint creation & decision engine intake.</p>
        </div>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-btn border border-border bg-surface hover:bg-surface-muted text-xs font-semibold text-carbon-secondary hover:text-carbon-primary shadow-xs transition cursor-pointer"
          title="Cancel and return"
        >
          <span>Cancel</span>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Stepper Bar */}
      <div className="flex items-center justify-between bg-surface border border-border rounded-btn p-3 text-xs">
        {[
          { stepNum: 1, label: 'Waste Type' },
          { stepNum: 2, label: 'Quantity & Properties' },
          { stepNum: 3, label: 'Location & GIS' },
          { stepNum: 4, label: 'Generator & Pricing' },
          { stepNum: 5, label: 'Review & Analyze' },
        ].map((item) => (
          <div key={item.stepNum} className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
              step === item.stepNum
                ? 'bg-brand-primary text-white'
                : step > item.stepNum
                ? 'bg-brand-soft text-brand-dark'
                : 'bg-surface-muted text-carbon-muted'
            }`}>
              {step > item.stepNum ? '✓' : item.stepNum}
            </div>
            <span className={`hidden sm:inline font-medium ${step === item.stepNum ? 'text-carbon-primary font-semibold' : 'text-carbon-secondary'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Step Container */}
      <div className="bg-surface border border-border rounded-card p-6 shadow-subtle space-y-6">
        
        {/* STEP 1: Waste Type */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-bold text-sm text-carbon-primary">Step 1: Select Waste Classification</h2>
            <p className="text-xs text-carbon-secondary">Choose the primary category of waste being listed into the CarbonCycle network.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {(Object.keys(WASTE_TYPE_LABELS) as WasteType[]).map((key) => {
                const info = WASTE_TYPE_LABELS[key];
                const isSelected = wasteType === key;

                return (
                  <div
                    key={key}
                    onClick={() => handleSelectType(key)}
                    className={`p-4 rounded-btn border cursor-pointer transition ${
                      isSelected
                        ? 'border-brand-primary bg-brand-soft/50 ring-1 ring-brand-primary'
                        : 'border-border bg-surface hover:border-carbon-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-xs text-carbon-primary">{info.label}</h3>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-primary" />}
                    </div>
                    <p className="text-[11px] text-carbon-secondary mt-1">{info.description}</p>
                    <div className="mt-2 text-[10px] text-carbon-muted font-mono">
                      Default Moisture: {info.defaultMoisture}% · Price: ₹{info.defaultPrice}/t
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Quantity & Properties */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-bold text-sm text-carbon-primary">Step 2: Quantity & Physical Fingerprint</h2>
            <p className="text-xs text-carbon-secondary">Moisture and organic fraction determine conversion suitability (e.g. Biochar vs Biogas).</p>

            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-carbon-primary mb-1">
                  Quantity (Tonnes)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0.1"
                    step="0.5"
                    value={quantityTonnes || ''}
                    onChange={(e) => {
                      setQuantityTonnes(parseFloat(e.target.value) || 0);
                      setErrorMessage(null);
                    }}
                    className={`w-full bg-surface-muted/60 border ${
                      quantityTonnes <= 0 || isNaN(quantityTonnes)
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-border focus:border-brand-primary'
                    } rounded-control px-3 py-2 text-xs font-bold text-carbon-primary focus:outline-none`}
                  />
                  <span className="text-xs font-bold text-carbon-secondary bg-surface-muted px-3 py-2 rounded-control border border-border">
                    Tonnes
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-carbon-primary mb-1">
                    Moisture Content (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={isNaN(moisturePercent) ? '' : moisturePercent}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setMoisturePercent(isNaN(val) ? 0 : val);
                      if (val > 100 || val < 0) {
                        setErrorMessage('Enter correct percent: Value must be 100% or less.');
                      } else {
                        setErrorMessage(null);
                      }
                    }}
                    className={`w-full bg-surface-muted/60 border ${
                      moisturePercent > 100 || moisturePercent < 0 || isNaN(moisturePercent)
                        ? 'border-red-500 bg-red-50/20 focus:border-red-500'
                        : 'border-border focus:border-brand-primary'
                    } rounded-control px-3 py-2 text-xs text-carbon-primary focus:outline-none`}
                  />
                  {(moisturePercent > 100 || moisturePercent < 0) ? (
                    <span className="text-[10px] text-red-600 font-bold mt-0.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Enter correct percent (0–100%)
                    </span>
                  ) : (
                    <span className="text-[10px] text-carbon-muted mt-0.5 block">
                      {moisturePercent < 30 ? 'Low moisture (Ideal Biochar)' : 'High moisture (Ideal Biogas)'}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-carbon-primary mb-1">
                    Organic Fraction (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={isNaN(organicFractionPercent) ? '' : organicFractionPercent}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setOrganicFractionPercent(isNaN(val) ? 0 : val);
                      if (val > 100 || val < 0) {
                        setErrorMessage('Enter correct percent: Value must be 100% or less.');
                      } else {
                        setErrorMessage(null);
                      }
                    }}
                    className={`w-full bg-surface-muted/60 border ${
                      organicFractionPercent > 100 || organicFractionPercent < 0 || isNaN(organicFractionPercent)
                        ? 'border-red-500 bg-red-50/20 focus:border-red-500'
                        : 'border-border focus:border-brand-primary'
                    } rounded-control px-3 py-2 text-xs text-carbon-primary focus:outline-none`}
                  />
                  {(organicFractionPercent > 100 || organicFractionPercent < 0) && (
                    <span className="text-[10px] text-red-600 font-bold mt-0.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Enter correct percent (0–100%)
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-carbon-primary mb-1">
                    Contamination (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={isNaN(contaminationPercent) ? '' : contaminationPercent}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setContaminationPercent(isNaN(val) ? 0 : val);
                      if (val > 100 || val < 0) {
                        setErrorMessage('Enter correct percent: Value must be 100% or less.');
                      } else {
                        setErrorMessage(null);
                      }
                    }}
                    className={`w-full bg-surface-muted/60 border ${
                      contaminationPercent > 100 || contaminationPercent < 0 || isNaN(contaminationPercent)
                        ? 'border-red-500 bg-red-50/20 focus:border-red-500'
                        : 'border-border focus:border-brand-primary'
                    } rounded-control px-3 py-2 text-xs text-carbon-primary focus:outline-none`}
                  />
                  {(contaminationPercent > 100 || contaminationPercent < 0) && (
                    <span className="text-[10px] text-red-600 font-bold mt-0.5 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Enter correct percent (0–100%)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Location & GIS */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-bold text-sm text-carbon-primary">Step 3: Waste Location & Area PIN Code</h2>
            <p className="text-xs text-carbon-secondary">Select a regional Gujarat location preset or enter a 6-digit Indian PIN code to automatically detect the area, district, and regional routing coordinates.</p>

            {/* Presets */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-carbon-primary">
                  Quick Regional Location Presets
                </label>
                {selectedPreset !== 'custom' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-dark bg-brand-soft px-2 py-0.5 rounded border border-brand-primary/20">
                    <Lock className="w-3 h-3 text-brand-primary" /> Preset Locked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                    <Edit3 className="w-3 h-3 text-amber-600" /> Custom PIN Mode
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {locationPresets.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2.5 rounded-btn border text-left text-xs transition ${
                      selectedPreset === preset.name
                        ? 'border-brand-primary bg-brand-soft text-brand-dark font-semibold ring-1 ring-brand-primary'
                        : 'border-border bg-surface hover:bg-surface-muted text-carbon-primary'
                    }`}
                  >
                    <div className="font-bold flex items-center justify-between">
                      <span>{preset.name}</span>
                      <span className="text-[10px] font-mono bg-surface-muted px-1.5 py-0.5 rounded text-carbon-secondary border border-border">
                        PIN {preset.pincode}
                      </span>
                    </div>
                    <div className="text-[10px] opacity-80 truncate">{preset.address}</div>
                  </button>
                ))}

                {/* Custom / Manual PIN Code Option */}
                <button
                  type="button"
                  onClick={handleSelectCustom}
                  className={`p-2.5 rounded-btn border text-left text-xs transition flex items-start gap-2 ${
                    selectedPreset === 'custom'
                      ? 'border-brand-primary bg-brand-soft text-brand-dark font-semibold ring-1 ring-brand-primary'
                      : 'border-dashed border-border bg-surface hover:bg-surface-muted text-carbon-primary'
                  }`}
                >
                  <div className="w-7 h-7 rounded-btn bg-brand-primary/10 text-brand-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Edit3 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold flex items-center gap-1.5">
                      <span>Custom PIN Code</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-extrabold">Auto-Detect</span>
                    </div>
                    <div className="text-[10px] opacity-80">Enter any 6-digit PIN to auto-fetch area location</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Helper Notice / Mode Indicator */}
            {selectedPreset !== 'custom' ? (
              <div className="flex items-center justify-between p-2.5 bg-surface-muted/70 border border-border rounded-btn text-xs text-carbon-secondary">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-carbon-muted flex-shrink-0" />
                  <span>Preset selected: Details below are mapped to PIN <strong>{pincode}</strong> with verified regional coordinates.</span>
                </div>
                <button
                  type="button"
                  onClick={handleSelectCustom}
                  className="text-[11px] font-bold text-brand-primary hover:text-brand-dark underline whitespace-nowrap ml-2"
                >
                  Enter Other PIN
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2.5 bg-brand-soft/40 border border-brand-primary/30 rounded-btn text-xs text-brand-dark">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-brand-primary flex-shrink-0" />
                  <span>Custom PIN Mode: Type any 6-digit Indian PIN code below. The system automatically queries the location API.</span>
                </div>
              </div>
            )}

            {/* Location & PIN Inputs (Latitude & Longitude completely removed) */}
            <div className="space-y-3.5 border-t border-border pt-3">
              {/* 6-Digit PIN Code Input with Live API Lookup */}
              <div>
                <label className="block text-xs font-semibold text-carbon-primary mb-1">
                  Postal PIN Code (6-Digit Numeric Code) <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={pincode}
                      onChange={handlePincodeChange}
                      placeholder="e.g. 382030, 380007, 395001"
                      className="w-full border border-border rounded-control px-3 py-2 text-xs font-mono font-bold tracking-widest text-carbon-primary focus:outline-none focus:border-brand-primary shadow-xs bg-surface"
                    />
                    {isLookingUpPincode && (
                      <div className="absolute right-3 top-2.5 flex items-center gap-1.5 text-carbon-muted text-xs">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-primary" />
                        <span className="text-[10px]">Querying API...</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => triggerPincodeLookup(pincode)}
                    disabled={isLookingUpPincode || pincode.length !== 6}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-carbon-surface hover:bg-brand-primary hover:text-white border border-border rounded-control text-xs font-bold text-carbon-primary disabled:opacity-50 disabled:cursor-not-allowed transition shadow-xs"
                  >
                    {isLookingUpPincode ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                    <span>Detect Area</span>
                  </button>
                </div>

                {/* Status / Feedback Pill */}
                {pincodeFeedback.message && (
                  <div className={`mt-1.5 flex items-center gap-1.5 text-[11px] font-medium ${
                    pincodeFeedback.status === 'success'
                      ? 'text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded'
                      : pincodeFeedback.status === 'error'
                      ? 'text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded'
                      : 'text-carbon-secondary px-1'
                  }`}>
                    {pincodeFeedback.status === 'success' && <Check className="w-3 h-3 text-emerald-600 flex-shrink-0" />}
                    {pincodeFeedback.status === 'error' && <AlertCircle className="w-3 h-3 text-rose-600 flex-shrink-0" />}
                    {pincodeFeedback.status === 'idle' && isLookingUpPincode && <Loader2 className="w-3 h-3 animate-spin text-brand-primary flex-shrink-0" />}
                    <span>{pincodeFeedback.message}</span>
                  </div>
                )}
              </div>

              {/* Location Name (Auto-populated from PIN code API) */}
              <div>
                <label className="block text-xs font-semibold text-carbon-primary mb-1">
                  Pickup Location / Area Name
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Sector 30 Farming Hub or APMC Market Yard"
                  className="w-full border border-border rounded-control px-3 py-2 text-xs bg-surface text-carbon-primary focus:outline-none focus:border-brand-primary shadow-xs"
                />
                <p className="text-[10px] text-carbon-muted mt-0.5">
                  Automatically populated from PIN code postal database. You can customize the name if desired.
                </p>
              </div>

              {/* Detailed Street / Facility Address (Auto-populated from PIN code API) */}
              <div>
                <label className="block text-xs font-semibold text-carbon-primary mb-1">
                  Full Street Address & Landmark
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Plot 14, GIDC Industrial Phase 2, Near APMC Gate"
                  className="w-full border border-border rounded-control px-3 py-2 text-xs focus:outline-none resize-none bg-surface text-carbon-primary focus:border-brand-primary shadow-xs"
                />
                <p className="text-[10px] text-carbon-muted mt-0.5">
                  Postal area automatically retrieved. Add specific farm gate, shed, or plot number for driver pickup.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Generator & Pricing */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="font-bold text-sm text-carbon-primary">Step 4: Generator Profile & Availability</h2>
            <p className="text-xs text-carbon-secondary">Define source entity details and logistics pickup window.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-carbon-primary mb-1">
                  Generator Organization Name
                </label>
                <input
                  type="text"
                  value={generatorName}
                  onChange={(e) => setGeneratorName(e.target.value)}
                  className="w-full bg-surface-muted/60 border border-border rounded-control px-3 py-2 text-xs text-carbon-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-carbon-primary mb-1">
                  Generator Entity Type
                </label>
                <select
                  value={generatorType}
                  onChange={(e) => setGeneratorType(e.target.value)}
                  className="w-full bg-surface-muted/60 border border-border rounded-control px-3 py-2 text-xs text-carbon-primary"
                >
                  <option value="Agricultural Enterprise">Agricultural Enterprise / Farm</option>
                  <option value="Food Processing Industry">Food Processing Industry</option>
                  <option value="Commercial Produce Market">Commercial Produce Market</option>
                  <option value="Livestock Cooperative">Livestock Cooperative</option>
                  <option value="Municipal Waste Source">Municipal Waste Source</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-carbon-primary mb-1">
                  Availability Window
                </label>
                <select
                  value={availabilityWindow}
                  onChange={(e) => setAvailabilityWindow(e.target.value)}
                  className="w-full bg-surface-muted/60 border border-border rounded-control px-3 py-2 text-xs text-carbon-primary focus:outline-none focus:border-brand-primary"
                >
                  <option value="Pickup Today (Immediate)">Pickup Today (Immediate)</option>
                  <option value="Pickup in 2 Days">Pickup in 2 Days</option>
                  <option value="Pickup Next Week">Pickup Next Week (Within 7 Days)</option>
                  <option value="Flexible (Within 14 Days)">Flexible (Within 14 Days)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-carbon-primary mb-1">
                  Base Price per Ton (₹/ton)
                </label>
                <input
                  type="number"
                  min="0"
                  value={pricePerTon}
                  onChange={(e) => setPricePerTon(parseInt(e.target.value) || 0)}
                  className="w-full bg-surface-muted/60 border border-border rounded-control px-3 py-2 text-xs text-carbon-primary font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Review & Submit */}
        {step === 5 && (
          <div className="space-y-4">
            <h2 className="font-bold text-sm text-carbon-primary">Step 5: Review Waste Fingerprint Summary</h2>
            <p className="text-xs text-carbon-secondary">Confirm batch parameters before initiating pathway recommendation engine.</p>

            <div className="p-4 bg-surface-muted/50 rounded-card border border-border space-y-3 text-xs">
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-carbon-muted">Waste Classification:</span>
                <span className="font-bold text-carbon-primary">{WASTE_TYPE_LABELS[wasteType]?.label}</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-carbon-muted">Quantity:</span>
                <span className="font-bold text-brand-primary">{quantityTonnes} Tonnes</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-carbon-muted">Physical Attributes:</span>
                <span className="font-semibold text-carbon-primary">Moisture: {moisturePercent}% · Organic: {organicFractionPercent}%</span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-carbon-muted">Origin Location:</span>
                <span className="font-semibold text-carbon-primary">{locationName} <span className="text-carbon-secondary font-mono text-[11px]">(PIN: {pincode})</span></span>
              </div>
              <div className="flex justify-between border-b border-border pb-2">
                <span className="text-carbon-muted">Availability Window:</span>
                <span className="font-semibold text-brand-primary">{availabilityWindow}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-carbon-muted">Generator Entity:</span>
                <span className="font-semibold text-carbon-primary">{generatorName} ({generatorType})</span>
              </div>
            </div>

            <div className="p-3 bg-brand-soft border border-brand-primary/30 rounded-btn text-xs text-brand-dark flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-primary flex-shrink-0" />
              <span>Clicking "Analyze & Find Matches" will run the rule-based decision engine to evaluate Biochar, Biogas, and Composting conversion suitability.</span>
            </div>
          </div>
        )}

        {/* Error Alert Message */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-btn text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Navigation Action Buttons */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          {step > 1 ? (
            <button
              onClick={() => {
                setErrorMessage(null);
                setStep(step - 1);
              }}
              className="flex items-center gap-1 text-xs font-semibold text-carbon-secondary hover:text-carbon-primary px-3 py-2 rounded-btn border border-border"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div></div>
          )}

          {step < 5 ? (
            <button
              onClick={handleContinue}
              className="flex items-center gap-1.5 bg-brand-primary hover:bg-brand-dark text-white text-xs font-bold px-5 py-2.5 rounded-btn shadow-sm transition"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-brand-primary hover:bg-brand-dark disabled:opacity-50 text-white text-xs font-bold px-6 py-2.5 rounded-btn shadow-md transition"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze & Find Matches</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
