# Operations Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a secure shared OptiMind operations dashboard at `/admin/` for platform administrators and self-managed store clients.

**Architecture:** A dependency-free static dashboard uses Supabase Auth and the PostgREST API with the authenticated user JWT. Existing RLS policies remain the authority for tenant isolation. The build copies the dashboard into `dist/admin` with the storefront portfolio.

**Tech Stack:** Vanilla HTML/CSS/JavaScript, Supabase Auth REST API, Supabase PostgREST, Cloudflare Pages, Node built-in tests.

## Global Constraints

- Use only project `zfqnomvcnxzkwfxasuij`; do not create a second database.
- Never expose a Supabase service-role key in source, Cloudflare, browser or Git.
- Use Magic Link email authentication and RLS for every tenant-bound request.
- Keep Base clients out of `store_members`; owner/editor users operate only within their assigned `store_id`.
- Preserve the user-owned untracked `captura-landing.png` file.

### Task 1: Dashboard API and session contract

**Files:** `admin/api.js`, `tests/admin-api.test.js`

- [ ] Write a failing test for session parsing, auth headers, query construction and an untracked product remaining available.
- [ ] Implement token parsing, local session storage, authenticated REST calls, safe query encoding and normalized catalog records.
- [ ] Run `node --test tests/admin-api.test.js` and commit the contract.

### Task 2: Secure dashboard interface

**Files:** `admin/index.html`, `admin/styles.css`, `admin/app.js`, `tests/admin-ui.test.js`

- [ ] Write failing markup tests for login, workspace, store selector, product form, category form and orders surface.
- [ ] Implement Magic Link sign-in, session recovery, member loading, role-aware store selection, category/product/variant CRUD, plan updates and error/empty states.
- [ ] Render and review desktop and mobile screenshots; run the full test/check/build suite.

### Task 3: Build, bootstrap and production verification

**Files:** `scripts/build.js`, `supabase/migrations/20260716210000_dashboard_access_helpers.sql`, `tests/build-dashboard.test.js`

- [ ] Write failing test asserting `/admin/index.html` is emitted by build.
- [ ] Copy the dashboard to `dist/admin`, add a private, idempotent platform-admin bootstrap helper, and assign the first administrator after the supplied account is created.
- [ ] Apply migration, audit RLS/security, build, push, verify production `/admin/` and perform the Magic Link flow.
