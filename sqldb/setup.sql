-- ============================================================
-- AASPASS: COMPLETE PROJECT MARKETPLACE DATABASE SETUP
-- Single unified setup script.
-- Safe to re-run (idempotent with IF NOT EXISTS and DROP POLICY).
-- ============================================================

-- ── 1. Custom PostgreSQL Enums ────────────────────────────────

DO $$ BEGIN
  CREATE TYPE public.project_role AS ENUM ('project_owner', 'developer', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.project_difficulty AS ENUM ('beginner', 'intermediate', 'advanced');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.project_status AS ENUM ('draft', 'published', 'in_progress', 'completed', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.request_status AS ENUM ('pending', 'accepted', 'rejected', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.compensation_type AS ENUM ('paid', 'stipend', 'unpaid');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.location_preference AS ENUM ('remote', 'on_site', 'hybrid');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.task_status AS ENUM ('todo', 'in_progress', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.deliverable_status AS ENUM ('submitted', 'accepted', 'revision_requested');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ── 2. Utility Functions & Triggers ───────────────────────────

CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


-- ── 3. Profiles Table & Auth Trigger ──────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id               UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name        TEXT,
  phone            TEXT,
  avatar_url       TEXT,
  headline         TEXT,
  bio              TEXT,
  organization     TEXT,
  education        TEXT,
  availability     TEXT DEFAULT 'Available for projects',
  skills           TEXT[] DEFAULT '{}',
  technologies     TEXT[] DEFAULT '{}',
  role             project_role DEFAULT 'developer',
  experience_level project_difficulty DEFAULT 'beginner',
  github_url       TEXT,
  portfolio_url    TEXT,
  linkedin_url     TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure all columns exist if table was already created
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS headline TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS organization TEXT,
  ADD COLUMN IF NOT EXISTS education TEXT,
  ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'Available for projects',
  ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS technologies TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS role project_role DEFAULT 'developer',
  ADD COLUMN IF NOT EXISTS experience_level project_difficulty DEFAULT 'beginner',
  ADD COLUMN IF NOT EXISTS github_url TEXT,
  ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- Auto-create profile when user registers via Supabase Auth
CREATE OR REPLACE FUNCTION public.fn_handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'New Member'),
    NEW.raw_user_meta_data ->> 'avatar_url',
    COALESCE((NEW.raw_user_meta_data ->> 'role')::project_role, 'developer')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    role = COALESCE(EXCLUDED.role, profiles.role);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_handle_new_user();

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_set_updated_at();


-- ── 4. Projects Table (Public Discovery Layer) ────────────────

CREATE TABLE IF NOT EXISTS public.projects (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id            UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  slug                TEXT UNIQUE,
  public_summary      TEXT NOT NULL,
  category            TEXT,
  industry            TEXT NOT NULL,
  project_type        TEXT NOT NULL,
  difficulty          project_difficulty NOT NULL DEFAULT 'intermediate',
  duration            TEXT NOT NULL,
  team_size           INT NOT NULL DEFAULT 1,
  location_type       location_preference NOT NULL DEFAULT 'remote',
  area                TEXT,
  compensation_type   compensation_type NOT NULL DEFAULT 'paid',
  compensation_amount NUMERIC(10, 2),
  required_skills     TEXT[] NOT NULL DEFAULT '{}',
  technologies        TEXT[] DEFAULT '{}',
  status              project_status NOT NULL DEFAULT 'draft',
  views_count         INT NOT NULL DEFAULT 0,
  views               INT NOT NULL DEFAULT 0,
  requests_count      INT NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_owner ON public.projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_created ON public.projects(created_at DESC);

DROP TRIGGER IF EXISTS trg_projects_updated_at ON public.projects;
CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_set_updated_at();


-- ── 5. Project Requirements Table (Protected Private Layer) ───

CREATE TABLE IF NOT EXISTS public.project_requirements (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id             UUID NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
  detailed_requirements  TEXT NOT NULL,
  feature_list           TEXT,
  confidential_notes     TEXT,
  attachments            TEXT[] NOT NULL DEFAULT '{}',
  confidential_specs     TEXT,
  deliverables           TEXT,
  credentials            TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_project_requirements_updated_at ON public.project_requirements;
CREATE TRIGGER trg_project_requirements_updated_at
  BEFORE UPDATE ON public.project_requirements
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_set_updated_at();


-- ── 6. Project Requests Table ─────────────────────────────────

CREATE TABLE IF NOT EXISTS public.project_requests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  developer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message      TEXT NOT NULL,
  status       request_status NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, developer_id)
);

CREATE INDEX IF NOT EXISTS idx_requests_project ON public.project_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_requests_developer ON public.project_requests(developer_id);

DROP TRIGGER IF EXISTS trg_project_requests_updated_at ON public.project_requests;
CREATE TRIGGER trg_project_requests_updated_at
  BEFORE UPDATE ON public.project_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_set_updated_at();

-- Backward compatibility view
CREATE OR REPLACE VIEW public.project_access_requests AS SELECT * FROM public.project_requests;


-- ── 7. Project Access Permissions Table ───────────────────────

CREATE TABLE IF NOT EXISTS public.project_access (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  developer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  access_level TEXT NOT NULL DEFAULT 'full',
  granted_by   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  granted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at   TIMESTAMPTZ,
  UNIQUE(project_id, developer_id)
);

CREATE INDEX IF NOT EXISTS idx_access_lookup ON public.project_access(project_id, developer_id);

-- Auto-grant access when request status is set to 'accepted'
CREATE OR REPLACE FUNCTION public.fn_auto_grant_project_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    INSERT INTO public.project_access (project_id, developer_id, access_level, granted_at, revoked_at)
    VALUES (NEW.project_id, NEW.developer_id, 'full', NOW(), NULL)
    ON CONFLICT (project_id, developer_id) 
    DO UPDATE SET revoked_at = NULL, access_level = 'full', granted_at = NOW();
  ELSIF NEW.status != 'accepted' AND OLD.status = 'accepted' THEN
    UPDATE public.project_access
    SET revoked_at = NOW()
    WHERE project_id = NEW.project_id AND developer_id = NEW.developer_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_grant_access ON public.project_requests;
CREATE TRIGGER trg_auto_grant_access
  AFTER INSERT OR UPDATE OF status ON public.project_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_auto_grant_project_access();


-- ── 8. Project Tasks (Private Workspace Milestones) ───────────

CREATE TABLE IF NOT EXISTS public.project_tasks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  status       task_status NOT NULL DEFAULT 'todo',
  is_completed BOOLEAN NOT NULL DEFAULT false,
  assigned_to  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_project ON public.project_tasks(project_id);

DROP TRIGGER IF EXISTS trg_tasks_updated_at ON public.project_tasks;
CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON public.project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_set_updated_at();


-- ── 9. Project Messages (Workspace Real-Time Discussion) ──────

CREATE TABLE IF NOT EXISTS public.project_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  sender_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_project ON public.project_messages(project_id, created_at ASC);


-- ── 10. Project Deliverables (Submissions & Code Repos) ────────

CREATE TABLE IF NOT EXISTS public.project_deliverables (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  developer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  github_url   TEXT,
  demo_url     TEXT,
  notes        TEXT,
  status       deliverable_status NOT NULL DEFAULT 'submitted',
  feedback     TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deliverables_project ON public.project_deliverables(project_id);

DROP TRIGGER IF EXISTS trg_deliverables_updated_at ON public.project_deliverables;
CREATE TRIGGER trg_deliverables_updated_at
  BEFORE UPDATE ON public.project_deliverables
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_set_updated_at();


-- ── 11. Project Reviews (Dual-Sided 5-Star Ratings) ───────────

CREATE TABLE IF NOT EXISTS public.project_reviews (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id           UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  reviewer_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating               INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  technical_rating     INT CHECK (technical_rating >= 1 AND technical_rating <= 5),
  communication_rating INT CHECK (communication_rating >= 1 AND communication_rating <= 5),
  reliability_rating   INT CHECK (reliability_rating >= 1 AND reliability_rating <= 5),
  comment              TEXT NOT NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(project_id, reviewer_id, reviewee_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON public.project_reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_project ON public.project_reviews(project_id);


-- ── 12. Row Level Security (RLS) Policies ─────────────────────

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, self insert/update
DROP POLICY IF EXISTS "profiles_read_all" ON public.profiles;
CREATE POLICY "profiles_read_all" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Projects: Published projects are visible to all; drafts/archived to owner only
DROP POLICY IF EXISTS "projects_select_public" ON public.projects;
CREATE POLICY "projects_select_public" ON public.projects FOR SELECT
  USING (status = 'published' OR auth.uid() = owner_id);

DROP POLICY IF EXISTS "projects_insert_owner" ON public.projects;
CREATE POLICY "projects_insert_owner" ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "projects_update_owner" ON public.projects;
CREATE POLICY "projects_update_owner" ON public.projects FOR UPDATE
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "projects_delete_owner" ON public.projects;
CREATE POLICY "projects_delete_owner" ON public.projects FOR DELETE
  USING (auth.uid() = owner_id);

-- Project Requirements: ONLY owner or approved developers
DROP POLICY IF EXISTS "reqs_select_authorized" ON public.project_requirements;
CREATE POLICY "reqs_select_authorized" ON public.project_requirements FOR SELECT
  USING (
    auth.uid() = (SELECT owner_id FROM public.projects WHERE id = project_id)
    OR EXISTS (
      SELECT 1 FROM public.project_access
      WHERE project_id = public.project_requirements.project_id
        AND developer_id = auth.uid()
        AND revoked_at IS NULL
    )
  );

DROP POLICY IF EXISTS "reqs_insert_owner" ON public.project_requirements;
CREATE POLICY "reqs_insert_owner" ON public.project_requirements FOR INSERT
  WITH CHECK (auth.uid() = (SELECT owner_id FROM public.projects WHERE id = project_id));

DROP POLICY IF EXISTS "reqs_update_owner" ON public.project_requirements;
CREATE POLICY "reqs_update_owner" ON public.project_requirements FOR UPDATE
  USING (auth.uid() = (SELECT owner_id FROM public.projects WHERE id = project_id));

DROP POLICY IF EXISTS "reqs_delete_owner" ON public.project_requirements;
CREATE POLICY "reqs_delete_owner" ON public.project_requirements FOR DELETE
  USING (auth.uid() = (SELECT owner_id FROM public.projects WHERE id = project_id));

-- Project Requests: Developers can view/submit own; owners can view/update
DROP POLICY IF EXISTS "requests_select" ON public.project_requests;
CREATE POLICY "requests_select" ON public.project_requests FOR SELECT
  USING (
    auth.uid() = developer_id
    OR auth.uid() = (SELECT owner_id FROM public.projects WHERE id = project_id)
  );

DROP POLICY IF EXISTS "requests_insert" ON public.project_requests;
CREATE POLICY "requests_insert" ON public.project_requests FOR INSERT
  WITH CHECK (auth.uid() = developer_id);

DROP POLICY IF EXISTS "requests_update" ON public.project_requests;
CREATE POLICY "requests_update" ON public.project_requests FOR UPDATE
  USING (
    auth.uid() = developer_id
    OR auth.uid() = (SELECT owner_id FROM public.projects WHERE id = project_id)
  );

DROP POLICY IF EXISTS "requests_delete" ON public.project_requests;
CREATE POLICY "requests_delete" ON public.project_requests FOR DELETE
  USING (
    auth.uid() = developer_id
    OR auth.uid() = (SELECT owner_id FROM public.projects WHERE id = project_id)
  );

-- Project Access Table: Read by owner or developer; Managed by project owner
DROP POLICY IF EXISTS "access_select" ON public.project_access;
CREATE POLICY "access_select" ON public.project_access FOR SELECT
  USING (
    auth.uid() = developer_id
    OR auth.uid() = (SELECT owner_id FROM public.projects WHERE id = project_id)
  );

DROP POLICY IF EXISTS "access_insert_owner" ON public.project_access;
CREATE POLICY "access_insert_owner" ON public.project_access FOR INSERT
  WITH CHECK (auth.uid() = (SELECT owner_id FROM public.projects WHERE id = project_id));

DROP POLICY IF EXISTS "access_update_owner" ON public.project_access;
CREATE POLICY "access_update_owner" ON public.project_access FOR UPDATE
  USING (auth.uid() = (SELECT owner_id FROM public.projects WHERE id = project_id));

DROP POLICY IF EXISTS "access_delete_owner" ON public.project_access;
CREATE POLICY "access_delete_owner" ON public.project_access FOR DELETE
  USING (auth.uid() = (SELECT owner_id FROM public.projects WHERE id = project_id));

-- Workspace Tasks: Owner or approved developers
DROP POLICY IF EXISTS "tasks_select" ON public.project_tasks;
CREATE POLICY "tasks_select" ON public.project_tasks FOR SELECT
  USING (
    auth.uid() = (SELECT owner_id FROM public.projects WHERE id = project_id)
    OR EXISTS (SELECT 1 FROM public.project_access WHERE project_id = public.project_tasks.project_id AND developer_id = auth.uid() AND revoked_at IS NULL)
  );

DROP POLICY IF EXISTS "tasks_insert" ON public.project_tasks;
CREATE POLICY "tasks_insert" ON public.project_tasks FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT owner_id FROM public.projects WHERE id = project_id)
    OR EXISTS (SELECT 1 FROM public.project_access WHERE project_id = public.project_tasks.project_id AND developer_id = auth.uid() AND revoked_at IS NULL)
  );

DROP POLICY IF EXISTS "tasks_update" ON public.project_tasks;
CREATE POLICY "tasks_update" ON public.project_tasks FOR UPDATE
  USING (
    auth.uid() = (SELECT owner_id FROM public.projects WHERE id = project_id)
    OR EXISTS (SELECT 1 FROM public.project_access WHERE project_id = public.project_tasks.project_id AND developer_id = auth.uid() AND revoked_at IS NULL)
  );

DROP POLICY IF EXISTS "tasks_delete" ON public.project_tasks;
CREATE POLICY "tasks_delete" ON public.project_tasks FOR DELETE
  USING (auth.uid() = (SELECT owner_id FROM public.projects WHERE id = project_id));

-- Workspace Messages: Owner or approved developers
DROP POLICY IF EXISTS "messages_select" ON public.project_messages;
CREATE POLICY "messages_select" ON public.project_messages FOR SELECT
  USING (
    auth.uid() = (SELECT owner_id FROM public.projects WHERE id = project_id)
    OR EXISTS (SELECT 1 FROM public.project_access WHERE project_id = public.project_messages.project_id AND developer_id = auth.uid() AND revoked_at IS NULL)
  );

DROP POLICY IF EXISTS "messages_insert" ON public.project_messages;
CREATE POLICY "messages_insert" ON public.project_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND (
      auth.uid() = (SELECT owner_id FROM public.projects WHERE id = project_id)
      OR EXISTS (SELECT 1 FROM public.project_access WHERE project_id = public.project_messages.project_id AND developer_id = auth.uid() AND revoked_at IS NULL)
    )
  );

-- Workspace Deliverables: Owner or approved developers
DROP POLICY IF EXISTS "deliverables_select" ON public.project_deliverables;
CREATE POLICY "deliverables_select" ON public.project_deliverables FOR SELECT
  USING (
    auth.uid() = (SELECT owner_id FROM public.projects WHERE id = project_id)
    OR EXISTS (SELECT 1 FROM public.project_access WHERE project_id = public.project_deliverables.project_id AND developer_id = auth.uid() AND revoked_at IS NULL)
  );

DROP POLICY IF EXISTS "deliverables_insert" ON public.project_deliverables;
CREATE POLICY "deliverables_insert" ON public.project_deliverables FOR INSERT
  WITH CHECK (
    auth.uid() = developer_id
    AND EXISTS (SELECT 1 FROM public.project_access WHERE project_id = public.project_deliverables.project_id AND developer_id = auth.uid() AND revoked_at IS NULL)
  );

DROP POLICY IF EXISTS "deliverables_update" ON public.project_deliverables;
CREATE POLICY "deliverables_update" ON public.project_deliverables FOR UPDATE
  USING (
    auth.uid() = developer_id
    OR auth.uid() = (SELECT owner_id FROM public.projects WHERE id = project_id)
  );

-- Project Reviews: Public read; participants insert
DROP POLICY IF EXISTS "reviews_select" ON public.project_reviews;
CREATE POLICY "reviews_select" ON public.project_reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "reviews_insert" ON public.project_reviews;
CREATE POLICY "reviews_insert" ON public.project_reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id
    AND (
      auth.uid() = (SELECT owner_id FROM public.projects WHERE id = project_id)
      OR EXISTS (SELECT 1 FROM public.project_access WHERE project_id = public.project_reviews.project_id AND developer_id = auth.uid() AND revoked_at IS NULL)
    )
  );
