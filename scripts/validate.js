#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { parseArgs } = require('node:util');

// Valida una tienda generada (o el template default).
// Uso:
//   node scripts/validate.js --dir dist/clients/moda-lucia
//   node scripts/validate.js --dir templates/default

function log(message, silent) {
  if (!silent) console.log(message);
}

function validate(dir, silent) {
  const abs = path.resolve(dir);
  if (!fs.existsSync(abs)) {
    console.error('No existe el directorio: ' + abs);
    return false;
  }

  const required = ['index.html', 'store.config.js', 'products.js', 'store-core.js', 'analytics.js', 'app.js', 'styles.css'];
  for (const file of required) {
    const filePath = path.join(abs, file);
    if (!fs.existsSync(filePath)) {
      console.error('Falta archivo requerido: ' + file);
      return false;
    }
  }

  // Cargar config en sandbox.
  const configCode = fs.readFileSync(path.join(abs, 'store.config.js'), 'utf8');
  const config = (new Function('window', configCode + '\nreturn window.STORE_CONFIG;'))({});

  // Validar campos mínimos de config.
  const checks = [
    [config.store?.slug, 'store.slug'],
    [config.store?.name, 'store.name'],
    [config.store?.whatsapp && /^\d+$/.test(config.store.whatsapp), 'store.whatsapp (solo dígitos)'],
    [config.store?.email, 'store.email'],
    [config.store?.url, 'store.url'],
    [config.locale?.currency, 'locale.currency'],
    [Array.isArray(config.categories) && config.categories.length >= 1, 'categories (array no vacío)'],
    [config.checkout?.intro, 'checkout.intro'],
    [config.seo?.title && config.seo?.canonical, 'seo.title y seo.canonical'],
    [config.legal?.responsibleName && config.legal?.email, 'legal.responsibleName y legal.email']
  ];

  for (const [pass, name] of checks) {
    if (!pass) {
      console.error('Config inválida: ' + name);
      return false;
    }
  }

  // Cargar productos en sandbox.
  const productsCode = fs.readFileSync(path.join(abs, 'products.js'), 'utf8');
  const products = (new Function('window', productsCode + '\nreturn window.STORE_PRODUCTS;'))({});

  if (!Array.isArray(products) || products.length === 0) {
    console.error('products.js está vacío o no es un array');
    return false;
  }

  const ids = new Set();
  const slugs = new Set();
  const knownCategories = new Set(config.categories.map((c) => c.id));

  for (const product of products) {
    if (!product.id || !product.name || !product.category || typeof product.price !== 'number') {
      console.error('Producto inválido: ' + JSON.stringify(product));
      return false;
    }
    if (product.price < 0) {
      console.error('Precio negativo en: ' + product.id);
      return false;
    }
    if (!knownCategories.has(product.category)) {
      console.error('Categoría desconocida en ' + product.id + ': ' + product.category);
      return false;
    }
    if (ids.has(product.id)) {
      console.error('ID duplicado: ' + product.id);
      return false;
    }
    if (slugs.has(product.slug)) {
      console.error('Slug duplicado: ' + product.slug);
      return false;
    }
    ids.add(product.id);
    slugs.add(product.slug);

    const imagePath = path.join(abs, product.image.replace(/\//g, path.sep));
    if (!fs.existsSync(imagePath)) {
      console.error('Imagen faltante para ' + product.id + ': ' + product.image);
      return false;
    }
  }

  // Validar imágenes de marca.
  const brandFiles = ['assets/brand/logo.svg', 'assets/brand/og.svg'];
  for (const brandFile of brandFiles) {
    if (!fs.existsSync(path.join(abs, brandFile))) {
      console.error('Falta archivo de marca: ' + brandFile);
      return false;
    }
  }

  // Validar legales.
  for (const legal of ['privacidad.html', 'terminos.html', 'envios-cambios.html', 'arrepentimiento.html']) {
    const legalPath = path.join(abs, 'legal', legal);
    if (!fs.existsSync(legalPath)) {
      console.error('Falta legal: ' + legal);
      return false;
    }
    const content = fs.readFileSync(legalPath, 'utf8');
    if (!content.includes('data-brand-name') || !content.includes('legal.js')) {
      console.error('Legal no hidratable: ' + legal);
      return false;
    }
  }

  log('✓ ' + abs + ' es válido (' + products.length + ' productos)', silent);
  return true;
}

module.exports = validate;

if (require.main === module) {
  const { values } = parseArgs({
    options: {
      dir: { type: 'string', short: 'd' },
      silent: { type: 'boolean', default: false }
    },
    strict: true,
    allowPositionals: false
  });
  const dir = values.dir || 'templates/default';
  const ok = validate(dir, values.silent);
  process.exit(ok ? 0 : 1);
}