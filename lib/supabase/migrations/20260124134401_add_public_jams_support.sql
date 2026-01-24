-- Add default value for access column
ALTER TABLE "public"."jams" 
ALTER COLUMN "access" SET DEFAULT 'private';

-- Update existing jams to have 'private' access if null
UPDATE "public"."jams" 
SET "access" = 'private' 
WHERE "access" IS NULL;

-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Users can view their own jams" ON "public"."jams";

-- Create new SELECT policy that allows users to view their own jams OR public jams
CREATE POLICY "Users can view their own jams or public jams"
ON "public"."jams"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING ((auth.uid() = owner_id) OR (access = 'public'));
