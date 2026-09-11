-- ============================================================
-- AASPASS: Workspace Column Fixes Migration
-- Run this in Supabase SQL editor to fix the workspace.
-- Safe to re-run (uses IF NOT EXISTS / DO blocks).
-- ============================================================

-- ── Fix 1: project_tasks — add completed_by column ──────────

ALTER TABLE public.project_tasks
  ADD COLUMN IF NOT EXISTS completed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- ── Fix 2: project_deliverables — add reviewer columns ──────

ALTER TABLE public.project_deliverables
  ADD COLUMN IF NOT EXISTS reviewer_notes TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ DEFAULT NOW();

-- Ensure title has a safe default and is not strictly required
ALTER TABLE public.project_deliverables
  ALTER COLUMN title DROP NOT NULL;
ALTER TABLE public.project_deliverables
  ALTER COLUMN title SET DEFAULT 'Deliverable Submission';

-- Backfill submitted_at from created_at for existing rows
UPDATE public.project_deliverables
  SET submitted_at = created_at
  WHERE submitted_at IS NULL;

-- Add github_repo_url / live_demo_url columns
ALTER TABLE public.project_deliverables
  ADD COLUMN IF NOT EXISTS github_repo_url TEXT,
  ADD COLUMN IF NOT EXISTS live_demo_url TEXT;

-- Backfill from old columns if data exists
UPDATE public.project_deliverables
  SET github_repo_url = github_url,
      live_demo_url   = demo_url
  WHERE github_repo_url IS NULL AND github_url IS NOT NULL;

-- Deliverables RLS: Allow developer with access OR project owner
DROP POLICY IF EXISTS "deliverables_insert" ON public.project_deliverables;
CREATE POLICY "deliverables_insert" ON public.project_deliverables FOR INSERT
  WITH CHECK (
    auth.uid() = developer_id
    AND (
      EXISTS (SELECT 1 FROM public.project_access WHERE project_id = public.project_deliverables.project_id AND developer_id = auth.uid() AND revoked_at IS NULL)
      OR auth.uid() = (SELECT owner_id FROM public.projects WHERE id = public.project_deliverables.project_id)
    )
  );

-- ── Fix 3: project_messages — add attachments column ────────

ALTER TABLE public.project_messages
  ADD COLUMN IF NOT EXISTS attachments TEXT[] DEFAULT '{}';

-- ── Realtime — enable via Supabase Dashboard ─────────────────
-- Dashboard > Database > Replication > Add project_messages
-- and optionally project_tasks to the realtime publication.
