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

test('magic links send the production dashboard as the redirect target', () => {
  const app = fs.readFileSync(path.join(root, 'admin', 'app.js'), 'utf8');
  assert.ok(app.includes("email_redirect_to:`${location.origin}${location.pathname}`"));
  assert.ok(!app.includes("options:{emailRedirectTo:"));
});

test('dashboard explains the temporary Supabase email rate limit', () => {
  const app = fs.readFileSync(path.join(root, 'admin', 'app.js'), 'utf8');
  assert.ok(app.includes("r.status===429"));
  assert.ok(app.includes('Esperá un minuto antes de pedir otro enlace.'));
});
