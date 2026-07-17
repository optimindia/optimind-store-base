-- Avoid overlapping authenticated SELECT policies on the membership table.
drop policy if exists "platform admins manage memberships" on public.store_members;

create policy "platform admins insert memberships" on public.store_members
  for insert to authenticated
  with check (private.is_platform_admin());

create policy "platform admins update memberships" on public.store_members
  for update to authenticated
  using (private.is_platform_admin())
  with check (private.is_platform_admin());

create policy "platform admins delete memberships" on public.store_members
  for delete to authenticated
  using (private.is_platform_admin());
