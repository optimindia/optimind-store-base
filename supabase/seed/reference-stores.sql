-- Reference catalog only. This script intentionally creates no authenticated users or access grants.
insert into public.stores (slug, name, plan, is_active)
values
  ('moda-lucia', 'Moda Lucía', 'base', true),
  ('todo-en-casa', 'Todo en Casa', 'base', true),
  ('raices-del-norte', 'Raíces del Norte', 'base', true)
on conflict (slug) do update
set name = excluded.name, plan = excluded.plan, is_active = excluded.is_active;

insert into public.store_settings (store_id, whatsapp, email, location, currency, free_shipping_from, checkout_intro, seo_title, seo_description)
select s.id, v.whatsapp, v.email, v.location, 'ARS', v.free_shipping_from, v.checkout_intro, v.seo_title, v.seo_description
from (values
  ('moda-lucia', '5492616123456', 'hola@modalucia.com', 'Mendoza, Argentina', 85000::numeric, 'Hola Lucía, quiero hacer este pedido:', 'Moda Lucía — indumentaria femenina', 'Elegí tu próxima prenda y coordiná la entrega por WhatsApp.'),
  ('todo-en-casa', '5492616123457', 'hola@todoencasa.ar', 'Buenos Aires, Argentina', 90000::numeric, 'Hola Todo en Casa, quiero hacer este pedido:', 'Todo en Casa — objetos útiles para el día a día', 'Encontrá lo que necesitás y coordiná la entrega por WhatsApp.'),
  ('raices-del-norte', '5492616027055', 'hola@raicesdelnorte.com', 'Salta, Argentina', 70000::numeric, 'Hola Raíces del Norte, quiero hacer este pedido:', 'Raíces del Norte — artesanías del norte', 'Elegí artesanías hechas a mano y coordiná la entrega por WhatsApp.')
) as v(slug, whatsapp, email, location, free_shipping_from, checkout_intro, seo_title, seo_description)
join public.stores s on s.slug = v.slug
on conflict (store_id) do update set
  whatsapp = excluded.whatsapp, email = excluded.email, location = excluded.location,
  free_shipping_from = excluded.free_shipping_from, checkout_intro = excluded.checkout_intro,
  seo_title = excluded.seo_title, seo_description = excluded.seo_description;

insert into public.categories (store_id, slug, name, position, is_visible)
select s.id, v.category_slug, v.name, v.position, true
from (values
  ('moda-lucia', 'remeras', 'Remeras', 10),
  ('moda-lucia', 'vestidos', 'Vestidos', 20),
  ('moda-lucia', 'abrigos', 'Abrigos', 30),
  ('todo-en-casa', 'cocina', 'Cocina', 10),
  ('todo-en-casa', 'hogar', 'Hogar', 20),
  ('todo-en-casa', 'escritorio', 'Escritorio', 30),
  ('raices-del-norte', 'textiles', 'Textiles', 10),
  ('raices-del-norte', 'ceramica', 'Cerámica', 20),
  ('raices-del-norte', 'madera', 'Madera', 30)
) as v(store_slug, category_slug, name, position)
join public.stores s on s.slug = v.store_slug
on conflict (store_id, slug) do update set name = excluded.name, position = excluded.position, is_visible = true;

insert into public.products (store_id, category_id, slug, name, short_description, description, price, track_inventory, is_featured, is_published, position, metadata)
select s.id, c.id, v.product_slug, v.name, v.short_description, v.description, v.price, false, v.is_featured, true, v.position,
  jsonb_build_object('image', v.image, 'alt', v.alt, 'stock_status', v.stock_status)
from (values
  ('moda-lucia', 'remeras', 'remera-lua', 'Remera Lua', 'Algodón orgánico, corte relajado.', 'Remera de algodón orgánico con corte relajado y terminación enrollada.', 25900::numeric, true, 10, 'assets/products/remera.svg', 'Remera Lua de algodón', 'in_stock'),
  ('moda-lucia', 'vestidos', 'vestido-mora', 'Vestido Mora', 'Viscosa liviana, escote cuadrado.', 'Vestido midi de viscosa liviana con escote cuadrado y manga 3/4.', 68900::numeric, true, 20, 'assets/products/vestido.svg', 'Vestido Mora', 'in_stock'),
  ('moda-lucia', 'abrigos', 'campera-norte', 'Campera Norte', 'Abrigo corto, interior cálido.', 'Campera corta con interior cálido y bolsillos laterales.', 92900::numeric, false, 30, 'assets/products/campera.svg', 'Campera Norte', 'in_stock'),
  ('todo-en-casa', 'cocina', 'set-sartenes', 'Set de Sartenes', 'Tres medidas, antiadherentes.', 'Set de tres sartenes con recubrimiento antiadherente y mango de baquelita.', 45000::numeric, true, 10, 'assets/products/sartenes.svg', 'Set de sartenes', 'in_stock'),
  ('todo-en-casa', 'hogar', 'lampara-mesa', 'Lámpara de Mesa', 'Luz cálida, diseño simple.', 'Lámpara de mesa con pantalla de tela y base de madera.', 38000::numeric, false, 20, 'assets/products/lampara.svg', 'Lámpara de mesa', 'in_stock'),
  ('todo-en-casa', 'hogar', 'manta-nido', 'Manta Nido', 'Tejido suave, dos plazas.', 'Manta de dos plazas, tejido suave y liviano para todo el año.', 28000::numeric, false, 30, 'assets/products/manta.svg', 'Manta Nido', 'in_stock'),
  ('todo-en-casa', 'escritorio', 'organizador-desk', 'Organizador Desk', 'Madera y metal, minimal.', 'Organizador de escritorio con compartimentos en madera y soportes metálicos.', 18500::numeric, false, 40, 'assets/products/organizador.svg', 'Organizador de escritorio', 'in_stock'),
  ('raices-del-norte', 'textiles', 'mochila-tejida', 'Mochila Tejida', 'Lana de oveja, tejido a mano.', 'Mochila tejida en telar con lana de oveja local, colores naturales.', 35000::numeric, true, 10, 'assets/products/mochila.svg', 'Mochila tejida', 'in_stock'),
  ('raices-del-norte', 'ceramica', 'cuenco-ceramica', 'Cuenco de Cerámica', 'Gres rústico, esmalte mate.', 'Cuenco de gres rústico con esmalte mate interior, ideal para uso diario.', 22000::numeric, false, 20, 'assets/products/cuenco.svg', 'Cuenco de cerámica', 'in_stock'),
  ('raices-del-norte', 'madera', 'bandeja-madera', 'Bandeja de Madera', 'Algarrobo, labrado a mano.', 'Bandeja de algarrobo con labrado artesanal y acabado con cera de abeja.', 28000::numeric, false, 30, 'assets/products/bandeja.svg', 'Bandeja de madera', 'in_stock'),
  ('raices-del-norte', 'textiles', 'aros-plata', 'Aros de Plata', 'Plata 925, diseño minimal.', 'Aros de plata 925 con acabado martillado a mano.', 18000::numeric, false, 40, 'assets/products/aros.svg', 'Aros de plata', 'in_stock')
) as v(store_slug, category_slug, product_slug, name, short_description, description, price, is_featured, position, image, alt, stock_status)
join public.stores s on s.slug = v.store_slug
join public.categories c on c.store_id = s.id and c.slug = v.category_slug
on conflict (store_id, slug) do update set
  category_id = excluded.category_id, name = excluded.name, short_description = excluded.short_description,
  description = excluded.description, price = excluded.price, is_featured = excluded.is_featured,
  is_published = true, position = excluded.position, metadata = excluded.metadata;

insert into public.product_variants (store_id, product_id, name, price_delta, is_available, position)
select s.id, p.id, v.name, v.price_delta, true, v.position
from (values
  ('moda-lucia', 'remera-lua', 'Blanco', 0::numeric, 10),
  ('moda-lucia', 'remera-lua', 'Negro', 0::numeric, 20),
  ('moda-lucia', 'campera-norte', 'S', 0::numeric, 10),
  ('moda-lucia', 'campera-norte', 'M', 0::numeric, 20),
  ('moda-lucia', 'campera-norte', 'L', 0::numeric, 30),
  ('todo-en-casa', 'set-sartenes', '20 cm', 0::numeric, 10),
  ('todo-en-casa', 'set-sartenes', '24 cm', 5000::numeric, 20),
  ('todo-en-casa', 'lampara-mesa', 'Negro', 0::numeric, 10),
  ('todo-en-casa', 'lampara-mesa', 'Blanco', 0::numeric, 20),
  ('todo-en-casa', 'organizador-desk', 'Chico', 0::numeric, 10),
  ('todo-en-casa', 'organizador-desk', 'Grande', 3000::numeric, 20),
  ('raices-del-norte', 'mochila-tejida', 'Crudo', 0::numeric, 10),
  ('raices-del-norte', 'mochila-tejida', 'Terracota', 0::numeric, 20),
  ('raices-del-norte', 'cuenco-ceramica', 'Chico', 0::numeric, 10),
  ('raices-del-norte', 'cuenco-ceramica', 'Grande', 4000::numeric, 20),
  ('raices-del-norte', 'aros-plata', 'Plata', 0::numeric, 10),
  ('raices-del-norte', 'aros-plata', 'Dorado', 2000::numeric, 20)
) as v(store_slug, product_slug, name, price_delta, position)
join public.stores s on s.slug = v.store_slug
join public.products p on p.store_id = s.id and p.slug = v.product_slug
on conflict (product_id, name) do update set price_delta = excluded.price_delta, is_available = true, position = excluded.position;
