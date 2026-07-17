-- Keep RLS helpers private, remove public object listing, and cover all foreign keys.
create schema if not exists private;
revoke all on schema private from public;

revoke all on function public.is_platform_admin() from public, anon, authenticated;
revoke all on function public.has_store_role(uuid, public.store_role[]) from public, anon, authenticated;

alter function public.is_platform_admin() set schema private;
alter function public.has_store_role(uuid, public.store_role[]) set schema private;

grant usage on schema private to authenticated;
grant execute on function private.is_platform_admin() to authenticated;
grant execute on function private.has_store_role(uuid, public.store_role[]) to authenticated;

drop policy if exists "public reads product image objects" on storage.objects;

alter policy "platform admins manage stores" on public.stores to authenticated;
alter policy "members read own memberships" on public.store_members to authenticated;
alter policy "platform admins manage memberships" on public.store_members to authenticated;
alter policy "members manage store settings" on public.store_settings to authenticated;
alter policy "members manage categories" on public.categories to authenticated;
alter policy "members manage products" on public.products to authenticated;
alter policy "members manage variants" on public.product_variants to authenticated;
alter policy "members manage product images" on public.product_images to authenticated;
alter policy "members read store orders" on public.orders to authenticated;
alter policy "members update store orders" on public.orders to authenticated;
alter policy "members read store order items" on public.order_items to authenticated;
alter policy "members read audit logs" on public.audit_log to authenticated;
alter policy "members insert audit logs" on public.audit_log to authenticated;

drop policy if exists "members read own memberships" on public.store_members;
create policy "members read own memberships" on public.store_members
  for select to authenticated
  using (user_id = (select auth.uid()) or private.is_platform_admin());

drop policy if exists "public reads active stores" on public.stores;
create policy "public reads active stores" on public.stores
  for select to anon using (is_active);

drop policy if exists "public reads active store settings" on public.store_settings;
create policy "public reads active store settings" on public.store_settings
  for select to anon using (exists (select 1 from public.stores s where s.id = store_id and s.is_active));

drop policy if exists "public reads visible categories" on public.categories;
create policy "public reads visible categories" on public.categories
  for select to anon using (is_visible and exists (select 1 from public.stores s where s.id = store_id and s.is_active));

drop policy if exists "public reads published products" on public.products;
create policy "public reads published products" on public.products
  for select to anon using (is_published and exists (select 1 from public.stores s where s.id = store_id and s.is_active));

drop policy if exists "public reads variants for published products" on public.product_variants;
create policy "public reads variants for published products" on public.product_variants
  for select to anon using (is_available and exists (
    select 1 from public.products p join public.stores s on s.id = p.store_id
    where p.id = product_id and p.is_published and s.is_active
  ));

drop policy if exists "public reads images for published products" on public.product_images;
create policy "public reads images for published products" on public.product_images
  for select to anon using (exists (
    select 1 from public.products p join public.stores s on s.id = p.store_id
    where p.id = product_id and p.is_published and s.is_active
  ));

create index store_members_user_id_idx on public.store_members (user_id);
create index products_category_id_idx on public.products (category_id);
create index product_variants_store_id_idx on public.product_variants (store_id);
create index product_images_store_id_idx on public.product_images (store_id);
create index order_items_store_id_idx on public.order_items (store_id);
create index order_items_product_id_idx on public.order_items (product_id);
create index order_items_variant_id_idx on public.order_items (variant_id);
create index audit_log_actor_id_idx on public.audit_log (actor_id);
