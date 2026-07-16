# Distinct Store Identities Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the visual shopping surfaces so Moda Lucía, Todo en Casa and Raíces del Norte do not share the same product-card hover, CTA or cart language.

**Architecture:** Keep the shared storefront engine untouched. Add CSS-only skin overrides in each theme and validate their required visual signatures from the existing portfolio build test. The build propagates these skins to `dist/`.

**Tech Stack:** Static HTML, CSS, Node.js test runner, existing storefront JavaScript, Cloudflare Pages.

## Global Constraints

- Do not modify `app.js`, `store-core.js`, `analytics.js`, `products.js`, `store.config.js` or `legal/`.
- Product cards never scale or change dimensions on hover.
- Raíces del Norte is the sole dark storefront.
- Touch controls remain visible and at least 44px tall on mobile.
- Every changed theme respects `prefers-reduced-motion`.

---

### Task 1: Lock the visual contracts

**Files:**
- Modify: `tests/portfolio-build.test.js`

- [ ] **Step 1: Write assertions that fail before the redesign**

Add source checks for the three unique theme signature selectors and for Raíces' dark `--paper: #10241F` token:

```js
const fashionTheme = fs.readFileSync(path.join(root, 'examples', 'fashion', 'fashion-theme.css'), 'utf8');
const generalTheme = fs.readFileSync(path.join(root, 'examples', 'general', 'general-theme.css'), 'utf8');
const artisanTheme = fs.readFileSync(path.join(root, 'examples', 'artisan', 'artisan-theme.css'), 'utf8');
assert.match(fashionTheme, /atelier-select/);
assert.match(generalTheme, /utility-switch/);
assert.match(artisanTheme, /archive-drawer/);
assert.match(artisanTheme, /--paper:\s*#10241F/);
```

- [ ] **Step 2: Verify RED**

Run: `node --test tests/portfolio-build.test.js`

Expected: failure because those selectors and the dark token do not exist.

### Task 2: Rebuild the three shopping surfaces

**Files:**
- Modify: `examples/fashion/fashion-theme.css`
- Modify: `examples/general/general-theme.css`
- Modify: `examples/artisan/artisan-theme.css`

- [ ] **Step 1: Implement Moda Lucía's atelier select**

Append an `.atelier-select` signature to the fashion theme. Its product card is transparent, image remains fixed on hover, and `.card-add` becomes an ink circular selection control using its existing button semantics.

- [ ] **Step 2: Implement Todo en Casa's utility switch**

Append a `.utility-switch` signature to the general theme. Cards use bordered rectangular modules, hover colors the action rail without zooming imagery, and the cart trigger becomes a square stock-count control.

- [ ] **Step 3: Implement Raíces' dark archive drawer**

Append an `.archive-drawer` signature to the artisan theme. Change the core tokens to `#10241F`, `#18342D`, `#E0B273`, `#F2E7D3` and `#8E533C`; cards become dark archive sheets, media has a restrained copper mask, and the cart trigger/drawer become collection hardware rather than a white ticket.

- [ ] **Step 4: Verify GREEN and commit**

```powershell
node --test tests/portfolio-build.test.js
git add tests/portfolio-build.test.js examples/fashion/fashion-theme.css examples/general/general-theme.css examples/artisan/artisan-theme.css
git commit -m "feat: give each store a distinct shopping identity"
```

### Task 3: Verify responsive output and publish

**Files:**
- Generated: `dist/`

- [ ] **Step 1: Run the full verification**

```powershell
npm.cmd test
npm.cmd run check
npm.cmd run validate
npm.cmd run build
git diff --check
```

- [ ] **Step 2: Render captures**

Capture `dist/moda-lucia/`, `dist/todo-en-casa/` and `dist/raices-del-norte/` at 1360x1000 and 390x844 using Chrome headless. Inspect that no product-card hover changes layout and that the dark store is legible.

- [ ] **Step 3: Merge, push and verify deployment**

Merge the branch into `master`, push `origin master`, and confirm a successful Cloudflare Pages production deployment triggered by the resulting commit.
