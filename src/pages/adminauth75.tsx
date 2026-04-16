import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import AnimatedDropdown from '@/components/ui/animated-dropdown';
import { Trash2, LogOut, Mail, Calendar, Search, Filter, Store, Home, Eye, EyeOff } from 'lucide-react';
import { CATEGORIES, type Listing } from '@/lib/mock-data';

// Admin email for display only — actual auth is verified via Supabase + is_admin flag
const ADMIN_EMAIL = 'sarthak.sontakke05@gmail.com';

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

interface CategoryStats {
  category: string;
  emoji: string;
  count: number;
  shops: number;
  homes: number;
  revenue: number;
}

export default function AdminAuth75() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [dataLoading, setDataLoading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [businessNameConfirm, setBusinessNameConfirm] = useState('');
  const [deleteError, setDeleteError] = useState('');
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedOperatingType, setSelectedOperatingType] = useState<'all' | 'home' | 'shop'>('all');
  const [selectedMembership, setSelectedMembership] = useState<'all' | 'monthly' | 'yearly'>('all');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Step 1: Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      alert('Invalid email or password.');
      setLoading(false);
      return;
    }

    // Step 2: Verify this user has is_admin = true in profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      await supabase.auth.signOut();
      alert('Access denied. You are not an admin.');
      setLoading(false);
      return;
    }

    setIsAuthenticated(true);
    fetchAdminData();
    setLoading(false);
  };

  // Debounced search effect
  useEffect(() => {
    // Only show loading if there's actual search text
    if (searchQuery.trim()) {
      setIsSearchLoading(true);
    }

    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setIsSearchLoading(false);
    }, 300); // 300ms delay

    return () => {
      clearTimeout(timer);
      setIsSearchLoading(false);
    };
  }, [searchQuery]);

  const fetchAdminData = async () => {
    setDataLoading(true);
    try {
      const { data: listings, error } = await supabase.from('listings').select('*').neq('status', 'suspended');
      if (error) throw error;
      
      // Transform listings into AdminUser format
      const usersMap: Record<string, AdminUser> = {};
      
      listings.forEach((listing: any) => {
        const userId = listing.user_id;
        if (!usersMap[userId]) {
          usersMap[userId] = {
            id: userId,
            seller_name: listing.seller_name,
            category: listing.category,
            operating_type: listing.operating_type,
            created_at: listing.created_at,
            location: listing.area,
            listings: [],
            membershipType: listing.plan === 'yearly' ? 'yearly' : 'monthly',
            revenue: 0,
          };
        }
        
        usersMap[userId].listings.push(listing);
        usersMap[userId].revenue += listing.plan === 'yearly' ? 1200 : 100;
        
        // Also keep track of membership visually
        if (listing.plan === 'yearly') {
          usersMap[userId].membershipType = 'yearly';
        }
      });
      
      const adminUsers = Object.values(usersMap);
      setUsers(adminUsers);
      calculateStats(adminUsers);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      alert('Error fetching data.');
    } finally {
      setDataLoading(false);
    }
  };

  const calculateStats = (data: AdminUser[]) => {
    const stats: { [key: string]: { count: number; shops: number; homes: number; revenue: number } } = {};
    let totalRev = 0;

    data.forEach((user) => {
      const category = user.category;
      if (!stats[category]) {
        stats[category] = { count: 0, shops: 0, homes: 0, revenue: 0 };
      }
      stats[category].count += 1;
      if (user.operating_type === 'shop') {
        stats[category].shops += 1;
      } else {
        stats[category].homes += 1;
      }
      stats[category].revenue += user.revenue;
      totalRev += user.revenue;
    });

    const statsArray = Object.entries(stats)
      .map(([categoryName, stat]) => {
        const categoryEmoji = CATEGORIES.find((cat) => cat.name === categoryName)?.emoji || '✨';
        return {
          category: categoryName,
          emoji: categoryEmoji,
          count: stat.count,
          shops: stat.shops,
          homes: stat.homes,
          revenue: stat.revenue,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);

    setCategoryStats(statsArray);
    setTotalRevenue(totalRev);
  };

  const handleDeleteUser = async (userToDelete: AdminUser) => {
    try {
      // Soft delete by suspending all their listings
      const { error } = await supabase.from('listings').update({ status: 'suspended' }).eq('user_id', userToDelete.id);
      if (error) throw error;
      
      const updatedUsers = users.filter((u) => u.id !== userToDelete.id);
      setUsers(updatedUsers);
      setDeleteConfirmOpen(false);
      calculateStats(updatedUsers);
      alert('User suspended successfully!');
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to suspend user');
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
    setUsers([]);
    setCategoryStats([]);
    setTotalRevenue(0);
    navigate('/');
  };

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.seller_name.toLowerCase().includes(debouncedSearchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || user.category === selectedCategory;
    const matchesType = selectedOperatingType === 'all' || user.operating_type === selectedOperatingType;
    return matchesSearch && matchesCategory && matchesType;
  });

  // Prepare dropdown data
  const categoryDropdownItems = [
    { name: 'All Categories', id: 'all' },
    ...CATEGORIES.map(cat => ({ name: `${cat.emoji} ${cat.name}`, id: cat.name }))
  ];

  const typeDropdownItems = [
    { name: 'All Types', id: 'all' },
    { name: '🏪 Shop', id: 'shop' },
    { name: '🏠 Home', id: 'home' }
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-card border-border shadow-lg">
          <div className="text-center mb-8">
            <img src="/aplg.png" alt="Aaspass Logo" className="h-12 w-auto mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
            <p className="text-muted-foreground">Secure Access Required</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="bg-muted border-border text-foreground"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="bg-muted border-border text-foreground pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground mt-6 text-center">
            🔒 Restricted. Authorised personnel only.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header - Logo and Logout */}
        <div className="flex justify-between items-center mb-12">
          <img src="/aplg.png" alt="Aaspass Logo" className="h-10 w-auto" />

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">Confirm Logout</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  Are you sure you want to logout? You will need to login again to access the admin panel.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex gap-3 justify-end">
                <AlertDialogCancel className="bg-muted text-foreground border-border">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleLogout}
                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  Logout
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Admin Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage sellers, view analytics, and monitor revenue</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border-border p-6">
            <div className="text-muted-foreground text-sm font-medium mb-2">Total Revenue</div>
            <div className="text-4xl font-bold text-primary">₹{totalRevenue.toLocaleString()}</div>
            <div className="text-muted-foreground text-xs mt-2">From all listings</div>
          </Card>

          <Card className="bg-card border-border p-6">
            <div className="text-muted-foreground text-sm font-medium mb-2">Total Sellers</div>
            <div className="text-4xl font-bold text-secondary">{users.length}</div>
            <div className="text-muted-foreground text-xs mt-2">Active sellers</div>
          </Card>

          <Card className="bg-card border-border p-6">
            <div className="text-muted-foreground text-sm font-medium mb-2">Shop Businesses</div>
            <div className="text-4xl font-bold text-secondary">{users.filter((u) => u.operating_type === 'shop').length}</div>
            <div className="text-muted-foreground text-xs mt-2">Physical locations</div>
            <div className="text-muted-foreground text-xs mt-3 pt-3 border-t border-border">
              {(() => {
                const shopListings = users.filter((u) => u.operating_type === 'shop').flatMap(u => u.listings);
                const products = shopListings.filter(l => l.type === 'product').length;
                const services = shopListings.filter(l => l.type === 'service').length;
                return <span>{products} products • {services} services</span>;
              })()}
            </div>
          </Card>

          <Card className="bg-card border-border p-6">
            <div className="text-muted-foreground text-sm font-medium mb-2">Home Businesses</div>
            <div className="text-4xl font-bold text-primary">{users.filter((u) => u.operating_type === 'home').length}</div>
            <div className="text-muted-foreground text-xs mt-2">Home based</div>
            <div className="text-muted-foreground text-xs mt-3 pt-3 border-t border-border">
              {(() => {
                const homeListings = users.filter((u) => u.operating_type === 'home').flatMap(u => u.listings);
                const products = homeListings.filter(l => l.type === 'product').length;
                const services = homeListings.filter(l => l.type === 'service').length;
                return <span>{products} products • {services} services</span>;
              })()}
            </div>
          </Card>
        </div>

        {/* Category Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-card border-border p-6">
            <h2 className="text-xl font-bold text-foreground mb-6">Sellers by Category</h2>
            <div className="space-y-4">
              {dataLoading ? (
                <div className="text-muted-foreground">Loading data...</div>
              ) : categoryStats.length > 0 ? (
                (() => {
                  const colorPalette = [
                    'from-[hsl(25,95%,53%)] to-orange-500',      // Orange
                    'from-[hsl(199,89%,48%)] to-blue-400',       // Service Blue (theme color)
                    'from-pink-500 to-pink-400',                 // Pink
                    'from-purple-500 to-purple-400',             // Purple
                    'from-cyan-500 to-cyan-400',                 // Cyan
                    'from-red-500 to-red-400',                   // Red
                    'from-green-500 to-green-400',               // Green
                    'from-amber-500 to-amber-400',               // Amber
                    'from-indigo-500 to-indigo-400',             // Indigo
                    'from-emerald-500 to-emerald-400',           // Emerald
                  ];

                  return categoryStats.map((stat, index) => (
                    <div key={stat.category} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground mb-1 flex items-center gap-2">
                          <span className="text-lg">{stat.emoji}</span>
                          {stat.category}
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`bg-gradient-to-r ${colorPalette[index % colorPalette.length]} h-2 rounded-full`}
                            style={{ width: `${(stat.count / users.length) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {stat.shops > 0 && <span>{stat.shops} shops</span>}
                          {stat.shops > 0 && stat.homes > 0 && <span> • </span>}
                          {stat.homes > 0 && <span>{stat.homes} homes</span>}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-foreground font-bold">{stat.count}</div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round((stat.count / users.length) * 100)}%
                        </div>
                      </div>
                    </div>
                  ));
                })()
              ) : (
                <p className="text-muted-foreground">No category data available</p>
              )}
            </div>
          </Card>

          {/* Revenue by Category */}
          <Card className="bg-card border-border p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Revenue by Category</h2>
              
              {/* Membership Filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedMembership('all')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                    selectedMembership === 'all'
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'bg-muted text-foreground hover:bg-accent'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedMembership('monthly')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                    selectedMembership === 'monthly'
                      ? 'bg-secondary text-secondary-foreground shadow-lg'
                      : 'bg-muted text-foreground hover:bg-accent'
                  }`}
                >
                  Monthly (₹100)
                </button>
                <button
                  onClick={() => setSelectedMembership('yearly')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                    selectedMembership === 'yearly'
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'bg-muted text-foreground hover:bg-accent'
                  }`}
                >
                  Yearly (₹1200)
                </button>
              </div>
            </div>

            {/* Filtered Revenue Data */}
            <div className="space-y-4">
              {categoryStats.length > 0 ? (
                (() => {
                  const filteredStats = categoryStats.map(stat => {
                    let filteredRevenue = 0;
                    users.forEach(user => {
                      if (stat.category === user.category) {
                        if (selectedMembership === 'all' || user.membershipType === selectedMembership) {
                          filteredRevenue += user.revenue;
                        }
                      }
                    });
                    return { ...stat, revenue: filteredRevenue };
                  }).filter(s => s.revenue > 0);

                  const maxRevenue = Math.max(...filteredStats.map((s) => s.revenue), 1);
                  
                  const colorPalette = [
                    'from-[hsl(25,95%,53%)] to-orange-500',      // Orange
                    'from-[hsl(199,89%,48%)] to-blue-400',       // Service Blue (theme color)
                    'from-pink-500 to-pink-400',                 // Pink
                    'from-purple-500 to-purple-400',             // Purple
                    'from-cyan-500 to-cyan-400',                 // Cyan
                    'from-red-500 to-red-400',                   // Red
                    'from-green-500 to-green-400',               // Green
                    'from-amber-500 to-amber-400',               // Amber
                    'from-indigo-500 to-indigo-400',             // Indigo
                    'from-emerald-500 to-emerald-400',           // Emerald
                  ];
                  
                  return filteredStats.map((stat, index) => (
                    <div key={`revenue-${stat.category}`} className="flex items-center gap-3">
                      <div className="text-lg min-w-fit">{stat.emoji}</div>
                      <div className="flex-1">
                        <div className="text-xs font-medium text-foreground mb-1">{stat.category}</div>
                        <div
                          className={`h-6 bg-gradient-to-r ${colorPalette[index % colorPalette.length]} rounded flex items-center px-2 transition-all duration-300`}
                          style={{ width: `${(stat.revenue / maxRevenue) * 100}%`, minWidth: '60px' }}
                        >
                          <span className="text-xs font-bold text-white">
                            ₹{stat.revenue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ));
                })()
              ) : (
                <p className="text-muted-foreground">No revenue data available</p>
              )}
            </div>
          </Card>
        </div>

        {/* Registered Sellers with Listings */}
        {/* Users Management Table */}
        <Card className="bg-card border-border p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Manage Sellers</h2>
            
            {/* Filters */}
            <div className="flex flex-col gap-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className={`absolute left-3 top-3 w-4 h-4 transition-colors duration-200 ${
                  isSearchLoading ? 'text-primary animate-pulse' : 'text-muted-foreground'
                }`} />
                <Input
                  type="text"
                  placeholder="Search seller name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 bg-muted border-border text-foreground transition-all duration-200 ${
                    isSearchLoading ? 'border-primary/50 shadow-sm' : ''
                  }`}
                />
                {isSearchLoading && (
                  <div className="absolute right-3 top-3">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* Filter Controls */}
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-foreground block mb-2">
                    <Filter className="w-3 h-3 inline mr-1" />
                    Category
                  </label>
                  <AnimatedDropdown
                    items={categoryDropdownItems}
                    text="Select Category"
                    selectedId={selectedCategory}
                    onSelect={(item) => setSelectedCategory(item.id)}
                    className="w-full"
                  />
                </div>

                <div className="flex-1">
                  <label className="text-xs font-semibold text-foreground block mb-2">
                    <Filter className="w-3 h-3 inline mr-1" />
                    Type
                  </label>
                  <AnimatedDropdown
                    items={typeDropdownItems}
                    text="Select Type"
                    selectedId={selectedOperatingType}
                    onSelect={(item) => setSelectedOperatingType(item.id as 'all' | 'home' | 'shop')}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {dataLoading ? (
            <div className="text-muted-foreground text-center py-8">
              Loading sellers...
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="relative overflow-x-auto">
              {isSearchLoading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Searching...</span>
                  </div>
                </div>
              )}
              <table className={`w-full text-sm transition-opacity duration-200 ${
                isSearchLoading ? 'opacity-50' : 'opacity-100'
              }`}>
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 text-foreground font-semibold">
                      Seller Name
                    </th>
                    <th className="text-left py-3 px-4 text-foreground font-semibold">
                      Category
                    </th>
                    <th className="text-left py-3 px-4 text-foreground font-semibold">
                      Type
                    </th>
                    <th className="text-center py-3 px-4 text-foreground font-semibold">
                      Listings
                    </th>
                    <th className="text-center py-3 px-4 text-foreground font-semibold">
                      Membership
                    </th>
                    <th className="text-center py-3 px-4 text-foreground font-semibold">
                      Revenue
                    </th>
                    <th className="text-center py-3 px-4 text-foreground font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {filteredUsers.map((user) => {
                      const categoryEmoji = CATEGORIES.find((cat) => cat.name === user.category)?.emoji || '✨';
                      return (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="border-b border-border hover:bg-muted"
                        >
                        <td className="py-3 px-4 text-foreground font-medium">
                          {user.seller_name}
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-primary/10 text-primary dark:bg-primary/20 px-2 py-1 rounded text-xs font-medium">
                            {categoryEmoji} {user.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="flex items-center gap-1">
                            {user.operating_type === 'shop' ? (
                              <>
                                <Store className="w-4 h-4 text-secondary" />
                                <span className="text-foreground">Shop</span>
                              </>
                            ) : (
                              <>
                                <Home className="w-4 h-4 text-primary" />
                                <span className="text-foreground">Home</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-muted-foreground">
                          {user.listings.length}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-3 py-1 rounded text-xs font-semibold ${
                            user.membershipType === 'yearly' 
                              ? 'bg-primary/10 text-primary dark:bg-primary/20'
                              : 'bg-secondary/10 text-secondary dark:bg-secondary/20'
                          }`}>
                            {user.membershipType === 'yearly' ? 'Yearly' : 'Monthly'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-foreground font-semibold">
                          ₹{user.revenue.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <AlertDialog open={deleteConfirmOpen && selectedUser?.id === user.id}>
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
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-card border-border">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-foreground">
                                  Delete Seller
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">
                                  To confirm deletion of{' '}
                                  <span className="font-bold text-foreground">
                                    {user.seller_name}
                                  </span>
                                  , please enter their name in the field below.
                                </AlertDialogDescription>
                              </AlertDialogHeader>

                              <div className="my-4">
                                <label className="block text-sm font-medium text-foreground mb-2">
                                  Seller Name
                                </label>
                                <Input
                                  type="text"
                                  value={businessNameConfirm}
                                  onChange={(e) => {
                                    setBusinessNameConfirm(e.target.value);
                                    setDeleteError('');
                                  }}
                                  placeholder={user.seller_name}
                                  className="bg-muted border-border text-foreground"
                                />
                                {deleteError && (
                                  <p className="text-destructive text-xs mt-2">
                                    {deleteError}
                                  </p>
                                )}
                              </div>

                              <div className="flex gap-3 justify-end">
                                <AlertDialogCancel
                                  onClick={() => {
                                    setDeleteConfirmOpen(false);
                                    setBusinessNameConfirm('');
                                    setDeleteError('');
                                  }}
                                  className="bg-muted text-foreground border-border"
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
                                  className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                >
                                  Delete Seller
                                </AlertDialogAction>
                              </div>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </motion.tr>
                    );
                  })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-muted-foreground text-center py-8">
              No sellers found matching your filters
            </div>
          )}

          {filteredUsers.length > 0 && (
            <div className="mt-4 text-xs text-muted-foreground">
              Showing {filteredUsers.length} of {users.length} sellers
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
