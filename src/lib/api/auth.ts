import { supabase } from '@/lib/supabase';
import type { Database, ProjectRole } from '@/lib/db-types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

/** Sign up with email + password and role. A profile row is created via DB trigger. */
export async function signUp(
  email: string, 
  password: string, 
  fullName: string, 
  role: ProjectRole = 'developer'
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { 
      data: { 
        full_name: fullName,
        role: role,
      } 
    },
  });
  if (error) throw error;
  return data;
}

/** Sign in with email + password. */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/** Sign in via OTP (phone / WhatsApp number — +91XXXXXXXXXX format). */
export async function signInWithPhone(phone: string) {
  const { data, error } = await supabase.auth.signInWithOtp({ phone });
  if (error) throw error;
  return data;
}

/** Verify the OTP sent to phone. */
export async function verifyOtp(phone: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });
  if (error) throw error;
  return data;
}

/** Sign out the current user. */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** Get the currently authenticated user's profile. */
export async function getMyProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  if (error) throw error;
  return data as Profile;
}

/** Update profile fields. */
export async function updateProfile(updates: ProfileUpdate) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}

/** Update user password (used during password reset flow). */
export async function updatePassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  return data;
}

/** Send password reset email with redirect link. */
export async function resetPasswordForEmail(email: string, redirectTo?: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectTo || `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
  return data;
}

/** Listen to auth state changes (for context providers). */
export const onAuthStateChange = supabase.auth.onAuthStateChange.bind(supabase.auth);
