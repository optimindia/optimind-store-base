'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const root = path.join(__dirname, '..');

test('dashboard exposes secure login and operational surfaces', () => {
  const html = fs.readFileSync(path.join(root, 'admin', 'index.html'), 'utf8');
  for (const token of ['id="auth-view"', 'id="workspace"', 'data-store-select', 'data-product-form', 'data-category-form', 'app.js']) assert.ok(html.includes(token));
});

test('build publishes the dashboard route', () => {
  const build = fs.readFileSync(path.join(root, 'scripts', 'build.js'), 'utf8');
  assert.ok(build.includes("const adminDir = path.join(root, 'admin')"));
  assert.ok(build.includes("copyDir(adminDir, path.join(outDir, 'admin'))"));
});

test('dashboard authenticates with email and password instead of magic links', () => {
  const html = fs.readFileSync(path.join(root, 'admin', 'index.html'), 'utf8');
  const app = fs.readFileSync(path.join(root, 'admin', 'app.js'), 'utf8');
  assert.ok(html.includes('name="password"'));
  assert.ok(app.includes('token?grant_type=password'));
  assert.ok(!app.includes('/auth/v1/otp'));
});

test('platform admin can provision a client account from the dashboard', () => {
  const html = fs.readFileSync(path.join(root, 'admin', 'index.html'), 'utf8');
  const app = fs.readFileSync(path.join(root, 'admin', 'app.js'), 'utf8');
  assert.ok(html.includes('data-member-form'));
  assert.ok(html.includes('data-tab="team"'));
  assert.ok(app.includes('functions/v1/manage-accounts'));
});

test('account provisioning function only permits platform administrators', () => {
  const functionPath = path.join(root, 'supabase', 'functions', 'manage-accounts', 'index.ts');
  assert.ok(fs.existsSync(functionPath));
  const source = fs.readFileSync(functionPath, 'utf8');
  assert.ok(source.includes("eq('role', 'platform_admin')"));
  assert.ok(source.includes('auth.admin.createUser'));
  assert.ok(source.includes('email_confirm: true'));
});

test('password login card remains contained on small screens', () => {
  const styles = fs.readFileSync(path.join(root, 'admin', 'styles.css'), 'utf8');
  assert.ok(styles.includes('@media(max-width:800px){.auth-card{width:100%;max-width:calc(100vw - 48px);min-width:0;padding:32px}'));
});
