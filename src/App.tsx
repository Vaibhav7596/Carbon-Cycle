import React, { useState, useEffect } from 'react';
import { NavTab, Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { LandingPage } from './pages/LandingPage';
import { DashboardView } from './pages/DashboardView';
import { FacilityOperatorDashboardView } from './pages/FacilityOperatorDashboardView';
import { AdminDashboardView } from './pages/AdminDashboardView';
import { AddWasteWizardView } from './pages/AddWasteWizardView';
import { WasteIntelligenceView } from './pages/WasteIntelligenceView';
import { WasteListView } from './pages/WasteListView';
import { FacilityDirectoryView } from './pages/FacilityDirectoryView';
import { LogisticsView } from './pages/LogisticsView';
import { ProcessingQueueView } from './pages/ProcessingQueueView';
import { CarbonImpactView } from './pages/CarbonImpactView';
import { AnalyticsView } from './pages/AnalyticsView';
import { ReportsView } from './pages/ReportsView';
import { ImpactReportModal } from './components/reports/ImpactReportModal';
import { AuthModal } from './components/auth/AuthModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Facility, WasteLot, WasteStatus } from './types';
import {
  fetchFacilitiesApi,
  fetchWasteLotsApi,
  getStoredFacilities,
  getStoredWasteLots,
  matchAndSelectFacilityApi,
  respondToMatchRequestApi,
  notifyGateArrivalApi,
  resetDemoDataApi,
  updateLotLifecycleStatusApi,
} from './services/store';

function AppContent() {
  const { isAuthenticated, user, setAuthModalOpen } = useAuth();
  
  // Default to LANDING if unauthenticated, or appropriate dashboard if authenticated
  const [currentTab, setCurrentTab] = useState<NavTab>('LANDING');
  const [previousTab, setPreviousTab] = useState<NavTab>('DASHBOARD');
  const [pendingTab, setPendingTab] = useState<NavTab | null>(null);

  const [wasteLots, setWasteLots] = useState<WasteLot[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [selectedLotId, setSelectedLotId] = useState<string | undefined>(undefined);
  const [openReportLot, setOpenReportLot] = useState<WasteLot | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Auto-collapse sidebar on RECOMMENDATION view to expand viewport and prevent crowding
  useEffect(() => {
    if (currentTab === 'RECOMMENDATION') {
      setIsSidebarCollapsed(true);
    }
  }, [currentTab]);

  // Load state on initial mount & synchronize with MongoDB
  useEffect(() => {
    // Initial instant hydration from local cache
    setWasteLots(getStoredWasteLots());
    setFacilities(getStoredFacilities());

    async function loadLiveDatabase() {
      try {
        const [liveLots, liveFacilities] = await Promise.all([
          fetchWasteLotsApi(),
          fetchFacilitiesApi(),
        ]);
        if (liveLots && liveLots.length > 0) setWasteLots(liveLots);
        if (liveFacilities && liveFacilities.length > 0) setFacilities(liveFacilities);
      } catch (err) {
        console.warn('Database synchronization error:', err);
      }
    }

    loadLiveDatabase();
  }, [isAuthenticated]);

  // Update initial tab when user logs in or out
  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentTab('LANDING');
    } else if (pendingTab) {
      setCurrentTab(pendingTab);
      setPendingTab(null);
    } else if (user?.role === 'admin') {
      setCurrentTab('ADMIN_DASHBOARD');
    } else if (user?.role === 'facility_operator') {
      setCurrentTab('DASHBOARD');
    } else {
      setCurrentTab('DASHBOARD');
    }
  }, [isAuthenticated, user?.role]);

  const handleNavigate = (tab: NavTab, authMode?: 'LOGIN' | 'REGISTER') => {
    if (tab !== 'LANDING' && !isAuthenticated) {
      setPendingTab(tab);
      setAuthModalOpen(true, authMode || 'LOGIN');
      return;
    }
    if (currentTab !== 'ADD_WASTE') {
      setPreviousTab(currentTab);
    }
    setCurrentTab(tab);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleResetDemo = async () => {
    showToast('Resetting database demo dataset...');
    const fresh = await resetDemoDataApi();
    setWasteLots(fresh.lots);
    setFacilities(fresh.facilities);
    if (fresh.lots.length > 0) {
      setSelectedLotId(fresh.lots[0].id);
    }
    showToast('Database reset to initial seeded dataset');
  };

  const handleCreatedLot = async (lotId: string) => {
    const updated = await fetchWasteLotsApi();
    setWasteLots(updated);
    setSelectedLotId(lotId);
    setCurrentTab('RECOMMENDATION');
    showToast(`Waste batch ${lotId} saved to database`);
  };

  const handleConfirmMatch = async (lotId: string, facilityId: string) => {
    const updatedLot = await matchAndSelectFacilityApi(lotId, facilityId);
    if (updatedLot) {
      setWasteLots((prev) => prev.map((l) => (l.id === lotId ? updatedLot : l)));
      setSelectedLotId(lotId);
      showToast(`Intake request submitted to ${updatedLot.requestedFacilityName || 'facility'}. Facility operator notified.`);
    }
  };

  const handleRespondToMatchRequest = async (
    lotId: string,
    action: 'ACCEPT' | 'REJECT',
    rejectionReason?: string,
    facilityId?: string
  ) => {
    const updatedLot = await respondToMatchRequestApi(lotId, action, rejectionReason, facilityId);
    if (updatedLot) {
      setWasteLots((prev) => prev.map((l) => (l.id === lotId ? updatedLot : l)));
      if (action === 'ACCEPT') {
        showToast(`Intake request ACCEPTED for batch ${lotId}. Collection logistics scheduled.`);
      } else {
        showToast(`Intake request REJECTED for batch ${lotId}. Generator notified.`);
      }
    }
  };

  const handleNotifyGateArrival = async (lotId: string) => {
    if (user?.role !== 'facility_operator' && user?.role !== 'admin') {
      showToast('Gate arrival can only be recorded by the facility operator.');
      return;
    }
    const updatedLot = await notifyGateArrivalApi(lotId);
    if (updatedLot) {
      setWasteLots((prev) => prev.map((l) => (l.id === lotId ? updatedLot : l)));
      showToast(`Truck arrival recorded at gate for batch ${lotId}. Intake alerted.`);
    }
  };

  const handleUpdateLotStatus = async (lotId: string, newStatus: WasteStatus) => {
    const facilityOnlyStatuses: WasteStatus[] = ['AT_GATE', 'DELIVERED', 'PROCESSING', 'COMPLETED'];
    if (facilityOnlyStatuses.includes(newStatus) && user?.role !== 'facility_operator' && user?.role !== 'admin') {
      showToast('Transitions from and after transit must be confirmed by the facility operator.');
      return;
    }
    const updatedLot = await updateLotLifecycleStatusApi(lotId, newStatus);
    if (updatedLot) {
      setWasteLots((prev) => prev.map((l) => (l.id === lotId ? updatedLot : l)));
      showToast(`Batch ${lotId} status updated to ${newStatus}`);
    }
  };

  const activeLotForRecommendation = wasteLots.find((l) => l.id === selectedLotId) || wasteLots[0];

  // If on Landing Page or unauthenticated, show Landing Page with Auth Modal
  if (currentTab === 'LANDING' || !isAuthenticated) {
    return (
      <>
        <LandingPage onEnterPlatform={(tab, authMode) => handleNavigate(tab, authMode)} />
        <AuthModal />
      </>
    );
  }

  const hideNavbarTabs: NavTab[] = ['DASHBOARD', 'RECOMMENDATION', 'ADD_WASTE', 'CARBON', 'ANALYTICS'];
  const showTopbar = !hideNavbarTabs.includes(currentTab);

  const isFacilityOperator = user?.role === 'facility_operator';
  const isGenerator = user?.role === 'generator';
  const isDemoFacilityUser = user?.email?.toLowerCase() === 'facility@carboncycle.io';
  const isDemoGenerator = user?.email?.toLowerCase() === 'generator@carboncycle.io';

  // Find the logged-in operator's facility
  // For demo account: falls back to EcoChar. For newly registered operators: strictly matches their own facility or provides clean zero-state
  const myFacility = isFacilityOperator
    ? facilities.find((f) => user?.email && f.contactEmail?.toLowerCase() === user.email.toLowerCase()) ||
      facilities.find((f) => (user?.id || (user as any)?._id) && (f.operatorId === user?.id || f.operatorId === (user as any)?._id)) ||
      facilities.find((f) => user?.organizationName && (f.name.toLowerCase().includes(user.organizationName.toLowerCase().trim()) || user.organizationName.toLowerCase().includes(f.name.toLowerCase().trim()))) ||
      (isDemoFacilityUser ? (facilities.find((f) => f.name.toLowerCase().includes('ecochar')) || facilities[0]) : null) ||
      {
        id: (user as any)?.facilityId || `FAC-${String(user?.id || user?.email || 'NEW').slice(-4).toUpperCase()}`,
        name: user?.organizationName || `${user?.name || 'Operator'}'s Conversion Center`,
        type: 'BIOCHAR' as const,
        acceptedWasteTypes: ['AGRICULTURAL_RESIDUE', 'BIOMASS_WOOD'] as any[],
        maxCapacityTonnes: 50.0,
        availableCapacityTonnes: 50.0,
        location: {
          name: user?.organizationName || 'Regional Conversion Center',
          address: user?.location || 'Gandhinagar Bio-Industrial Zone, Gujarat',
          lat: 23.2156,
          lng: 72.6369,
        },
        processingCostPerTon: 950,
        carbonFactorPerTon: 0.45,
        rating: 5.0,
        contactEmail: user?.email,
        operatorId: user?.id || (user as any)?._id,
        activeBatchesCount: 0,
        status: 'ACTIVE' as const,
      }
    : null;

  // Lots strictly scoped to the logged-in facility operator
  const facilityScopedLots = (isFacilityOperator && myFacility)
    ? wasteLots.filter((l) => {
        if (l.matchedFacilityId === myFacility.id) return true;
        if (l.status === 'MATCH_REQUESTED') {
          if (l.requestedFacilityId === myFacility.id) return true;
          if (l.requestedFacilities && l.requestedFacilities.some((r) => r.facilityId === myFacility.id && r.status === 'PENDING')) return true;
        }
        return false;
      })
    : wasteLots;

  // Facilities strictly scoped to the logged-in facility operator
  const facilityScopedFacilities = (isFacilityOperator && myFacility)
    ? (facilities.some((f) => f.id === myFacility.id) ? facilities.filter((f) => f.id === myFacility.id) : [myFacility])
    : facilities;

  // Lots strictly scoped to the logged-in generator (new generators have 0 lots until registered)
  const generatorScopedLots = isGenerator
    ? wasteLots.filter((l) => {
        if (isDemoGenerator) return true;
        const uId = String(user?.id || (user as any)?._id || '');
        const lGenId = String(l.generatorId || '');
        if (uId && lGenId && (lGenId === uId || lGenId.includes(uId) || uId.includes(lGenId))) return true;
        const uOrg = user?.organizationName?.toLowerCase().trim();
        const lGenName = l.generatorName?.toLowerCase().trim();
        if (uOrg && lGenName && (lGenName === uOrg || lGenName.includes(uOrg) || uOrg.includes(lGenName))) return true;
        const uName = user?.name?.toLowerCase().trim();
        if (uName && lGenName && (lGenName === uName || lGenName.includes(uName) || uName.includes(lGenName))) return true;
        const uEmail = user?.email?.toLowerCase().trim();
        const lContact = l.generatorContact?.toLowerCase().trim();
        if (uEmail && lContact && lContact === uEmail) return true;
        return false;
      })
    : wasteLots;

  return (
    <div className="flex min-h-screen bg-canvas text-carbon-primary font-sans">
      
      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-carbon-primary text-white text-xs font-semibold px-4 py-3 rounded-btn shadow-modal border border-gray-700 animate-in fade-in slide-in-from-bottom-3">
          {toastMessage}
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleNavigate}
        activeWasteCount={
          isFacilityOperator
            ? facilityScopedLots.length
            : isGenerator
            ? generatorScopedLots.length
            : wasteLots.length
        }
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        
        {/* Topbar Header with Live MongoDB Notifications (rendered only where search and global alerts are relevant) */}
        {showTopbar && (
          <Topbar
            currentTab={currentTab}
            onSelectTab={handleNavigate}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        )}

        {/* View Router Body */}
        <main className="flex-1 overflow-y-auto pb-12">
          {currentTab === 'ADMIN_DASHBOARD' && user?.role === 'admin' && (
            <AdminDashboardView
              wasteLots={wasteLots}
              facilities={facilities}
            />
          )}

          {currentTab === 'DASHBOARD' && (
            user?.role === 'facility_operator' ? (
              <FacilityOperatorDashboardView
                wasteLots={wasteLots}
                facilities={facilities}
                onSelectTab={handleNavigate}
                onSelectLot={(id) => {
                  setSelectedLotId(id);
                  setCurrentTab('LOGISTICS');
                }}
                onUpdateLotStatus={handleUpdateLotStatus}
                onRespondToMatchRequest={handleRespondToMatchRequest}
                onNotifyGateArrival={handleNotifyGateArrival}
                onOpenReport={(lot) => setOpenReportLot(lot)}
              />
            ) : (
              <DashboardView
                wasteLots={isGenerator ? generatorScopedLots : wasteLots}
                facilities={facilities}
                onSelectTab={handleNavigate}
                onSelectLot={(id) => {
                  setSelectedLotId(id);
                  setCurrentTab('LOGISTICS');
                }}
                onSelectFacility={() => setCurrentTab('FACILITIES')}
              />
            )
          )}

          {currentTab === 'WASTE' && (
            <WasteListView
              wasteLots={isFacilityOperator ? facilityScopedLots : (isGenerator ? generatorScopedLots : wasteLots)}
              onSelectLot={(id) => {
                setSelectedLotId(id);
                setCurrentTab('RECOMMENDATION');
              }}
              onSelectTab={handleNavigate}
              onOpenReport={(lot) => setOpenReportLot(lot)}
              searchQuery={searchQuery}
            />
          )}

          {currentTab === 'ADD_WASTE' && (
            <AddWasteWizardView
              onCreatedLot={handleCreatedLot}
              onCancel={() => setCurrentTab(previousTab || (user?.role === 'facility_operator' ? 'PROCESSING' : 'WASTE'))}
            />
          )}

          {currentTab === 'RECOMMENDATION' && activeLotForRecommendation && (
            <WasteIntelligenceView
              lot={activeLotForRecommendation}
              facilities={facilities}
              onConfirmMatch={handleConfirmMatch}
              onBack={() => setCurrentTab('WASTE')}
              isSidebarCollapsed={isSidebarCollapsed}
              onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
          )}

          {currentTab === 'FACILITIES' && (
            <FacilityDirectoryView
              facilities={facilities}
              searchQuery={searchQuery}
            />
          )}

          {currentTab === 'LOGISTICS' && (
            <LogisticsView
              wasteLots={isFacilityOperator ? facilityScopedLots : (isGenerator ? generatorScopedLots : wasteLots)}
              facilities={isFacilityOperator ? facilityScopedFacilities : facilities}
              selectedLotId={selectedLotId}
              onSelectLot={setSelectedLotId}
              onUpdateLotStatus={handleUpdateLotStatus}
            />
          )}

          {currentTab === 'PROCESSING' && (
            <ProcessingQueueView
              wasteLots={isFacilityOperator ? facilityScopedLots : (isGenerator ? generatorScopedLots : wasteLots)}
              onUpdateLotStatus={handleUpdateLotStatus}
              onOpenReport={(lot) => setOpenReportLot(lot)}
              searchQuery={searchQuery}
            />
          )}

          {currentTab === 'CARBON' && (
            <CarbonImpactView
              wasteLots={isFacilityOperator ? facilityScopedLots : (isGenerator ? generatorScopedLots : wasteLots)}
              onOpenReport={(lot) => setOpenReportLot(lot)}
            />
          )}

          {currentTab === 'ANALYTICS' && (
            <AnalyticsView
              wasteLots={isFacilityOperator ? facilityScopedLots : (isGenerator ? generatorScopedLots : wasteLots)}
              facilities={isFacilityOperator ? facilityScopedFacilities : facilities}
            />
          )}

          {currentTab === 'REPORTS' && (
            <ReportsView
              wasteLots={isFacilityOperator ? facilityScopedLots : (isGenerator ? generatorScopedLots : wasteLots)}
              onOpenReport={(lot) => setOpenReportLot(lot)}
              searchQuery={searchQuery}
            />
          )}
        </main>
      </div>

      {/* Auth Modal & Impact Report Modal */}
      <AuthModal />

      {openReportLot && (
        <ImpactReportModal
          isOpen={!!openReportLot}
          onClose={() => setOpenReportLot(null)}
          lot={openReportLot}
        />
      )}

    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
