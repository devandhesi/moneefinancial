-- Add INSERT policy for chat-images bucket so authenticated users can upload
CREATE POLICY "Users can upload chat images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'chat-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add UPDATE policy for chat-images bucket
CREATE POLICY "Users can update own chat images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'chat-images' AND auth.uid()::text = (storage.foldername(name))[1]);