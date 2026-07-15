# QA de lanzamiento · Tienda Demo (plantilla neutral)

Verificación ejecutada el 14 de julio de 2026 sobre la versión neutralizada y reutilizable de la tienda (Fase 1).

## Resultado

- Suite automatizada: **33/33 pruebas aprobadas** (core, analítica, estructura, configuración y catálogo).
- Sintaxis validada en `app.js`, `analytics.js` y `store-core.js`.
- Estructura CSS balanceada y sin errores de llaves.
- Flujo funcional probado desde `http://127.0.0.1:4173/` con atribución UTM.
- Consola del navegador revisada sin errores bloqueantes.
- No se abrió WhatsApp ni se envió un pedido real durante QA.

## Neutralización (Fase 1)

- Sin restos de la marca demo original: config, catálogo, HTML, CSS, legales, tests y docs.
- `store.config.js` concentra identidad, categorías, legales, SEO y features.
- `app.js` hidrata `<head>` (title, meta, canonical, OG, JSON-LD, theme-color), marca, footer, noscript y preview del ticket desde config.
- Filtros de categoría y atajo se generan desde `config.categories`.
- Legales se hidratan con `legal.js` desde config.
- El motor (`store-core.js`, `analytics.js`), el carrito, las variantes y el checkout no se modificaron.

## Flujo comercial probado

1. Búsqueda de “lampara” sin tilde: un resultado correcto.
2. Apertura de la ficha de Lámpara de mesa.
3. Selección de variante y cantidad 2.
4. Carrito persistente con subtotal, ahorro y aviso de faltante para envío gratis.
5. Apertura del checkout y validación de nombre, localidad y modalidad de entrega.
6. Corrección de campos: el error individual y el alerta general desaparecen al editar.
7. Selección de envío a domicilio: la dirección aparece y pasa a ser obligatoria.
8. El carrito se vuelve inerte en cuanto comienza su cierre, antes de abrir el checkout.

## Verificación visual

- Escritorio inicial: 1360 × 1000 px.
- Página completa: 1280 × 7500 px.
- Responsive visual: 640 × 1000 px.
- Breakpoint estrecho: 390 × 844 px.

Capturas de referencia: `../_preview/demo-*.png`.

## Medición y privacidad

- Meta Pixel permanece desactivado mientras `analytics.pixelId` esté vacío.
- Contratos cubiertos: `PageView`, `ViewContent`, `Search`, `AddToCart`, `InitiateCheckout` y `Lead`.
- El adaptador excluye nombre, dirección, localidad, nota, teléfono y email.
- `Lead` se emite únicamente después de validar el checkout.
- No existe un evento `Purchase` falso por abrir WhatsApp.
- Conversions API queda reservada para una fase con backend seguro y deduplicación por `event_id`.

## Bloqueos antes de publicar una tienda real

- Reemplazar marca, dominio, email, ubicación y WhatsApp en `store.config.js`.
- Cargar catálogo, precios, stock, fotografías y promociones reales en `products.js` y `assets/`.
- Rehacer la piel visual (`index.html` + `styles.css`) para el cliente.
- Revisar textos legales con los datos del responsable y asesoramiento profesional.
- Configurar y probar el Pixel real en Events Manager.
- Probar el pedido en un teléfono real y confirmar el texto de WhatsApp.
- Publicar con HTTPS y volver a ejecutar la suite y las capturas.
- No activar cobro online hasta implementar backend, webhooks e idempotencia.

## Límites aceptados de esta versión

La V1 no cobra, no confirma pagos, no administra inventario remoto y no tiene panel. Su objetivo es convertir tráfico de anuncios en pedidos estructurados por WhatsApp con una base rápida de duplicar y segura de personalizar.