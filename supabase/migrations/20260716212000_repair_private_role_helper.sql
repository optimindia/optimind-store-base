-- The helper was moved out of the public API schema, but its SQL body still
-- referenced the old public function name. That broke every authenticated
-- policy which calls private.has_store_role().
create or replace function private.has_store_role(requested_store_id uuid, allowed_roles public.store_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select private.is_platform_admin() or exists (
    select 1 from public.store_members
    where user_id = auth.uid()
      and store_id = requested_store_id
      and role = any(allowed_roles)
  );
$$;

grant execute on function private.has_store_role(uuid, public.store_role[]) to authenticated;
