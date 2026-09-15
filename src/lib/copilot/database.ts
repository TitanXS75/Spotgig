import { supabase } from '@/lib/supabase';
import type { CopilotMessage, CopilotContextType } from './types';

export interface StoredConversation {
  id: string;
  user_id: string;
  project_id?: string | null;
  context_type: string;
  title: string;
  created_at: string;
  updated_at: string;
}

/**
 * Creates or retrieves an active Copilot conversation for the user.
 */
export async function getOrCreateConversation(
  userId: string,
  contextType: CopilotContextType,
  title: string = 'New Conversation',
  projectId?: string
): Promise<string> {
  try {
    const { data: existing, error: fetchErr } = await supabase
      .from('copilot_conversations')
      .select('id')
      .eq('user_id', userId)
      .eq('context_type', contextType)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!fetchErr && existing?.id) {
      return existing.id;
    }

    const { data: created, error: insertErr } = await supabase
      .from('copilot_conversations')
      .insert({
        user_id: userId,
        context_type: contextType,
        title,
        project_id: projectId || null,
      })
      .select('id')
      .single();

    if (!insertErr && created?.id) {
      return created.id;
    }
  } catch {
    // Database table might not be migrated yet; fallback to local ID
  }

  return `local-conv-${Date.now()}`;
}

/**
 * Persists a message to Supabase copilot_messages table (with fallback).
 */
export async function saveCopilotMessage(
  conversationId: string,
  message: CopilotMessage
): Promise<void> {
  if (conversationId.startsWith('local-conv-')) return;

  try {
    await supabase.from('copilot_messages').insert({
      conversation_id: conversationId,
      sender_type: message.sender,
      message: message.content,
      metadata: message.structuredData || {},
    });
  } catch {
    // Gracefully ignore if offline or unmigrated
  }
}

/**
 * Loads messages for a conversation from Supabase.
 */
export async function loadConversationMessages(
  conversationId: string
): Promise<CopilotMessage[]> {
  if (conversationId.startsWith('local-conv-')) return [];

  try {
    const { data, error } = await supabase
      .from('copilot_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      return data.map((d) => ({
        id: d.id,
        sender: d.sender_type as 'user' | 'assistant' | 'system',
        content: d.message,
        timestamp: d.created_at,
        structuredData: d.metadata as CopilotMessage['structuredData'],
      }));
    }
  } catch {
    // Fallback to empty list
  }

  return [];
}
