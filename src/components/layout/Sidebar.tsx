import React from 'react';
import { 
  LayoutDashboard, 
  Trash2, 
  Factory, 
  Truck, 
  Cpu, 
  Leaf, 
  BarChart3, 
  FileText, 
  ShieldCheck,
  LogOut,
  LogIn,
  PanelLeftClose
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type NavTab = 
  | 'LANDING'
  | 'DASHBOARD'
  | 'ADMIN_DASHBOARD'
  | 'WASTE'
  | 'ADD_WASTE'
  | 'RECOMMENDATION'
  | 'FACILITIES'
  | 'LOGISTICS'
  | 'PROCESSING'
  | 'CARBON'
  | 'ANALYTICS'
  | 'REPORTS';

interface NavItem {
  id: NavTab;
  label: string;
  icon: any;
  badge?: number;
  badgeText?: string;
}

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeWasteCount: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeWasteCount,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const { user, isAuthenticated, logout, setAuthModalOpen } = useAuth();

  const navSections: Array<{ title: string; items: NavItem[] }> = [
    {
      title: 'OVERVIEW',
      items: [
        { 
          id: 'DASHBOARD', 
          label: user?.role === 'facility_operator' ? 'Facility Dashboard' : 'Overview', 
          icon: user?.role === 'facility_operator' ? Factory : LayoutDashboard,
          badgeText: user?.role === 'facility_operator' ? 'OPERATOR' : undefined,
        },
        ...(user?.role === 'admin' ? [{ id: 'ADMIN_DASHBOARD' as NavTab, label: 'Admin Dashboard', icon: ShieldCheck, badgeText: 'ADMIN' }] : []),
      ],
    },
    {
      title: 'OPERATIONS',
      items: user?.role === 'facility_operator' ? [
        { id: 'PROCESSING', label: 'Processing Queue', icon: Cpu },
        { id: 'WASTE', label: 'Inbound Feedstock Lots', icon: Trash2, badge: activeWasteCount },
        { id: 'LOGISTICS', label: 'Inbound Logistics', icon: Truck },
        { id: 'FACILITIES', label: 'Network Facilities', icon: Factory },
      ] : [
        { id: 'WASTE', label: 'Waste Lots', icon: Trash2, badge: activeWasteCount },
        { id: 'FACILITIES', label: 'Facilities', icon: Factory },
        { id: 'LOGISTICS', label: 'Logistics', icon: Truck },
        { id: 'PROCESSING', label: 'Processing', icon: Cpu },
      ],
    },
    {
      title: 'IMPACT & INTELLIGENCE',
      items: [
        { id: 'CARBON', label: 'Carbon Impact', icon: Leaf },
        { id: 'ANALYTICS', label: 'Analytics', icon: BarChart3 },
        { id: 'REPORTS', label: 'Reports', icon: FileText },
      ],
    },
  ];

  return (
    <aside className={`bg-surface border-r border-border flex flex-col justify-between h-screen sticky top-0 z-30 select-none transition-all duration-300 ease-in-out ${
      isCollapsed
        ? 'w-0 -translate-x-full overflow-hidden opacity-0 pointer-events-none border-r-0'
        : 'w-64 translate-x-0 opacity-100'
    }`}>
      <div>
        {/* Brand Header */}
        <div className="p-4 border-b border-border/60 flex items-center justify-between">
          <div 
            onClick={() => onSelectTab('LANDING')}
            className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition"
          >
            <div className="w-8 h-8 rounded-btn bg-brand-primary flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <Leaf className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wider uppercase text-carbon-primary">
                CarbonCycle
              </h1>
              <p className="text-[11px] text-carbon-secondary font-medium">
                Waste-to-Carbon Network
              </p>
            </div>
          </div>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-btn text-carbon-muted hover:text-carbon-primary hover:bg-surface-muted transition ml-1"
              title="Collapse Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Navigation Groups */}
        <div className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <h2 className="px-3 text-[10px] font-bold text-carbon-muted uppercase tracking-widest">
                {section.title}
              </h2>
              <div className="space-y-0.5 mt-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id || 
                    (item.id === 'WASTE' && (currentTab === 'ADD_WASTE' || currentTab === 'RECOMMENDATION'));

                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-btn text-xs font-medium transition ${
                        isActive
                          ? 'bg-brand-soft text-brand-dark font-semibold'
                          : 'text-carbon-secondary hover:text-carbon-primary hover:bg-surface-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-brand-primary' : 'text-carbon-muted'}`} />
                        <span>{item.label}</span>
                      </div>

                      {item.badgeText && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-blue-100 text-blue-800">
                          {item.badgeText}
                        </span>
                      )}

                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          isActive ? 'bg-brand-primary text-white' : 'bg-surface-muted text-carbon-secondary'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User / Organization Profile Card */}
      <div className="p-3 border-t border-border bg-surface-muted/30">
        {isAuthenticated && user ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-btn bg-surface border border-border">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                  user.role === 'admin'
                    ? 'bg-blue-100 border border-blue-300 text-blue-800'
                    : user.role === 'facility_operator'
                    ? 'bg-amber-100 border border-amber-300 text-amber-800'
                    : 'bg-emerald-100 border border-emerald-300 text-emerald-800'
                }`}>
                  {user.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-carbon-primary truncate">
                      {user.organizationName}
                    </p>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase ${
                      user.role === 'admin'
                        ? 'bg-blue-100 text-blue-800'
                        : user.role === 'facility_operator'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-brand-soft text-brand-dark'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <p className="text-[10px] text-carbon-secondary truncate">
                    {user.name} ({user.organizationType})
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-btn border border-red-200 font-semibold transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAuthModalOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-white bg-brand-primary hover:bg-brand-dark rounded-btn shadow-sm transition"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In / Register</span>
          </button>
        )}
      </div>
    </aside>
  );
};
