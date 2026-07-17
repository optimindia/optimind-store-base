# Panel de operaciones OptiMind

## Objetivo

Publicar un único panel privado en `/admin/` para gestionar las tiendas compartidas sin crear una segunda base de datos. El personal de OptiMind ve todas las tiendas; un cliente autogestionable ve exclusivamente la tienda a la que pertenece.

## Acceso

El panel usa Supabase Auth por Magic Link. El navegador conserva sólo el token de sesión de la persona autenticada; nunca recibe una clave de servicio. La página pide el correo, envía un enlace al mismo `/admin/`, recupera el token de la URL al volver y valida el usuario contra Supabase.

El primer administrador será `jesusheredia86design@gmail.com`. La vinculación con el rol `platform_admin` se realiza cuando la cuenta exista en Auth; los demás accesos se otorgan creando una fila en `store_members` con rol `owner` o `editor`.

## Permisos y pantallas

- `platform_admin`: selector de tienda, resumen de las tres tiendas, cambio de plan, altas de categorías/productos/variantes, visibilidad, stock y pedidos.
- `owner` y `editor`: exactamente las mismas herramientas operativas, pero la lista de tiendas contiene sólo su `store_id`.
- `base`: no recibe miembro y por lo tanto ve acceso denegado tras iniciar sesión.

Las tablas se consultan y modifican por la API REST de Supabase con el JWT de la sesión. RLS es la frontera de seguridad: el selector visual no se considera autorización.

## Dirección visual

El panel es una consola de estudio, no otra tienda: fondo azul noche, acento cobre luminoso, gran superficie editorial para el catálogo y una barra lateral compacta. La firma es una franja de actividad que convierte el estado del negocio en un pulso visual. Tipografía: Space Grotesk para interfaz y DM Mono para datos. La interfaz es responsive, con navegación apilada en móvil y movimiento reducido cuando el sistema lo pide.

## Alcance

Incluye acceso, sesión, cierre de sesión, lectura de permisos, selección segura de tienda, CRUD de categorías/productos/variantes, cambios de plan y vista de pedidos. Las imágenes quedan preparadas para la política de Storage existente y se muestran desde sus URLs, pero la primera entrega no modifica archivos visuales de las tiendas públicas ni incorpora cobros automáticos.
