import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import AnimatedDropdown from '@/components/ui/animated-dropdown';
import {
  Trash2,
  LogOut,
  Search,
  Filter,
  Store,
  Home,
  Eye,
  EyeOff,
  ShieldAlert,
  CreditCard,
  PauseCircle,
  PlayCircle,
  TrendingUp,
  Users,
  Briefcase,
  DollarSign,
  CheckCircle2,
  Clock,
  Settings2,
  Save,
  RefreshCw,
  FolderKanban,
} from 'lucide-react';
import { CATEGORIES, type Listing } from '@/lib/mock-data';
import {
  getPlatformSettings,
  updatePlatformSettings,
  getAdminPayments,
  type PlatformSettings,
  type PaymentRecord,
} from '@/lib/api/platform-settings';

interface AdminUser {
  id: string;
  seller_name: string;
  email?: string;
  category: string;
  operating_type: 'home' | 'shop';
  created_at: string;
  location: string;
  listings: Listing[];
  membershipType: 'monthly' | 'yearly';
  revenue: number;
}

interface RawProjectRow {
  id: string;
  title: string;
  status: string;
  compensation_type: string;
  compensation_amount: number | null;
  created_at: string;
  profiles?: { full_name?: string | null } | { full_name?: string | null }[] | null;
}

interface ProjectSummary {
  id: string;
  title: string;
  status: string;
  compensation_type: string;
  compensation_amount: number | null;
  created_at: string;
  owner_name?: string;
}

export default function AdminAuth() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentAdminEmail, setCurrentAdminEmail] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'income' | 'settings' | 'projects' | 'users'>('income');

  // Monetization and Income State
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    id: 'global',
    payment_gateway_enabled: false,
    free_client_limit: 1,
    platform_fee_percent: 0,
    monthly_plan_price: 10000,
    yearly_plan_price: 120000,
    announcement_banner: '',
    updated_at: new Date().toISOString(),
  });
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'pending' | 'failed'>('all');
  const [paymentSearch, setPaymentSearch] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // Settings form editing
  const [freeClientLimitInput, setFreeClientLimitInput] = useState('1');
  const [monthlyPriceInput, setMonthlyPriceInput] = useState('100');

  // Platform entities
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [dataLoading, setDataLoading] = useState(false);

  // User moderation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [businessNameConfirm, setBusinessNameConfirm] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Seller filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedOperatingType, setSelectedOperatingType] = useState<'all' | 'home' | 'shop'>('all');

  const fetchAdminData = useCallback(async () => {
    setDataLoading(true);
    try {
      // 1. Fetch monetization settings
      const settings = await getPlatformSettings();
      setPlatformSettings(settings);
      setFreeClientLimitInput(String(settings.free_client_limit ?? 1));
      setMonthlyPriceInput(String(Math.round((settings.monthly_plan_price || 10000) / 100)));

      // 2. Fetch payments & income ledger
      const paymentsList = await getAdminPayments();
      setPayments(paymentsList);

      const incomeFromDb = paymentsList
        .filter((p) => p.status === 'paid')
        .reduce((acc, p) => acc + Number(p.amount || 0), 0);

      // 3. Fetch listings (with fallback)
      const { data: listings } = await supabase
        .from('listings')
        .select('*')
        .neq('status', 'suspended');

      const usersMap: Record<string, AdminUser> = {};
      let listingEstimatedRev = 0;

      (listings || []).forEach((listing) => {
        const userId = listing.user_id;
        if (!usersMap[userId]) {
          usersMap[userId] = {
            id: userId,
            seller_name: listing.seller_name || 'Member',
            category: listing.category || 'General',
            operating_type: listing.operating_type || 'home',
            created_at: listing.created_at,
            location: listing.area || 'Anywhere',
            listings: [],
            membershipType: listing.plan === 'yearly' ? 'yearly' : 'monthly',
            revenue: 0,
          };
        }

        usersMap[userId].listings.push(listing);
        const rev = listing.plan === 'yearly' ? 1200 : 100;
        usersMap[userId].revenue += rev;
        listingEstimatedRev += rev;
      });

      const adminUsers = Object.values(usersMap);
      setUsers(adminUsers);
      setTotalRevenue(incomeFromDb > 0 ? incomeFromDb : listingEstimatedRev);

      // 4. Fetch projects summary
      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, title, status, compensation_type, compensation_amount, created_at, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (projectsData) {
        setProjects(
          (projectsData as unknown as RawProjectRow[]).map((p) => {
            const profile = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
            return {
              id: p.id,
              title: p.title,
              status: p.status,
              compensation_type: p.compensation_type,
              compensation_amount: p.compensation_amount,
              created_at: p.created_at,
              owner_name: profile?.full_name || 'Anonymous Client',
            };
          })
        );
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load some admin data');
    } finally {
      setDataLoading(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !authData.user) {
        toast.error('Invalid email or password credentials');
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile?.is_admin) {
        await supabase.auth.signOut();
        toast.error('Access denied: You do not have administrator permissions.');
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);
      setCurrentAdminEmail(authData.user.email || email);
      toast.success('Admin authentication verified');
      fetchAdminData();
    } catch (err) {
      console.error(err);
      toast.error('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePaymentGateway = async () => {
    const nextState = !platformSettings.payment_gateway_enabled;
    setSavingSettings(true);
    try {
      const updated = await updatePlatformSettings({
        payment_gateway_enabled: nextState,
      });
      setPlatformSettings(updated);
      toast.success(
        nextState
          ? 'Payment Gateway ACTIVATED: Paid charges & subscriptions are now enforced!'
          : 'Payment Gateway PAUSED: Platform is now in 100% FREE MODE!'
      );
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      toast.error('Failed to update payment gateway state: ' + message);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveMonetizationConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const parsedLimit = parseInt(freeClientLimitInput, 10);
      const parsedMonthly = Math.round(parseFloat(monthlyPriceInput) * 100);

      const updated = await updatePlatformSettings({
        free_client_limit: isNaN(parsedLimit) ? 1 : parsedLimit,
        monthly_plan_price: isNaN(parsedMonthly) ? 10000 : parsedMonthly,
      });

      setPlatformSettings(updated);
      toast.success('Monetization settings saved successfully!');
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : String(err);
      toast.error('Failed to save settings: ' + message);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDeleteUser = async (userToDelete: AdminUser) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: 'suspended' })
        .eq('user_id', userToDelete.id);
      if (error) throw error;

      const updatedUsers = users.filter((u) => u.id !== userToDelete.id);
      setUsers(updatedUsers);
      setDeleteConfirmOpen(false);
      toast.success('User suspended successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to suspend user';
      setDeleteError(message);
      console.error(err);
    }
  };

  const handleDeleteProject = async (projectId: string, projectTitle: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${projectTitle}" from the marketplace?`)) {
      return;
    }
    try {
      const { error } = await supabase.from('projects').delete().eq('id', projectId);
      if (error) throw error;
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      toast.success(`Project "${projectTitle}" deleted successfully`);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Failed to delete project';
      toast.error(message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
    setUsers([]);
    setPayments([]);
    navigate('/');
  };

  // Filtered Payments
  const filteredPayments = payments.filter((p) => {
    const matchesFilter = paymentFilter === 'all' || p.status === paymentFilter;
    const searchLower = paymentSearch.toLowerCase();
    const matchesSearch =
      !paymentSearch ||
      p.id.toLowerCase().includes(searchLower) ||
      (p.profiles?.full_name && p.profiles.full_name.toLowerCase().includes(searchLower)) ||
      (p.razorpay_payment_id && p.razorpay_payment_id.toLowerCase().includes(searchLower)) ||
      p.plan.toLowerCase().includes(searchLower);

    return matchesFilter && matchesSearch;
  });

  // Filtered Users
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.seller_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || user.category === selectedCategory;
    const matchesType = selectedOperatingType === 'all' || user.operating_type === selectedOperatingType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const categoryDropdownItems = [
    { name: 'All Categories', id: 'all' },
    ...CATEGORIES.map((cat) => ({ name: `${cat.emoji} ${cat.name}`, id: cat.name })),
  ];

  const typeDropdownItems = [
    { name: 'All Types', id: 'all' },
    { name: '🏪 Shop', id: 'shop' },
    { name: '🏠 Home / Remote', id: 'home' },
  ];

  // ── Login Gate (When Not Authenticated) ──
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-slate-900 border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-primary to-amber-500" />

          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 text-primary">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Spotgig Admin Console</h1>
            <p className="text-sm text-slate-400 mt-1">Platform Control & Income Oversight</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Administrator Email
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@spotgig.com"
                className="bg-slate-950/70 border-slate-800 text-white placeholder:text-slate-500 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Admin Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="bg-slate-950/70 border-slate-800 text-white placeholder:text-slate-500 pr-10 focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 mt-2 transition-all shadow-lg shadow-primary/20"
            >
              {loading ? 'Authenticating...' : 'Sign In as Administrator'}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-500">
              🔒 Unexposed entrypoint (<code className="text-slate-400">/adminauth</code>).
              Protected by database kernel role enforcement.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // ── Authenticated Admin Console ──
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Bar */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">Spotgig Admin Console</h1>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                  PROD
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Logged in as <span className="text-slate-200 font-medium">{currentAdminEmail}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAdminData}
              disabled={dataLoading}
              className="border-slate-800 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-2 ${dataLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-900/40 text-red-400 hover:bg-red-950/40 hover:text-red-300"
                >
                  <LogOut className="w-3.5 h-3.5 mr-2" />
                  Logout
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Admin Logout</AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-400">
                    Are you sure you want to exit the admin dashboard? You will need your master
                    credentials to log back in.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex gap-3 justify-end mt-4">
                  <AlertDialogCancel className="bg-slate-800 text-slate-300 border-slate-700">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Logout
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </header>

        {/* Global Key Metrics Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Revenue */}
          <Card className="bg-slate-900 border-slate-800 p-5 relative overflow-hidden">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Income (INR)
              </span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-emerald-400">
              ₹{totalRevenue.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>{payments.filter((p) => p.status === 'paid').length} completed transactions</span>
            </div>
          </Card>

          {/* Gateway Status Card */}
          <Card className="bg-slate-900 border-slate-800 p-5 relative overflow-hidden">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Payment Gateway
              </span>
              <div
                className={`p-2 rounded-lg ${
                  platformSettings.payment_gateway_enabled
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-amber-500/10 text-amber-400'
                }`}
              >
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  platformSettings.payment_gateway_enabled ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="text-xl font-bold text-white">
                {platformSettings.payment_gateway_enabled ? 'Active (Paid Mode)' : 'Paused (100% Free)'}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-2">
              {platformSettings.payment_gateway_enabled
                ? 'Charges enforced after free limit'
                : 'Platform is totally free for all users'}
            </div>
          </Card>

          {/* Monetization Rule */}
          <Card className="bg-slate-900 border-slate-800 p-5 relative overflow-hidden">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Free Client Policy
              </span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Settings2 className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-blue-400">
              {platformSettings.free_client_limit} Free Client
              {platformSettings.free_client_limit === 1 ? '' : 's'}
            </div>
            <div className="text-xs text-slate-400 mt-2">
              {platformSettings.payment_gateway_enabled
                ? 'Subsequent clients require unlock / plan'
                : 'Free limit dormant while gateway paused'}
            </div>
          </Card>

          {/* Total Projects / Talent */}
          <Card className="bg-slate-900 border-slate-800 p-5 relative overflow-hidden">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Platform Activity
              </span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-purple-400">{projects.length} Projects</div>
            <div className="text-xs text-slate-400 mt-2">
              {users.length} active registered sellers/talent
            </div>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 gap-2">
          <button
            onClick={() => setActiveTab('income')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'income'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Income & Gateway Control
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'projects'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            Projects ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'users'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Sellers & Moderation ({users.length})
          </button>
        </div>

        {/* ── TAB 1: Income & Gateway Control ── */}
        {activeTab === 'income' && (
          <div className="space-y-6">
            {/* Gateway Controller Banner */}
            <Card className="bg-slate-900 border-slate-800 p-6 relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs uppercase font-mono px-2 py-0.5 rounded ${
                        platformSettings.payment_gateway_enabled
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {platformSettings.payment_gateway_enabled ? 'STATUS: PAID GATEWAY ACTIVE' : 'STATUS: 100% FREE MODE'}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white">Payment Gateway Master Switch</h2>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {platformSettings.payment_gateway_enabled
                      ? 'The gateway is currently active. Users will be prompted to purchase a plan or unlock once they exceed the free client threshold.'
                      : 'The gateway is currently PAUSED. All project posting, client discovery, and developer collaborations are 100% free with zero paywalls.'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleTogglePaymentGateway}
                    disabled={savingSettings}
                    size="lg"
                    className={`font-semibold shadow-xl transition-all ${
                      platformSettings.payment_gateway_enabled
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {platformSettings.payment_gateway_enabled ? (
                      <>
                        <PauseCircle className="w-5 h-5 mr-2" />
                        Pause Gateway (Make Platform Free)
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-5 h-5 mr-2" />
                        Start Gateway (Enable Paid Monetization)
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Monetization Rule Configuration */}
              <form
                onSubmit={handleSaveMonetizationConfig}
                className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end"
              >
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Free Client / Project Limit
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    value={freeClientLimitInput}
                    onChange={(e) => setFreeClientLimitInput(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Free client projects allowed before charging</p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Monthly Plan Fee (₹ INR)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={monthlyPriceInput}
                    onChange={(e) => setMonthlyPriceInput(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Monthly subscription fee per user</p>
                </div>

                <div>
                  <Button
                    type="submit"
                    disabled={savingSettings}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 h-10"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Monetization Rules
                  </Button>
                </div>
              </form>
            </Card>

            {/* Income Transactions Ledger */}
            <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Platform Income & Payments Ledger</h3>
                  <p className="text-xs text-slate-400">
                    Live transaction stream from the database payments table
                  </p>
                </div>

                {/* Filter and Search */}
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="Search transactions..."
                      value={paymentSearch}
                      onChange={(e) => setPaymentSearch(e.target.value)}
                      className="pl-8 bg-slate-950 border-slate-800 text-white text-xs h-9"
                    />
                  </div>

                  <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                    {(['all', 'paid', 'pending', 'failed'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setPaymentFilter(status)}
                        className={`px-2.5 py-1 text-xs rounded font-medium capitalize transition-colors ${
                          paymentFilter === status
                            ? 'bg-primary text-primary-foreground'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {filteredPayments.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
                  <CreditCard className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-300">No payment transactions recorded yet</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Payments made via Razorpay or unlocked client milestones will automatically record
                    here in real-time.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-950/60 border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Date & Time</th>
                        <th className="py-3 px-4">User / Payer</th>
                        <th className="py-3 px-4">Plan / Type</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Razorpay ID</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredPayments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-800/40">
                          <td className="py-3 px-4 text-xs text-slate-400 whitespace-nowrap">
                            {new Date(p.created_at).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </td>
                          <td className="py-3 px-4 font-medium text-white">
                            {p.profiles?.full_name || 'Member'}
                            {p.profiles?.phone && (
                              <span className="block text-[11px] text-slate-400 font-mono">
                                {p.profiles.phone}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-xs capitalize text-slate-300">
                            {p.plan.replace('_', ' ')}
                          </td>
                          <td className="py-3 px-4 font-bold text-emerald-400">
                            ₹{Number(p.amount).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-xs font-mono text-slate-400">
                            {p.razorpay_payment_id || p.razorpay_order_id || '—'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                p.status === 'paid'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : p.status === 'pending'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}
                            >
                              {p.status === 'paid' && <CheckCircle2 className="w-3 h-3" />}
                              {p.status === 'pending' && <Clock className="w-3 h-3" />}
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ── TAB 2: Projects ── */}
        {activeTab === 'projects' && (
          <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white">Global Marketplace Projects</h3>
              <p className="text-xs text-slate-400">
                Live requirements posted by clients and business owners anywhere
              </p>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-12 text-slate-500">No projects found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-950/60 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Project Title</th>
                      <th className="py-3 px-4">Client / Owner</th>
                      <th className="py-3 px-4">Compensation</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Created</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {projects.map((proj) => (
                      <tr key={proj.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-medium text-white">{proj.title}</td>
                        <td className="py-3 px-4 text-xs text-slate-300">{proj.owner_name}</td>
                        <td className="py-3 px-4 text-xs text-slate-300">
                          {proj.compensation_amount
                            ? `₹${proj.compensation_amount.toLocaleString()} (${proj.compensation_type})`
                            : proj.compensation_type}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase">
                            {proj.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-400">
                          {new Date(proj.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleDeleteProject(proj.id, proj.title)}
                            className="px-2.5 py-1 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold inline-flex items-center gap-1 transition"
                            title="Delete Project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* ── TAB 3: Users & Sellers Moderation ── */}
        {activeTab === 'users' && (
          <Card className="bg-slate-900 border-slate-800 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">Talent & Seller Management</h3>
                <p className="text-xs text-slate-400">
                  Manage registered sellers, verify authenticity, and suspend accounts
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-60">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 bg-slate-950 border-slate-800 text-white text-xs h-9"
                  />
                </div>

                <div className="w-40">
                  <AnimatedDropdown
                    items={categoryDropdownItems}
                    text="Category"
                    selectedId={selectedCategory}
                    onSelect={(item) => setSelectedCategory(item.id)}
                    className="w-full text-xs"
                  />
                </div>

                <div className="w-36">
                  <AnimatedDropdown
                    items={typeDropdownItems}
                    text="Type"
                    selectedId={selectedOperatingType}
                    onSelect={(item) => setSelectedOperatingType(item.id as 'all' | 'home' | 'shop')}
                    className="w-full text-xs"
                  />
                </div>
              </div>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-slate-500">No sellers matching filter</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-950/60 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Seller Name</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4 text-center">Listings</th>
                      <th className="py-3 px-4 text-center">Plan</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    <AnimatePresence mode="popLayout">
                      {filteredUsers.map((user) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="hover:bg-slate-800/40"
                        >
                          <td className="py-3 px-4 font-medium text-white">{user.seller_name}</td>
                          <td className="py-3 px-4 text-xs text-slate-300">{user.category}</td>
                          <td className="py-3 px-4">
                            <span className="flex items-center gap-1.5 text-xs text-slate-300">
                              {user.operating_type === 'shop' ? (
                                <>
                                  <Store className="w-3.5 h-3.5 text-blue-400" /> Shop
                                </>
                              ) : (
                                <>
                                  <Home className="w-3.5 h-3.5 text-emerald-400" /> Remote
                                </>
                              )}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-xs text-slate-400">
                            {user.listings.length}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 uppercase">
                              {user.membershipType}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <AlertDialog
                              open={deleteConfirmOpen && selectedUser?.id === user.id}
                            >
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setDeleteConfirmOpen(true);
                                    setBusinessNameConfirm('');
                                    setDeleteError('');
                                  }}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-950/40 h-8 w-8 p-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Suspend Seller Account</AlertDialogTitle>
                                  <AlertDialogDescription className="text-slate-400">
                                    To suspend{' '}
                                    <strong className="text-white">{user.seller_name}</strong>,
                                    type their name below to confirm.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>

                                <div className="my-4">
                                  <Input
                                    value={businessNameConfirm}
                                    onChange={(e) => {
                                      setBusinessNameConfirm(e.target.value);
                                      setDeleteError('');
                                    }}
                                    placeholder={user.seller_name}
                                    className="bg-slate-950 border-slate-800 text-white"
                                  />
                                  {deleteError && (
                                    <p className="text-red-400 text-xs mt-1">{deleteError}</p>
                                  )}
                                </div>

                                <div className="flex gap-3 justify-end">
                                  <AlertDialogCancel
                                    onClick={() => setDeleteConfirmOpen(false)}
                                    className="bg-slate-800 text-slate-300 border-slate-700"
                                  >
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => {
                                      if (
                                        businessNameConfirm.toLowerCase() ===
                                        user.seller_name.toLowerCase()
                                      ) {
                                        handleDeleteUser(user);
                                      } else {
                                        setDeleteError('Name does not match');
                                      }
                                    }}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                  >
                                    Confirm Suspend
                                  </AlertDialogAction>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
