-- Add human readable ID column to jams table
ALTER TABLE "public"."jams" ADD COLUMN "human_readable_id" text;

-- Create a unique index on the human_readable_id column
CREATE UNIQUE INDEX jams_human_readable_id_key ON public.jams USING btree (human_readable_id);

-- Add unique constraint
ALTER TABLE "public"."jams" ADD CONSTRAINT "jams_human_readable_id_key" UNIQUE using index "jams_human_readable_id_key"; 