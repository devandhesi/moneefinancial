
-- Add edit/delete columns to direct_messages
ALTER TABLE public.direct_messages
  ADD COLUMN IF NOT EXISTS is_edited boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS edited_at timestamp with time zone;

-- Drop the existing update policy (only allows receivers to mark read)
DROP POLICY IF EXISTS "Receivers can mark DMs read" ON public.direct_messages;

-- New update policy: receivers can mark read, senders can edit their messages
CREATE POLICY "Users can update own DMs"
  ON public.direct_messages
  FOR UPDATE
  USING ((auth.uid() = sender_id) OR (auth.uid() = receiver_id));
