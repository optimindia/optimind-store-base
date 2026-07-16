'use strict';

const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

test('el build publica el portfolio y las tres tiendas', () => {
  execFileSync(process.execPath, ['scripts/build.js'], { cwd: root });

  for (const route of [
    'index.html',
    'moda-lucia/index.html',
    'todo-en-casa/index.html',
    'raices-del-norte/index.html'
  ]) {
    assert.ok(fs.existsSync(path.join(root, 'dist', route)), `Falta ${route}`);
  }

  const landing = fs.readFileSync(path.join(root, 'dist', 'index.html'), 'utf8');
  assert.match(landing, /Esto podr\u00eda ser/);
  assert.match(landing, /5492616027055/);

  const fashion = fs.readFileSync(path.join(root, 'examples', 'fashion', 'index.html'), 'utf8');
  const general = fs.readFileSync(path.join(root, 'examples', 'general', 'index.html'), 'utf8');
  const artisan = fs.readFileSync(path.join(root, 'examples', 'artisan', 'index.html'), 'utf8');
  assert.match(fashion, /data-store-style="campaign-editorial"/);
  assert.match(general, /data-store-style="domestic-modular"/);
  assert.match(artisan, /data-store-style="material-archive"/);
  assert.match(artisan, /data-product-origin/);
  assert.match(artisan, /weave-band/);

  const fashionTheme = fs.readFileSync(path.join(root, 'examples', 'fashion', 'fashion-theme.css'), 'utf8');
  const generalTheme = fs.readFileSync(path.join(root, 'examples', 'general', 'general-theme.css'), 'utf8');
  const artisanTheme = fs.readFileSync(path.join(root, 'examples', 'artisan', 'artisan-theme.css'), 'utf8');
  const portfolioTheme = fs.readFileSync(path.join(root, 'showcase', 'portfolio.css'), 'utf8');
  const portfolioMotion = fs.readFileSync(path.join(root, 'showcase', 'portfolio.js'), 'utf8');
  assert.match(fashionTheme, /atelier-select/);
  assert.match(fashionTheme, /runway-lookbook/);
  assert.match(fashionTheme, /fashion-type-reset/);
  assert.match(fashionTheme, /mobile-copy-guard/);
  assert.match(fashionTheme, /motion-signature-fashion/);
  assert.match(generalTheme, /utility-switch/);
  assert.match(generalTheme, /weekend-toolbox/);
  assert.match(generalTheme, /home-detail-pass/);
  assert.match(generalTheme, /mobile-copy-guard/);
  assert.match(generalTheme, /motion-signature-home/);
  assert.match(artisanTheme, /archive-drawer/);
  assert.match(artisanTheme, /high-contrast-archive/);
  assert.match(artisanTheme, /roots-detail-pass/);
  assert.match(artisanTheme, /high-contrast-footer/);
  assert.match(artisanTheme, /archive-search-table/);
  assert.match(artisanTheme, /--paper:\s*#10241F/);
  assert.match(artisanTheme, /@media \(max-width: 960px\)[\s\S]*material-archive"\] \.hero-ticket-wrap/);
  assert.match(artisanTheme, /mobile-copy-guard/);
  assert.match(artisanTheme, /motion-signature-roots/);
  assert.match(portfolioTheme, /motion-signature-portfolio/);
  assert.match(portfolioMotion, /IntersectionObserver/);
  assert.match(portfolioMotion, /prefers-reduced-motion/);
});

test('el chequeo de sintaxis revisa los scripts que el proyecto publica', () => {
  assert.doesNotThrow(() => {
    execFileSync('npm.cmd', ['run', 'check'], {
      cwd: root,
      stdio: 'pipe',
      shell: process.platform === 'win32'
    });
  });
});
