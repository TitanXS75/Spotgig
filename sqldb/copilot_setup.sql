-- ============================================================
-- AASPASS: COPILOT CONVERSATION & MESSAGE STORAGE SETUP
-- Stores Copilot conversation sessions and message histories.
-- Idempotent and protected by strict Row-Level Security (RLS).
-- ============================================================

-- ── 1. Copilot Conversations Table ─────────────────────────────

CREATE TABLE IF NOT EXISTS public.copilot_conversations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id   UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  context_type TEXT NOT NULL DEFAULT 'general',
  title        TEXT NOT NULL DEFAULT 'New Conversation',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_copilot_conversations_user ON public.copilot_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_copilot_conversations_project ON public.copilot_conversations(project_id);

DROP TRIGGER IF EXISTS trg_copilot_conversations_updated_at ON public.copilot_conversations;
CREATE TRIGGER trg_copilot_conversations_updated_at
  BEFORE UPDATE ON public.copilot_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_set_updated_at();


-- ── 2. Copilot Messages Table ──────────────────────────────────

CREATE TABLE IF NOT EXISTS public.copilot_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.copilot_conversations(id) ON DELETE CASCADE,
  sender_type     TEXT NOT NULL CHECK (sender_type IN ('user', 'assistant', 'system')),
  message         TEXT NOT NULL,
  metadata        JSONB DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_copilot_messages_conversation ON public.copilot_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_copilot_messages_created ON public.copilot_messages(created_at ASC);


-- ── 3. Row Level Security Policies ─────────────────────────────

ALTER TABLE public.copilot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copilot_messages ENABLE ROW LEVEL SECURITY;

-- Conversations: Users can only see, create, update, and delete their own conversations
DROP POLICY IF EXISTS "copilot_conv_select_own" ON public.copilot_conversations;
CREATE POLICY "copilot_conv_select_own" ON public.copilot_conversations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "copilot_conv_insert_own" ON public.copilot_conversations;
CREATE POLICY "copilot_conv_insert_own" ON public.copilot_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "copilot_conv_update_own" ON public.copilot_conversations;
CREATE POLICY "copilot_conv_update_own" ON public.copilot_conversations FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "copilot_conv_delete_own" ON public.copilot_conversations;
CREATE POLICY "copilot_conv_delete_own" ON public.copilot_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Messages: Users can only see and add messages in conversations they own
DROP POLICY IF EXISTS "copilot_msg_select_own" ON public.copilot_messages;
CREATE POLICY "copilot_msg_select_own" ON public.copilot_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.copilot_conversations
      WHERE id = copilot_messages.conversation_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "copilot_msg_insert_own" ON public.copilot_messages;
CREATE POLICY "copilot_msg_insert_own" ON public.copilot_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.copilot_conversations
      WHERE id = copilot_messages.conversation_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "copilot_msg_delete_own" ON public.copilot_messages;
CREATE POLICY "copilot_msg_delete_own" ON public.copilot_messages FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.copilot_conversations
      WHERE id = copilot_messages.conversation_id AND user_id = auth.uid()
    )
  );
