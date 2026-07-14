'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('la estructura HTML contiene los landmarks y controles críticos', () => {
  const html = read('index.html');

  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /<main\b/);
  assert.match(html, /class="skip-link"/);
  assert.match(html, /id="product-grid"/);
  assert.match(html, /id="product-dialog"/);
  assert.match(html, /id="cart-drawer"/);
  assert.match(html, /id="checkout-form"/);
  assert.match(html, /id="live-region"[^>]+aria-live="polite"/);
  assert.match(html, /id="product-card-template"/);
  assert.match(html, /id="cart-line-template"/);
});

test('el checkout usa etiquetas reales para todos sus campos', () => {
  const html = read('index.html');

  for (const field of ['checkout-name', 'checkout-city', 'checkout-delivery', 'checkout-address', 'checkout-note']) {
    assert.match(html, new RegExp(`<label[^>]+for="${field}"`));
    assert.match(html, new RegExp(`id="${field}"`));
  }
});

test('los scripts cargan en el orden de dependencias', () => {
  const html = read('index.html');
  const scripts = [...html.matchAll(/<script\s+src="([^"]+)"/g)].map((match) => match[1]);

  assert.deepEqual(scripts, [
    'store.config.js',
    'products.js',
    'store-core.js',
    'analytics.js',
    'app.js'
  ]);
});

test('existen ocho ilustraciones locales de producto', () => {
  const productDir = path.join(root, 'assets', 'products');
  const images = fs.readdirSync(productDir).filter((file) => file.endsWith('.svg'));

  assert.equal(images.length, 8);
});

test('el controlador implementa catálogo, modal y eventos delegados', () => {
  const app = read('app.js');

  for (const functionName of ['renderCatalog', 'openProductDialog', 'closeProductDialog', 'handleAddToCart', 'handleImageError']) {
    assert.match(app, new RegExp(`function\\s+${functionName}\\s*\\(`));
  }
  assert.match(app, /productGrid\.addEventListener\('click'/);
  assert.match(app, /addEventListener\('keydown'/);
  assert.match(app, /event\.key === 'Escape'/);
  assert.match(app, /lastFocusedElement\.focus/);
  assert.match(app, /Analytics\.track\('ViewContent'/);
  assert.match(app, /Analytics\.track\('Search'/);
  assert.match(app, /Analytics\.track\('AddToCart'/);
});

test('el controlador completa persistencia, Ticket Vivo y checkout', () => {
  const app = read('app.js');

  for (const functionName of ['loadCart', 'persistCart', 'renderCart', 'openCart', 'closeCart', 'openCheckout', 'validateCheckout', 'submitOrder']) {
    assert.match(app, new RegExp(`function\\s+${functionName}\\s*\\(`));
  }
  assert.match(app, /optimind-store-cart:v1:/);
  assert.match(app, /localStorage\.getItem/);
  assert.match(app, /localStorage\.setItem/);
  assert.match(app, /addEventListener\('storage'/);
  assert.match(app, /Analytics\.track\('InitiateCheckout'/);
  assert.match(app, /Analytics\.track\('Lead'/);
  assert.match(app, /Core\.buildWhatsAppMessage/);
  assert.match(app, /Core\.buildWhatsAppUrl/);
  assert.match(app, /submitLocked/);
  assert.match(app, /addressInput\.required/);
});

test('el checkout limpia cada error mientras la persona corrige el campo', () => {
  const app = read('app.js');

  assert.match(app, /checkoutForm\.addEventListener\('input'/);
  assert.match(app, /fieldError\(event\.target,\s*''\)/);
  assert.match(app, /errorBox\.hidden\s*=\s*true/);
});

test('el carrito deja de ser interactivo antes de abrir el checkout', () => {
  const app = read('app.js');

  assert.match(app, /function\s+openCart[\s\S]*cartDrawer\.inert\s*=\s*false/);
  assert.match(app, /function\s+closeCart[\s\S]*cartDrawer\.inert\s*=\s*true/);
});

test('el CSS contiene el sistema visual, estados y responsive acordados', () => {
  const css = read('styles.css');

  for (const token of ['#F2F5EA', '#FFFFFF', '#173027', '#65736A', '#FF623E', '#3557F4', '#D8F45A']) {
    assert.match(css, new RegExp(token, 'i'));
  }
  assert.match(css, /Bricolage Grotesque/);
  assert.match(css, /Familjen Grotesk/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /\[aria-disabled="true"\]/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /@media\s*\(max-width:\s*960px\)/);
  assert.match(css, /@media\s*\(max-width:\s*640px\)/);
  for (const selector of ['.product-dialog', '.cart-drawer', '.no-results', '.image-fallback', '.checkout-error']) {
    assert.match(css, new RegExp(selector.replace('.', '\\.')));
  }
  assert.match(css, /@media\s*\(max-width:\s*640px\)[\s\S]*\.hero\s*\{[^}]*overflow-x:\s*clip/);
  assert.match(css, /\.hero h1\s*\{[^}]*font-size:\s*clamp\(52px,\s*15vw,\s*64px\)/);
});

test('la tienda incluye SEO, documentos legales y manual de lanzamiento', () => {
  const html = read('index.html');
  assert.match(html, /rel="canonical"/);
  assert.match(html, /property="og:image"/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /Botón de arrepentimiento/);

  for (const file of ['privacidad.html', 'terminos.html', 'envios-cambios.html', 'arrepentimiento.html']) {
    const page = read(path.join('legal', file));
    assert.match(page, /<h1\b/);
    assert.match(page, /NIDO/);
    assert.match(page, /Revisión profesional/);
  }

  const regret = read(path.join('legal', 'arrepentimiento.html'));
  assert.match(regret, /id="regret-form"/);
  assert.match(regret, /ARR-/);
  assert.doesNotMatch(regret, /registrate|iniciá sesión/i);

  const guide = read('README.md');
  for (const section of ['Configuración rápida', 'Catálogo', 'Meta Pixel', 'Pruebas', 'Despliegue', 'Límites']) {
    assert.match(guide, new RegExp(section));
  }
});
