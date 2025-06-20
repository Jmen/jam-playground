-- Drop RLS policies for jam_loops
DROP POLICY IF EXISTS "Users can view loops in their jams" ON "public"."jam_loops";
DROP POLICY IF EXISTS "Users can add loops to their jams" ON "public"."jam_loops";

-- Drop the jam_loops table
DROP TABLE IF EXISTS "public"."jam_loops";
