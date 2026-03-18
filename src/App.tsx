import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "next-themes";
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
import MapPage from "./pages/MapPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <TopBar />
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <BottomNav />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
