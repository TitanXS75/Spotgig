import { supabase } from '@/lib/supabase';
import type { 
  ProjectTask, 
  ProjectTaskInsert, 
  ProjectMessage, 
  ProjectDeliverable, 
  ProjectDeliverableInsert 
} from '@/lib/db-types';

export interface ProjectMessageWithSender extends ProjectMessage {
  profiles?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role: string;
  };
}

export interface ProjectDeliverableWithDeveloper extends ProjectDeliverable {
  profiles?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

// ── 1. Project Tasks & Milestones ─────────────────────────────

/**
 * Fetch all tasks and milestones for a project workspace.
 */
export async function getProjectTasks(projectId: string): Promise<ProjectTask[]> {
  const { data, error } = await supabase
    .from('project_tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []) as ProjectTask[];
}

/**
 * Create a new milestone task for the project workspace.
 */
export async function createProjectTask(
  projectId: string,
  title: string,
  description?: string
): Promise<ProjectTask> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('project_tasks')
    .insert({
      project_id: projectId,
      title: title.trim(),
      description: description?.trim() || null,
      created_by: user.id,
      is_completed: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data as ProjectTask;
}

/**
 * Toggle milestone completion status.
 */
export async function toggleProjectTask(taskId: string, isCompleted: boolean): Promise<ProjectTask> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('project_tasks')
    .update({
      is_completed: isCompleted,
      completed_by: isCompleted ? user.id : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;
  return data as ProjectTask;
}

/**
 * Delete a milestone task.
 */
export async function deleteProjectTask(taskId: string): Promise<void> {
  const { error } = await supabase
    .from('project_tasks')
    .delete()
    .eq('id', taskId);

  if (error) throw error;
}

// ── 2. Workspace Discussion / Messages ─────────────────────────

/**
 * Fetch workspace messages with sender profile information.
 */
export async function getProjectMessages(projectId: string): Promise<ProjectMessageWithSender[]> {
  const { data, error } = await supabase
    .from('project_messages')
    .select('*, profiles!sender_id(id, full_name, avatar_url, role)')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []) as ProjectMessageWithSender[];
}

/**
 * Send a message in the project workspace discussion.
 */
export async function sendProjectMessage(projectId: string, message: string): Promise<ProjectMessage> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('project_messages')
    .insert({
      project_id: projectId,
      sender_id: user.id,
      message: message.trim(),
      attachments: [],
    })
    .select()
    .single();

  if (error) throw error;
  return data as ProjectMessage;
}

// ── 3. Project Deliverables & Submission ───────────────────────

/**
 * Submit work for the project (GitHub repo URL, live demo, and release notes).
 */
export async function submitProjectDeliverable(
  projectId: string,
  deliverable: {
    github_repo_url?: string;
    live_demo_url?: string;
    notes: string;
  }
): Promise<ProjectDeliverable> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('project_deliverables')
    .insert({
      project_id: projectId,
      developer_id: user.id,
      github_repo_url: deliverable.github_repo_url?.trim() || null,
      live_demo_url: deliverable.live_demo_url?.trim() || null,
      notes: deliverable.notes.trim(),
      status: 'submitted',
    })
    .select()
    .single();

  if (error) throw error;
  return data as ProjectDeliverable;
}

/**
 * Fetch all deliverables submitted for this project.
 */
export async function getProjectDeliverables(projectId: string): Promise<ProjectDeliverableWithDeveloper[]> {
  const { data, error } = await supabase
    .from('project_deliverables')
    .select('*, profiles!developer_id(id, full_name, avatar_url)')
    .eq('project_id', projectId)
    .order('submitted_at', { ascending: false });

  if (error) throw error;
  return (data || []) as ProjectDeliverableWithDeveloper[];
}

/**
 * Update deliverable status (Owner can accept or request revisions).
 */
export async function updateDeliverableStatus(
  deliverableId: string,
  status: 'accepted' | 'revision_requested',
  reviewerNotes?: string
): Promise<ProjectDeliverable> {
  const { data, error } = await supabase
    .from('project_deliverables')
    .update({
      status,
      reviewer_notes: reviewerNotes?.trim() || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', deliverableId)
    .select()
    .single();

  if (error) throw error;
  return data as ProjectDeliverable;
}
