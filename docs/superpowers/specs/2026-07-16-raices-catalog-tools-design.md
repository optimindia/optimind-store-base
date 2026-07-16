# Raíces del Norte · mesa de búsqueda

## Objetivo

Reemplazar el bloque pesado de búsqueda, filtros y orden del catálogo por una
herramienta clara que acompañe la estética de archivo material de Raíces.

## Dirección aprobada

La interfaz funciona como una **mesa de búsqueda**: el campo de búsqueda queda
primero, liviano y continuo; las categorías se convierten en etiquetas de
archivo debajo; el orden se mantiene a la derecha como una acción secundaria.

## Composición

En escritorio, el bloque tendrá una regla superior de cobre tenue y dos filas:

1. búsqueda amplia a la izquierda y selector de orden compacto a la derecha;
2. etiquetas de categoría alineadas a la izquierda, sin contenedor gris.

En móvil, el buscador conserva todo el ancho disponible; las etiquetas se
desplazan horizontalmente y el selector se sitúa debajo con separación clara.

## Tokens y comportamiento

- Fondo: transparente sobre el verde petróleo existente.
- Líneas: cobre apagado (`--accent-2`) con baja opacidad.
- Categoría activa: cobre mate (`--accent`) sin saltos de tamaño.
- Foco: aro de cobre visible, sin glow azul heredado.
- Los controles conservan los mismos IDs, roles y eventos actuales.

## Límites

No se cambia el motor de filtros, el catálogo, el HTML semántico ni el resto de
las tiendas. El ajuste afecta solamente el tema visual de Raíces y su salida
compilada en `dist/`.
