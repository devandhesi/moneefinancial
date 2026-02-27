
-- Storage bucket for chat images
INSERT INTO storage.buckets (id, name, public) VALUES ('chat-images', 'chat-images', true);

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload chat images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-images' AND auth.uid() IS NOT NULL);

-- Anyone can view chat images (public bucket)
CREATE POLICY "Chat images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-images');

-- Users can delete their own uploads
CREATE POLICY "Users can delete own chat images"
ON storage.objects FOR DELETE
USING (bucket_id = 'chat-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Polls table
CREATE TABLE public.chat_polls (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_polls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Polls are viewable by everyone" ON public.chat_polls FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create polls" ON public.chat_polls FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creators can delete polls" ON public.chat_polls FOR DELETE USING (auth.uid() = created_by);

-- Poll votes table
CREATE TABLE public.chat_poll_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id uuid NOT NULL REFERENCES public.chat_polls(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  option_index int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(poll_id, user_id)
);

ALTER TABLE public.chat_poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Votes are viewable by everyone" ON public.chat_poll_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON public.chat_poll_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can change vote" ON public.chat_poll_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can remove vote" ON public.chat_poll_votes FOR DELETE USING (auth.uid() = user_id);
