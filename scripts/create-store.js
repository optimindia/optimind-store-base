#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { parseArgs } = require('node:util');

// Generador de tiendas OptiMind Store Base.
// Uso:
//   npm run create-store -- --slug moda-lucia --input ./clientes/moda-lucia/
//
// Estructura esperada en --input:
//   config.json        -> datos de la tienda (nombre, whatsapp, email, etc.)
//   products.csv         -> catálogo del cliente
//   assets/brand/      -> logo.svg y og.svg
//   assets/products/   -> imágenes de productos
//
// Si no se pasa --input, usa datos demo del template.

const { values } = parseArgs({
  options: {
    slug: { type: 'string', short: 's' },
    input: { type: 'string', short: 'i' },
    'skip-validation': { type: 'boolean', default: false }
  },
  strict: true,
  allowPositionals: false
});

const slug = values.slug;
const inputDir = values.input ? path.resolve(values.input) : null;
const skipValidation = values['skip-validation'];

if (!slug || !/^[-a-z0-9]+$/.test(slug)) {
  console.error('Uso: npm run create-store -- --slug nombre-de-la-tienda [--input ./carpeta-cliente/]');
  console.error('El slug solo puede contener letras minúsculas, números y guiones.');
  process.exit(1);
}

const repoRoot = path.join(__dirname, '..');
const templateDir = path.join(repoRoot, 'templates', 'default');
const outputDir = path.join(repoRoot, 'dist', 'clients', slug);

if (fs.existsSync(outputDir)) {
  console.error('La tienda "' + slug + '" ya existe en ' + outputDir);
  console.error('Eliminala primero o elegí otro slug.');
  process.exit(1);
}

function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, dstPath);
    else fs.copyFileSync(srcPath, dstPath);
  }
}

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [search, replace] of replacements) {
    content = content.split(search).join(replace);
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

function loadConfigFromInput() {
  const configPath = path.join(inputDir, 'config.json');
  if (!fs.existsSync(configPath)) {
    console.error('No se encontró config.json en ' + inputDir);
    console.error('Se necesita al menos: { store: { name, whatsapp, email, url, location }, categories, commerce, legal }');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function cleanPhone(phone) {
  return String(phone).replace(/\D/g, '');
}

function inferCategoriesFromProducts(rows) {
  const map = new Map();
  for (const row of rows) {
    const id = normalizeSlug(row.category || 'general');
    if (!map.has(id)) map.set(id, { id, label: capitalize(row.category || 'General'), icon: '' });
  }
  return Array.from(map.values());
}

function normalizeSlug(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function capitalize(value) {
  return String(value).charAt(0).toUpperCase() + String(value).slice(1).toLowerCase();
}

function parseCsv(csv) {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  function splitLine(line) {
    const result = [];
    let value = '';
    let inside = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const next = line[i + 1];
      if (char === '"') {
        if (inside && next === '"') { value += '"'; i++; }
        else { inside = !inside; }
      } else if (char === ',' && !inside) {
        result.push(value.trim());
        value = '';
      } else {
        value += char;
      }
    }
    result.push(value.trim());
    return result;
  }

  const headers = splitLine(lines[0]).map((h) => h.replace(/^"|"$/g, ''));
  return lines.slice(1).map((line) => {
    const values = splitLine(line).map((v) => v.replace(/^"|"$/g, ''));
    const row = {};
    headers.forEach((h, i) => { row[h] = values[i] !== undefined ? values[i] : ''; });
    return row;
  });
}

function buildProductsJs(rows, categories) {
  const validStatuses = new Set(['in_stock', 'low_stock', 'out_of_stock']);
  const products = rows
    .filter((row) => row.name && row.price)
    .map((row, index) => {
      const category = normalizeSlug(row.category || categories[0]?.id || 'general');
      const price = Number(row.price) || 0;
      const compareAtPrice = row.compare_at_price ? Number(row.compare_at_price) : undefined;
      const stockStatus = validStatuses.has(row.stock_status) ? row.stock_status : 'in_stock';
      const variants = [];
      if (row.variants) {
        for (const part of row.variants.split('|')) {
          const [variantName, delta, variantStock] = part.split(':');
          if (!variantName) continue;
          variants.push({
            id: normalizeSlug(variantName),
            label: variantName.trim(),
            priceDelta: Number(delta) || 0,
            stockStatus: validStatuses.has(variantStock) ? variantStock : 'in_stock'
          });
        }
      }
      return {
        id: normalizeSlug(row.name) + '-' + index,
        slug: row.slug || normalizeSlug(row.name),
        name: row.name,
        shortDescription: row.short_description || '',
        description: row.description || row.short_description || '',
        category,
        tags: row.tags ? row.tags.split(';').map((t) => t.trim()).filter(Boolean) : [],
        price,
        ...(compareAtPrice && compareAtPrice >= price ? {} : { compareAtPrice }),
        image: row.image || 'assets/products/placeholder.svg',
        alt: row.alt || row.name,
        featured: String(row.featured).toLowerCase() === 'true',
        stockStatus,
        variants
      };
    });

  if (products.length === 0) {
    console.error('El CSV de productos no contiene filas válidas (name + price son obligatorios).');
    process.exit(1);
  }
  return products;
}

function writeProductsJs(products, outputPath) {
  const lines = products.map((p) => {
    const clean = { ...p };
    if (clean.compareAtPrice === undefined) delete clean.compareAtPrice;
    return '  ' + JSON.stringify(clean).replace(/"/g, "'");
  });
  const content = "'use strict';\n\nwindow.STORE_PRODUCTS = [\n" + lines.join(',\n') + "\n];\n";
  fs.writeFileSync(outputPath, content, 'utf8');
}

function buildStoreConfig(clientConfig, products) {
  const store = clientConfig.store || {};
  const categories = clientConfig.categories || inferCategoriesFromProducts(products);
  const seo = clientConfig.seo || {};
  const storeUrl = store.url || 'https://optimind-store-base.pages.dev/clients/' + slug + '/';

  return {
    store: {
      slug,
      name: store.name || slug,
      shortName: store.shortName || store.name || slug,
      descriptor: store.descriptor || 'Tienda creada con OptiMind',
      url: storeUrl,
      whatsapp: cleanPhone(store.whatsapp),
      instagram: store.instagram || '',
      email: store.email || '',
      location: store.location || ''
    },
    locale: clientConfig.locale || { lang: 'es-AR', locale: 'es-AR', currency: 'ARS' },
    commerce: {
      minimumOrder: clientConfig.commerce?.minimumOrder || 0,
      freeShippingFrom: clientConfig.commerce?.freeShippingFrom || null,
      lowStockLabel: clientConfig.commerce?.lowStockLabel || 'Últimas unidades',
      deliveryModes: clientConfig.commerce?.deliveryModes || [
        { id: 'shipping', label: 'Envío a domicilio', requiresAddress: true },
        { id: 'pickup', label: 'Retiro coordinado', requiresAddress: false }
      ]
    },
    categories,
    checkout: {
      requiredFields: ['name', 'city', 'delivery'],
      intro: 'Hola ' + (store.shortName || store.name || '') + ', quiero hacer este pedido:',
      paymentProvider: 'disabled',
      fallbackContact: store.email || ''
    },
    legal: {
      responsibleName: store.name || '',
      email: store.email || '',
      city: store.location || '',
      country: 'AR'
    },
    analytics: {
      pixelId: clientConfig.analytics?.pixelId || '',
      debug: true,
      consentRequired: false
    },
    seo: {
      title: seo.title || store.name + ' — ' + (store.descriptor || 'Tienda online'),
      description: seo.description || 'Armá tu pedido online y coordiná la entrega por WhatsApp.',
      canonical: storeUrl + '/',
      ogTitle: seo.ogTitle || store.name,
      ogDescription: seo.ogDescription || 'Armá tu pedido online y coordiná la entrega por WhatsApp.',
      ogImage: 'assets/brand/og.svg',
      themeColor: clientConfig.themeColor || '#F2F5EA'
    },
    features: clientConfig.features || {
      search: true,
      filters: true,
      variants: true,
      testimonials: false,
      freeShippingBar: true
    }
  };
}

function writeStoreConfig(config, outputPath) {
  const content = "'use strict';\n\nwindow.STORE_CONFIG = " + JSON.stringify(config, null, 2) + ";\n";
  fs.writeFileSync(outputPath, content, 'utf8');
}

// ---------------------------------------------------------------------------
console.log('Generando tienda: ' + slug);

fs.mkdirSync(outputDir, { recursive: true });
copyDir(templateDir, outputDir);

// Copiar motor reutilizable a la raíz del output.
for (const file of ['store-core.js', 'analytics.js', 'app.js']) {
  fs.copyFileSync(path.join(repoRoot, 'src', file), path.join(outputDir, file));
}

let products = [];
let clientConfig = null;

if (inputDir) {
  clientConfig = loadConfigFromInput();

  const csvPath = path.join(inputDir, 'products.csv');
  if (fs.existsSync(csvPath)) {
    const csv = fs.readFileSync(csvPath, 'utf8');
    products = buildProductsJs(parseCsv(csv), clientConfig.categories || []);
    writeProductsJs(products, path.join(outputDir, 'products.js'));
  } else {
    console.warn('No se encontró products.csv; se copiará el catálogo demo.');
  }

  const clientAssets = path.join(inputDir, 'assets');
  if (fs.existsSync(clientAssets)) {
    fs.cpSync(clientAssets, path.join(outputDir, 'assets'), { recursive: true, force: true });
  }
}

if (!clientConfig) {
  // Modo demo: usa la config y productos del template, solo renombra el slug.
  const demoConfigCode = fs.readFileSync(path.join(templateDir, 'store.config.js'), 'utf8');
  clientConfig = (new Function('window', demoConfigCode + '\nreturn window.STORE_CONFIG;'))({});
}

const config = buildStoreConfig(clientConfig, products);
writeStoreConfig(config, path.join(outputDir, 'store.config.js'));

// Reemplazar fallback hardcodeado del HTML por datos demo mínimos (el JS los sobrescribe).
replaceInFile(path.join(outputDir, 'index.html'), [
  ['Tienda Demo', config.store.name],
  ['tienda-demo.optimind.com.ar', config.store.url.replace(/https?:\/\//, '')]
]);

if (!skipValidation) {
  console.log('Validando...');
  const validate = require('./validate.js');
  const ok = validate(outputDir, true);
  if (!ok) {
    console.error('La tienda generada no pasó la validación. Corregí los datos y volvé a intentar.');
    process.exit(1);
  }
}

console.log('Tienda generada en: ' + outputDir);
console.log('Próximo paso: abrí el HTML, aplicá la piel visual única del cliente y ejecutá npm test.');