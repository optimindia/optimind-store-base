-- OptiMind shared commerce platform. Every business record belongs to one store.
create extension if not exists pgcrypto;

create type public.store_plan as enum ('base', 'self_managed');
create type public.store_role as enum ('platform_admin', 'owner', 'editor');
create type public.order_status as enum ('draft', 'submitted', 'contacted', 'confirmed', 'cancelled');

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 120),
  plan public.store_plan not null default 'base',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.store_members (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.store_role not null,
  created_at timestamptz not null default now(),
  unique (store_id, user_id)
);

create unique index store_members_one_platform_admin_per_user
  on public.store_members (user_id)
  where role = 'platform_admin';

create table public.store_settings (
  store_id uuid primary key references public.stores(id) on delete cascade,
  whatsapp text not null check (whatsapp ~ '^[0-9]{8,20}$'),
  email text,
  location text,
  currency text not null default 'ARS' check (currency ~ '^[A-Z]{3}$'),
  free_shipping_from numeric(12, 2) check (free_shipping_from is null or free_shipping_from >= 0),
  minimum_order numeric(12, 2) not null default 0 check (minimum_order >= 0),
  shipping_copy text,
  checkout_intro text,
  seo_title text,
  seo_description text,
  public_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 80),
  description text,
  position integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, slug)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 1 and 160),
  short_description text,
  description text,
  price numeric(12, 2) not null check (price >= 0),
  compare_at_price numeric(12, 2) check (compare_at_price is null or compare_at_price >= price),
  stock_quantity integer check (stock_quantity is null or stock_quantity >= 0),
  track_inventory boolean not null default false,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  position integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, slug)
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  sku text,
  price_delta numeric(12, 2) not null default 0,
  stock_quantity integer check (stock_quantity is null or stock_quantity >= 0),
  is_available boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, name)
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  bucket_id text not null default 'store-product-images',
  object_path text not null,
  alt_text text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  unique (bucket_id, object_path)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete restrict,
  order_number bigint generated always as identity unique,
  status public.order_status not null default 'draft',
  customer jsonb not null default '{}'::jsonb,
  delivery jsonb not null default '{}'::jsonb,
  attribution jsonb not null default '{}'::jsonb,
  currency text not null default 'ARS' check (currency ~ '^[A-Z]{3}$'),
  subtotal numeric(12, 2) not null default 0 check (subtotal >= 0),
  total numeric(12, 2) not null default 0 check (total >= 0),
  whatsapp_message text,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete restrict,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name_snapshot text not null,
  variant_name_snapshot text,
  unit_price_snapshot numeric(12, 2) not null check (unit_price_snapshot >= 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(12, 2) generated always as (unit_price_snapshot * quantity) stored,
  created_at timestamptz not null default now()
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  store_id uuid not null references public.stores(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null check (char_length(action) between 1 and 120),
  entity_type text not null check (char_length(entity_type) between 1 and 80),
  entity_id uuid,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index categories_store_position_idx on public.categories (store_id, position);
create index products_public_catalog_idx on public.products (store_id, is_published, position);
create index product_variants_product_position_idx on public.product_variants (product_id, position);
create index product_images_product_position_idx on public.product_images (product_id, position);
create index orders_store_created_at_idx on public.orders (store_id, created_at desc);
create index order_items_order_id_idx on public.order_items (order_id);
create index audit_log_store_created_at_idx on public.audit_log (store_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger stores_set_updated_at before update on public.stores for each row execute procedure public.set_updated_at();
create trigger store_settings_set_updated_at before update on public.store_settings for each row execute procedure public.set_updated_at();
create trigger categories_set_updated_at before update on public.categories for each row execute procedure public.set_updated_at();
create trigger products_set_updated_at before update on public.products for each row execute procedure public.set_updated_at();
create trigger product_variants_set_updated_at before update on public.product_variants for each row execute procedure public.set_updated_at();
create trigger orders_set_updated_at before update on public.orders for each row execute procedure public.set_updated_at();

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.store_members
    where user_id = auth.uid() and role = 'platform_admin'
  );
$$;

create or replace function public.has_store_role(requested_store_id uuid, allowed_roles public.store_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_platform_admin() or exists (
    select 1 from public.store_members
    where user_id = auth.uid()
      and store_id = requested_store_id
      and role = any(allowed_roles)
  );
$$;

grant execute on function public.is_platform_admin() to authenticated;
grant execute on function public.has_store_role(uuid, public.store_role[]) to authenticated;

alter table public.stores enable row level security;
alter table public.store_members enable row level security;
alter table public.store_settings enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.audit_log enable row level security;

create policy "public reads active stores" on public.stores
  for select using (is_active or public.is_platform_admin());
create policy "platform admins manage stores" on public.stores
  for all using (public.is_platform_admin()) with check (public.is_platform_admin());

create policy "members read own memberships" on public.store_members
  for select using (user_id = auth.uid() or public.is_platform_admin());
create policy "platform admins manage memberships" on public.store_members
  for all using (public.is_platform_admin()) with check (public.is_platform_admin());

create policy "public reads active store settings" on public.store_settings
  for select using (exists (select 1 from public.stores s where s.id = store_id and s.is_active));
create policy "members manage store settings" on public.store_settings
  for all using (public.has_store_role(store_id, array['owner', 'editor']::public.store_role[]))
  with check (public.has_store_role(store_id, array['owner', 'editor']::public.store_role[]));

create policy "public reads visible categories" on public.categories
  for select using (is_visible and exists (select 1 from public.stores s where s.id = store_id and s.is_active));
create policy "members manage categories" on public.categories
  for all using (public.has_store_role(store_id, array['owner', 'editor']::public.store_role[]))
  with check (public.has_store_role(store_id, array['owner', 'editor']::public.store_role[]));

create policy "public reads published products" on public.products
  for select using (is_published and exists (select 1 from public.stores s where s.id = store_id and s.is_active));
create policy "members manage products" on public.products
  for all using (public.has_store_role(store_id, array['owner', 'editor']::public.store_role[]))
  with check (public.has_store_role(store_id, array['owner', 'editor']::public.store_role[]));

create policy "public reads variants for published products" on public.product_variants
  for select using (is_available and exists (
    select 1 from public.products p join public.stores s on s.id = p.store_id
    where p.id = product_id and p.is_published and s.is_active
  ));
create policy "members manage variants" on public.product_variants
  for all using (public.has_store_role(store_id, array['owner', 'editor']::public.store_role[]))
  with check (public.has_store_role(store_id, array['owner', 'editor']::public.store_role[]));

create policy "public reads images for published products" on public.product_images
  for select using (exists (
    select 1 from public.products p join public.stores s on s.id = p.store_id
    where p.id = product_id and p.is_published and s.is_active
  ));
create policy "members manage product images" on public.product_images
  for all using (public.has_store_role(store_id, array['owner', 'editor']::public.store_role[]))
  with check (public.has_store_role(store_id, array['owner', 'editor']::public.store_role[]));

create policy "members read store orders" on public.orders
  for select using (public.has_store_role(store_id, array['owner', 'editor']::public.store_role[]));
create policy "members update store orders" on public.orders
  for update using (public.has_store_role(store_id, array['owner', 'editor']::public.store_role[]))
  with check (public.has_store_role(store_id, array['owner', 'editor']::public.store_role[]));

create policy "members read store order items" on public.order_items
  for select using (public.has_store_role(store_id, array['owner', 'editor']::public.store_role[]));

create policy "members read audit logs" on public.audit_log
  for select using (public.has_store_role(store_id, array['owner', 'editor']::public.store_role[]));
create policy "members insert audit logs" on public.audit_log
  for insert with check (public.has_store_role(store_id, array['owner', 'editor']::public.store_role[]));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('store-product-images', 'store-product-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy "public reads product image objects" on storage.objects
  for select using (bucket_id = 'store-product-images');
create policy "members upload product image objects" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'store-product-images'
    and public.has_store_role((storage.foldername(name))[1]::uuid, array['owner', 'editor']::public.store_role[])
  );
create policy "members update product image objects" on storage.objects
  for update to authenticated using (
    bucket_id = 'store-product-images'
    and public.has_store_role((storage.foldername(name))[1]::uuid, array['owner', 'editor']::public.store_role[])
  ) with check (
    bucket_id = 'store-product-images'
    and public.has_store_role((storage.foldername(name))[1]::uuid, array['owner', 'editor']::public.store_role[])
  );
create policy "members delete product image objects" on storage.objects
  for delete to authenticated using (
    bucket_id = 'store-product-images'
    and public.has_store_role((storage.foldername(name))[1]::uuid, array['owner', 'editor']::public.store_role[])
  );

create function public.get_public_storefront(requested_slug text)
returns jsonb
language sql
stable
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'store', jsonb_build_object('slug', s.slug, 'name', s.name),
    'settings', coalesce(to_jsonb(ss) - 'store_id' - 'created_at' - 'updated_at', '{}'::jsonb),
    'categories', coalesce((
      select jsonb_agg(to_jsonb(c) - 'store_id' - 'created_at' - 'updated_at' order by c.position, c.name)
      from public.categories c where c.store_id = s.id and c.is_visible
    ), '[]'::jsonb),
    'products', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', p.id, 'slug', p.slug, 'name', p.name,
        'short_description', p.short_description, 'description', p.description,
        'price', p.price, 'compare_at_price', p.compare_at_price,
        'stock_quantity', p.stock_quantity, 'track_inventory', p.track_inventory,
        'is_featured', p.is_featured, 'category_id', p.category_id,
        'metadata', p.metadata,
        'variants', coalesce((
          select jsonb_agg(to_jsonb(v) - 'store_id' - 'created_at' - 'updated_at' order by v.position, v.name)
          from public.product_variants v where v.product_id = p.id and v.is_available
        ), '[]'::jsonb),
        'images', coalesce((
          select jsonb_agg(to_jsonb(i) - 'store_id' - 'created_at' order by i.position)
          from public.product_images i where i.product_id = p.id
        ), '[]'::jsonb)
      ) order by p.position, p.name)
      from public.products p where p.store_id = s.id and p.is_published
    ), '[]'::jsonb)
  )
  from public.stores s
  left join public.store_settings ss on ss.store_id = s.id
  where s.slug = requested_slug and s.is_active
  limit 1;
$$;

grant execute on function public.get_public_storefront(text) to anon, authenticated;
