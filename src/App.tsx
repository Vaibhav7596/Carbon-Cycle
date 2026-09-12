import React, { useState, useEffect } from 'react';
import { NavTab, Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { LandingPage } from './pages/LandingPage';
import { DashboardView } from './pages/DashboardView';
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
  resetDemoDataApi,
  updateLotLifecycleStatusApi,
} from './services/store';

function AppContent() {
  const { isAuthenticated, user, setAuthModalOpen } = useAuth();
  
  // Default to LANDING if unauthenticated, or appropriate dashboard if authenticated
  const [currentTab, setCurrentTab] = useState<NavTab>('LANDING');

  const [wasteLots, setWasteLots] = useState<WasteLot[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [selectedLotId, setSelectedLotId] = useState<string | undefined>(undefined);
  const [openReportLot, setOpenReportLot] = useState<WasteLot | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
    } else if (user?.role === 'admin') {
      setCurrentTab('ADMIN_DASHBOARD');
    } else if (user?.role === 'facility_operator') {
      setCurrentTab('PROCESSING');
    } else {
      setCurrentTab('DASHBOARD');
    }
  }, [isAuthenticated, user?.role]);

  const handleNavigate = (tab: NavTab) => {
    if (tab !== 'LANDING' && !isAuthenticated) {
      setAuthModalOpen(true);
      return;
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
      setCurrentTab('LOGISTICS');
      showToast(`Batch ${lotId} matched with ${updatedLot.matchedFacilityName}`);
    }
  };

  const handleUpdateLotStatus = async (lotId: string, newStatus: WasteStatus) => {
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
        <LandingPage onEnterPlatform={(tab) => handleNavigate(tab)} />
        <AuthModal />
      </>
    );
  }

  const hideNavbarTabs: NavTab[] = ['DASHBOARD', 'RECOMMENDATION', 'ADD_WASTE', 'CARBON', 'ANALYTICS'];
  const showTopbar = !hideNavbarTabs.includes(currentTab);

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
        activeWasteCount={wasteLots.length}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Topbar Header (rendered only where search and global alerts are relevant) */}
        {showTopbar && (
          <Topbar
            currentTab={currentTab}
            onSelectTab={handleNavigate}
            onResetDemo={handleResetDemo}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
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
            <DashboardView
              wasteLots={wasteLots}
              facilities={facilities}
              onSelectTab={handleNavigate}
              onSelectLot={(id) => {
                setSelectedLotId(id);
                setCurrentTab('LOGISTICS');
              }}
              onSelectFacility={() => setCurrentTab('FACILITIES')}
            />
          )}

          {currentTab === 'WASTE' && (
            <WasteListView
              wasteLots={wasteLots}
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
              onCancel={() => setCurrentTab('WASTE')}
            />
          )}

          {currentTab === 'RECOMMENDATION' && activeLotForRecommendation && (
            <WasteIntelligenceView
              lot={activeLotForRecommendation}
              facilities={facilities}
              onConfirmMatch={handleConfirmMatch}
              onBack={() => setCurrentTab('WASTE')}
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
              wasteLots={wasteLots}
              facilities={facilities}
              selectedLotId={selectedLotId}
              onSelectLot={setSelectedLotId}
              onUpdateLotStatus={handleUpdateLotStatus}
            />
          )}

          {currentTab === 'PROCESSING' && (
            <ProcessingQueueView
              wasteLots={wasteLots}
              onUpdateLotStatus={handleUpdateLotStatus}
              onOpenReport={(lot) => setOpenReportLot(lot)}
              searchQuery={searchQuery}
            />
          )}

          {currentTab === 'CARBON' && (
            <CarbonImpactView
              wasteLots={wasteLots}
              onOpenReport={(lot) => setOpenReportLot(lot)}
            />
          )}

          {currentTab === 'ANALYTICS' && (
            <AnalyticsView
              wasteLots={wasteLots}
              facilities={facilities}
            />
          )}

          {currentTab === 'REPORTS' && (
            <ReportsView
              wasteLots={wasteLots}
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
