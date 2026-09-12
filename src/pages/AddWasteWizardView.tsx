import React, { useState, useEffect } from 'react';
import { WASTE_TYPE_LABELS } from '../data/constants';
import { LocationPoint, WasteFingerprint, WasteType } from '../types';
import { createWasteLotApi } from '../services/store';
import { useAuth } from '../context/AuthContext';
import { NavTab } from '../components/layout/Sidebar';
import { Trash2, Scale, MapPin, Calendar, CheckCircle2, ArrowRight, ArrowLeft, Sparkles, AlertCircle, Loader2, Lock, Edit3 } from 'lucide-react';

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
  const [locationName, setLocationName] = useState<string>('Gandhinagar Farm Belt');
  const [address, setAddress] = useState<string>('Sector 30 Agriculture Belt, Gandhinagar, Gujarat');
  const [lat, setLat] = useState<number>(23.2156);
  const [lng, setLng] = useState<number>(72.6369);

  const [availabilityWindow, setAvailabilityWindow] = useState<string>('Pickup Today (Immediate)');
  const [pricePerTon, setPricePerTon] = useState<number>(1200);

  // Helper preset locations in Gujarat
  const locationPresets = [
    { name: 'Gandhinagar Farm Belt', address: 'Sector 30 Agriculture Belt, Gandhinagar, Gujarat', lat: 23.2156, lng: 72.6369 },
    { name: 'Ahmedabad APMC Market', address: 'Vasna Market Road, Vasna, Ahmedabad, Gujarat', lat: 23.0225, lng: 72.5714 },
    { name: 'Sanand Industrial Estate', address: 'GIDC Phase 2, Sanand, Gujarat', lat: 22.9897, lng: 72.3810 },
    { name: 'Kheda Livestock Sector', address: 'Station Road, Kheda, Gujarat', lat: 22.7533, lng: 72.6868 },
    { name: 'Kalol Agro Zone', address: 'Highway 41, Kalol, Gujarat', lat: 23.2323, lng: 72.4975 },
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
    setLocationName(preset.name);
    setAddress(preset.address);
    setLat(preset.lat);
    setLng(preset.lng);
    setErrorMessage(null);
  };

  const handleSelectCustom = () => {
    setSelectedPreset('custom');
    setErrorMessage(null);
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

    // Validation for Step 3
    if (step === 3) {
      if (!locationName.trim()) {
        setErrorMessage('Please provide a pickup location name or select a preset.');
        return;
      }
      if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lng) || lng < -180 || lng > 180) {
        setErrorMessage('Please enter valid geographic coordinates.');
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
          className="text-xs text-carbon-secondary hover:text-carbon-primary font-semibold"
        >
          Cancel
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
            <h2 className="font-bold text-sm text-carbon-primary">Step 3: Waste Location & Pickup Coordinates</h2>
            <p className="text-xs text-carbon-secondary">Select a regional Gujarat location preset or choose Custom Location to enter your own coordinates.</p>

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
                    <Edit3 className="w-3 h-3 text-amber-600" /> Custom Editing Enabled
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
                      {selectedPreset === preset.name && <Lock className="w-3 h-3 text-brand-primary" />}
                    </div>
                    <div className="text-[10px] opacity-80 truncate">{preset.address}</div>
                  </button>
                ))}

                {/* Custom / Manual Location Option */}
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
                      <span>Custom / Manual Location</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-extrabold">Editable</span>
                    </div>
                    <div className="text-[10px] opacity-80">Click here to manually type custom address & GPS</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Helper Notice / Mode Indicator */}
            {selectedPreset !== 'custom' ? (
              <div className="flex items-center justify-between p-2.5 bg-surface-muted/70 border border-border rounded-btn text-xs text-carbon-secondary">
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-carbon-muted flex-shrink-0" />
                  <span>Preset selected: Details below are locked to ensure official regional coordinates.</span>
                </div>
                <button
                  type="button"
                  onClick={handleSelectCustom}
                  className="text-[11px] font-bold text-brand-primary hover:text-brand-dark underline whitespace-nowrap ml-2"
                >
                  Edit Manually
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2.5 bg-brand-soft/40 border border-brand-primary/30 rounded-btn text-xs text-brand-dark">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-3.5 h-3.5 text-brand-primary flex-shrink-0" />
                  <span>Custom mode active: You can freely edit the location name, address, latitude, and longitude below.</span>
                </div>
              </div>
            )}

            {/* Location Inputs */}
            <div className="space-y-3 border-t border-border pt-3">
              <div>
                <label className="block text-xs font-semibold text-carbon-primary mb-1">
                  Location Name {selectedPreset !== 'custom' && <span className="text-[10px] font-normal text-carbon-muted">(Locked)</span>}
                </label>
                <input
                  type="text"
                  readOnly={selectedPreset !== 'custom'}
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className={`w-full border rounded-control px-3 py-2 text-xs focus:outline-none transition ${
                    selectedPreset !== 'custom'
                      ? 'bg-surface-muted/80 text-carbon-secondary cursor-not-allowed border-border/80'
                      : 'bg-surface border-border text-carbon-primary focus:border-brand-primary shadow-xs'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-carbon-primary mb-1">
                  Street Address {selectedPreset !== 'custom' && <span className="text-[10px] font-normal text-carbon-muted">(Locked)</span>}
                </label>
                <textarea
                  rows={2}
                  readOnly={selectedPreset !== 'custom'}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`w-full border rounded-control px-3 py-2 text-xs focus:outline-none resize-none transition ${
                    selectedPreset !== 'custom'
                      ? 'bg-surface-muted/80 text-carbon-secondary cursor-not-allowed border-border/80'
                      : 'bg-surface border-border text-carbon-primary focus:border-brand-primary shadow-xs'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-carbon-secondary mb-1">
                    Latitude {selectedPreset !== 'custom' && <span className="text-[10px] text-carbon-muted">(Locked)</span>}
                  </label>
                  <input
                    type="number"
                    step="any"
                    readOnly={selectedPreset !== 'custom'}
                    value={lat}
                    onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                    className={`w-full border rounded-control px-3 py-1.5 text-xs focus:outline-none transition ${
                      selectedPreset !== 'custom'
                        ? 'bg-surface-muted/80 text-carbon-secondary cursor-not-allowed border-border/80'
                        : 'bg-surface border-border text-carbon-primary focus:border-brand-primary shadow-xs'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-carbon-secondary mb-1">
                    Longitude {selectedPreset !== 'custom' && <span className="text-[10px] text-carbon-muted">(Locked)</span>}
                  </label>
                  <input
                    type="number"
                    step="any"
                    readOnly={selectedPreset !== 'custom'}
                    value={lng}
                    onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                    className={`w-full border rounded-control px-3 py-1.5 text-xs focus:outline-none transition ${
                      selectedPreset !== 'custom'
                        ? 'bg-surface-muted/80 text-carbon-secondary cursor-not-allowed border-border/80'
                        : 'bg-surface border-border text-carbon-primary focus:border-brand-primary shadow-xs'
                    }`}
                  />
                </div>
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
                <span className="font-semibold text-carbon-primary">{locationName}</span>
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
