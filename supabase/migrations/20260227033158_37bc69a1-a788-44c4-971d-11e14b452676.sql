-- Add reply_to column for DM replies
ALTER TABLE public.direct_messages ADD COLUMN IF NOT EXISTS reply_to UUID REFERENCES public.direct_messages(id) ON DELETE SET NULL;