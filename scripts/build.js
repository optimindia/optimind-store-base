#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

// Build para Cloudflare Pages.
// Empaqueta las tiendas generadas y de referencia en dist/ para deploy.

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'dist');

const stores = [
  { slug: 'moda-lucia', source: 'examples/fashion' },
  { slug: 'todo-en-casa', source: 'examples/general' },
  { slug: 'raices-del-norte', source: 'examples/artisan' },
  { slug: 'demo-cliente', source: 'dist/clients/demo-cliente' }
];

function rmDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) rmDir(p);
    else fs.unlinkSync(p);
  }
  fs.rmdirSync(dir);
}

function copyDir(src, dst, ignore = []) {
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (ignore.includes(entry.name)) continue;
    const srcPath = path.join(src, entry.name);
    const dstPath = path.join(dst, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, dstPath, ignore);
    else fs.copyFileSync(srcPath, dstPath);
  }
}

function buildLanding() {
  const items = stores
    .filter((s) => fs.existsSync(path.join(outDir, s.slug, 'index.html')))
    .map((s) => `        <li><a href="./${s.slug}/">${s.slug.replace(/-/g, ' ')}</a></li>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="es-AR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>OptiMind IA · Tiendas online</title>
  <meta name="description" content="Tiendas online estáticas con pedido por WhatsApp.">
  <style>
    :root { color-scheme: light; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #F6F4F1; color: #1B1714; max-width: 680px; margin: 0 auto; padding: 64px 24px; }
    h1 { font-size: 42px; letter-spacing: -0.03em; margin: 0 0 12px; }
    p { color: #7A716A; line-height: 1.6; margin: 0 0 32px; }
    ul { list-style: none; padding: 0; }
    li { margin: 0 0 12px; }
    a { display: block; padding: 18px 20px; background: #fff; color: #1B1714; text-decoration: none; border-radius: 14px; box-shadow: 0 4px 16px rgba(0,0,0,0.05); font-weight: 600; }
    a:hover { background: #2B3A4E; color: #fff; }
    .brand { font-size: 14px; text-transform: uppercase; letter-spacing: 0.12em; color: #A35C42; margin-bottom: 40px; }
  </style>
</head>
<body>
  <div class="brand">OptiMind IA</div>
  <h1>Tiendas online listas para vender.</h1>
  <p>Elegí una tienda de referencia para ver el motor en acción. Cada una tiene catálogo, carrito y checkout por WhatsApp.</p>
  <ul>
${items}
  </ul>
</body>
</html>
`;
}

console.log('Limpiando dist/...');
rmDir(outDir);
fs.mkdirSync(outDir, { recursive: true });

console.log('Copiando tiendas...');
for (const store of stores) {
  const src = path.join(root, store.source);
  const dst = path.join(outDir, store.slug);
  if (!fs.existsSync(src)) {
    console.warn(`  ⚠ Saltando ${store.slug}: no existe ${store.source}`);
    continue;
  }
  copyDir(src, dst, ['captura.png', 'captura-full.png', 'captura-full2.png', 'captura-full3.png', 'captura-inicio.png', 'captura-completa.png', '.git']);
  console.log(`  ✓ ${store.slug}`);
}

console.log('Generando landing...');
fs.writeFileSync(path.join(outDir, 'index.html'), buildLanding(), 'utf8');

console.log('Build completo en dist/');
