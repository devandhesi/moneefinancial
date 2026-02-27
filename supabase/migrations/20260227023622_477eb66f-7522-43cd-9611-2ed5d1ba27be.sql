
-- Add access control columns to rooms
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS join_code text UNIQUE;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS password_hash text;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS is_invite_only boolean NOT NULL DEFAULT false;

-- Create index on join_code for fast lookups
CREATE INDEX IF NOT EXISTS idx_rooms_join_code ON public.rooms (join_code) WHERE join_code IS NOT NULL;
