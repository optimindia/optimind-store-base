# Tienda Base OptiMind

## Portfolio publicado

- Landing: `https://optimind-store-base.pages.dev/`
- Moda Lucía: `https://optimind-store-base.pages.dev/moda-lucia/`
- Todo en Casa: `https://optimind-store-base.pages.dev/todo-en-casa/`
- Raíces del Norte: `https://optimind-store-base.pages.dev/raices-del-norte/`

Este repositorio es la fuente única del portfolio publicado. `npm.cmd run build` copia las tres tiendas funcionales y el dossier de `showcase/` a `dist/`. Cloudflare Pages ejecuta ese build al recibir cambios en `master`.

Motor estático y duplicable para convertir tráfico de Meta Ads en pedidos estructurados por WhatsApp. La tienda de demostración se llama **Tienda Demo** y vende objetos genéricos; el motor no depende de ese rubro. Cada cliente real obtiene una **piel visual nueva** (HTML/CSS) reutilizando el mismo motor.

## Qué incluye

- Catálogo configurable con búsqueda, categorías, orden y variantes.
- Carrito persistente y reconciliado contra stock actual.
- Ficha rápida accesible.
- Umbral de envío gratis, ahorro y estados de stock.
- Checkout mínimo con dirección condicional.
- Pedido legible por WhatsApp con identificador y atribución UTM.
- Meta Pixel opcional con eventos comerciales sin datos personales.
- Páginas de privacidad, términos, envíos/cambios y arrepentimiento.
- 35 pruebas automatizadas (core, analítica, estructura, configuración y build del portfolio).

## Cómo se arma una tienda nueva

El motor (`store-core.js`, `analytics.js`, `app.js`) **no se toca**. Para un cliente nuevo solo se edita la capa de datos y la piel:

1. `store.config.js` — identidad, URL, WhatsApp, email, moneda, envío, categorías, legales, SEO y funciones activas.
2. `products.js` — el catálogo real (mismo contrato que abajo).
3. `assets/` — logo, OG e imágenes de producto (conservando rutas y dimensiones explícitas).
4. La piel visual: `index.html` + `styles.css` se rehacen por cliente siguiendo el sistema de diseño OptiMind (`../design/`). El `:root` de `styles.css` concentra la paleta y la tipografía.

Los legales (`legal/`) y el `<head>` se hidratan solos desde `store.config.js` (vía `app.js` y `legal.js`), así que no hace falta tocarlos salvo para ajustar copy específico.

## Configuración rápida

1. Duplicá la carpeta completa y renombrala con el comercio.
2. Editá `store.config.js`: identidad, URL, WhatsApp, email, moneda, envío, categorías y funciones activas.
3. Sustituí los registros de `products.js` por el catálogo real.
4. Reemplazá `assets/brand/` y `assets/products/` conservando rutas y dimensiones explícitas.
5. Rehacé la piel visual de `index.html` y `styles.css` para el cliente; no publiques afirmaciones demostrativas como si fueran reales.
6. Revisá las cuatro páginas de `legal/` con los datos verdaderos del responsable (se hidratan, pero el copy específico puede ajustarse).
7. Ejecutá pruebas y captura visual antes del despliegue.

El número de WhatsApp se guarda con código de país y área, solo dígitos. Ejemplo argentino: `5492616027055`.

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

Estados válidos: `in_stock`, `low_stock`, `out_of_stock`. Los precios se expresan como enteros en la unidad mostrada por la tienda. Un ID duplicado, un precio negativo o un producto sin nombre se descartan de manera segura. Las categorías usadas deben existir en `store.config.js > categories`.

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
cd optimind-store-base
npm.cmd test
npm.cmd run check
npm.cmd run validate
npm.cmd run build
```

La suite cubre normalización, búsqueda, filtros, variantes, carrito, totales, UTMs, mensaje de WhatsApp, privacidad de eventos, contratos estructurales y validez de la configuración y el catálogo.

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

Cloudflare Pages está conectado al repo `optimindia/optimind-store-base`: la rama de producción es `master`, el comando es `npm run build` y el directorio de salida es `dist`.

Antes de producción:

- Cambiar canonical, Open Graph y URL en `store.config.js` (se hidratan en el DOM).
- Usar HTTPS.
- Probar el WhatsApp del cliente en un teléfono real.
- Cargar el Pixel correcto y verificar eventos.
- Optimizar fotografías reales a WebP/AVIF con dimensiones explícitas.
- Comprobar que todas las promociones y estados de stock sean verdaderos.

## Personalización visual

La demo usa Bricolage Grotesque + Familjen Grotesk, retail geométrico claro y la firma **Ticket Vivo**. Para cada cliente debe ejecutarse la máquina de variedad de `../design/`: investigar el rubro, descartar combinaciones recientes, elegir dirección/tipografía/paleta/firma y registrar el resultado en `design/log.md`.

No cambies únicamente el color principal. El artefacto firma, el copy, la composición y las fotografías deben salir del mundo real del comercio. La paleta y la tipografía se cambian en el `:root` de `styles.css`.

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
