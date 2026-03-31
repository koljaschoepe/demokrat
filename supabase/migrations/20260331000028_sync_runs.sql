-- Phase 169: Sync Runs tracking table
CREATE TABLE IF NOT EXISTS public.sync_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL CHECK (source IN ('dip', 'abgeordnetenwatch', 'meilisearch', 'content')),
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'success', 'partial', 'failed')),
  records_processed INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_sync_runs_source ON public.sync_runs (source);
CREATE INDEX idx_sync_runs_started_at ON public.sync_runs (started_at DESC);

ALTER TABLE public.sync_runs ENABLE ROW LEVEL SECURITY;

-- Only admins can read sync runs
CREATE POLICY "Admins can read sync runs"
  ON public.sync_runs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND privilege_tier >= 3
    )
  );
