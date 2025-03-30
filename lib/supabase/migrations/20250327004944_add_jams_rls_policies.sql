-- Add RLS policies for the jams table

-- Allow users to insert their own jams
create policy "Users can insert their own jams"
on "public"."jams"
as permissive
for insert
to authenticated
with check ((auth.uid() = owner_id));

-- Allow users to view their own jams
create policy "Users can view their own jams"
on "public"."jams"
as permissive
for select
to authenticated
using ((auth.uid() = owner_id));

-- Allow users to update their own jams
create policy "Users can update their own jams"
on "public"."jams"
as permissive
for update
to authenticated
using ((auth.uid() = owner_id))
with check ((auth.uid() = owner_id));

-- Allow users to delete their own jams
create policy "Users can delete their own jams"
on "public"."jams"
as permissive
for delete
to authenticated
using ((auth.uid() = owner_id));
