import React, { useState } from 'react';
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
  PanelLeftClose,
  PanelLeftOpen
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
  isCollapsed: controlledIsCollapsed,
  onToggleCollapse,
}) => {
  const { user, isAuthenticated, logout, setAuthModalOpen } = useAuth();
  const [localIsCollapsed, setLocalIsCollapsed] = useState<boolean>(false);

  const isCollapsed = controlledIsCollapsed !== undefined ? controlledIsCollapsed : localIsCollapsed;
  const toggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setLocalIsCollapsed((prev) => !prev);
    }
  };

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
    <aside 
      className={`${
        isCollapsed ? 'w-[68px]' : 'w-64'
      } bg-surface border-r border-border flex flex-col justify-between h-screen sticky top-0 z-40 select-none overflow-visible transition-[width] duration-300 ease-in-out flex-shrink-0`}
    >
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Brand Header & Toggle Button */}
        <div className={`${
          isCollapsed ? 'min-h-[96px] py-3.5 px-2 flex-col justify-center gap-2.5' : 'h-16 px-4 justify-between'
        } border-b border-border/60 flex items-center flex-shrink-0 transition-all`}>
          {isCollapsed ? (
            <>
              {/* Logo with top margin/space */}
              <div 
                onClick={() => onSelectTab('LANDING')}
                title="CarbonCycle - Waste-to-Carbon Network"
                className="w-9 h-9 rounded-btn bg-brand-primary flex items-center justify-center text-white shadow-sm cursor-pointer hover:opacity-90 transition flex-shrink-0"
              >
                <Leaf className="w-5 h-5 stroke-[2.5]" />
              </div>
              {/* Square Toggle Button */}
              <button
                onClick={toggleCollapse}
                title="Expand sidebar"
                className="w-9 h-9 aspect-square flex items-center justify-center rounded-xl bg-surface-muted/70 hover:bg-surface-muted text-carbon-secondary hover:text-carbon-primary transition cursor-pointer border border-border/80 shadow-xs"
              >
                <PanelLeftOpen className="w-5 h-5" />
              </button>
            </>
          ) : (
            <>
              <div 
                onClick={() => onSelectTab('LANDING')}
                className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition min-w-0 overflow-hidden"
              >
                <div className="w-9 h-9 rounded-btn bg-brand-primary flex items-center justify-center text-white shadow-sm flex-shrink-0">
                  <Leaf className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="truncate min-w-0">
                  <h1 className="font-bold text-sm tracking-wider uppercase text-carbon-primary truncate">
                    CarbonCycle
                  </h1>
                  <p className="text-[11px] text-carbon-secondary font-medium truncate">
                    Waste-to-Carbon Network
                  </p>
                </div>
              </div>

              <button
                onClick={toggleCollapse}
                title="Collapse sidebar"
                className="w-9 h-9 aspect-square flex items-center justify-center rounded-xl text-carbon-secondary hover:text-carbon-primary hover:bg-surface-muted transition cursor-pointer border border-transparent hover:border-border/70 flex-shrink-0 ml-1"
              >
                <PanelLeftClose className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Navigation Groups - strictly overflow-hidden in collapsed state, no scrollbars! */}
        <div 
          className={`p-2 flex-1 ${
            isCollapsed 
              ? 'overflow-hidden space-y-3' 
              : 'overflow-y-auto overflow-x-hidden space-y-5 [scrollbar-width:thin]'
          }`}
        >
          {navSections.map((section, sIdx) => (
            <div key={section.title} className="space-y-1">
              {!isCollapsed ? (
                <h2 className="px-3 text-[10px] font-bold text-carbon-muted uppercase tracking-widest">
                  {section.title}
                </h2>
              ) : sIdx > 0 ? (
                <div className="w-6 h-px bg-border/70 mx-auto my-1.5" />
              ) : null}

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id || 
                    (item.id === 'WASTE' && (currentTab === 'ADD_WASTE' || currentTab === 'RECOMMENDATION'));

                  if (isCollapsed) {
                    return (
                      <div key={item.id} className="relative group flex justify-center">
                        <button
                          onClick={() => onSelectTab(item.id)}
                          title={item.label}
                          className={`w-10 h-10 flex items-center justify-center rounded-xl transition relative cursor-pointer ${
                            isActive
                              ? 'bg-brand-soft text-brand-dark font-semibold'
                              : 'text-carbon-secondary hover:text-carbon-primary hover:bg-surface-muted'
                          }`}
                        >
                          <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-brand-primary' : 'text-carbon-secondary'}`} />

                          {item.badge !== undefined && item.badge > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-surface">
                              {item.badge}
                            </span>
                          )}

                          {item.badgeText && (
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-surface" />
                          )}
                        </button>

                        {/* Floating tooltip on hover */}
                        <div className="absolute left-full ml-3 px-2.5 py-1 bg-carbon-primary text-white text-xs font-semibold rounded-md shadow-modal whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition z-50">
                          {item.label}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={item.id}
                      onClick={() => onSelectTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                        isActive
                          ? 'bg-brand-soft text-brand-dark font-semibold'
                          : 'text-carbon-secondary hover:text-carbon-primary hover:bg-surface-muted'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-brand-primary' : 'text-carbon-muted'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badgeText && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-blue-100 text-blue-800 flex-shrink-0">
                          {item.badgeText}
                        </span>
                      )}

                      {item.badge !== undefined && item.badge > 0 && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${
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
      <div className="p-3 border-t border-border bg-surface-muted/30 flex-shrink-0">
        {isAuthenticated && user ? (
          isCollapsed ? (
            /* Collapsed: Only circular profile avatar with zero scroll */
            <div className="flex flex-col items-center justify-center">
              <div className="relative group">
                <div 
                  title={`${user.name} (${user.organizationName})`}
                  className="w-9 h-9 aspect-square rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs bg-zinc-200 border border-zinc-300 text-zinc-800 shadow-xs cursor-pointer"
                >
                  {user.name.slice(0, 2).toUpperCase()}
                </div>

                {/* Popout menu on hover for logout */}
                <div className="absolute bottom-0 left-full ml-3 w-52 p-3 bg-surface border border-border rounded-xl shadow-modal opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150 z-[100] text-xs space-y-2.5 before:absolute before:-left-3 before:top-0 before:w-3 before:h-full">
                  <div>
                    <p className="font-bold text-carbon-primary truncate">{user.organizationName}</p>
                    <p className="text-[10px] text-carbon-secondary truncate">{user.name} · {user.role}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg border border-red-200 font-semibold transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Expanded Profile Card with neutral colors */
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-xl bg-surface border border-border">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 aspect-square rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs bg-zinc-200 border border-zinc-300 text-zinc-800 shadow-xs">
                    {user.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="truncate min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-carbon-primary truncate">
                        {user.organizationName}
                      </p>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-zinc-100 border border-zinc-200 text-zinc-700">
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
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-xl border border-red-200 font-semibold transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )
        ) : (
          isCollapsed ? (
            <button
              onClick={() => setAuthModalOpen(true)}
              title="Sign In / Register"
              className="w-9 h-9 mx-auto rounded-full flex items-center justify-center text-white bg-brand-primary hover:bg-brand-dark transition cursor-pointer shadow-sm"
            >
              <LogIn className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-white bg-brand-primary hover:bg-brand-dark rounded-xl shadow-sm transition cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Register</span>
            </button>
          )
        )}
      </div>
    </aside>
  );
};
