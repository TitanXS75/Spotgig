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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Fetch a single project by ID or unique slug.
 * Increments view counter.
 */
export async function fetchProjectById(idOrSlug: string): Promise<Project> {
  const isUuid = UUID_REGEX.test(idOrSlug);
  let query = supabase
    .from('projects')
    .select('*, profiles!owner_id(full_name, avatar_url, organization, role)');

  if (isUuid) {
    query = query.or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`);
  } else {
    query = query.eq('slug', idOrSlug);
  }

  const { data, error } = await query.single();

  if (error) throw error;

  // Increment view count in background
  if (data?.id) {
    const rawData = data as unknown as Record<string, unknown>;
    const currentViews = typeof rawData.views_count === 'number' 
      ? rawData.views_count 
      : (typeof rawData.views === 'number' ? rawData.views : 0);
    const nextViews = currentViews + 1;

    supabase
      .from('projects')
      .update({ views_count: nextViews, views: nextViews })
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

  // Normalize location_type enum to strictly 'remote' | 'on_site' | 'hybrid'
  const locRaw = String(projectData.location_type || '').toLowerCase();
  let safeLocationType: LocationPreference = 'remote';
  if (locRaw === 'hybrid') safeLocationType = 'hybrid';
  else if (locRaw === 'on_site' || locRaw === 'on_premise' || locRaw === 'onsite' || locRaw === 'in_person') safeLocationType = 'on_site';

  // Normalize compensation_type enum to strictly 'paid' | 'stipend' | 'unpaid'
  const compRaw = String(projectData.compensation_type || '').toLowerCase();
  let safeCompensationType: CompensationType = 'paid';
  if (compRaw === 'stipend') safeCompensationType = 'stipend';
  else if (compRaw === 'unpaid') safeCompensationType = 'unpaid';

  // Normalize difficulty enum to strictly 'beginner' | 'intermediate' | 'advanced'
  const diffRaw = String(projectData.difficulty || '').toLowerCase();
  let safeDifficulty: ProjectDifficulty = 'intermediate';
  if (diffRaw === 'beginner') safeDifficulty = 'beginner';
  else if (diffRaw === 'advanced') safeDifficulty = 'advanced';

  // Normalize numeric compensation amount
  let safeAmount: number | null = null;
  if (safeCompensationType === 'paid' && projectData.compensation_amount != null) {
    const rawVal = projectData.compensation_amount;
    const parsed = typeof rawVal === 'number' ? rawVal : parseFloat(String(rawVal).replace(/[^0-9.]/g, ''));
    if (!isNaN(parsed) && parsed > 0) {
      safeAmount = parsed;
    }
  }

  // 1. Insert into projects
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .insert({
      ...projectData,
      location_type: safeLocationType,
      compensation_type: safeCompensationType,
      difficulty: safeDifficulty,
      compensation_amount: safeAmount,
      owner_id: user.id,
    })
    .select()
    .single();

  if (projectError) throw projectError;

  // 2. Insert into protected project_requirements
  const reqText = privateRequirements.detailed_requirements?.trim() || 'Detailed project deliverables to be specified by the owner.';
  const { error: reqError } = await supabase
    .from('project_requirements')
    .insert({
      project_id: project.id,
      detailed_requirements: reqText,
      feature_list: privateRequirements.feature_list?.trim() || null,
      confidential_notes: privateRequirements.confidential_notes?.trim() || null,
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
