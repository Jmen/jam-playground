-- Rename audio_files table to audio
ALTER TABLE "public"."audio_files" RENAME TO "audio";

-- Update any foreign key references
-- Note: Foreign keys will automatically follow the table rename, but we need to update any explicit references in policies

-- Update RLS policies for the renamed table
ALTER POLICY "Users can view their own audio files" ON "public"."audio" RENAME TO "Users can view their own audio";
ALTER POLICY "Users can insert their own audio files" ON "public"."audio" RENAME TO "Users can insert their own audio";
