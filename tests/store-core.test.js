'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const Core = require('../store-core.js');

const sampleProducts = [
  {
    id: 'lamp',
    slug: 'lampara',
    name: 'Lámpara',
    category: 'hogar',
    price: 39900,
    tags: ['luz', 'mesa'],
    stockStatus: 'in_stock'
  },
  {
    id: 'mug',
    slug: 'taza',
    name: 'Taza',
    category: 'cocina',
    price: 12900,
    tags: ['cerámica'],
    stockStatus: 'in_stock'
  },
  {
    id: 'lamp',
    slug: 'duplicado',
    name: 'Duplicado',
    category: 'hogar',
    price: 1,
    stockStatus: 'in_stock'
  },
  { id: 'sin-nombre', category: 'hogar', price: 2500 },
  { id: 'precio-negativo', name: 'Error', category: 'hogar', price: -1 }
];

test('normaliza el catálogo y descarta productos inválidos o duplicados', () => {
  const result = Core.normalizeProducts(sampleProducts);

  assert.equal(result.length, 2);
  assert.deepEqual(result.map((product) => product.id), ['lamp', 'mug']);
  assert.equal(result[0].stockStatus, 'in_stock');
});

test('busca sin distinguir mayúsculas ni tildes', () => {
  const products = Core.normalizeProducts(sampleProducts);

  assert.deepEqual(Core.searchProducts(products, 'LAMPARA').map((product) => product.id), ['lamp']);
  assert.deepEqual(Core.searchProducts(products, 'ceramica').map((product) => product.id), ['mug']);
});

test('filtra por categoría y ordena por precio ascendente', () => {
  const products = Core.normalizeProducts(sampleProducts);
  const result = Core.filterAndSort(products, { category: 'hogar', sort: 'price-asc' });

  assert.deepEqual(result.map((product) => product.id), ['lamp']);
});

test('ordena por nombre con reglas del español', () => {
  const products = Core.normalizeProducts(sampleProducts);
  const result = Core.filterAndSort(products, { category: 'all', sort: 'name-asc' });

  assert.deepEqual(result.map((product) => product.name), ['Lámpara', 'Taza']);
});

const commerceProducts = Core.normalizeProducts([
  {
    id: 'lamp',
    name: 'Lámpara',
    category: 'hogar',
    price: 40000,
    compareAtPrice: 45000,
    stockStatus: 'in_stock',
    variants: [
      { id: 'arena', label: 'Arena', priceDelta: 0, stockStatus: 'in_stock' },
      { id: 'azul', label: 'Azul', priceDelta: 2000, stockStatus: 'in_stock' }
    ]
  },
  {
    id: 'mug',
    name: 'Taza',
    category: 'cocina',
    price: 15000,
    stockStatus: 'in_stock'
  },
  {
    id: 'sold',
    name: 'Agotado',
    category: 'hogar',
    price: 10000,
    stockStatus: 'out_of_stock'
  }
]);

test('el carrito acumula la misma línea y separa variantes distintas', () => {
  let cart = [];
  cart = Core.addCartItem(cart, { productId: 'lamp', variantId: 'arena', quantity: 1 }, commerceProducts);
  cart = Core.addCartItem(cart, { productId: 'lamp', variantId: 'arena', quantity: 2 }, commerceProducts);
  cart = Core.addCartItem(cart, { productId: 'lamp', variantId: 'azul', quantity: 1 }, commerceProducts);

  assert.deepEqual(cart, [
    { lineKey: 'lamp::arena', productId: 'lamp', variantId: 'arena', quantity: 3 },
    { lineKey: 'lamp::azul', productId: 'lamp', variantId: 'azul', quantity: 1 }
  ]);
});

test('el carrito rechaza productos y variantes agotados', () => {
  const unchanged = Core.addCartItem([], { productId: 'sold', quantity: 1 }, commerceProducts);
  const missingVariant = Core.addCartItem([], { productId: 'lamp', variantId: 'missing', quantity: 1 }, commerceProducts);

  assert.deepEqual(unchanged, []);
  assert.deepEqual(missingVariant, []);
});

test('actualizar a cero elimina la línea del carrito', () => {
  const cart = [{ lineKey: 'mug::base', productId: 'mug', variantId: '', quantity: 2 }];

  assert.deepEqual(Core.updateCartItem(cart, 'mug::base', 0), []);
});

test('normaliza un carrito persistido contra el catálogo actual', () => {
  const stale = [
    { productId: 'lamp', variantId: 'arena', quantity: 2 },
    { productId: 'missing', quantity: 3 },
    { productId: 'sold', quantity: 1 }
  ];

  assert.deepEqual(Core.normalizeCart(stale, commerceProducts), [
    { lineKey: 'lamp::arena', productId: 'lamp', variantId: 'arena', quantity: 2 }
  ]);
});

test('calcula subtotal, ahorro y umbral de envío gratis', () => {
  const cart = [
    { lineKey: 'lamp::arena', productId: 'lamp', variantId: 'arena', quantity: 2 },
    { lineKey: 'mug::base', productId: 'mug', variantId: '', quantity: 1 }
  ];
  const totals = Core.calculateCart(cart, commerceProducts, { freeShippingFrom: 90000 });

  assert.equal(totals.itemCount, 3);
  assert.equal(totals.subtotal, 95000);
  assert.equal(totals.compareTotal, 105000);
  assert.equal(totals.savings, 10000);
  assert.equal(totals.freeShippingRemaining, 0);
  assert.equal(totals.qualifiesForFreeShipping, true);
});

test('captura atribución UTM y fbclid desde una URL', () => {
  const attribution = Core.captureAttribution('https://demo.test/?utm_source=instagram&utm_medium=paid_social&utm_campaign=verano&utm_content=lampara&fbclid=abc123');

  assert.deepEqual(attribution, {
    source: 'instagram',
    medium: 'paid_social',
    campaign: 'verano',
    content: 'lampara',
    term: '',
    fbclid: 'abc123'
  });
});

test('genera un mensaje de WhatsApp completo y legible', () => {
  const cart = [{ lineKey: 'lamp::arena', productId: 'lamp', variantId: 'arena', quantity: 2 }];
  const totals = Core.calculateCart(cart, commerceProducts, { freeShippingFrom: 90000 });
  const message = Core.buildWhatsAppMessage({
    cart,
    products: commerceProducts,
    totals,
    customer: { name: 'Martina', city: 'Godoy Cruz', deliveryLabel: 'Envío a domicilio', address: 'San Martín 123', note: '' },
    attribution: { source: 'instagram', campaign: 'verano' },
    config: { storeName: 'Demo', intro: 'Hola, quiero hacer este pedido:', locale: 'es-AR', currency: 'ARS' },
    orderId: 'DEM-7K3M2'
  });

  assert.match(message, /Pedido: DEM-7K3M2/);
  assert.match(message, /2 × Lámpara — Arena/);
  assert.match(message, /Subtotal: \$ 80\.000/);
  assert.match(message, /Localidad: Godoy Cruz/);
  assert.match(message, /Origen: instagram \/ verano/);
});

test('construye la URL de WhatsApp y rechaza un mensaje vacío', () => {
  const url = Core.buildWhatsAppUrl('+54 9 11 0000-0000', 'Hola Demo');

  assert.equal(url, 'https://wa.me/5491100000000?text=Hola%20Demo');
  assert.throws(() => Core.buildWhatsAppUrl('5491100000000', ''), /mensaje/i);
});