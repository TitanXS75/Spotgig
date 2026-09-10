import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useAppStore } from "@/store/app-store";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import Index from "./pages/Index";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import ProjectWorkspacePage from "./pages/ProjectWorkspacePage";
import ListingDetail from "./pages/ListingDetail";
import CategoriesPage from "./pages/CategoriesPage";
import ProfilePage from "./pages/ProfilePage";
import MyProjectsPage from "./pages/MyProjectsPage";
import OwnerRequestsPage from "./pages/OwnerRequestsPage";
import MyRequestsPage from "./pages/MyRequestsPage";
import PostProject from "./pages/PostProject";
import EditProject from "./pages/EditProject";
import SellerOnboarding from "./pages/SellerOnboarding";
import EditListing from "./pages/EditListing";
import MapPage from "./pages/MapPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import SafetyTipsPage from "./pages/SafetyTipsPage";
import PricingPage from "./pages/PricingPage";
import FAQPage from "./pages/FAQPage";
import AdminAuth from "./pages/adminauth";

const queryClient = new QueryClient();

// Pages that shouldn't show navigation
const noNavPages = ['/auth', '/forgot-password', '/about', '/contact', '/privacy', '/terms', '/safety-tips', '/pricing', '/faq', '/adminauth'];

const AppContent = () => {
  const location = useLocation();
  const isNoNavPage = location.pathname === '/' || noNavPages.some(path => location.pathname.startsWith(path));

  const { setUser } = useAppStore();

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Supabase Auth Listener with profile sync
  useEffect(() => {
    const syncUser = async (sessionUser: SupabaseUser) => {
      let role = sessionUser.user_metadata?.role || 'developer';
      let name = sessionUser.user_metadata?.full_name || '';

      try {
        const { data } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', sessionUser.id)
          .single();

        if (data) {
          if (data.role) role = data.role;
          if (data.full_name) name = data.full_name;
        }
      } catch (e) {
        // use metadata fallback
      }

      setUser({
        id: sessionUser.id,
        email: sessionUser.email || "",
        name: name,
        phone: sessionUser.phone || null,
        gender: null,
        role: role,
      });
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        syncUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return (
    <>
      {!isNoNavPage && <TopBar />}
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<Index />} />
          <Route path="/projects" element={<Index />} />
          <Route path="/project/:id" element={<ProjectDetailPage />} />
          <Route path="/project/:id/workspace" element={<ProjectWorkspacePage />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/my-projects" element={<MyProjectsPage />} />
          <Route path="/requests" element={<OwnerRequestsPage />} />
          <Route path="/my-requests" element={<MyRequestsPage />} />
          <Route path="/post-project" element={<PostProject />} />
          <Route path="/edit-project/:id" element={<EditProject />} />
          <Route path="/seller/onboarding" element={<SellerOnboarding />} />
          <Route path="/edit-listing/:id" element={<EditListing />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/safety-tips" element={<SafetyTipsPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/adminauth" element={<AdminAuth />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isNoNavPage && <BottomNav />}
    </>
  );
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
