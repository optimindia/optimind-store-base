'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const seedPath = path.join(__dirname, '..', 'supabase', 'seed', 'reference-stores.sql');

test('reference seed contains the three live storefront slugs and remains idempotent', () => {
  const sql = fs.readFileSync(seedPath, 'utf8').toLowerCase();
  for (const slug of ['moda-lucia', 'todo-en-casa', 'raices-del-norte']) {
    assert.ok(sql.includes(`'${slug}'`), `missing reference store ${slug}`);
  }
  assert.match(sql, /on conflict \(slug\) do update/);
  assert.match(sql, /on conflict \(store_id, slug\) do update/);
});

test('reference seed provides catalog products and no privileged Auth users', () => {
  const sql = fs.readFileSync(seedPath, 'utf8').toLowerCase();
  assert.match(sql, /'remera-lua'/);
  assert.match(sql, /'set-sartenes'/);
  assert.match(sql, /'mochila-tejida'/);
  assert.equal(sql.includes('auth.users'), false);
  assert.equal(sql.includes('store_members'), false);
});
