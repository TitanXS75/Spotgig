import { supabase } from '@/lib/supabase';
import type { ProjectRequest, ProjectAccess, RequestStatus, CompensationType, LocationPreference, ProjectDifficulty, ProjectStatus } from '@/lib/db-types';

export interface ProjectRequestWithDetails extends ProjectRequest {
  projects?: {
    id: string;
    title: string;
    slug: string;
    category: string;
    industry: string;
    difficulty: ProjectDifficulty;
    duration: string;
    compensation_type: CompensationType;
    compensation_amount: number | null;
    location_type: LocationPreference;
    status: ProjectStatus;
    public_summary?: string;
    required_skills?: string[];
  };
  profiles?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    headline: string | null;
    bio: string | null;
    skills: string[];
    technologies: string[];
    experience_level: ProjectDifficulty;
    github_url: string | null;
    portfolio_url: string | null;
    linkedin_url: string | null;
    education: string | null;
    availability: string;
  };
}

/**
 * Submit an access request for a project as an emerging developer.
 */
export async function submitProjectRequest(projectId: string, message: string): Promise<ProjectRequest> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be signed in to request access.');

  const { data, error } = await supabase
    .from('project_requests')
    .insert({
      project_id: projectId,
      developer_id: user.id,
      message: message.trim(),
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('You have already submitted a request for this project.');
    }
    throw error;
  }

  return data as ProjectRequest;
}

/**
 * Cancel/withdraw an active request submitted by the logged-in developer.
 */
export async function cancelProjectRequest(requestId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('project_requests')
    .update({ status: 'cancelled' })
    .eq('id', requestId)
    .eq('developer_id', user.id);

  if (error) throw error;
}

/**
 * Get all requests submitted by the logged-in developer.
 */
export async function getMyProjectRequests(): Promise<ProjectRequestWithDetails[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('project_requests')
    .select('*, projects(id, title, slug, category, industry, difficulty, duration, compensation_type, compensation_amount, location_type, status, public_summary, required_skills)')
    .eq('developer_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as ProjectRequestWithDetails[];
}

/**
 * Get incoming requests for the project owner's projects.
 */
export async function getProjectRequestsForOwner(projectId?: string): Promise<ProjectRequestWithDetails[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  let query = supabase
    .from('project_requests')
    .select('*, projects!inner(id, title, slug, owner_id), profiles!developer_id(id, full_name, avatar_url, headline, bio, skills, technologies, experience_level, github_url, portfolio_url, linkedin_url, education, availability)')
    .eq('projects.owner_id', user.id)
    .order('created_at', { ascending: false });

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as ProjectRequestWithDetails[];
}

/**
 * Respond to a developer's request (accept or reject).
 * If accepted, grants access in project_access.
 */
export async function respondToProjectRequest(
  requestId: string,
  projectId: string,
  developerId: string,
  newStatus: 'accepted' | 'rejected'
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // 1. Update the request status
  const { error: updateError } = await supabase
    .from('project_requests')
    .update({ status: newStatus })
    .eq('id', requestId);

  if (updateError) throw updateError;

  // 2. If accepted, create/upsert entry in project_access
  if (newStatus === 'accepted') {
    const { error: accessError } = await supabase
      .from('project_access')
      .upsert({
        project_id: projectId,
        developer_id: developerId,
        access_level: 'view_requirements',
        granted_by: user.id,
        revoked_at: null,
      }, { onConflict: 'project_id,developer_id' });

    if (accessError) throw accessError;
  } else if (newStatus === 'rejected') {
    // Revoke access if it was previously granted
    await supabase
      .from('project_access')
      .update({ revoked_at: new Date().toISOString() })
      .eq('project_id', projectId)
      .eq('developer_id', developerId);
  }
}

/**
 * Check if the currently logged in user has approved access to a project.
 */
export async function checkProjectAccess(projectId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .from('project_access')
    .select('id')
    .eq('project_id', projectId)
    .eq('developer_id', user.id)
    .is('revoked_at', null)
    .maybeSingle();

  if (error || !data) return false;
  return true;
}

/**
 * Check user's request status for a project ('pending' | 'accepted' | 'rejected' | null).
 */
export async function getMyRequestStatusForProject(projectId: string): Promise<RequestStatus | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('project_requests')
    .select('status')
    .eq('project_id', projectId)
    .eq('developer_id', user.id)
    .maybeSingle();

  if (error || !data) return null;
  return data.status as RequestStatus;
}
