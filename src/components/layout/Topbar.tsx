import React, { useState } from 'react';
import { Search, Bell, CheckCircle2, XCircle, Truck, Package, ArrowUpRight } from 'lucide-react';
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


  return (
    <header className="h-16 bg-surface border-b border-border sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between gap-4">
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
          {/* Notifications Icon Toggle */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-10 h-10 flex items-center justify-center text-carbon-secondary hover:text-carbon-primary rounded-xl border border-border hover:bg-surface-muted transition relative cursor-pointer shadow-xs"
              title="Real-time Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-brand-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-surface shadow-sm">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div 
                className="absolute right-0 mt-2 w-[350px] sm:w-[380px] max-w-[calc(100vw-2rem)] bg-surface border border-border rounded-xl shadow-modal p-3.5 z-50 text-xs space-y-2.5 animate-in fade-in-50 zoom-in-95 duration-150 ring-1 ring-black/5"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-brand-soft flex items-center justify-center text-brand-primary">
                      <Bell className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs text-carbon-primary leading-none">Notifications & Alerts</h3>
                      <p className="text-[10px] text-carbon-secondary mt-0.5">Live platform and facility updates</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {unreadCount > 0 ? (
                      <>
                        <span className="text-[9px] bg-brand-soft text-brand-dark font-bold px-2 py-0.5 rounded-full border border-brand-primary/20">
                          {unreadCount} new
                        </span>
                        <button
                          type="button"
                          onClick={handleMarkAllRead}
                          className="text-[10px] font-semibold text-brand-primary hover:text-brand-dark hover:underline cursor-pointer transition ml-0.5"
                        >
                          Mark all read
                        </button>
                      </>
                    ) : (
                      <span className="text-[9px] text-carbon-muted font-medium bg-surface-muted px-1.5 py-0.5 rounded-full">
                        Up to date
                      </span>
                    )}
                  </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-0.5">
                  {notifications.length === 0 ? (
                    <div className="py-7 text-center space-y-1.5">
                      <div className="w-9 h-9 rounded-full bg-surface-muted flex items-center justify-center mx-auto text-carbon-muted/60">
                        <Bell className="w-4 h-4" />
                      </div>
                      <p className="font-bold text-xs text-carbon-primary">All caught up!</p>
                      <p className="text-[10px] text-carbon-muted max-w-[200px] mx-auto">
                        There are no new intake requests or shipment alerts right now.
                      </p>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const isIntake = notif.type === 'INTAKE_REQUEST';
                      const isAccepted = notif.type === 'REQUEST_ACCEPTED';
                      const isRejected = notif.type === 'REQUEST_REJECTED';
                      const isGate = notif.type === 'GATE_ARRIVAL';

                      const borderClass = isIntake
                        ? 'border-l-amber-500 bg-amber-500/5 hover:bg-amber-500/10'
                        : isAccepted
                        ? 'border-l-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10'
                        : isRejected
                        ? 'border-l-rose-500 bg-rose-500/5 hover:bg-rose-500/10'
                        : isGate
                        ? 'border-l-blue-600 bg-blue-600/5 hover:bg-blue-600/10'
                        : 'border-l-brand-primary bg-surface-muted/50 hover:bg-surface-muted/80';

                      const iconBgClass = isIntake
                        ? 'bg-amber-100 text-amber-700'
                        : isAccepted
                        ? 'bg-emerald-100 text-emerald-700'
                        : isRejected
                        ? 'bg-rose-100 text-rose-700'
                        : isGate
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-brand-soft text-brand-primary';

                      return (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`p-2.5 rounded-lg border border-border/70 border-l-[4px] ${borderClass} cursor-pointer transition shadow-xs ${
                            !notif.read ? 'ring-1 ring-brand-primary/20 bg-surface' : 'opacity-85'
                          }`}
                        >
                          <div className="flex items-start gap-2.5">
                            <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${iconBgClass}`}>
                              {isIntake && <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />}
                              {isAccepted && <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />}
                              {isRejected && <XCircle className="w-3.5 h-3.5 stroke-[2.5]" />}
                              {isGate && <Truck className="w-3.5 h-3.5 stroke-[2.5]" />}
                              {!isIntake && !isAccepted && !isRejected && !isGate && <Package className="w-3.5 h-3.5 stroke-[2.5]" />}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1.5 mb-0.5">
                                <p className="font-bold text-xs text-carbon-primary flex items-center gap-1 truncate">
                                  {!notif.read && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-brand-primary inline-block flex-shrink-0"></span>
                                  )}
                                  <span className="truncate">{notif.title}</span>
                                </p>
                                <span className="text-[9px] font-medium text-carbon-muted whitespace-nowrap">
                                  {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>

                              <p className="text-[11px] text-carbon-secondary leading-snug">
                                {notif.message}
                              </p>

                              {notif.lotDisplayId && (
                                <div className="mt-1.5 pt-1.5 border-t border-border/50 flex items-center justify-between text-[10px]">
                                  <span className="font-mono text-[9px] text-carbon-secondary bg-surface-muted px-1.5 py-0.2 rounded border border-border">
                                    {notif.lotDisplayId}
                                  </span>
                                  {notif.actionTab && (
                                    <span className="text-brand-primary font-bold hover:underline flex items-center gap-0.5 text-[11px]">
                                      View details &rarr;
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="pt-1.5 border-t border-border flex items-center justify-between text-[10px] text-carbon-muted font-medium">
                    <span>{notifications.length} alert{notifications.length === 1 ? '' : 's'}</span>
                    <span>Synced live</span>
                  </div>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  </header>
  );
};
