import { supabase } from '@/lib/supabase';

export interface PlatformSettings {
  id: string;
  payment_gateway_enabled: boolean;
  free_client_limit: number;
  platform_fee_percent: number;
  monthly_plan_price: number;
  yearly_plan_price?: number;
  announcement_banner: string;
  updated_at: string;
  updated_by?: string | null;
}

export interface AdminFinancialSummary {
  total_income: number;
  paid_transactions_count: number;
  pending_transactions_count: number;
  total_users: number;
  total_projects: number;
  payment_gateway_enabled: boolean;
  free_client_limit: number;
}

export interface PaymentRecord {
  id: string;
  user_id: string;
  project_id?: string | null;
  listing_id?: string | null;
  amount: number;
  plan: string;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  status: 'paid' | 'pending' | 'failed';
  notes?: string | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
  } | null;
}

/**
 * Fetch platform monetization settings (Publicly readable)
 */
export async function getPlatformSettings(): Promise<PlatformSettings> {
  const { data, error } = await supabase
    .from('platform_settings')
    .select('*')
    .eq('id', 'global')
    .maybeSingle();

  if (error || !data) {
    // Return safe default if not yet seeded
    return {
      id: 'global',
      payment_gateway_enabled: false, // Default to FREE
      free_client_limit: 1,
      platform_fee_percent: 0,
      monthly_plan_price: 10000,
      yearly_plan_price: 120000,
      announcement_banner: '',
      updated_at: new Date().toISOString(),
    };
  }

  return data as PlatformSettings;
}

/**
 * Update platform monetization settings (Admin only)
 */
export async function updatePlatformSettings(
  updates: Partial<PlatformSettings>
): Promise<PlatformSettings> {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('platform_settings')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
      updated_by: user?.id ?? null,
    })
    .eq('id', 'global')
    .select()
    .single();

  if (error) throw error;
  return data as PlatformSettings;
}

/**
 * Fetch all payments for admin oversight
 */
export async function getAdminPayments(): Promise<PaymentRecord[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*, profiles(full_name, phone, avatar_url)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching admin payments:', error);
    return [];
  }

  return (data || []) as unknown as PaymentRecord[];
}

/**
 * Get aggregated income & dashboard statistics
 */
export async function getAdminFinancialStats(): Promise<AdminFinancialSummary> {
  // Try RPC first for server-side aggregation
  const { data, error } = await supabase.rpc('get_admin_financial_summary');

  if (!error && data) {
    return data as AdminFinancialSummary;
  }

  // Client-side fallback calculation
  const [payments, settings, profilesRes, projectsRes] = await Promise.all([
    getAdminPayments(),
    getPlatformSettings(),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('projects').select('id', { count: 'exact', head: true }),
  ]);

  const paidPayments = payments.filter((p) => p.status === 'paid');
  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const totalIncome = paidPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return {
    total_income: totalIncome,
    paid_transactions_count: paidPayments.length,
    pending_transactions_count: pendingPayments.length,
    total_users: profilesRes.count ?? 0,
    total_projects: projectsRes.count ?? 0,
    payment_gateway_enabled: settings.payment_gateway_enabled,
    free_client_limit: settings.free_client_limit,
  };
}

export interface UserMonetizationStatus {
  canProceed: boolean;
  requiresPayment: boolean;
  isPlatformFree: boolean;
  freeLimit: number;
  completedClientsCount: number;
  message: string;
}

/**
 * Checks whether a user can proceed with client/project discovery & work:
 * 1. If admin turned payment gateway OFF: 100% Free for ALL users (new & previous trial users).
 * 2. If payment gateway is ON: Active monthly subscribers OR users within their free trial limit (e.g. 1st client free).
 * 3. If trial is exhausted: requires monthly subscription.
 */
export async function checkUserMonetizationStatus(userId?: string): Promise<UserMonetizationStatus> {
  const settings = await getPlatformSettings();

  // 1. If gateway is paused/toggled off: EVERYTHING IS 100% FREE!
  if (!settings.payment_gateway_enabled) {
    return {
      canProceed: true,
      requiresPayment: false,
      isPlatformFree: true,
      freeLimit: settings.free_client_limit,
      completedClientsCount: 0,
      message: 'Platform Free Mode: All features are currently 100% free.',
    };
  }

  if (!userId) {
    return {
      canProceed: false,
      requiresPayment: true,
      isPlatformFree: false,
      freeLimit: settings.free_client_limit,
      completedClientsCount: 0,
      message: 'Sign in to check account status.',
    };
  }

  // 2. Check if user has an active paid monthly subscription
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: activePayment } = await supabase
    .from('payments')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'paid')
    .gte('created_at', thirtyDaysAgo)
    .limit(1);

  if (activePayment && activePayment.length > 0) {
    return {
      canProceed: true,
      requiresPayment: false,
      isPlatformFree: false,
      freeLimit: settings.free_client_limit,
      completedClientsCount: 0,
      message: 'Active monthly subscription.',
    };
  }

  // 3. User is NOT paying monthly: Check how many client projects they have accepted
  const { count: acceptedCount } = await supabase
    .from('project_requests')
    .select('id', { count: 'exact', head: true })
    .eq('developer_id', userId)
    .eq('status', 'accepted');

  const count = acceptedCount ?? 0;
  const freeLimit = settings.free_client_limit ?? 1;

  // New user or within free client trial limit:
  if (count < freeLimit) {
    return {
      canProceed: true,
      requiresPayment: false,
      isPlatformFree: false,
      freeLimit,
      completedClientsCount: count,
      message: `Free trial active (${count} of ${freeLimit} free client project${freeLimit > 1 ? 's' : ''} used).`,
    };
  }

  // Trial limit reached:
  return {
    canProceed: false,
    requiresPayment: true,
    isPlatformFree: false,
    freeLimit,
    completedClientsCount: count,
    message: `You have completed ${count} free client project${count > 1 ? 's' : ''}. Subscribe to the monthly plan (₹${Math.round(settings.monthly_plan_price / 100)}/mo) to unlock additional clients.`,
  };
}

export interface ProjectComment {
  id: string;
  project_id: string;
  user_id: string;
  message: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
    headline: string | null;
    skills: string[];
  } | null;
}

/**
 * Fetch all candidate pitch comments for a project
 */
export async function fetchProjectComments(projectId: string): Promise<ProjectComment[]> {
  const { data, error } = await supabase
    .from('project_comments')
    .select('*, profiles(full_name, avatar_url, headline, skills)')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching project comments:', error);
    return [];
  }
  return (data || []) as unknown as ProjectComment[];
}

/**
 * Submit candidate pitch/message on a project (strictly 1 message per account)
 */
export async function submitProjectComment(projectId: string, message: string): Promise<ProjectComment> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be signed in to leave a message.');

  const { data, error } = await supabase
    .from('project_comments')
    .insert({
      project_id: projectId,
      user_id: user.id,
      message: message.trim(),
    })
    .select('*, profiles(full_name, avatar_url, headline, skills)')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('You have already submitted a message for this project (Limit: 1 message per account).');
    }
    throw error;
  }
  return data as unknown as ProjectComment;
}

