# Portfolio real de tiendas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar el dossier de tres tiendas desde el repositorio y proyecto de Cloudflare Pages `optimind-store-base`, conservando su motor funcional.

**Architecture:** El build continúa copiando los tres ejemplos funcionales a `dist/`. La landing deja de generarse como un bloque violeta incrustado y pasa a ser una vista de portfolio mantenible. Cada ejemplo conserva datos, checkout, legales y scripts; solo se rehace su capa de presentación y hero según su identidad aprobada.

**Tech Stack:** HTML estático, CSS, JavaScript del motor existente, Node.js test runner, Cloudflare Pages y GitHub.

## Global Constraints

- Producción: repo `optimindia/optimind-store-base`, rama `master`, Pages `optimind-store-base`.
- No modificar `store-core.js`, `app.js`, `analytics.js`, `products.js`, `store.config.js` ni `legal/` de los ejemplos salvo que una prueba demuestre una incompatibilidad visual.
- La landing no vende productos ficticios; sus CTAs abren tiendas o WhatsApp de OptiMind.
- Todos los CTAs de portfolio usan `https://wa.me/5492616027055`.
- Preservar `captura-landing.png`, que es un archivo local no rastreado del usuario.

---

### Task 1: Contrato de build del portfolio

**Files:**
- Create: `tests/portfolio-build.test.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: `scripts/build.js` genera `dist/`.
- Produces: una prueba `el build publica el portfolio y las tres tiendas` ejecutada por `npm.cmd test`.

- [ ] **Step 1: Write the failing test**

```js
test('el build publica el portfolio y las tres tiendas', () => {
  execFileSync(process.execPath, ['scripts/build.js'], { cwd: root });
  for (const route of ['index.html', 'moda-lucia/index.html', 'todo-en-casa/index.html', 'raices-del-norte/index.html']) {
    assert.ok(fs.existsSync(path.join(root, 'dist', route)), `Falta ${route}`);
  }
  const landing = fs.readFileSync(path.join(root, 'dist', 'index.html'), 'utf8');
  assert.match(landing, /Esto podría ser/);
  assert.match(landing, /5492616027055/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/portfolio-build.test.js`

Expected: FAIL porque la landing actual no contiene el titular del dossier aprobado.

- [ ] **Step 3: Add the test file without changing production code**

Crear `tests/portfolio-build.test.js` con imports de `node:assert/strict`, `node:child_process`, `node:fs`, `node:path`, `node:test`, la constante `root = path.resolve(__dirname, '..')` y el test anterior.

- [ ] **Step 4: Verify the RED state**

Run: `node --test tests/portfolio-build.test.js`

Expected: 1 failure por `Esto podría ser` ausente.

- [ ] **Step 5: Commit**

```powershell
git add tests/portfolio-build.test.js
git commit -m "test: define portfolio build contract"
```

### Task 2: Landing dossier publicada desde el build

**Files:**
- Create: `showcase/index.html`
- Create: `showcase/portfolio.css`
- Create: `showcase/portfolio.js`
- Copy: `showcase/logo-optimind.png`
- Modify: `scripts/build.js`

**Interfaces:**
- Consumes: `showcase/` es una landing estática con enlaces relativos a las tres carpetas producidas.
- Produces: `dist/index.html`, `dist/portfolio.css`, `dist/portfolio.js` y `dist/logo-optimind.png`.

- [ ] **Step 1: Implement the minimum landing needed for Task 1**

Copiar el dossier aprobado de `portfolio-tiendas` a `showcase/`, conservar el hero “Esto podría ser / tu tienda.”, el logo real, los tres enlaces `./moda-lucia/`, `./todo-en-casa/`, `./raices-del-norte/` y los CTAs de WhatsApp. Eliminar referencias a `../logo-optimind.png` para que la landing se publique desde la raíz.

- [ ] **Step 2: Update the build**

Reemplazar la llamada a `buildLanding()` en `scripts/build.js` por una copia de los archivos de `showcase/` hacia `dist/`. Mantener el copiado de `examples/fashion`, `examples/general` y `examples/artisan` a sus slugs actuales.

- [ ] **Step 3: Verify the GREEN state**

Run: `node --test tests/portfolio-build.test.js`

Expected: PASS; `dist/index.html` contiene el hero, WhatsApp y tres enlaces.

- [ ] **Step 4: Run all existing checks**

Run: `npm.cmd test && npm.cmd run check && npm.cmd run validate && npm.cmd run build`

Expected: todas las pruebas pasan y `dist/` contiene cuatro rutas.

- [ ] **Step 5: Commit**

```powershell
git add showcase scripts/build.js tests/portfolio-build.test.js
git commit -m "feat: publish dossier portfolio landing"
```

### Task 3: Reskin funcional de Moda Lucía y Todo en Casa

**Files:**
- Modify: `examples/fashion/index.html`
- Modify: `examples/fashion/styles.css`
- Modify: `examples/general/index.html`
- Modify: `examples/general/styles.css`

**Interfaces:**
- Consumes: los selectores y atributos que usa `examples/*/app.js`.
- Produces: dos heroes propios sin modificar los controles de catálogo, carrito ni checkout.

- [ ] **Step 1: Add failing structure assertions**

Agregar a `tests/portfolio-build.test.js` asserts para `examples/fashion/index.html` con `data-store-style="campaign-editorial"` y `examples/general/index.html` con `data-store-style="domestic-modular"`.

- [ ] **Step 2: Verify RED**

Run: `node --test tests/portfolio-build.test.js`

Expected: falla porque esos atributos todavía no existen.

- [ ] **Step 3: Implement Moda Lucía**

Agregar `data-store-style="campaign-editorial"` al `<body>`. Rehacer exclusivamente la composición visible del hero y sus variables CSS con marfil, azul noche y berry; usar Boska/General Sans; introducir la silueta geométrica de prenda. Mantener IDs, botones, `data-*` y contenedores que consume `app.js`.

- [ ] **Step 4: Implement Todo en Casa**

Agregar `data-store-style="domestic-modular"` al `<body>`. Rehacer hero y variables CSS con papel claro, verde estantería y ámbar; usar Space Grotesk; introducir la estantería modular ilustrada. Mantener IDs, botones, `data-*` y contenedores que consume `app.js`.

- [ ] **Step 5: Verify GREEN and regression suite**

Run: `npm.cmd test && npm.cmd run check && npm.cmd run validate`

Expected: toda la suite pasa y los dos marcadores existen.

- [ ] **Step 6: Commit**

```powershell
git add examples/fashion examples/general tests/portfolio-build.test.js
git commit -m "feat: reskin fashion and home store cases"
```

### Task 4: Raíces del Norte material y no repetida

**Files:**
- Modify: `examples/artisan/index.html`
- Modify: `examples/artisan/styles.css`
- Modify: `examples/artisan/fashion-theme.css`
- Modify: `tests/portfolio-build.test.js`

**Interfaces:**
- Consumes: el mismo motor de `examples/artisan/app.js`.
- Produces: una tienda con `data-store-style="material-archive"`, banda de trama y etiquetas de origen.

- [ ] **Step 1: Add failing assertions**

Agregar asserts para `data-store-style="material-archive"`, `data-product-origin` y `weave-band` en `examples/artisan/index.html`.

- [ ] **Step 2: Verify RED**

Run: `node --test tests/portfolio-build.test.js`

Expected: falla porque Raíces todavía no declara la nueva identidad.

- [ ] **Step 3: Implement the material archive skin**

Cambiar los tokens a verde profundo, cobre y arena; cargar Gambetta/Supreme; reemplazar el hero repetido por una composición de oficio y una `weave-band`; añadir `data-product-origin` a las tarjetas visibles. Mantener los hooks de carrito, modal y checkout que necesita `app.js`.

- [ ] **Step 4: Regenerate reference captures**

Ejecutar el build y capturar `dist/raices-del-norte/` para reemplazar la captura repetida por una imagen real de Raíces.

- [ ] **Step 5: Verify GREEN**

Run: `npm.cmd test && npm.cmd run check && npm.cmd run validate && npm.cmd run build`

Expected: todas las pruebas pasan; `dist/raices-del-norte/index.html` contiene la identidad material.

- [ ] **Step 6: Commit**

```powershell
git add examples/artisan tests/portfolio-build.test.js
git commit -m "feat: build material archive store case"
```

### Task 5: Verificación visual, deploy y limpieza

**Files:**
- Modify: `README.md`
- Modify: `../design/log.md`
- Delete after deployment: `C:/Users/HP/Pictures/Proyectos_Emprendimientos/OptiMind_IA/portfolio-tiendas`
- Delete after deployment: GitHub repo `optimindia/portfolio-tiendas`

**Interfaces:**
- Consumes: `dist/` generada y el proyecto Pages conectado a `master`.
- Produces: deploy exitoso en `https://optimind-store-base.pages.dev` y un solo repositorio fuente.

- [ ] **Step 1: Capture desktop views**

Generar capturas de `dist/index.html`, `dist/moda-lucia/index.html`, `dist/todo-en-casa/index.html` y `dist/raices-del-norte/index.html` a 1360 px. Verificar logo, CTAs, legibilidad y que Raíces no repite Moda.

- [ ] **Step 2: Update operational documentation**

Actualizar `README.md` para indicar que `optimind-store-base` es el único repo publicado, que `npm.cmd run build` genera `dist/` y que Pages publica `master`.

- [ ] **Step 3: Register visual directions**

Agregar a `../design/log.md` una entrada para las tres identidades de tiendas y el dossier, evitando repetir la aurora violeta.

- [ ] **Step 4: Final verification and push**

Run: `npm.cmd test && npm.cmd run check && npm.cmd run validate && npm.cmd run build && git diff --check`

Then:

```powershell
git add README.md docs design
git commit -m "docs: document real portfolio deployment"
git push origin master
```

- [ ] **Step 5: Confirm Cloudflare deployment**

Consultar el último deployment de `optimind-store-base` y confirmar estado `success` y commit actualizado.

- [ ] **Step 6: Remove the accidental duplicate only after success**

Eliminar la carpeta local `C:/Users/HP/Pictures/Proyectos_Emprendimientos/OptiMind_IA/portfolio-tiendas` y el repo privado `optimindia/portfolio-tiendas` solo tras confirmar el deploy exitoso.
