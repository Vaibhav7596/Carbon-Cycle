import React, { useState, useRef, useEffect } from 'react';
import { Leaf, ArrowRight, Factory, Truck, BarChart3, ShieldCheck, CheckCircle2, ChevronRight, Zap, ChevronDown, LogOut, Plus } from 'lucide-react';
import { NavTab } from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onEnterPlatform: (tab: NavTab) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterPlatform }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dialogue when clicking outside or pressing Escape
  useEffect(() => {
    if (!isProfileMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsProfileMenuOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProfileMenuOpen]);

  return (
    <div className="min-h-screen bg-canvas text-carbon-primary font-sans">
      
      {/* Top Navbar */}
      <nav className="h-16 border-b border-border bg-surface/90 backdrop-blur-md sticky top-0 z-50 px-6 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-btn bg-brand-primary flex items-center justify-center text-white shadow-sm">
            <Leaf className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-extrabold text-sm sm:text-base tracking-wider uppercase text-carbon-primary">
              CarbonCycle
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <div className="relative" ref={profileMenuRef}>
              {/* Profile Pill Button: toggles dialogue box on click without redirecting */}
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                className={`flex items-center gap-2.5 py-1.5 pl-1.5 pr-3 rounded-full border transition-all duration-200 cursor-pointer shadow-subtle active:scale-[0.98] ${
                  isProfileMenuOpen
                    ? 'border-brand-primary/70 bg-surface-muted ring-2 ring-brand-primary/15'
                    : 'border-border bg-surface hover:bg-surface-muted hover:border-carbon-muted/50'
                }`}
                aria-haspopup="true"
                aria-expanded={isProfileMenuOpen}
                title={`${user.name} (${user.organizationName})`}
              >
                <div className="w-8 h-8 aspect-square rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs bg-zinc-200 border border-zinc-300 text-zinc-800 shadow-xs">
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block pr-0.5">
                  <p className="text-xs font-bold text-carbon-primary leading-tight truncate max-w-[130px]">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-carbon-secondary leading-tight truncate max-w-[130px]">
                    {user.organizationName}
                  </p>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-carbon-muted transition-transform duration-200 ${
                    isProfileMenuOpen ? 'rotate-180 text-brand-primary' : ''
                  }`}
                />
              </button>

              {/* Profile Dialogue Box */}
              {isProfileMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-2.5 w-72 bg-surface border border-border rounded-2xl shadow-modal p-4 space-y-3.5 animate-in fade-in-50 zoom-in-95 duration-150 z-[100]"
                  role="dialog"
                  aria-label="User Profile Menu"
                >
                  {/* User Profile Header Card */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-muted/60 border border-border/70">
                    <div className="w-10 h-10 aspect-square rounded-full flex-shrink-0 flex items-center justify-center font-extrabold text-xs bg-zinc-200 border border-zinc-300 text-zinc-800 shadow-xs">
                      {user.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-xs text-carbon-primary truncate leading-tight">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-carbon-secondary truncate font-medium mt-0.5">
                        {user.organizationName}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-brand-soft text-brand-dark border border-brand-primary/20">
                          <ShieldCheck className="w-2.5 h-2.5 text-brand-primary" />
                          {user.role}
                        </span>
                        {user.organizationType && (
                          <span className="text-[9px] text-carbon-muted truncate">
                            · {user.organizationType}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Navigation Links */}
                  <div className="space-y-1.5 pt-0.5">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onEnterPlatform('DASHBOARD');
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-brand-soft text-brand-dark hover:bg-brand-primary hover:text-white font-bold text-xs transition group cursor-pointer shadow-xs"
                    >
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4" />
                        <span>Go to Dashboard</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onEnterPlatform('ADD_WASTE');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-carbon-secondary hover:text-carbon-primary hover:bg-surface-muted transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-brand-primary" />
                      <span>Register Waste Batch</span>
                    </button>
                  </div>

                  {/* Footer Sign Out */}
                  <div className="border-t border-border/80 pt-2">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl border border-red-200/80 font-semibold transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onEnterPlatform('ADD_WASTE')}
              className="flex items-center gap-2 bg-brand-primary hover:bg-brand-dark text-white text-xs font-bold px-4 py-2 rounded-btn shadow-md hover:shadow-lg transition transform active:scale-95 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 text-center space-y-8">
        <div className="inline-flex items-center gap-2 bg-brand-soft text-brand-dark px-3.5 py-1.5 rounded-full text-xs font-semibold border border-brand-primary/20">
          <Zap className="w-3.5 h-3.5 text-brand-primary" />
          <span>Waste-to-Carbon Decision & Traceability Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-carbon-primary tracking-tight max-w-4xl mx-auto leading-tight">
          Turn waste into <span className="text-brand-primary underline decoration-brand-bright/40 decoration-4">carbon value.</span>
        </h1>

        <p className="text-base sm:text-lg text-carbon-secondary max-w-2xl mx-auto font-normal">
          Connect waste generators with conversion facilities, recommend optimal pathways, optimize collection routes, and track auditable net CO₂e climate impact.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => onEnterPlatform('ADD_WASTE')}
            className="flex items-center gap-2.5 bg-brand-primary hover:bg-brand-dark text-white font-bold text-sm px-6 py-3.5 rounded-btn shadow-float transition transform active:scale-95"
          >
            <span>Register Waste Batch</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEnterPlatform('DASHBOARD')}
            className="flex items-center gap-2 bg-surface hover:bg-surface-muted text-carbon-primary border border-border font-bold text-sm px-6 py-3.5 rounded-btn shadow-subtle transition"
          >
            <span>View Live Network</span>
          </button>
        </div>

        {/* Product Visual Ecosystem Teaser Card */}
        <div className="pt-8 max-w-5xl mx-auto">
          <div className="bg-surface border border-border rounded-container shadow-modal p-6 text-left space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-400"></span>
                <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                <span className="text-xs font-semibold text-carbon-secondary ml-2">CarbonCycle Decision Engine Pipeline</span>
              </div>
              <span className="text-[11px] font-mono text-brand-primary bg-brand-soft px-2 py-0.5 rounded font-semibold">
                Live Simulation Mode
              </span>
            </div>

            {/* 5-Step Process Visual Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <div className="p-3 bg-surface-muted/60 rounded-btn border border-border space-y-1">
                <span className="text-[10px] font-bold text-carbon-muted uppercase">01 Waste Input</span>
                <p className="font-bold text-xs text-carbon-primary">10t Agro Residue</p>
                <p className="text-[10px] text-carbon-secondary">Gandhinagar Sector</p>
              </div>

              <div className="p-3 bg-surface-muted/60 rounded-btn border border-border space-y-1">
                <span className="text-[10px] font-bold text-brand-dark uppercase">02 Fingerprint</span>
                <p className="font-bold text-xs text-brand-dark">94% Biochar Fit</p>
                <p className="text-[10px] text-carbon-secondary">Moisture 15%</p>
              </div>

              <div className="p-3 bg-surface-muted/60 rounded-btn border border-border space-y-1">
                <span className="text-[10px] font-bold text-blue-600 uppercase">03 Facility Match</span>
                <p className="font-bold text-xs text-carbon-primary">EcoChar Hub</p>
                <p className="text-[10px] text-carbon-secondary">4.8 km Transit</p>
              </div>

              <div className="p-3 bg-surface-muted/60 rounded-btn border border-border space-y-1">
                <span className="text-[10px] font-bold text-amber-600 uppercase">04 Processing</span>
                <p className="font-bold text-xs text-carbon-primary">Pyrolysis Kiln</p>
                <p className="text-[10px] text-carbon-secondary">3.5t Biochar Yield</p>
              </div>

              <div className="p-3 bg-brand-soft border border-brand-primary/30 rounded-btn space-y-1">
                <span className="text-[10px] font-bold text-brand-dark uppercase">05 Impact Report</span>
                <p className="font-bold text-xs text-brand-dark">+11.19 tCO₂e Net</p>
                <p className="text-[10px] text-carbon-secondary">W2C-2026-00125</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Network Metrics Strip */}
      <section className="bg-surface border-y border-border py-10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-extrabold text-carbon-primary tracking-tight">12,840 t</div>
            <div className="text-xs font-medium text-carbon-secondary mt-1">Total Waste Tracked</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-brand-primary tracking-tight">65.5%</div>
            <div className="text-xs font-medium text-carbon-secondary mt-1">Landfill Diversion Rate</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-emerald-700 tracking-tight">4,820 tCO₂e</div>
            <div className="text-xs font-medium text-carbon-secondary mt-1">Net CO₂e Climate Impact</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-carbon-primary tracking-tight">36</div>
            <div className="text-xs font-medium text-carbon-secondary mt-1">Active Conversion Facilities</div>
          </div>
        </div>
      </section>

      {/* 5 Steps Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-carbon-primary">How CarbonCycle Works</h2>
          <p className="text-xs sm:text-sm text-carbon-secondary max-w-xl mx-auto">
            From raw waste registration to certified digital impact report, every step is optimized for circular sustainability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { num: '01', title: 'List Waste', desc: 'Enter quantity, moisture, and location to create a Waste Fingerprint.' },
            { num: '02', title: 'Find Facility', desc: 'Rule-based decision engine ranks compatible Biochar/Biogas plants.' },
            { num: '03', title: 'Optimize Transit', desc: 'Interactive GIS map plots source-to-facility transit route.' },
            { num: '04', title: 'Convert Waste', desc: 'Track batch throughput through facility processing queue.' },
            { num: '05', title: 'Measure Impact', desc: 'Generate auditable Digital Impact Report with CO₂e breakdown.' },
          ].map((step) => (
            <div key={step.num} className="p-5 bg-surface border border-border rounded-card space-y-2 hover:border-brand-primary/50 transition">
              <span className="text-2xl font-black text-brand-primary">{step.num}</span>
              <h3 className="font-bold text-sm text-carbon-primary">{step.title}</h3>
              <p className="text-xs text-carbon-secondary leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="bg-carbon-primary text-white py-16 px-6 text-center space-y-6">
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Ready to optimize your waste-to-carbon network?</h2>
        <p className="text-xs sm:text-sm text-gray-300 max-w-lg mx-auto">
          Start exploring Gujarat's active circular conversion ecosystem in seconds.
        </p>
        <button
          onClick={() => onEnterPlatform('DASHBOARD')}
          className="bg-brand-primary hover:bg-brand-dark text-white font-bold text-xs px-6 py-3 rounded-btn shadow-lg transition"
        >
          Launch CarbonCycle Dashboard →
        </button>
      </section>

      {/* Simple Footer */}
      <footer className="bg-surface border-t border-border py-6 px-8 text-center text-xs text-carbon-muted">
        <p>CarbonCycle — Waste-to-Carbon Decision & Traceability Platform © 2026. Hackathon Edition.</p>
      </footer>
    </div>
  );
};
