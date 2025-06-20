-- Create loops table
CREATE TABLE "public"."loops" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "jam_id" uuid NOT NULL,
    "parent_id" uuid,
    "owner_id" uuid NOT NULL,
    "name" text NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "deleted" boolean NOT NULL DEFAULT false,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("jam_id") REFERENCES public.jams(id) ON DELETE RESTRICT,
    FOREIGN KEY ("parent_id") REFERENCES public.loops(id) ON DELETE SET NULL,
    FOREIGN KEY ("owner_id") REFERENCES auth.users(id) ON DELETE RESTRICT
);

-- Create index on loops.created_at for sorting
CREATE INDEX "loops_created_at_idx" ON "public"."loops" ("created_at");
-- Create index on loops.deleted for filtering
CREATE INDEX "loops_deleted_idx" ON "public"."loops" ("deleted");

-- Create loop_audio junction table
CREATE TABLE "public"."loop_audio" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "loop_id" uuid NOT NULL,
    "audio_id" uuid NOT NULL,
    "created_at" timestamp with time zone NOT NULL DEFAULT now(),
    "position" integer NOT NULL DEFAULT 0,
    "deleted" boolean NOT NULL DEFAULT false,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("loop_id") REFERENCES public.loops(id) ON DELETE RESTRICT,
    FOREIGN KEY ("audio_id") REFERENCES public.audio(id) ON DELETE RESTRICT
);

-- Create index on loop_audio.deleted for filtering
CREATE INDEX "loop_audio_deleted_idx" ON "public"."loop_audio" ("deleted");

-- Enable RLS
ALTER TABLE "public"."loops" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."loop_audio" ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON TABLE "public"."loops" TO authenticated;
GRANT ALL ON TABLE "public"."loop_audio" TO authenticated;

-- RLS policies for loops
CREATE POLICY "Users can view loops in their jams"
ON "public"."loops"
FOR SELECT
TO authenticated
USING ((SELECT owner_id FROM public.jams WHERE id = jam_id) = auth.uid() AND deleted = false);

CREATE POLICY "Users can insert loops in their jams"
ON "public"."loops"
FOR INSERT
TO authenticated
WITH CHECK ((SELECT owner_id FROM public.jams WHERE id = jam_id) = auth.uid() AND owner_id = auth.uid());

CREATE POLICY "Users can update their own loops"
ON "public"."loops"
FOR UPDATE
TO authenticated
USING ((SELECT owner_id FROM public.jams WHERE id = jam_id) = auth.uid() AND owner_id = auth.uid());

CREATE POLICY "Users can delete their own loops"
ON "public"."loops"
FOR UPDATE
TO authenticated
USING ((SELECT owner_id FROM public.jams WHERE id = jam_id) = auth.uid() AND owner_id = auth.uid());

-- RLS policies for loop_audio
CREATE POLICY "Users can view their own loop_audio"
ON "public"."loop_audio"
FOR SELECT
TO authenticated
USING ((SELECT owner_id FROM public.jams WHERE id = (SELECT jam_id FROM public.loops WHERE id = loop_id)) = auth.uid() AND deleted = false);

CREATE POLICY "Users can insert their own loop_audio"
ON "public"."loop_audio"
FOR INSERT
TO authenticated
WITH CHECK ((SELECT owner_id FROM public.jams WHERE id = (SELECT jam_id FROM public.loops WHERE id = loop_id)) = auth.uid());

CREATE POLICY "Users can update their own loop_audio"
ON "public"."loop_audio"
FOR UPDATE
TO authenticated
USING ((SELECT owner_id FROM public.jams WHERE id = (SELECT jam_id FROM public.loops WHERE id = loop_id)) = auth.uid());

CREATE POLICY "Users can delete their own loop_audio"
ON "public"."loop_audio"
FOR UPDATE
TO authenticated
USING ((SELECT owner_id FROM public.jams WHERE id = (SELECT jam_id FROM public.loops WHERE id = loop_id)) = auth.uid());
