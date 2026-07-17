'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const migrationPath = path.join(
  __dirname,
  '..',
  'supabase',
  'migrations',
  '20260716190000_create_multitenant_commerce.sql'
);
const hardeningMigrationPath = path.join(
  __dirname,
  '..',
  'supabase',
  'migrations',
  '20260716191000_harden_multitenant_commerce.sql'
);
const policyMigrationPath = path.join(
  __dirname,
  '..',
  'supabase',
  'migrations',
  '20260716192000_optimize_membership_policies.sql'
);
const encodingRepairMigrationPath = path.join(
  __dirname,
  '..',
  'supabase',
  'migrations',
  '20260716200000_repair_mojibake_seed_text.sql'
);

test('the commerce migration defines the tenant boundary and public storefront contract', () => {
  const sql = fs.readFileSync(migrationPath, 'utf8').toLowerCase();
  const required = [
    'create table public.stores',
    'create table public.store_members',
    'create table public.store_settings',
    'create table public.categories',
    'create table public.products',
    'create table public.product_variants',
    'create table public.product_images',
    'create table public.orders',
    'create table public.order_items',
    'create table public.audit_log',
    'alter table public.products enable row level security',
    'create function public.get_public_storefront',
    'create policy "public reads published products"'
  ];

  for (const statement of required) {
    assert.ok(sql.includes(statement), `missing SQL contract: ${statement}`);
  }
});

test('the public storefront RPC accepts only a slug and returns jsonb', () => {
  const sql = fs.readFileSync(migrationPath, 'utf8').toLowerCase();
  assert.match(sql, /get_public_storefront\(requested_slug text\)/);
  assert.match(sql, /returns jsonb/);
  assert.match(sql, /security invoker/);
});

test('the hardening migration removes public helper access and indexes tenant foreign keys', () => {
  const sql = fs.readFileSync(hardeningMigrationPath, 'utf8').toLowerCase();
  for (const statement of [
    'create schema if not exists private',
    'alter function public.is_platform_admin() set schema private',
    'alter function public.has_store_role(uuid, public.store_role[]) set schema private',
    'drop policy if exists "public reads product image objects" on storage.objects',
    'revoke all on function public.is_platform_admin() from public, anon, authenticated',
    'create index audit_log_actor_id_idx',
    'create index order_items_product_id_idx',
    'create index order_items_variant_id_idx'
  ]) assert.ok(sql.includes(statement), `missing hardening contract: ${statement}`);
});

test('the policy optimization separates membership writes from reads', () => {
  const sql = fs.readFileSync(policyMigrationPath, 'utf8').toLowerCase();
  assert.ok(sql.includes('drop policy if exists "platform admins manage memberships" on public.store_members'));
  assert.ok(sql.includes('for insert to authenticated'));
  assert.ok(sql.includes('for update to authenticated'));
  assert.ok(sql.includes('for delete to authenticated'));
});

test('the encoding repair migrates corrupted seed text without changing valid rows', () => {
  const sql = fs.readFileSync(encodingRepairMigrationPath, 'utf8').toLowerCase();
  assert.ok(sql.includes("convert_from(convert_to(name, 'win1252'), 'utf8')"));
  assert.ok(sql.includes('position(chr(195) in'));
  assert.ok(sql.includes('public.products'));
  assert.ok(sql.includes('public.store_settings'));
});
