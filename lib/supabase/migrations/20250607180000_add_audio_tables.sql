-- Create audio files table
CREATE TABLE "public"."audio_files" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "owner_id" uuid NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "file_hash" text NOT NULL,
    "file_path" text NOT NULL,
    "file_name" text NOT NULL,
    "file_size" integer NOT NULL,
    "file_type" text NOT NULL,
    "deleted" boolean NOT NULL DEFAULT false,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("owner_id") REFERENCES auth.users(id)
);

-- Create jam_loops table for the relationship
CREATE TABLE "public"."jam_loops" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "jam_id" uuid NOT NULL,
    "audio_id" uuid NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "position" integer NOT NULL DEFAULT 0,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("jam_id") REFERENCES public.jams(id),
    FOREIGN KEY ("audio_id") REFERENCES public.audio_files(id)
);

-- Add RLS policies
ALTER TABLE "public"."audio_files" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."jam_loops" ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON TABLE "public"."audio_files" TO authenticated;
GRANT ALL ON TABLE "public"."jam_loops" TO authenticated;

-- RLS policies for audio_files
CREATE POLICY "Users can view their own audio files"
ON "public"."audio_files"
FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

CREATE POLICY "Users can insert their own audio files"
ON "public"."audio_files"
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

-- RLS policies for jam_loops
CREATE POLICY "Users can view loops in their jams"
ON "public"."jam_loops"
FOR SELECT
TO authenticated
USING ((SELECT owner_id FROM public.jams WHERE id = jam_id) = auth.uid());

CREATE POLICY "Users can add loops to their jams"
ON "public"."jam_loops"
FOR INSERT
TO authenticated
WITH CHECK ((SELECT owner_id FROM public.jams WHERE id = jam_id) = auth.uid());
