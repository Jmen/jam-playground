-- Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-files', 'audio-files', false);

-- Set up RLS policies for the audio-files bucket
CREATE POLICY "Users can upload their own audio files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'audio-files');

CREATE POLICY "Users can view their own audio files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'audio-files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own audio files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'audio-files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own audio files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'audio-files' AND (storage.foldername(name))[1] = auth.uid()::text);
