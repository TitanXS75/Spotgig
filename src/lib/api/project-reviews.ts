import { supabase } from '@/lib/supabase';
import type { ProjectReview, ProjectReviewInsert } from '@/lib/db-types';

export interface ProjectReviewWithProfiles extends ProjectReview {
  reviewer?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role: string;
    organization?: string | null;
  };
  project?: {
    id: string;
    title: string;
    slug: string;
    category: string;
    industry: string;
  };
}

/**
 * Submit a verified review for a completed project.
 */
export async function submitProjectReview(
  reviewData: Omit<ProjectReviewInsert, 'reviewer_id'>
): Promise<ProjectReview> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('project_reviews')
    .insert({
      ...reviewData,
      reviewer_id: user.id,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('You have already submitted a review for this participant on this project.');
    }
    throw error;
  }

  return data as ProjectReview;
}

/**
 * Fetch reviews submitted for a specific project.
 */
export async function getProjectReviews(projectId: string): Promise<ProjectReviewWithProfiles[]> {
  const { data, error } = await supabase
    .from('project_reviews')
    .select('*, reviewer:profiles!reviewer_id(id, full_name, avatar_url, role, organization)')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as ProjectReviewWithProfiles[];
}

/**
 * Fetch all verified reviews and testimonials received by a user (powers public profile reputation).
 */
export async function getUserProjectReviews(userId: string): Promise<ProjectReviewWithProfiles[]> {
  const { data, error } = await supabase
    .from('project_reviews')
    .select('*, reviewer:profiles!reviewer_id(id, full_name, avatar_url, role, organization), project:projects!project_id(id, title, slug, category, industry)')
    .eq('reviewee_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as ProjectReviewWithProfiles[];
}

/**
 * Officially complete the project and sign off as the Project Owner.
 * Updates project status to 'completed'.
 */
export async function completeProjectAndSignOff(projectId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('projects')
    .update({ 
      status: 'completed',
      updated_at: new Date().toISOString()
    })
    .eq('id', projectId)
    .eq('owner_id', user.id);

  if (error) throw error;
}
