import { supabase } from '@/lib/supabase';
import type { 
  Project, 
  ProjectInsert, 
  ProjectUpdate, 
  ProjectRequirements,
  ProjectDifficulty,
  LocationPreference,
  CompensationType 
} from '@/lib/db-types';

export interface ProjectFilters {
  category?: string;
  industry?: string;
  difficulty?: ProjectDifficulty;
  locationType?: LocationPreference;
  compensationType?: CompensationType;
  query?: string;
  limit?: number;
}

/**
 * Fetch public projects for discovery feed.
 * Never returns private requirements.
 */
export async function fetchProjects(filters?: ProjectFilters): Promise<Project[]> {
  let query = supabase
    .from('projects')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (filters?.category) query = query.eq('category', filters.category);
  if (filters?.industry) query = query.eq('industry', filters.industry);
  if (filters?.difficulty) query = query.eq('difficulty', filters.difficulty);
  if (filters?.locationType) query = query.eq('location_type', filters.locationType);
  if (filters?.compensationType) query = query.eq('compensation_type', filters.compensationType);
  if (filters?.limit) query = query.limit(filters.limit);

  if (filters?.query) {
    const q = filters.query.trim();
    query = query.or(`title.ilike.%${q}%,public_summary.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as Project[];
}

/**
 * Fetch a single project by ID or unique slug.
 * Increments view counter.
 */
export async function fetchProjectById(idOrSlug: string): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .select('*, profiles!owner_id(full_name, avatar_url, organization, role)')
    .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
    .single();

  if (error) throw error;

  // Increment view count in background
  if (data?.id) {
    supabase
      .from('projects')
      .update({ views: (data.views ?? 0) + 1 })
      .eq('id', data.id)
      .then(() => {});
  }

  return data as Project;
}

/**
 * Fetch protected private requirements for a project.
 * RLS ensures ONLY the owner or approved developers can retrieve this.
 */
export async function fetchProjectRequirements(projectId: string): Promise<ProjectRequirements | null> {
  const { data, error } = await supabase
    .from('project_requirements')
    .select('*')
    .eq('project_id', projectId)
    .maybeSingle();

  if (error) {
    // RLS permission denied or not found
    return null;
  }

  return data as ProjectRequirements | null;
}

/**
 * Create a new project along with its protected private requirements.
 */
export async function createProject(
  projectData: Omit<ProjectInsert, 'owner_id'>,
  privateRequirements: {
    detailed_requirements: string;
    feature_list?: string;
    confidential_notes?: string;
    attachments?: string[];
  }
): Promise<Project> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('You must be signed in to post a project.');

  // 1. Insert into projects
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      ...projectData,
      owner_id: user.id,
    })
    .select()
    .single();

  if (projectError) throw projectError;

  // 2. Insert into protected project_requirements
  const { error: reqError } = await supabase
    .from('project_requirements')
    .insert({
      project_id: project.id,
      detailed_requirements: privateRequirements.detailed_requirements,
      feature_list: privateRequirements.feature_list || null,
      confidential_notes: privateRequirements.confidential_notes || null,
      attachments: privateRequirements.attachments || [],
    });

  if (reqError) {
    console.error('Failed to save project requirements:', reqError);
  }

  return project as Project;
}

/**
 * Update project details and optionally private requirements.
 */
export async function updateProject(
  id: string,
  projectUpdate: ProjectUpdate,
  privateRequirementsUpdate?: Partial<ProjectRequirements>
): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update(projectUpdate)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  if (privateRequirementsUpdate) {
    await supabase
      .from('project_requirements')
      .update(privateRequirementsUpdate)
      .eq('project_id', id);
  }

  return data as Project;
}

/**
 * Delete a project. Cascades to requirements, requests, and access tables.
 */
export async function deleteProject(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

/**
 * Fetch all projects created by the authenticated professional.
 */
export async function getMyProjects(): Promise<Project[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Project[];
}

/**
 * Fetch project along with its private requirements (only succeeds if owner or approved).
 */
export async function getProjectWithRequirements(id: string): Promise<{
  project: Project;
  requirements: ProjectRequirements | null;
}> {
  const project = await fetchProjectById(id);
  const requirements = await fetchProjectRequirements(project.id);
  return { project, requirements };
}

/**
 * Update project status (e.g., publish, unpublish/draft, completed, archived).
 */
export async function updateProjectStatus(
  id: string, 
  status: 'draft' | 'published' | 'in_progress' | 'completed' | 'archived'
): Promise<Project> {
  return updateProject(id, { status });
}
