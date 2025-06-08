-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own audio files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own audio files" ON storage.objects;

-- Create updated policies that don't require the user ID in the path
CREATE POLICY "Users can view audio files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'audio-files');

CREATE POLICY "Users can update audio files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'audio-files');

CREATE POLICY "Users can delete audio files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'audio-files');
