# Rediseño de identidades de tienda

## Objetivo

Hacer que las tres tiendas se perciban como casos de marca independientes y premium, sin modificar el motor de catálogo, carrito, checkout, legales ni WhatsApp.

## Diagnóstico

La captura de Todo en Casa revela el problema principal: el hover de la tarjeta expone una interfaz de compra sobredimensionada y genérica. Las tres tiendas comparten la misma estructura de catálogo, el mismo gesto de zoom, el mismo botón de suma y el mismo disparador de carrito. La repetición es visible aunque cambie la paleta.

## Dirección aprobada

| Tienda | Dirección | Paleta | Catálogo | Compra y carrito | Firma |
|---|---|---|---|---|---|
| Moda Lucía | Atelier editorial silencioso | marfil, tinta azul y oro apagado | lookbook de piezas con texto flotante, sin zoom invasivo | botón de selección redondo y ticket con borde fino | etiqueta cosida / hanger |
| Todo en Casa | Sistema doméstico modular | papel frío, verde estantería, ámbar | fichas utilitarias con módulos estables y acción tipo interruptor | bolsa cuadrada y selector de producto de una línea | estantería de bloques |
| Raíces del Norte | Archivo material nocturno | petróleo profundo, arcilla cobriza, arena y humo | galería oscura de piezas, marcos de cobre y origen visible | carrito lateral como ficha de colección, no como ticket | trama de telar luminosa |

## Reglas de interacción

- Ninguna tarjeta escala ni cambia de tamaño al pasar el cursor.
- El hover solo revela una acción útil y usa color, borde o una máscara controlada.
- Cada tienda tiene radio, tipografía de acción, forma de CTA y representación de carrito propios.
- En móvil no se depende de hover: las acciones están siempre disponibles y los controles miden al menos 44 px.
- `prefers-reduced-motion` elimina animaciones no esenciales.

## Arquitectura

La capa funcional se conserva en `app.js`, `store-core.js`, `analytics.js`, `products.js`, `store.config.js` y `legal/`. El rediseño vive exclusivamente en `fashion-theme.css`, `general-theme.css`, `artisan-theme.css` e identificadores `data-store-style` ya presentes. El build continúa copiando cada ejemplo a su ruta pública en `dist/`.

## Verificación

- Prueba automatizada: cada tema declara su firma visual y Raíces declara fondo oscuro.
- Capturas de 1360 px y 390 px de las tres rutas publicadas desde `dist/`.
- `npm.cmd test`, `npm.cmd run check`, `npm.cmd run validate`, `npm.cmd run build` y `git diff --check`.
