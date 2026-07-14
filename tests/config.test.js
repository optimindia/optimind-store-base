'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Core = require('../store-core.js');

const root = path.join(__dirname, '..');

// store.config.js y products.js asignan a `window` (sin exportar). Los cargamos
// en un sandbox con un objeto window propio para poder leerlos en Node.
function loadGlobal(file, key) {
  const code = fs.readFileSync(path.join(root, file), 'utf8');
  const sandbox = {};
  const fn = new Function('window', code + '\nreturn window.' + key + ';');
  return fn(sandbox);
}

const config = loadGlobal('store.config.js', 'STORE_CONFIG');
const products = loadGlobal('products.js', 'STORE_PRODUCTS');

test('store.config.js define los campos obligatorios', () => {
  assert.ok(config, 'STORE_CONFIG debe estar definido');
  assert.ok(config.store, 'debe definir config.store');
  assert.ok(config.store.slug, 'store.slug es obligatorio');
  assert.ok(config.store.name, 'store.name es obligatorio');
  assert.ok(config.store.whatsapp, 'store.whatsapp es obligatorio');
  assert.ok(/^\d+$/.test(config.store.whatsapp), 'store.whatsapp debe ser solo dígitos');
  assert.ok(config.store.email, 'store.email es obligatorio');
  assert.ok(config.store.url, 'store.url es obligatorio');

  assert.ok(config.locale && config.locale.currency, 'locale.currency es obligatorio');
  assert.ok(config.commerce, 'debe definir config.commerce');
  assert.ok(config.checkout && config.checkout.intro, 'checkout.intro es obligatorio');
  assert.ok(config.seo && config.seo.title && config.seo.description && config.seo.canonical, 'seo requiere title, description y canonical');
  assert.ok(config.features, 'debe definir config.features');
});

test('config.categories define etiquetas usables para los filtros', () => {
  assert.ok(Array.isArray(config.categories) && config.categories.length >= 1, 'categories debe ser un array no vacío');
  for (const cat of config.categories) {
    assert.ok(cat.id, 'cada categoría necesita id');
    assert.ok(cat.label, 'cada categoría necesita label');
  }
  const ids = config.categories.map((cat) => cat.id);
  assert.equal(new Set(ids).size, ids.length, 'los ids de categoría no se repiten');
});

test('config.legal define al responsable para los documentos legales', () => {
  assert.ok(config.legal, 'debe definir config.legal');
  assert.ok(config.legal.responsibleName, 'legal.responsibleName es obligatorio');
  assert.ok(config.legal.email, 'legal.email es obligatorio');
});

test('products.js define un catálogo válido que pasa el normalizador del motor', () => {
  assert.ok(Array.isArray(products) && products.length >= 1, 'STORE_PRODUCTS debe ser un array no vacío');
  const normalized = Core.normalizeProducts(products);
  assert.equal(normalized.length, products.length, 'el catálogo demo no debe tener productos inválidos ni duplicados');

  for (const product of normalized) {
    assert.ok(product.id, 'todo producto necesita id');
    assert.ok(product.name, 'todo producto necesita name');
    assert.ok(product.category, 'todo producto necesita category');
    assert.ok(typeof product.price === 'number' && product.price >= 0, 'todo producto necesita price >= 0');
    assert.ok(['in_stock', 'low_stock', 'out_of_stock'].includes(product.stockStatus), 'stockStatus inválido en ' + product.id);
  }

  const slugs = normalized.map((product) => product.slug);
  assert.equal(new Set(slugs).size, slugs.length, 'los slugs de producto no se repiten');
});

test('cada producto referencia una imagen que existe en assets/products', () => {
  for (const product of products) {
    assert.ok(product.image, 'todo producto necesita image en ' + (product.id || '(sin id)'));
    const file = path.join(root, product.image.replace(/\//g, path.sep));
    assert.ok(fs.existsSync(file), 'falta el archivo de imagen: ' + product.image);
  }
});

test('las categorías usadas en el catálogo existen en config.categories', () => {
  const known = new Set(config.categories.map((cat) => cat.id));
  for (const product of products) {
    assert.ok(known.has(product.category), 'categoría desconocida en ' + product.id + ': ' + product.category);
  }
});