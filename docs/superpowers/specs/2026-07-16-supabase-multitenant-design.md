# Supabase multitenant para tiendas OptiMind

## Objetivo

Usar el proyecto Supabase `tiendasonline` como la única fuente de datos para todas las tiendas OptiMind. Las tiendas Base y Autogestionable comparten catálogo, pedidos y estructura: lo único que cambia es quién puede administrar cada tienda.

## Decisiones aprobadas

- Un único proyecto Supabase y una única base de datos compartida.
- Cada fila comercial está aislada con `store_id`; no habrá una base por cliente.
- Las tiendas públicas siguen publicadas como sitios estáticos en Cloudflare Pages y conservan su identidad visual propia.
- El catálogo, las variantes, el stock, los destacados y la configuración comercial se obtienen desde Supabase, no desde archivos duplicados en Git.
- Los pedidos siguen cerrándose por WhatsApp. En esta etapa se registra el ticket de pedido, sin checkout, pagos automáticos ni sincronizaciones externas.
- Base: OptiMind administra los datos; el cliente no recibe panel.
- Autogestionable: el dueño recibe un panel privado limitado a su tienda; OptiMind mantiene acceso de plataforma.
- Al mejorar Base a Autogestionable se concede acceso al mismo `store_id`; no se migra ni duplica catálogo.

## Modelo de datos

### Tenencia y acceso

`stores` define el comercio, su slug público, plan y estado. `store_members` vincula usuarios de Supabase Auth con una tienda y un rol: `platform_admin`, `owner` o `editor`.

Todos los datos de negocio incluyen `store_id` y se relacionan con `stores(id)`:

- `store_settings`: WhatsApp, moneda, envío, textos de compra, SEO y configuración visual que no altera el diseño de la plantilla.
- `categories`: categorías y orden de aparición.
- `products`: producto, descripción, precio, estado, inventario y destacado.
- `product_variants`: talla, color u otra opción, con precio y stock opcionales.
- `product_images`: imágenes ordenadas por producto; los archivos viven en Storage bajo `stores/<store_id>/products/...`.
- `orders` y `order_items`: ticket armado para enviar por WhatsApp, estado comercial y total calculado.
- `audit_log`: cambios de administración con usuario, tienda, acción y fecha.

Las claves públicas del frontend sólo pueden leer productos activos y configuración pública de tiendas activas. La escritura se limita por RLS: un dueño o editor sólo opera sobre su `store_id`; `platform_admin` opera sobre todas. Las operaciones sensibles validan la pertenencia en el servidor o en funciones con credenciales seguras; el navegador nunca elige libremente una tienda ajena.

## Arquitectura de aplicaciones

```
Cloudflare Pages (cada tienda pública)
  └─ lectura pública de catálogo y configuración de su slug

Supabase: Auth + Postgres + Storage + RLS
  ├─ panel privado compartido en app.optimind (fase posterior)
  ├─ administración de OptiMind
  └─ datos aislados por store_id

WhatsApp
  └─ recibe el ticket estructurado del pedido
```

El diseño no se convierte en plantilla genérica: cada storefront mantiene sus componentes, CSS, animaciones y estética. El contrato común es una capa pequeña de datos que traduce productos/configuración de Supabase al skin de esa tienda.

## Entregas por fases

1. Migración segura: extensiones, tipos, tablas, relaciones, índices, RLS, Storage y datos iniciales de las tres demos.
2. Contrato de catálogo: cliente web compartido, variables de entorno públicas, adaptadores por skin y fallback explícito para no dejar tiendas vacías ante una configuración incompleta.
3. Pedidos y operaciones: ticket persistido antes de abrir WhatsApp, registro de auditoría y validaciones de stock/variantes.
4. Panel Autogestionable: login, selector de tienda sólo para roles de plataforma y CRUD de catálogo, categorías, imágenes, stock y destacados.
5. Pipeline replicable: reparar `create-store` y `build` para que una nueva tienda se registre en la misma base y se despliegue sin que un build borre clientes existentes.

## Límites de esta primera implementación

- No hay cobros, checkout ni facturación automática.
- No hay sincronización con Mercado Libre, Tiendanube ni ERP.
- No se cambia el diseño actual de las tres tiendas como parte de la migración de datos.
- No se crea un segundo proyecto o una segunda base.

## Validación de salida

- Un usuario público sólo obtiene los productos publicados de una tienda activa.
- Un owner no puede leer ni escribir otra tienda aunque altere una petición manualmente.
- OptiMind puede administrar cualquier tienda.
- Un ticket de pedido conserva sus precios e ítems aunque luego cambie el catálogo.
- Una tienda Base puede convertirse en Autogestionable sin exportar, copiar ni migrar datos.
- Las tres demos existentes conservan su apariencia y siguen funcionando después de conectarse al catálogo.
