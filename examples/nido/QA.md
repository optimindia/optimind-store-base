# QA de lanzamiento · NIDO Market

Verificación ejecutada el 14 de julio de 2026 sobre la primera versión reutilizable de la tienda.

## Resultado

- Suite automatizada: **27/27 pruebas aprobadas**.
- Sintaxis validada en `app.js`, `analytics.js` y `store-core.js`.
- Estructura CSS balanceada y sin errores de llaves.
- Flujo funcional probado desde `http://127.0.0.1:4173/` con atribución UTM.
- Consola del navegador revisada sin errores bloqueantes.
- No se abrió WhatsApp ni se envió un pedido real durante QA.

## Flujo comercial probado

1. Búsqueda de “lampara” sin tilde: un resultado correcto.
2. Apertura de la ficha de Lámpara Nube.
3. Selección de la variante Azul bruma y cantidad 2.
4. Carrito persistente con subtotal de $85.800, ahorro de $12.000 y aviso de $4.200 faltantes para envío gratis.
5. Apertura del checkout y validación de nombre, localidad y modalidad de entrega.
6. Corrección de campos: el error individual y el alerta general desaparecen al editar.
7. Selección de envío a domicilio: la dirección aparece y pasa a ser obligatoria.
8. El carrito se vuelve inerte en cuanto comienza su cierre, antes de abrir el checkout.

## Verificación visual

- Escritorio inicial: 1360 × 1000 px.
- Página completa: 1280 × 7500 px.
- Responsive visual: 640 × 1000 px.
- Breakpoint estrecho medido en navegador: 390 × 844 px.

En 390 px, el contenido útil mide 375 px y no genera overflow horizontal. El hero móvil contiene su decoración, conserva el titular completo y mantiene CTA, beneficios y Ticket Vivo dentro del viewport. En escritorio, el catálogo termina en filas completas de tres columnas y la primera tarjeta conserva el énfasis editorial.

Capturas de referencia:

- `../_preview/nido-1360-final.png`
- `../_preview/nido-full-final.png`
- `../_preview/nido-mobile-640-final.png`

## Medición y privacidad

- Meta Pixel permanece desactivado mientras `analytics.pixelId` esté vacío.
- Contratos cubiertos: `PageView`, `ViewContent`, `Search`, `AddToCart`, `InitiateCheckout` y `Lead`.
- El adaptador excluye nombre, dirección, localidad, nota, teléfono y email.
- `Lead` se emite únicamente después de validar el checkout.
- No existe un evento `Purchase` falso por abrir WhatsApp.
- Conversions API queda reservada para una fase con backend seguro y deduplicación por `event_id`.

## Bloqueos antes de publicar una tienda real

- Reemplazar marca, dominio, email, ubicación y WhatsApp.
- Cargar catálogo, precios, stock, fotografías y promociones reales.
- Revisar textos legales con los datos del responsable y asesoramiento profesional.
- Configurar y probar el Pixel real en Events Manager.
- Probar el pedido en un teléfono real y confirmar el texto de WhatsApp.
- Publicar con HTTPS y volver a ejecutar la suite y las capturas.
- No activar cobro online hasta implementar backend, webhooks e idempotencia.

## Límites aceptados de esta versión

La V1 no cobra, no confirma pagos, no administra inventario remoto y no tiene panel. Su objetivo es convertir tráfico de anuncios en pedidos estructurados por WhatsApp con una base rápida de duplicar y segura de personalizar.
