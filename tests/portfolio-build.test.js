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
  assert.match(fashion, /data-store-style="campaign-editorial"/);
  assert.match(general, /data-store-style="domestic-modular"/);
});
