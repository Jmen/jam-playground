create table "public"."jams" (
    "id" uuid not null default gen_random_uuid(),
    "owner_id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "access" text,
    "name" text not null,
    "description" text not null,
    "image" text,
    "deleted" boolean not null default false
);


alter table "public"."jams" enable row level security;

CREATE UNIQUE INDEX jams_pkey ON public.jams USING btree (id);

alter table "public"."jams" add constraint "jams_pkey" PRIMARY KEY using index "jams_pkey";

alter table "public"."jams" add constraint "jams_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES auth.users(id) not valid;

alter table "public"."jams" validate constraint "jams_owner_id_fkey";

grant delete on table "public"."jams" to "anon";

grant insert on table "public"."jams" to "anon";

grant references on table "public"."jams" to "anon";

grant select on table "public"."jams" to "anon";

grant trigger on table "public"."jams" to "anon";

grant truncate on table "public"."jams" to "anon";

grant update on table "public"."jams" to "anon";

grant delete on table "public"."jams" to "authenticated";

grant insert on table "public"."jams" to "authenticated";

grant references on table "public"."jams" to "authenticated";

grant select on table "public"."jams" to "authenticated";

grant trigger on table "public"."jams" to "authenticated";

grant truncate on table "public"."jams" to "authenticated";

grant update on table "public"."jams" to "authenticated";

grant delete on table "public"."jams" to "service_role";

grant insert on table "public"."jams" to "service_role";

grant references on table "public"."jams" to "service_role";

grant select on table "public"."jams" to "service_role";

grant trigger on table "public"."jams" to "service_role";

grant truncate on table "public"."jams" to "service_role";

grant update on table "public"."jams" to "service_role";


