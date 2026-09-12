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
  currentTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
}) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<import('../../types').NotificationItem[]>([]);
  const notifRef = React.useRef<HTMLDivElement>(null);

  // Fetch real notifications from MongoDB
  const loadNotifications = React.useCallback(async () => {
    try {
      const { fetchNotificationsApi } = await import('../../services/store');
      const role = user?.role === 'facility_operator' ? 'FACILITY_OPERATOR' : user?.role === 'admin' ? 'ALL' : 'WASTE_GENERATOR';
      const items = await fetchNotificationsApi({
        role,
        email: user?.email,
      });
      setNotifications(items);
    } catch (e) {
      console.warn('Failed to load notifications in topbar', e);
    }
  }, [user]);

  React.useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 6000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Click outside to close notification menu
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      const { markAllNotificationsReadApi } = await import('../../services/store');
      const role = user?.role === 'facility_operator' ? 'FACILITY_OPERATOR' : 'WASTE_GENERATOR';
      await markAllNotificationsReadApi({ role, email: user?.email });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotificationClick = async (notif: import('../../types').NotificationItem) => {
    try {
      const { markNotificationReadApi } = await import('../../services/store');
      await markNotificationReadApi(notif.id);
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
      if (notif.actionTab) {
        onSelectTab(notif.actionTab as NavTab);
      }
      setShowNotifications(false);
    } catch (e) {
      console.error(e);
    }
  };

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

        {/* Notifications Icon Toggle */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 text-carbon-secondary hover:text-carbon-primary rounded-btn border border-border hover:bg-surface-muted transition relative"
            title="Real-time Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-brand-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-surface shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-88 max-w-[90vw] bg-surface border border-border rounded-card shadow-modal p-3 z-50 text-xs space-y-2.5">
              <div className="flex items-center justify-between font-semibold border-b border-border pb-2">
                <div className="flex items-center gap-1.5">
                  <span>Intake & Gate Alerts</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-brand-soft text-brand-primary font-bold px-1.5 py-0.2 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[10px] text-brand-primary hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-mono font-medium">
                    MongoDB Live
                  </span>
                </div>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-0.5">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-carbon-muted">
                    <Bell className="w-6 h-6 mx-auto mb-1.5 opacity-30" />
                    <p className="text-[11px]">No alerts right now</p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const isIntake = notif.type === 'INTAKE_REQUEST';
                    const isAccepted = notif.type === 'REQUEST_ACCEPTED';
                    const isRejected = notif.type === 'REQUEST_REJECTED';
                    const isGate = notif.type === 'GATE_ARRIVAL';

                    const borderClass = isIntake
                      ? 'border-l-amber-500 bg-amber-500/5'
                      : isAccepted
                      ? 'border-l-emerald-500 bg-emerald-500/5'
                      : isRejected
                      ? 'border-l-rose-500 bg-rose-500/5'
                      : isGate
                      ? 'border-l-blue-600 bg-blue-600/5'
                      : 'border-l-brand-primary bg-surface-muted/50';

                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-2.5 rounded-control border border-border/70 border-l-4 ${borderClass} cursor-pointer hover:bg-surface-muted/70 transition ${
                          !notif.read ? 'ring-1 ring-brand-primary/20 font-medium' : 'opacity-85'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <p className="font-semibold text-carbon-primary text-xs flex items-center gap-1.5">
                            {!notif.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-primary inline-block"></span>
                            )}
                            {notif.title}
                          </p>
                          <span className="text-[9px] text-carbon-muted whitespace-nowrap">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-carbon-secondary leading-snug">
                          {notif.message}
                        </p>
                        {notif.lotDisplayId && (
                          <div className="mt-1 flex items-center justify-between text-[10px]">
                            <span className="font-mono text-carbon-muted">{notif.lotDisplayId}</span>
                            {notif.actionTab && (
                              <span className="text-brand-primary font-medium hover:underline flex items-center gap-0.5">
                                View details &rarr;
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
