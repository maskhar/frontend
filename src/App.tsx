import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

import Index from "./pages/Index";
import KatalogPage from "./pages/KatalogPage";
import StorePartner from "./pages/StorePartner";
import Services from "./pages/Services";
import PricingPage from "./pages/Pricing";
import CategoryDetailPage from "./pages/CategoryDetailPage";
import Kolaborasi from "./pages/Kolaborasi";
import Blog from "./pages/Blog";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import DashboardContractPage from "./pages/DashboardContractPage";
import DashboardServicesPage from "./pages/DashboardServicesPage";
import DashboardMusicPage from './pages/DashboardMusicPage';
import DashboardPricingManagementPage from './pages/DashboardPricingManagementPage';
// import DashboardPricingManagementPage from './pages/DashboardPricingManagementPage';

import "./index.css";
import { TooltipProvider } from "./components/ui/tooltip";
import { PlayerProvider } from "./contexts/PlayerContext";
import { Player } from "./components/Player";
import { NowPlayingSheet } from "./components/NowPlayingSheet";
import { Toaster } from 'sonner';

// A component to protect routes that require authentication
const ProtectedRoute = ({ session, loading }: { session: Session | null, loading: boolean }) => {
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Memuat Sesi...</div>;
  }
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />; // Renders the child route's element (e.g., DashboardPage)
};

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    };

    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <PlayerProvider>
        <TooltipProvider>
          <Toaster richColors />
          <div className="flex flex-col h-screen">
            {/* Navbar sekarang ada di dalam setiap halaman untuk layout yang lebih fleksibel */}
            <div className="flex-1 overflow-y-auto">
              <Routes>
                {/* --- Public Routes --- */}
                <Route path="/" element={<Index />} />
                <Route path="/katalog" element={<KatalogPage />} />
                <Route path="/store-partner" element={<StorePartner />} />
                <Route path="/services" element={<Services />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/pricing/:slug" element={<CategoryDetailPage />} />
                <Route path="/kolaborasi" element={<Kolaborasi />} />
                <Route path="/blog" element={<Blog />} />
                
                {/* --- Auth Route --- */}
                <Route 
                  path="/login" 
                  element={!session ? <LoginPage /> : <Navigate to="/dashboard" replace />} 
                />

                {/* --- Protected Dashboard Routes --- */}
                <Route element={<ProtectedRoute session={session} loading={loading} />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/dashboard/contract" element={<DashboardContractPage />} />
                  <Route path="/dashboard/services" element={<DashboardServicesPage />} />
                  <Route path="/dashboard/music" element={<DashboardMusicPage />} />
                  <Route path="/dashboard/pricing-management" element={<DashboardPricingManagementPage />} />
                  <Route path="/dashboard/pricing-management" element={<DashboardPricingManagementPage />} />

                </Route>

                {/* --- Catch-all Route --- */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Player onBarClick={() => setIsSheetOpen(true)} />
            <NowPlayingSheet isOpen={isSheetOpen} onOpenChange={setIsSheetOpen} />
          </div>
        </TooltipProvider>
      </PlayerProvider>
    </BrowserRouter>
  );
};

export default App;
