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
 * Update a task's title (inline edit).
 */
export async function updateProjectTask(taskId: string, title: string): Promise<ProjectTask> {
  const { data, error } = await supabase
    .from('project_tasks')
    .update({ title: title.trim(), updated_at: new Date().toISOString() })
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;
  return data as ProjectTask;
}

/**
 * Toggle milestone completion status.
 * Works with or without the workspace_fixes.sql migration (graceful fallback).
 */
export async function toggleProjectTask(taskId: string, isCompleted: boolean): Promise<ProjectTask> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Try with completed_by first (requires workspace_fixes.sql migration)
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

  // If completed_by column doesn't exist yet, retry without it
  if (error && (error.message?.includes('completed_by') || error.code === 'PGRST204')) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('project_tasks')
      .update({
        is_completed: isCompleted,
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .select()
      .single();
    if (fallbackError) throw fallbackError;
    return fallbackData as ProjectTask;
  }

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
    })
    .select()
    .single();

  if (error) throw error;
  return data as ProjectMessage;
}

/**
 * Subscribe to real-time messages for the project workspace.
 * Returns an unsubscribe function.
 */
export function subscribeToProjectMessages(
  projectId: string,
  onMessage: (msg: ProjectMessageWithSender) => void
): () => void {
  const channel = supabase
    .channel(`project-messages-${projectId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'project_messages',
        filter: `project_id=eq.${projectId}`,
      },
      async (payload) => {
        // Enrich with sender profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, role')
          .eq('id', payload.new.sender_id)
          .single();

        const msg = {
          ...payload.new,
          profiles: profile || undefined,
        } as ProjectMessageWithSender;

        onMessage(msg);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ── 3. Project Deliverables & Submission ───────────────────────

/**
 * Submit work for the project (GitHub repo URL, live demo, and release notes).
 */
export async function submitProjectDeliverable(
  projectId: string,
  deliverable: {
    title?: string;
    github_repo_url?: string;
    live_demo_url?: string;
    notes: string;
  }
): Promise<ProjectDeliverable> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const title = deliverable.title?.trim() || 'Deliverable Submission';
  const ghUrl = deliverable.github_repo_url?.trim() || null;
  const demoUrl = deliverable.live_demo_url?.trim() || null;
  const notes = deliverable.notes.trim();

  // Base payload using columns guaranteed to exist in setup.sql:
  // project_id, developer_id, title (NOT NULL), github_url, demo_url, notes, status
  const basePayload = {
    project_id: projectId,
    developer_id: user.id,
    title,
    github_url: ghUrl,
    demo_url: demoUrl,
    notes,
    status: 'submitted' as const,
  };

  const { data, error } = await supabase
    .from('project_deliverables')
    .insert(basePayload)
    .select()
    .single();

  if (error) {
    console.error('Failed to submit deliverable:', error);
    throw error;
  }

  // Best-effort: if workspace_fixes.sql migration was run, backfill extra columns
  if (data?.id) {
    try {
      await supabase
        .from('project_deliverables')
        .update({
          github_repo_url: ghUrl,
          live_demo_url: demoUrl,
          submitted_at: new Date().toISOString(),
        })
        .eq('id', data.id);
    } catch {
      // Non-fatal if extra columns don't exist yet
    }
  }

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
    .order('created_at', { ascending: false });

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
  const notes = reviewerNotes?.trim() || null;

  // Base update: feedback column always exists in setup.sql
  const { data, error } = await supabase
    .from('project_deliverables')
    .update({
      status,
      feedback: notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', deliverableId)
    .select()
    .single();

  if (error) {
    console.error('Failed to update deliverable status:', error);
    throw error;
  }

  // Best-effort: if workspace_fixes.sql migration was run, sync reviewer_notes and reviewed_at
  if (data?.id) {
    try {
      await supabase
        .from('project_deliverables')
        .update({
          reviewer_notes: notes,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', deliverableId);
    } catch {
      // Non-fatal if extended columns don't exist
    }
  }

  return data as ProjectDeliverable;
}
