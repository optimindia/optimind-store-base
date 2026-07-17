# Supabase Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert `tiendasonline` into the secure shared data foundation for every OptiMind store while preserving the public storefronts and their distinct design.

**Architecture:** A versioned SQL migration creates a multi-tenant catalog, Auth membership model, Storage policies and public read views. A thin browser client loads only a store's public catalog by slug, keeps the existing static data as a resilient fallback, and sends orders through a guarded server endpoint before WhatsApp opens. A separate shared dashboard is added only after the public contract is live.

**Tech Stack:** Supabase Postgres, Auth, Storage, RLS, Edge Functions; vanilla JavaScript; Cloudflare Pages; Node built-in test runner.

## Global Constraints

- Use project `zfqnomvcnxzkwfxasuij` (`tiendasonline`) only; do not create a second database.
- Keep the three storefronts visually and functionally independent; data sharing must not turn them into one template.
- Every tenant-owned row contains `store_id`; all policies derive permission from the authenticated user and never trust a browser-provided tenant ID.
- Public callers may read only active stores, published products, available categories, public images and public settings.
- Base customers have no dashboard membership; Autogestionable owners and editors are limited to their own store.
- Persist order line prices and product names as snapshots before opening WhatsApp.
- Do not implement payments, automatic payment confirmation, marketplace synchronization or a second database.
- Preserve the untracked user-owned `captura-landing.png` file.

---

### Task 1: Versioned multi-tenant database migration

**Files:**
- Create: `supabase/migrations/20260716190000_create_multitenant_commerce.sql`
- Create: `tests/supabase-schema.test.js`

**Interfaces:**
- Consumes: Supabase Auth schema `auth.users`.
- Produces: `public.stores`, `store_members`, `store_settings`, `categories`, `products`, `product_variants`, `product_images`, `orders`, `order_items`, `audit_log`, the `is_platform_admin()` and `has_store_role(uuid, text[])` SQL helpers, and public catalog RPC `get_public_storefront(text)`.

- [ ] **Step 1: Write the failing schema contract test**

```js
test('migration defines tenant tables, RLS and public storefront RPC', () => {
  const sql = fs.readFileSync(MIGRATION, 'utf8');
  for (const token of [
    'create table public.stores', 'create table public.store_members',
    'create table public.products', 'create table public.orders',
    'alter table public.products enable row level security',
    'create function public.get_public_storefront',
    'create policy "public reads published products"'
  ]) assert.match(sql.toLowerCase(), new RegExp(escapeRegExp(token)));
});
```

- [ ] **Step 2: Run the new test before the migration exists**

Run: `node --test tests/supabase-schema.test.js`

Expected: failure because `supabase/migrations/20260716190000_create_multitenant_commerce.sql` is absent.

- [ ] **Step 3: Implement the migration**

Create UUID primary keys, `store_plan` (`base`, `self_managed`), `store_role` (`platform_admin`, `owner`, `editor`) and `order_status` enums. Add explicit foreign keys, `updated_at` trigger, non-negative price/stock checks, unique slugs, `(store_id, slug)` product uniqueness and catalog indexes. Implement RLS for each table and a read-only storefront RPC that returns the active store's settings, categories, published products, variants and images by slug. Create the private `store-product-images` bucket and Storage policies based on the first `stores/<store_id>/` path segment.

- [ ] **Step 4: Run static tests and deploy the SQL migration**

Run: `node --test tests/supabase-schema.test.js`

Expected: PASS.

Use `mcp__codex_apps__supabase_apply_migration` with project ID `zfqnomvcnxzkwfxasuij`, migration name `create_multitenant_commerce`, and the SQL file contents. Then use `mcp__codex_apps__supabase_list_tables` and `mcp__codex_apps__supabase_get_advisors` for `security` and `performance`.

- [ ] **Step 5: Commit the migration and test**

```bash
git add -- supabase/migrations/20260716190000_create_multitenant_commerce.sql tests/supabase-schema.test.js
git commit -m "feat: add secure multi-tenant commerce schema"
```

### Task 2: Seed reference storefronts and public contract

**Files:**
- Create: `supabase/seed/reference-stores.sql`
- Create: `tests/public-catalog-contract.test.js`

**Interfaces:**
- Consumes: tables and `get_public_storefront(slug)` from Task 1.
- Produces: `moda-lucia`, `todo-en-casa` and `raices-del-norte` Base-store records with categories, products, variants and settings; normalized public catalog payload examples.

- [ ] **Step 1: Write failing payload contract tests**

```js
test('normalizes a Supabase storefront payload without leaking private fields', () => {
  const catalog = normalizeStorefront(payload);
  assert.equal(catalog.store.slug, 'moda-lucia');
  assert.equal(catalog.products[0].price, 25900);
  assert.equal('plan' in catalog.store, false);
  assert.equal('owner_id' in catalog.store, false);
});
```

- [ ] **Step 2: Run the contract test before the adapter exists**

Run: `node --test tests/public-catalog-contract.test.js`

Expected: failure because `src/catalog-api.js` is absent.

- [ ] **Step 3: Add idempotent seed data**

Use stable explicit slugs, upserts by store slug/category slug/product slug, and representative products from each existing demo. Set all three stores active and plan `base`, preserve local asset URLs until Storage uploads exist, and never seed Auth users.

- [ ] **Step 4: Apply seed data and verify public read isolation**

Use `mcp__codex_apps__supabase_execute_sql` only for the idempotent seed SQL. Execute `select public.get_public_storefront('moda-lucia')` and confirm it contains no membership, audit or private order data.

- [ ] **Step 5: Commit seed contract**

```bash
git add -- supabase/seed/reference-stores.sql tests/public-catalog-contract.test.js
git commit -m "feat: seed reference storefront catalog"
```

### Task 3: Browser catalog adapter with safe fallback

**Files:**
- Create: `src/catalog-api.js`
- Modify: `src/app.js`
- Modify: `examples/fashion/index.html`
- Modify: `examples/general/index.html`
- Modify: `examples/artisan/index.html`
- Modify: `examples/fashion/app.js`
- Modify: `examples/general/app.js`
- Modify: `examples/artisan/app.js`
- Test: `tests/public-catalog-contract.test.js`

**Interfaces:**
- Consumes: `window.OPTIMIND_STORE_SOURCE = { slug, supabaseUrl, publishableKey }` and `get_public_storefront(slug)`.
- Produces: `window.OptiMindCatalog.load(source, fallback)` returning `{ source: 'supabase'|'fallback', catalog }` and the existing `window.STORE_PRODUCTS` shape expected by each store skin.

- [ ] **Step 1: Implement a dependency-free adapter**

```js
async function load(source, fallback) {
  if (!source?.supabaseUrl || !source?.publishableKey) return { source: 'fallback', catalog: fallback };
  const response = await fetch(`${source.supabaseUrl}/rest/v1/rpc/get_public_storefront`, {
    method: 'POST', headers: {
      apikey: source.publishableKey, Authorization: `Bearer ${source.publishableKey}`,
      'Content-Type': 'application/json'
    }, body: JSON.stringify({ requested_slug: source.slug })
  });
  if (!response.ok) return { source: 'fallback', catalog: fallback };
  const payload = await response.json();
  return payload ? { source: 'supabase', catalog: normalizeStorefront(payload) } : { source: 'fallback', catalog: fallback };
}
```

- [ ] **Step 2: Load remote catalog before the store renders**

Add `catalog-api.js` before `app.js`, define the store slug in each `index.html`, and have each store app replace its local array only after validation. A bad URL, empty payload or network error must leave the existing local demo working and log one non-blocking diagnostic in development.

- [ ] **Step 3: Test adapters and existing storefront logic**

Run: `npm test && npm run check && npm run build`

Expected: every test passes and `dist/moda-lucia`, `dist/todo-en-casa`, `dist/raices-del-norte` each include `catalog-api.js`.

- [ ] **Step 4: Commit the public catalog connection**

```bash
git add -- src/catalog-api.js src/app.js examples/fashion examples/general examples/artisan tests/public-catalog-contract.test.js
git commit -m "feat: connect storefronts to shared catalog"
```

### Task 4: Order snapshot endpoint and WhatsApp handoff

**Files:**
- Create: `supabase/functions/create-order/index.ts`
- Create: `supabase/functions/create-order/deno.json`
- Modify: `src/store-core.js`
- Modify: `src/app.js`
- Create: `tests/order-ticket.test.js`

**Interfaces:**
- Consumes: `{ storeSlug, items: [{ productId, variantId?, quantity }], customer }` from the storefront.
- Produces: `{ orderId, orderNumber, whatsappText }`, with prices/names fetched from the database and persisted into `orders`/`order_items`.

- [ ] **Step 1: Write a failing order payload test**

```js
test('buildOrderRequest strips client-supplied price and validates positive quantities', () => {
  const request = buildOrderRequest('moda-lucia', [{ productId: 'remera-lua', quantity: 2, price: 1 }], customer);
  assert.deepEqual(request.items, [{ productId: 'remera-lua', variantId: null, quantity: 2 }]);
  assert.throws(() => buildOrderRequest('moda-lucia', [{ productId: 'x', quantity: 0 }], customer));
});
```

- [ ] **Step 2: Implement Edge Function validation and server prices**

Validate a published active store, item IDs, variants and stock inside Postgres. Insert one `orders` record and immutable `order_items` snapshots in a single transaction, decrement finite stock only after a successful insert, and return a formatted WhatsApp ticket. Enable JWT verification only if the existing endpoint requires user identity; anonymous public order creation must instead use a narrowly validated body, rate-limit-ready design and public store lookup.

- [ ] **Step 3: Deploy and test without sending WhatsApp**

Use `mcp__codex_apps__supabase_deploy_edge_function`, then run a local request-builder test and a manual non-production request against one demo item. Confirm the database stores an order snapshot and that a changed product price does not affect existing order rows.

- [ ] **Step 4: Commit order flow**

```bash
git add -- supabase/functions/create-order src/store-core.js src/app.js tests/order-ticket.test.js
git commit -m "feat: persist order tickets before WhatsApp"
```

### Task 5: Shared self-managed dashboard and replicable build pipeline

**Files:**
- Create: `admin/index.html`
- Create: `admin/app.js`
- Create: `admin/styles.css`
- Modify: `scripts/create-store.js`
- Modify: `scripts/build.js`
- Create: `clients/.gitkeep`
- Create: `tests/build-client-persistence.test.js`

**Interfaces:**
- Consumes: Supabase Auth session and `store_members` role policies.
- Produces: a dashboard for `owner`/`editor` product/category/image/status management and a build that copies persistent client folders from `clients/<slug>` to `dist/<slug>` without deleting them.

- [ ] **Step 1: Write failing build persistence test**

```js
test('build preserves a generated client storefront', () => {
  fs.mkdirSync(path.join(root, 'clients', 'cliente-prueba'), { recursive: true });
  fs.writeFileSync(path.join(root, 'clients', 'cliente-prueba', 'index.html'), '<h1>Cliente</h1>');
  execFileSync(process.execPath, ['scripts/build.js'], { cwd: root });
  assert.equal(fs.existsSync(path.join(root, 'dist', 'cliente-prueba', 'index.html')), true);
});
```

- [ ] **Step 2: Move generated sources out of `dist`**

Change `create-store` output to `clients/<slug>`. Make `build.js` copy demos, showcase and every directory in `clients/` after cleaning `dist/`. Reject a client slug that collides with a demo slug.

- [ ] **Step 3: Build the private dashboard**

Use Supabase Auth magic-link or password login, read the member's allowed stores, hide the store selector unless `platform_admin`, and use RLS-protected table operations for categories, products, variants, images and publish state. Do not expose the service role key. Route image uploads to the tenant folder in the private bucket and render accessible upload/error states.

- [ ] **Step 4: Full verification and final security review**

Run: `npm test && npm run check && npm run build`

Use `mcp__codex_apps__supabase_get_advisors` for both security and performance. Resolve every advisory caused by the new schema, then test a public catalog request, owner mutation, cross-tenant denied mutation and a Base store with no dashboard member.

- [ ] **Step 5: Commit and deploy**

```bash
git add -- admin scripts/create-store.js scripts/build.js clients tests/build-client-persistence.test.js
git commit -m "feat: add self-managed store dashboard"
git push origin master
```

Deploy through the existing Cloudflare Pages Git integration and verify the production storefront URLs after the build is green.

## Plan self-review

- Spec coverage: Tasks 1–2 cover the shared database, tenant isolation, seed data and security; Task 3 connects the public skins without replacing their design; Task 4 preserves orders before WhatsApp; Task 5 delivers the owner panel and fixes the destructive build path.
- Placeholder scan: no deferred implementation markers are present; each task names files, interfaces, test command and completion action.
- Type consistency: `store_id` is the sole tenant boundary; `storeSlug` is only the public lookup value; browser code supplies product IDs/quantity while database code controls price and authorization.
