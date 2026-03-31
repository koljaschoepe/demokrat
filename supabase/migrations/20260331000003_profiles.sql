-- Phase 019: Profiles + RLS

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  wahlkreis_id INTEGER REFERENCES wahlkreise(id),
  bio TEXT,
  avatar_url TEXT,
  verification_tier TEXT NOT NULL DEFAULT 'unverified'
    CHECK (verification_tier IN ('unverified', 'verified', 'identity_verified')),
  reputation_points INTEGER NOT NULL DEFAULT 0,
  privilege_tier INTEGER NOT NULL DEFAULT 0
    CHECK (privilege_tier BETWEEN 0 AND 4),
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_wahlkreis ON profiles (wahlkreis_id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select ON profiles FOR SELECT
  USING (is_public = true OR id = auth.uid());

CREATE POLICY profiles_insert ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY profiles_update ON profiles FOR UPDATE
  USING (id = auth.uid());
