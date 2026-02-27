
-- Pinned items table for rooms and DM conversations
CREATE TABLE public.pinned_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  item_type text NOT NULL, -- 'room' or 'dm'
  item_id text NOT NULL,   -- room slug or partner user_id
  pinned_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);

ALTER TABLE public.pinned_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pins" ON public.pinned_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create pins" ON public.pinned_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete pins" ON public.pinned_items FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_pinned_items_user ON public.pinned_items(user_id);
