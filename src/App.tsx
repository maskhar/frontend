import { createRoot } from "react-dom/client";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

import Index from "./pages/Index";
import Katalog from "./pages/Katalog";
import StorePartner from "./pages/StorePartner";
import Services from "./pages/Services";
import Contract from "./pages/Contract";
import Kolaborasi from "./pages/Kolaborasi";
import Blog from "./pages/Blog";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import DashboardContractPage from "./pages/DashboardContractPage";
import "./index.css";

const queryClient = new QueryClient();

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
      <TooltipProvider>
        <Toaster />
        <Sonner richColors />
        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/" element={<Index />} />
          <Route path="/katalog" element={<Katalog />} />
          <Route path="/store-partner" element={<StorePartner />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contract" element={<Contract />} />
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
          </Route>

          {/* --- Catch-all Route --- */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  );
};

// Rendering the app in main.tsx, but keeping AppWrapper logic here
const AppWrapper = () => (
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);


// We assume main.tsx is now:
// import { createRoot } from "react-dom/client";
// import AppWrapper from "./App.tsx";
// import "./index.css";
// createRoot(document.getElementById("root")!).render(<AppWrapper />);

export default AppWrapper;

