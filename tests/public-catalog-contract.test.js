'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { normalizeStorefront, loadStorefront } = require('../src/catalog-api.js');

const payload = {
  store: { slug: 'moda-lucia', name: 'Moda Lucía', plan: 'base' },
  settings: { whatsapp: '5492616123456', free_shipping_from: 85000 },
  categories: [{ id: 'cat-1', slug: 'remeras', name: 'Remeras', position: 10 }],
  products: [{
    id: 'product-1', slug: 'remera-lua', name: 'Remera Lua', short_description: 'Algodón orgánico.',
    description: 'Remera amplia.', price: 25900, compare_at_price: null, stock_quantity: null,
    track_inventory: false, is_featured: true, category_id: 'cat-1',
    metadata: { image: 'assets/products/remera.svg', alt: 'Remera Lua', stock_status: 'in_stock' },
    variants: [{ id: 'variant-1', name: 'Blanco', price_delta: 0, stock_quantity: null, is_available: true }],
    images: []
  }]
};

test('normalizes the public payload without exposing private store fields', () => {
  const catalog = normalizeStorefront(payload);
  assert.equal(catalog.store.slug, 'moda-lucia');
  assert.equal(catalog.categories[0].id, 'remeras');
  assert.equal(catalog.products[0].category, 'remeras');
  assert.equal(catalog.products[0].price, 25900);
  assert.equal(catalog.products[0].variants[0].label, 'Blanco');
  assert.equal('plan' in catalog.store, false);
});

test('keeps an untracked product without variants available', () => {
  const noVariantPayload = {
    ...payload,
    products: [{
      ...payload.products[0],
      variants: []
    }]
  };

  const catalog = normalizeStorefront(noVariantPayload);
  assert.equal(catalog.products[0].stockStatus, 'in_stock');
});

test('uses the local catalog when the public request fails', async () => {
  const fallback = { products: [{ id: 'local-product' }] };
  const result = await loadStorefront({ slug: 'moda-lucia', supabaseUrl: 'https://example.test', publishableKey: 'key' }, fallback, async () => ({ ok: false }));
  assert.equal(result.source, 'fallback');
  assert.equal(result.catalog, fallback);
});
