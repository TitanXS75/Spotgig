import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation, useNavigate, Navigate } from "react-router-dom";
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
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import SafetyTipsPage from "./pages/SafetyTipsPage";
import PricingPage from "./pages/PricingPage";
import FAQPage from "./pages/FAQPage";
import AdminAuth from "./pages/adminauth";
import { CopilotFloatingButton } from "@/components/copilot/CopilotFloatingButton";
import { CopilotDrawer } from "@/components/copilot/CopilotDrawer";

const queryClient = new QueryClient();

// Pages that shouldn't show navigation
const noNavPages = ['/auth', '/forgot-password', '/reset-password', '/about', '/contact', '/privacy', '/terms', '/safety-tips', '/pricing', '/faq', '/adminauth'];

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isNoNavPage = location.pathname === '/' || noNavPages.some(path => location.pathname.startsWith(path));

  const { setUser, setAuthLoading, setAuthInitialized } = useAppStore();

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Backward compatibility: /auth?reset=true redirects to /reset-password
  useEffect(() => {
    if (location.pathname === '/auth') {
      const searchParams = new URLSearchParams(location.search);
      if (searchParams.get('reset') === 'true') {
        navigate('/reset-password' + location.hash, { replace: true });
      }
    }
  }, [location, navigate]);

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
          .maybeSingle();

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
      setAuthLoading(false);
      setAuthInitialized(true);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncUser(session.user);
      } else {
        setAuthLoading(false);
        setAuthInitialized(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        navigate('/reset-password');
        return;
      }
      if (session?.user) {
        syncUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setAuthLoading(false);
        setAuthInitialized(true);
      } else if (!session) {
        setAuthLoading(false);
        setAuthInitialized(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setAuthLoading, setAuthInitialized, navigate]);

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
          <Route path="/account" element={<Navigate to="/profile" replace />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
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
      <CopilotFloatingButton />
      <CopilotDrawer />
    </>
  );
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false}>
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
