import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Building2, Factory, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setAuthModalOpen, login, register } = useAuth();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [organizationType, setOrganizationType] = useState('Agricultural Enterprise');
  const [location, setLocation] = useState('Gandhinagar, Gujarat');
  const [role, setRole] = useState<'generator' | 'facility_operator'>('generator');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Lock background body scroll when auth modal is open
  React.useEffect(() => {
    if (!isAuthModalOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isAuthModalOpen]);

  // Close on Escape key press
  React.useEffect(() => {
    if (!isAuthModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAuthModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, setAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === 'LOGIN') {
        const res = await login(email, password);
        if (!res.success) {
          setError(res.message || 'Invalid email or password.');
        }
      } else {
        const res = await register({
          name,
          email,
          password,
          organizationName,
          organizationType,
          location,
          role,
        });
        if (!res.success) {
          setError(res.message || 'Registration failed.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    const lower = val.toLowerCase();
    if (
      lower.includes('facility') ||
      lower.includes('operator') ||
      lower.includes('biochar') ||
      lower.includes('biogas') ||
      lower.includes('factory') ||
      lower.includes('plant') ||
      lower.includes('processing') ||
      lower.includes('hub') ||
      lower.includes('refinery')
    ) {
      setRole('facility_operator');
      setOrganizationType('Conversion Facility Operator');
    } else if (lower.includes('generator') || lower.includes('farm') || lower.includes('coop')) {
      setRole('generator');
      setOrganizationType('Agricultural Enterprise');
    }
  };

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) setAuthModalOpen(false); }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      {/* Modal Card with max height & scroll */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-surface rounded-container border border-border shadow-modal overflow-hidden max-h-[90vh] flex flex-col my-auto animate-in zoom-in-95 duration-150"
      >
        
        {/* Fixed Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-surface-muted/40 flex-shrink-0">
          <div>
            <h2 className="font-extrabold text-base text-carbon-primary">
              {mode === 'LOGIN' ? 'Sign In to CarbonCycle' : 'Create Network Account'}
            </h2>
            <p className="text-xs text-carbon-secondary">
              {mode === 'LOGIN' ? 'Access your authenticated dashboard.' : 'Join Gujarat waste-to-carbon circular network.'}
            </p>
          </div>
          <button
            onClick={() => setAuthModalOpen(false)}
            className="p-1.5 rounded-btn text-carbon-muted hover:text-carbon-primary hover:bg-surface-muted transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle Bar */}
        <div className="flex border-b border-border bg-surface-muted/60 text-xs font-semibold flex-shrink-0">
          <button
            type="button"
            onClick={() => { setMode('LOGIN'); setError(null); }}
            className={`flex-1 py-2.5 text-center transition ${
              mode === 'LOGIN' ? 'bg-surface text-brand-primary border-b-2 border-brand-primary font-bold' : 'text-carbon-secondary hover:text-carbon-primary'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('REGISTER'); setError(null); }}
            className={`flex-1 py-2.5 text-center transition ${
              mode === 'REGISTER' ? 'bg-surface text-brand-primary border-b-2 border-brand-primary font-bold' : 'text-carbon-secondary hover:text-carbon-primary'
            }`}
          >
            Register Account
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-btn text-red-700 flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'REGISTER' && (
            <>
              {/* Highlighted Role Selector */}
              <div className="space-y-1">
                <label className="block font-bold text-carbon-primary text-xs">
                  Select Your Network Role <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  
                  {/* Waste Generator Button */}
                  <button
                    type="button"
                    onClick={() => { setRole('generator'); setOrganizationType('Agricultural Enterprise'); }}
                    className={`p-3 rounded-btn border text-left text-xs transition relative ${
                      role === 'generator'
                        ? 'border-brand-primary bg-brand-soft text-brand-dark font-bold ring-2 ring-brand-primary/40 shadow-sm'
                        : 'border-border bg-surface hover:bg-surface-muted text-carbon-secondary'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Trash2 className={`w-4 h-4 ${role === 'generator' ? 'text-brand-primary' : 'text-carbon-muted'}`} />
                        <span>Waste Generator</span>
                      </div>
                      {role === 'generator' && <CheckCircle2 className="w-4 h-4 text-brand-primary flex-shrink-0" />}
                    </div>
                    <span className="text-[10px] opacity-80 block mt-1 leading-tight">Farm, Food Business, Market</span>
                  </button>

                  {/* Facility Operator Button */}
                  <button
                    type="button"
                    onClick={() => { setRole('facility_operator'); setOrganizationType('Conversion Facility Operator'); }}
                    className={`p-3 rounded-btn border text-left text-xs transition relative ${
                      role === 'facility_operator'
                        ? 'border-brand-primary bg-brand-soft text-brand-dark font-bold ring-2 ring-brand-primary/40 shadow-sm'
                        : 'border-border bg-surface hover:bg-surface-muted text-carbon-secondary'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Factory className={`w-4 h-4 ${role === 'facility_operator' ? 'text-brand-primary' : 'text-carbon-muted'}`} />
                        <span>Facility Operator</span>
                      </div>
                      {role === 'facility_operator' && <CheckCircle2 className="w-4 h-4 text-brand-primary flex-shrink-0" />}
                    </div>
                    <span className="text-[10px] opacity-80 block mt-1 leading-tight">Biochar, Biogas, Compost Hub</span>
                  </button>

                </div>
              </div>

              <div>
                <label className="block font-semibold text-carbon-primary mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-carbon-muted absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vaibhav Patel"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-surface-muted/60 border border-border rounded-control pl-9 pr-3 py-2 text-xs text-carbon-primary focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block font-semibold text-carbon-primary mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-carbon-muted absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="email"
                required
                placeholder="name@organization.com"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className="w-full bg-surface-muted/60 border border-border rounded-control pl-9 pr-3 py-2 text-xs text-carbon-primary focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-carbon-primary mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-carbon-muted absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-muted/60 border border-border rounded-control pl-9 pr-3 py-2 text-xs text-carbon-primary focus:outline-none focus:border-brand-primary"
              />
            </div>
          </div>

          {mode === 'REGISTER' && (
            <>
              <div>
                <label className="block font-semibold text-carbon-primary mb-1">Organization Name</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-carbon-muted absolute left-3 top-2.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gujarat EcoChar Hub"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className="w-full bg-surface-muted/60 border border-border rounded-control pl-9 pr-3 py-2 text-xs text-carbon-primary focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-carbon-primary mb-1">Entity Type</label>
                  <input
                    type="text"
                    value={organizationType}
                    onChange={(e) => setOrganizationType(e.target.value)}
                    className="w-full bg-surface-muted/60 border border-border rounded-control px-2.5 py-2 text-xs text-carbon-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-carbon-primary mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-surface-muted/60 border border-border rounded-control px-2.5 py-2 text-xs text-carbon-primary"
                  />
                </div>
              </div>
            </>
          )}



          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-primary hover:bg-brand-dark text-white font-bold text-xs py-2.5 rounded-btn shadow-sm transition transform active:scale-98 disabled:opacity-50"
          >
            {submitting ? 'Authenticating...' : mode === 'LOGIN' ? 'Sign In →' : 'Complete Registration →'}
          </button>
        </form>

      </div>
    </div>
  );
};
