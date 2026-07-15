# Cómo crear una tienda nueva con el motor OptiMind Store

Esta guía es para quien use el generador. No hay que tocar código del motor: solo se preparan datos, imágenes y una piel visual, y se corre un comando.

---

## 1. Preparar la carpeta del cliente

Crear una carpeta con este nombre exacto de archivos:

```
clientes/nombre-de-la-tienda/
├── config.json
├── products.csv
└── assets/
    ├── brand/
    │   ├── logo.svg
    │   └── og.svg
    └── products/
        ├── remera.svg
        ├── vestido.svg
        └── ... (una imagen por producto)
```

> **Importante:** el slug de la tienda se escribe en minúsculas, números y guiones. Ejemplo: `moda-lucia`, `todo-en-casa`, `raices-del-norte`.

---

## 2. Completar `config.json`

Campos mínimos obligatorios:

```json
{
  "store": {
    "name": "Nombre completo de la tienda",
    "shortName": "Nombre corto",
    "descriptor": "Frase de una línea que define qué vende",
    "url": "https://nombre-de-la-tienda.optimindia.site",
    "whatsapp": "5492616123456",
    "instagram": "@cuenta",
    "email": "hola@tienda.com",
    "location": "Mendoza, Argentina"
  },
  "locale": {
    "lang": "es-AR",
    "locale": "es-AR",
    "currency": "ARS"
  },
  "commerce": {
    "minimumOrder": 0,
    "freeShippingFrom": 70000,
    "lowStockLabel": "Últimas unidades",
    "deliveryModes": [
      { "id": "shipping", "label": "Envío a domicilio", "requiresAddress": true },
      { "id": "pickup", "label": "Retiro coordinado", "requiresAddress": false }
    ]
  },
  "categories": [
    { "id": "textiles", "label": "Textiles", "icon": "▣" },
    { "id": "ceramica", "label": "Cerámica", "icon": "◉" },
    { "id": "madera", "label": "Madera", "icon": "▦" }
  ],
  "legal": {
    "responsibleName": "Nombre completo de la tienda",
    "email": "hola@tienda.com",
    "city": "Mendoza, Argentina",
    "country": "AR"
  },
  "seo": {
    "title": "Nombre de la tienda — qué vende",
    "description": "Armá tu pedido online y coordiná la entrega por WhatsApp.",
    "themeColor": "#F6F4F1"
  },
  "analytics": {
    "pixelId": ""
  },
  "features": {
    "search": true,
    "filters": true,
    "variants": true,
    "testimonials": false,
    "freeShippingBar": true
  }
}
```

Reglas:

- `whatsapp` solo dígitos, con código de país. Ejemplo: `5492616123456`.
- Las `categories` deben coincidir con los valores de `category` en el CSV.
- `themeColor` define el color de la barra del navegador en móviles.

---

## 3. Completar `products.csv`

El archivo debe tener encabezados exactos. Ejemplo:

```csv
name,short_description,description,category,price,compare_at_price,stock_status,featured,image,alt,variants,slug,tags
Mochila Tejida,Lana de oveja tejida a mano.,Mochila tejida en telar con lana de oveja local.,textiles,35000,,in_stock,true,assets/products/mochila.svg,Mochila tejida,Crudo:0:in_stock;Terracota:0:in_stock,mochila-tejida,regalo
Cuenco de Cerámica,Gres rústico esmalte mate.,Cuenco de gres rústico con esmalte mate interior.,ceramica,22000,,in_stock,false,assets/products/cuenco.svg,Cuenco de cerámica,Chico:0:in_stock;Grande:4000:in_stock,cuenco-ceramica,casa
```

Campos:

| Campo | Tipo | Notas |
|---|---|---|
| `name` | texto | Obligatorio. Nombre visible. |
| `short_description` | texto | Subtítulo en la tarjeta. |
| `description` | texto | Texto largo del detalle. |
| `category` | texto | Debe existir en `config.json`. |
| `price` | número | Sin puntos ni comas. |
| `compare_at_price` | número | Opcional. Precio tachado. |
| `stock_status` | texto | `in_stock`, `low_stock` o `out_of_stock`. |
| `featured` | booleano | `true` para destacar en el ticket de ejemplo. |
| `image` | ruta | Ej: `assets/products/mochila.svg`. |
| `alt` | texto | Texto alternativo accesible. |
| `variants` | texto | Opcional. Formato: `Nombre:delta:stock|Nombre2:delta2:stock2`. |
| `slug` | texto | Opcional. URL amigable. Si no va, se genera desde el nombre. |
| `tags` | texto | Opcional. Separados por `;`. |

---

## 4. Preparar las imágenes

### Marca

- `logo.svg`: cuadrado, legible a 44 px. Puede usarse fondo transparente o el color de fondo que luzca bien sobre `--paper`.
- `og.svg`: 1200 × 630 px, imagen para compartir en redes.

### Productos

- Formatos: SVG preferido, PNG o JPG también funcionan.
- Tamaño recomendado: 800 × 800 px.
- Nombre de archivo: debe coincidir exactamente con la columna `image` del CSV.
- Fondo: preferiblemente el color `--highlight` de la piel visual, para que las tarjetas queden uniformes.

---

## 5. Generar la tienda

Desde la raíz del repo:

```bash
npm run create-store -- --slug nombre-de-la-tienda --input ./clientes/nombre-de-la-tienda/
```

Esto crea `dist/clients/nombre-de-la-tienda/` copiando el motor y reemplazando config y productos.

Si querés saltar la validación (no recomendado):

```bash
npm run create-store -- --slug nombre-de-la-tienda --input ./clientes/nombre-de-la-tienda/ --skip-validation
```

---

## 6. Aplicar la piel visual única

El generador entrega la tienda con el estilo base (`styles.css`) del template default. Para que no se vea genérica, hay que crear un archivo `*-theme.css` y ajustar:

1. Copiar `examples/fashion/fashion-theme.css` o `examples/general/general-theme.css` como punto de partida.
2. Renombrarlo a `nombre-de-la-tienda-theme.css` dentro de `dist/clients/nombre-de-la-tienda/`.
3. Editar las variables:
   - `--paper`, `--surface`, `--ink`, `--muted`
   - `--accent`, `--accent-2`, `--highlight`
   - `--display`, `--body`, `--mono`
4. Adaptar el copy de `index.html`: título, hero, categorías, pasos, FAQ, footer.
5. Reemplazar la firma visual (SVG del hero) por algo propio del mundo del cliente.
6. Enlazar el tema en `index.html` después de `styles.css`:

```html
<link rel="stylesheet" href="styles.css">
<link rel="stylesheet" href="nombre-de-la-tienda-theme.css">
```

> Ver los tres ejemplos en `examples/` para copiar estructuras probadas.

---

## 7. Validar

```bash
npm run validate -- --dir dist/clients/nombre-de-la-tienda
```

Esto revisa que estén todos los archivos, que la config sea válida, que los productos tengan imágenes y que las categorías coincidan.

---

## 8. Verificar visualmente antes de entregar

Capturar el hero:

```bash
CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-color-profile=srgb \
  --window-size=1360,1000 --virtual-time-budget=4000 \
  --screenshot="captura.png" \
  "file:///RUTA/ABSOLUTA/dist/clients/nombre-de-la-tienda/index.html"
```

Capturar la página completa (temporalmente activar el bloque `PREVIEW-OVERRIDE` al final del tema, luego volver a comentarlo):

```bash
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-color-profile=srgb \
  --window-size=1280,6000 --virtual-time-budget=4000 \
  --screenshot="captura-full.png" \
  "file:///RUTA/ABSOLUTA/dist/clients/nombre-de-la-tienda/index.html"
```

Revisar:

- ¿Se ve premium y distinta a los ejemplos anteriores?
- ¿La tipografía tiene carácter?
- ¿La firma visual pertenece al mundo del cliente?
- ¿Nada se pisa en móvil y escritorio?
- ¿Las imágenes de producto no son genéricas?

---

## 9. Correr los tests

```bash
npm test
```

Si todo pasa, la tienda está lista para subir.

---

## 10. Subir a Cloudflare / GitHub

- El output es una carpeta estática.
- Subir los archivos de `dist/clients/nombre-de-la-tienda/` al bucket o pages deseado.
- Configurar el dominio: `nombre-de-la-tienda.optimindia.site`.
- Probar el botón de WhatsApp con un pedido de prueba.

---

## Checklist rápido

- [ ] Carpeta con `config.json`, `products.csv` y `assets/`.
- [ ] `whatsapp` con código de país y solo dígitos.
- [ ] Categorías del CSV coinciden con las de `config.json`.
- [ ] Cada producto tiene su imagen en `assets/products/`.
- [ ] `logo.svg` y `og.svg` en `assets/brand/`.
- [ ] Se generó con `npm run create-store`.
- [ ] Se aplicó piel visual propia (`*-theme.css` + copy adaptado).
- [ ] `npm run validate` pasa.
- [ ] Captura de pantalla revisada.
- [ ] `npm test` pasa.
