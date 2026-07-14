# Tienda Base OptiMind

Motor estático y duplicable para convertir tráfico de Meta Ads en pedidos estructurados por WhatsApp. La tienda demostrativa se llama **NIDO Market** y vende objetos de hogar; el motor no depende de ese rubro.

## Qué incluye

- Catálogo configurable con búsqueda, categorías, orden y variantes.
- Carrito persistente y reconciliado contra stock actual.
- Ficha rápida accesible.
- Umbral de envío gratis, ahorro y estados de stock.
- Checkout mínimo con dirección condicional.
- Pedido legible por WhatsApp con identificador y atribución UTM.
- Meta Pixel opcional con eventos comerciales sin datos personales.
- Páginas de privacidad, términos, envíos/cambios y arrepentimiento.
- 27 pruebas automatizadas al momento de la primera versión.

## Configuración rápida

1. Duplicá la carpeta completa y renombrala con el comercio.
2. Editá `store.config.js`: identidad, URL, WhatsApp, email, moneda, envío y funciones activas.
3. Sustituí los ocho registros de `products.js` por el catálogo real.
4. Reemplazá `assets/brand/` y `assets/products/` conservando rutas y dimensiones explícitas.
5. Adaptá copy y testimonios de `index.html`; no publiques afirmaciones demostrativas como si fueran reales.
6. Revisá las cuatro páginas de `legal/` con los datos verdaderos del proveedor.
7. Ejecutá pruebas y captura visual antes del despliegue.

El número de WhatsApp debe guardarse con código de país y área, solo dígitos. Ejemplo argentino: `5492616027055`.

## Catálogo

Cada elemento de `products.js` usa este contrato:

```js
{
  id: 'id-estable',
  slug: 'url-legible',
  name: 'Nombre visible',
  shortDescription: 'Resumen para la tarjeta',
  description: 'Detalle completo',
  category: 'categoria-normalizada',
  tags: ['palabra', 'uso'],
  price: 42900,
  compareAtPrice: 48900,
  image: 'assets/products/imagen.svg',
  alt: 'Descripción objetiva de la imagen',
  featured: true,
  adLanding: true,
  stockStatus: 'in_stock',
  variants: [
    { id: 'arena', label: 'Arena', priceDelta: 0, stockStatus: 'in_stock' }
  ]
}
```

Estados válidos: `in_stock`, `low_stock`, `out_of_stock`. Los precios se expresan como enteros en la unidad mostrada por la tienda. Un ID duplicado, un precio negativo o un producto sin nombre se descartan de manera segura.

## Meta Pixel

En `store.config.js`, `analytics.pixelId` está vacío y por eso Meta permanece desactivado. Para una tienda real:

1. Crear o identificar el dataset/Pixel del cliente en Events Manager.
2. Escribir el ID público en `analytics.pixelId`.
3. Mantener `debug: true` durante la prueba.
4. Verificar `PageView`, `ViewContent`, `Search`, `AddToCart`, `InitiateCheckout` y `Lead` en la herramienta de eventos de prueba.
5. Cambiar `debug` a `false` al publicar si no se necesita el historial local.

`Lead` se emite cuando el formulario es válido y se abre WhatsApp. **No es una compra.** `Purchase` permanece reservado para una confirmación verificable de pago o pedido. El adaptador elimina nombre, dirección, localidad, nota, teléfono y email de los payloads.

Meta recomienda combinar Pixel y Conversions API para mejorar conectividad y medición. CAPI requiere un endpoint seguro y deduplicación por `event_id`; nunca debe exponerse un Access Token en estos archivos.

## Pruebas

En PowerShell, usar `npm.cmd` porque algunas instalaciones bloquean `npm.ps1`:

```powershell
cd Tienda-Generica
npm.cmd test
node --check app.js
node --check analytics.js
node --check store-core.js
```

La suite cubre normalización, búsqueda, filtros, variantes, carrito, totales, UTMs, mensaje de WhatsApp, privacidad de eventos y contratos estructurales.

Para probar la interfaz desde HTTP:

```powershell
python -m http.server 4173
```

Abrir `http://127.0.0.1:4173`. También funciona desde `file://`, aunque HTTP representa mejor el entorno de producción.

Checklist manual mínimo:

- Buscar “lámpara” sin tilde y con mayúsculas.
- Abrir una ficha, cambiar variante y cantidad.
- Agregar, aumentar, disminuir y quitar una línea.
- Recargar y comprobar persistencia.
- Probar carrito vacío, sin resultados y producto agotado.
- Elegir envío, verificar que dirección sea obligatoria; cambiar a retiro y comprobar que deje de serlo.
- Inspeccionar la URL de WhatsApp y confirmar producto, variante, cantidad, subtotal, localidad y UTM.
- Navegar solo con teclado y probar Escape.
- Activar movimiento reducido en el sistema.
- Revisar 360, 768, 1280 y 1600 px.

## Despliegue

No hay build. Publicá el contenido de `Tienda-Generica/` como sitio estático en Cloudflare Pages, Vercel o un hosting equivalente.

Antes de producción:

- Cambiar canonical, Open Graph y URL en configuración y HTML.
- Usar HTTPS.
- Probar el WhatsApp del cliente en un teléfono real.
- Cargar el Pixel correcto y verificar eventos.
- Optimizar fotografías reales a WebP/AVIF con dimensiones explícitas.
- Reemplazar email, ubicación, redes y textos legales.
- Comprobar que todas las promociones y estados de stock sean verdaderos.

## Personalización visual

La demo usa Bricolage Grotesque + Familjen Grotesk, retail geométrico claro y la firma **Ticket Vivo**. Para cada cliente debe ejecutarse la máquina de variedad de `../design/`: investigar el rubro, descartar combinaciones recientes, elegir dirección/tipografía/paleta/firma y registrar el resultado en `design/log.md`.

No cambies únicamente el color principal. El artefacto firma, el copy, la composición y las fotografías deben salir del mundo real del comercio.

## Límites

La versión 1 no incluye:

- Cobro online ni validación de pagos.
- Panel administrador.
- Base de datos o inventario sincronizado.
- Usuarios o contraseñas.
- Facturación electrónica.
- Cálculo de envío mediante APIs.
- Conversions API.

Mercado Pago requiere backend o función serverless para crear preferencias, proteger credenciales y validar webhooks. La extensión recomendada es Checkout Pro primero; Checkout Bricks solo cuando el control visual justifique su mayor complejidad.

## Responsabilidad operativa

Las páginas legales son una base editable, no una garantía automática de cumplimiento. El responsable real debe revisar identidad del proveedor, información al consumidor, privacidad, arrepentimiento, facturación y condiciones de entrega con profesionales adecuados.

La tienda nunca debe emitir `Purchase` por un clic a WhatsApp ni afirmar que un pago fue aprobado usando solo parámetros de URL.
