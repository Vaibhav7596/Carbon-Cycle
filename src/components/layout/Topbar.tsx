import React, { useState } from 'react';
import { Search, Bell } from 'lucide-react';
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
  searchQuery,
  onSearchChange,
}) => {
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

  return (
    <header className="h-16 bg-surface border-b border-border px-6 flex items-center justify-between sticky top-0 z-40 gap-4">
      {/* Search bar takes prime spot on the left / center */}
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

      {/* Right Controls */}
      <div className="flex items-center gap-3 ml-auto">
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
      </div>
    </header>
  );
};
