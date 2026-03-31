-- Phase 034: Groups & Group Members

CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('party', 'faction', 'interest', 'custom')),
  visibility TEXT NOT NULL DEFAULT 'public'
    CHECK (visibility IN ('public', 'private')),
  created_by UUID NOT NULL REFERENCES profiles(id),
  member_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE group_members (
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member'
    CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Public groups readable by all; private only by members
CREATE POLICY groups_select ON groups FOR SELECT
  USING (
    visibility = 'public'
    OR EXISTS (
      SELECT 1 FROM group_members
      WHERE group_id = groups.id AND user_id = auth.uid()
    )
  );

CREATE POLICY groups_insert ON groups FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Group members: visible if group is visible
CREATE POLICY group_members_select ON group_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM groups
      WHERE id = group_id
      AND (visibility = 'public' OR EXISTS (
        SELECT 1 FROM group_members gm
        WHERE gm.group_id = groups.id AND gm.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY group_members_insert ON group_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY group_members_delete ON group_members FOR DELETE
  USING (user_id = auth.uid());

-- Trigger: update member_count
CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE groups SET member_count = member_count + 1
    WHERE id = NEW.group_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE groups SET member_count = member_count - 1
    WHERE id = OLD.group_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_group_member_count
AFTER INSERT OR DELETE ON group_members
FOR EACH ROW EXECUTE FUNCTION update_group_member_count();
