import { supabase } from '@/lib/supabase';
import type { Database, ProjectRole, ProjectDifficulty } from '@/lib/db-types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export interface UserStats {
  projectsCount: number;
  completedCount: number;
  pendingRequestsCount: number;
  acceptedRequestsCount: number;
}

/**
 * Fetch the currently authenticated user's complete profile.
 */
export async function getMyProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data as Profile;
}

/**
 * Update the currently authenticated user's profile.
 */
export async function updateMyProfile(updates: ProfileUpdate): Promise<Profile> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data as Profile;
}

/**
 * Get public profile of any user (developer or project owner) by their user ID.
 */
export async function getPublicProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching public profile:', error);
    return null;
  }
  return data as Profile;
}

/**
 * Fetch high-level statistics for a user's profile.
 */
export async function getUserStats(userId: string, role: ProjectRole = 'developer'): Promise<UserStats> {
  const stats: UserStats = {
    projectsCount: 0,
    completedCount: 0,
    pendingRequestsCount: 0,
    acceptedRequestsCount: 0,
  };

  try {
    if (role === 'project_owner') {
      // Fetch projects posted by this owner
      const { data: projects } = await supabase
        .from('projects')
        .select('id, status')
        .eq('owner_id', userId);

      if (projects) {
        stats.projectsCount = projects.length;
        stats.completedCount = projects.filter(p => p.status === 'completed').length;
      }

      // Fetch requests for owner's projects
      const { data: requests } = await supabase
        .from('project_requests')
        .select('id, status, projects!inner(owner_id)')
        .eq('projects.owner_id', userId);

      if (requests) {
        stats.pendingRequestsCount = requests.filter(r => r.status === 'pending').length;
        stats.acceptedRequestsCount = requests.filter(r => r.status === 'accepted').length;
      }
    } else {
      // Developer stats: requests submitted and accepted projects
      const { data: requests } = await supabase
        .from('project_requests')
        .select('id, status')
        .eq('developer_id', userId);

      if (requests) {
        stats.projectsCount = requests.length;
        stats.pendingRequestsCount = requests.filter(r => r.status === 'pending').length;
        stats.acceptedRequestsCount = requests.filter(r => r.status === 'accepted').length;
      }

      const { data: accessGrants } = await supabase
        .from('project_access')
        .select('id')
        .eq('developer_id', userId)
        .is('revoked_at', null);

      if (accessGrants) {
        stats.completedCount = accessGrants.length;
      }
    }
  } catch (err) {
    console.warn('Could not fetch user stats:', err);
  }

  return stats;
}
