# Portfolio real de tiendas · Diseño

## Objetivo

Publicar desde `optimind-store-base` un portfolio de OptiMind que presente tres tiendas funcionales y visualmente irrepetibles. El sitio se enviará por WhatsApp para que cada persona recorra los casos y vuelva a contactar a OptiMind.

## Arquitectura

`optimind-store-base` sigue siendo el único repositorio y el único proyecto de Cloudflare Pages. `scripts/build.js` genera `dist/`, que es el directorio publicado. Las fuentes funcionales siguen en `examples/`; no se cambian el catálogo, carrito, checkout por WhatsApp, analítica ni legales.

El proyecto duplicado `portfolio-tiendas` se usa solo como referencia de diseño durante la migración. Se elimina recién cuando el repositorio real esté validado, pusheado y desplegado correctamente.

## Diseño aprobado

### Landing del portfolio

- Dirección: galería/dossier editorial clara, fondo azul-tinta y acentos cyan de OptiMind; no usar la aurora violeta actual.
- Trabajo: mostrar las tres tiendas como protagonistas y conducir al WhatsApp de OptiMind, no vender productos ficticios desde la landing.
- Rutas: `/`, `/moda-lucia/`, `/todo-en-casa/`, `/raices-del-norte/`.
- Firma: las tarjetas funcionan como portadas de campaña, cada una anticipa la personalidad de su tienda sin usar la misma plantilla.

### Moda Lucía

- Dirección: campaña editorial, composición asimétrica, azul noche, marfil y berry; Boska/General Sans.
- Firma: siluetas geométricas de una prenda en campaña y el titular “Piezas que se viven”.
- Conserva el catálogo, carrito y checkout existente.

### Todo en Casa

- Dirección: sistema doméstico modular, verde estantería, ámbar y papel claro; Space Grotesk.
- Firma: estantería ilustrada con objetos cotidianos que organiza el hero.
- Conserva el catálogo, carrito y checkout existente.

### Raíces del Norte

- Dirección: archivo material, verde profundo, cobre y arena; Gambetta/Supreme.
- Firma: banda de trama tejida y fichas de origen por pieza.
- Debe dejar de reutilizar cualquier composición o captura visual de Moda Lucía.
- Conserva el catálogo, carrito y checkout existente.

## Criterios de aceptación

1. El build deja las cuatro rutas en `dist/` y los enlaces entre ellas funcionan.
2. Los tres casos mantienen carrito, checkout por WhatsApp, legales y productos.
3. Cada caso tiene tipografía, paleta, hero y firma visual propios.
4. Raíces no comparte copy, capturas ni clases de campaña con Moda Lucía.
5. Pruebas existentes, validación y pruebas nuevas de estructura pasan.
6. Se inspeccionan capturas desktop de la landing y las tres tiendas antes de publicar.
7. La rama `master` queda pusheada; Cloudflare Pages confirma un deploy exitoso.
