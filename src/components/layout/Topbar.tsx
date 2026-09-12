import React, { useState } from 'react';
import { Plus, Search, Bell, ExternalLink, Sparkles, PanelLeftClose, PanelLeftOpen, Cpu } from 'lucide-react';
import { NavTab } from './Sidebar';
import { useAuth } from '../../context/AuthContext';

interface TopbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  currentTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  isSidebarCollapsed = false,
  onToggleSidebar,
}) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  // Close notifications dropdown when clicking outside
  React.useEffect(() => {
    if (!showNotifications) return;
    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#notifications-dropdown-container')) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, [showNotifications]);

  const titleMap: Record<NavTab, { title: string; subtitle: string }> = {
    LANDING: { title: 'Welcome to CarbonCycle', subtitle: 'Waste-to-Carbon Decision & Traceability Platform' },
    DASHBOARD: { 
      title: user?.role === 'facility_operator' ? 'Facility Operations Dashboard' : 'Network Overview', 
      subtitle: user?.role === 'facility_operator' 
        ? 'Real-time conversion capacity, inbound intake pipeline, and durable carbon yields' 
        : 'Monitor waste flows, conversion capacity, and carbon impact' 
    },
    ADMIN_DASHBOARD: { title: 'Dedicated Admin Dashboard', subtitle: 'Global network oversight across generators, facility operators, and users' },
    WASTE: { 
      title: user?.role === 'facility_operator' ? 'Inbound Feedstock Batches' : 'Waste Lots', 
      subtitle: user?.role === 'facility_operator' 
        ? 'Track incoming feedstock batches routed for facility reactor intake' 
        : 'Track registered waste batches through the conversion pipeline' 
    },
    ADD_WASTE: { title: 'List New Waste Batch', subtitle: 'Generate structured waste fingerprint and run decision engine' },
    RECOMMENDATION: { title: 'Waste Intelligence & Matching', subtitle: 'Explainable conversion pathway recommendation & facility matching' },
    FACILITIES: { title: 'Conversion Facilities', subtitle: 'Directory of active biochar, biogas, and composting processing hubs' },
    LOGISTICS: { title: 'Logistics & GIS Route Tracker', subtitle: 'Source-to-facility route optimization and pickup lifecycle' },
    PROCESSING: { title: 'Facility Operations Queue', subtitle: 'Real-time monitoring of active waste conversion batches' },
    CARBON: { title: 'Carbon Intelligence & Accounting', subtitle: 'Transparent breakdown of avoided landfill emissions and carbon stored' },
    ANALYTICS: { title: 'Network Analytics', subtitle: 'Waste diversion trends, pathway distribution, and climate metrics' },
    REPORTS: { title: 'Digital Impact Reports', subtitle: 'Auditable digital certificates and traceable batch summaries' },
  };

  const isOverview = currentTab === 'DASHBOARD';
  const currentInfo = titleMap[currentTab] || { title: 'CarbonCycle', subtitle: 'Decision Platform' };

  return (
    <header className="h-16 bg-surface border-b border-border px-6 flex items-center justify-between sticky top-0 z-40 gap-4">
      {/* Overview Only: Page Title & Breadcrumb */}
      {isOverview ? (
        <div className="flex-shrink-0">
    <header className="h-16 bg-surface border-b border-border px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Page Title & Breadcrumb */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-btn border border-border text-carbon-secondary hover:text-carbon-primary hover:bg-surface-muted transition"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar (Widescreen)"}
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4 text-brand-primary" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        )}
        <div>
          <div className="flex items-center gap-2 text-[11px] font-medium text-carbon-secondary">
            <span>CarbonCycle</span>
            <span>/</span>
            <span className="text-carbon-primary font-semibold">{currentInfo.title}</span>
          </div>
          <h1 className="text-sm font-semibold text-carbon-primary tracking-tight">
            {currentInfo.subtitle}
          </h1>
        </div>
      ) : (
        /* Non-Overview: Search bar takes prime spot on the left / center */
        <div className="flex-1 max-w-lg">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-carbon-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search waste, facility, batch ID, or location..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-surface-muted/60 text-sm text-carbon-primary pl-10 pr-4 py-2 rounded-xl border border-border/80 focus:outline-none focus:border-brand-primary focus:bg-surface shadow-xs transition"
            />
          </div>
        </div>
      )}

      {/* Overview Center Search Input */}
      {isOverview && (
        <div className="hidden lg:flex items-center relative flex-1 max-w-md mx-4">
          <Search className="w-4 h-4 text-carbon-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search waste, facility, or batch ID..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-surface-muted/60 text-sm text-carbon-primary pl-10 pr-4 py-2 rounded-xl border border-border/80 focus:outline-none focus:border-brand-primary focus:bg-surface shadow-xs transition"
          />
        </div>
      )}

      {/* Right Controls */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Reset Demo Button - Overview Only */}
        {isOverview && (
          <button
            onClick={onResetDemo}
            title="Reset to fresh demo scenario"
            className="flex items-center gap-1.5 text-xs text-carbon-secondary hover:text-carbon-primary px-3 py-2 rounded-xl border border-border hover:bg-surface-muted transition font-medium cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Search Input (Shifted to right beside notification) */}
        {currentTab !== 'LANDING' && (
          <div className="hidden sm:flex items-center relative w-56 md:w-72">
            <Search className="w-3.5 h-3.5 text-carbon-muted absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search waste, facility, or batch ID..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-surface-muted/60 text-xs text-carbon-primary pl-8 pr-3 py-1.5 rounded-control border border-border/80 focus:outline-none focus:border-brand-primary focus:bg-surface transition"
            />
          </div>
        )}

        {/* Notifications Icon Toggle - Enlarged with z-50 dropdown */}
        <div id="notifications-dropdown-container" className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            title="System notifications"
            className="w-10 h-10 flex items-center justify-center text-carbon-secondary hover:text-carbon-primary rounded-xl border border-border hover:bg-surface-muted transition relative cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-primary rounded-full ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-surface border border-border rounded-card shadow-modal p-3.5 z-50 text-xs space-y-2.5">
              <div className="flex items-center justify-between font-semibold border-b border-border pb-2">
                <span className="text-carbon-primary">Recent System Alerts</span>
                <span className="text-[10px] text-brand-primary bg-brand-soft px-1.5 py-0.5 rounded font-bold">Live</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <div className="p-2.5 bg-surface-muted/50 rounded-control border-l-2 border-brand-primary">
                  <p className="font-semibold text-carbon-primary">Batch W2C-2026-00125 Matched</p>
                  <p className="text-[11px] text-carbon-secondary">Gujarat EcoChar facility accepted match request.</p>
                  <p className="text-[9px] text-carbon-muted mt-1">2 mins ago</p>
                </div>
                <div className="p-2.5 bg-surface-muted/50 rounded-control border-l-2 border-blue-500">
                  <p className="font-semibold text-carbon-primary">Truck En-Route</p>
                  <p className="text-[11px] text-carbon-secondary">Driver Ramesh Patel assigned for pickup #PK-1024.</p>
                  <p className="text-[9px] text-carbon-muted mt-1">15 mins ago</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Primary CTA Button - Overview Only */}
        {isOverview && (
          <button
            onClick={() => onSelectTab('ADD_WASTE')}
            className="flex items-center gap-1.5 bg-brand-primary hover:bg-brand-dark text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>List Waste</span>
          </button>
        {/* Primary CTA Button */}
        {user?.role === 'facility_operator' ? (
          currentTab !== 'PROCESSING' && (
            <button
              onClick={() => onSelectTab('PROCESSING')}
              className="flex items-center gap-1.5 bg-brand-primary hover:bg-brand-dark text-white text-xs font-semibold px-3.5 py-1.5 rounded-btn shadow-sm transition transform active:scale-95"
            >
              <Cpu className="w-4 h-4" />
              <span className="hidden sm:inline">Operations Queue</span>
            </button>
          )
        ) : (
          currentTab !== 'ADD_WASTE' && (
            <button
              onClick={() => onSelectTab('ADD_WASTE')}
              className="flex items-center gap-1.5 bg-brand-primary hover:bg-brand-dark text-white text-xs font-semibold px-3.5 py-1.5 rounded-btn shadow-sm transition transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>List Waste</span>
            </button>
          )
        )}
      </div>
    </header>
  );
};
