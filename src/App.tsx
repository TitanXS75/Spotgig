import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ThemeProvider } from "next-themes";
import { supabase } from "@/lib/supabase";
import { useAppStore } from "@/store/app-store";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import Index from "./pages/Index";
import ListingDetail from "./pages/ListingDetail";
import CategoriesPage from "./pages/CategoriesPage";
import ProfilePage from "./pages/ProfilePage";
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

// Static pages that shouldn't show navigation
const staticPages = ['/about', '/contact', '/privacy', '/terms', '/safety-tips', '/pricing', '/faq', '/adminauth'];

const AppContent = () => {
  const location = useLocation();
  const isStaticPage = staticPages.some(path => location.pathname.startsWith(path));

  const { setUser } = useAppStore();

  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Supabase Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.user_metadata?.full_name || "",
          phone: session.user.phone || null,
          gender: null,
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
          name: session.user.user_metadata?.full_name || "",
          phone: session.user.phone || null,
          gender: null,
        });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return (
    <>
      {!isStaticPage && <TopBar />}
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<Index />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/profile" element={<ProfilePage />} />
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
      {!isStaticPage && <BottomNav />}
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
