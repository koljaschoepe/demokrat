-- Phase 173: Feature Flags
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT false,
  rollout_percentage INTEGER NOT NULL DEFAULT 100 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Anyone can read flags (needed for client-side checks)
CREATE POLICY "Anyone can read feature flags"
  ON public.feature_flags FOR SELECT
  USING (true);

-- Only admins can update
CREATE POLICY "Admins can update feature flags"
  ON public.feature_flags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND privilege_tier >= 4
    )
  );

-- Seed default flags
INSERT INTO public.feature_flags (id, name, description, enabled, rollout_percentage) VALUES
  ('sitzungswoche', 'Sitzungswoche Modus', 'Aktiviert spezielle UI-Elemente waehrend der Sitzungswochen', true, 100),
  ('ai-summaries', 'KI-Zusammenfassungen', 'Generiert automatische Zusammenfassungen', true, 100),
  ('quiz', 'Quiz-Fragen', 'Zeigt Wissensquiz-Fragen zu politischen Themen', false, 100),
  ('citizen-topics', 'Buerger-Themen', 'Erlaubt Nutzern eigene Themen vorzuschlagen', true, 100),
  ('web-push', 'Web Push Notifications', 'Push-Benachrichtigungen ueber den Browser', false, 50)
ON CONFLICT (id) DO NOTHING;
