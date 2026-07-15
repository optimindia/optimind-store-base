# Tienda Demo — Motor OptiMind Store

Este es el template base del motor de tiendas estáticas de OptiMind IA.

## Configuración rápida

1. Copiá esta carpeta como base de un cliente.
2. Editá `store.config.js` con los datos reales de la tienda.
3. Reemplazá `products.js` por el catálogo del cliente.
4. Actualizá las imágenes en `assets/brand/` y `assets/products/`.
5. Si querés una piel visual distinta, creá un `*-theme.css` y adaptá el copy de `index.html`.

## Catálogo

El catálogo vive en `products.js`. Cada producto debe tener:

- `id`, `slug`, `name`, `category`, `price`, `image`
- `stockStatus`: `in_stock`, `low_stock` o `out_of_stock`
- `variants`: array opcional con `id`, `label`, `priceDelta`, `stockStatus`

Las categorías usadas deben existir en `store.config.js`.

## Meta Pixel

Agregá el Pixel ID en `store.config.js`:

```json
"analytics": { "pixelId": "TU_PIXEL_ID" }
```

Si dejás el campo vacío, el pixel no se carga.

## Pruebas

```bash
npm test
npm run validate -- --dir templates/default
```

## Despliegue

La carpeta es un sitio estático. Subila a Cloudflare Pages, R2, GitHub Pages o cualquier servidor estático.

## Límites

- No tiene backend: el carrito vive en `localStorage` y el checkout se envía por WhatsApp.
- El pago se coordina fuera de la tienda.
- No gestiona stock en tiempo real: los estados son informativos.
