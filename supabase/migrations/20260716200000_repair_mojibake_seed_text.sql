-- Repair text imported through a UTF-8/Windows-1252 mismatch.
-- The condition makes this idempotent and avoids touching valid content.

update public.stores
set name = convert_from(convert_to(name, 'WIN1252'), 'UTF8')
where position(chr(195) in name) > 0 or position(chr(226) in name) > 0;

update public.store_settings
set
  location = case when position(chr(195) in coalesce(location, '')) > 0 or position(chr(226) in coalesce(location, '')) > 0 then convert_from(convert_to(location, 'WIN1252'), 'UTF8') else location end,
  shipping_copy = case when position(chr(195) in coalesce(shipping_copy, '')) > 0 or position(chr(226) in coalesce(shipping_copy, '')) > 0 then convert_from(convert_to(shipping_copy, 'WIN1252'), 'UTF8') else shipping_copy end,
  checkout_intro = case when position(chr(195) in coalesce(checkout_intro, '')) > 0 or position(chr(226) in coalesce(checkout_intro, '')) > 0 then convert_from(convert_to(checkout_intro, 'WIN1252'), 'UTF8') else checkout_intro end,
  seo_title = case when position(chr(195) in coalesce(seo_title, '')) > 0 or position(chr(226) in coalesce(seo_title, '')) > 0 then convert_from(convert_to(seo_title, 'WIN1252'), 'UTF8') else seo_title end,
  seo_description = case when position(chr(195) in coalesce(seo_description, '')) > 0 or position(chr(226) in coalesce(seo_description, '')) > 0 then convert_from(convert_to(seo_description, 'WIN1252'), 'UTF8') else seo_description end
where concat_ws(' ', location, shipping_copy, checkout_intro, seo_title, seo_description) ~ (chr(195) || '|' || chr(226));

update public.categories
set
  name = case when position(chr(195) in name) > 0 or position(chr(226) in name) > 0 then convert_from(convert_to(name, 'WIN1252'), 'UTF8') else name end,
  description = case when position(chr(195) in coalesce(description, '')) > 0 or position(chr(226) in coalesce(description, '')) > 0 then convert_from(convert_to(description, 'WIN1252'), 'UTF8') else description end
where concat_ws(' ', name, description) ~ (chr(195) || '|' || chr(226));

update public.products
set
  name = case when position(chr(195) in name) > 0 or position(chr(226) in name) > 0 then convert_from(convert_to(name, 'WIN1252'), 'UTF8') else name end,
  short_description = case when position(chr(195) in coalesce(short_description, '')) > 0 or position(chr(226) in coalesce(short_description, '')) > 0 then convert_from(convert_to(short_description, 'WIN1252'), 'UTF8') else short_description end,
  description = case when position(chr(195) in coalesce(description, '')) > 0 or position(chr(226) in coalesce(description, '')) > 0 then convert_from(convert_to(description, 'WIN1252'), 'UTF8') else description end,
  metadata = case
    when position(chr(195) in coalesce(metadata ->> 'alt', '')) > 0 or position(chr(226) in coalesce(metadata ->> 'alt', '')) > 0
      then jsonb_set(metadata, '{alt}', to_jsonb(convert_from(convert_to(metadata ->> 'alt', 'WIN1252'), 'UTF8')), false)
    else metadata
  end
where concat_ws(' ', name, short_description, description, metadata::text) ~ (chr(195) || '|' || chr(226));

update public.product_variants
set
  name = case when position(chr(195) in name) > 0 or position(chr(226) in name) > 0 then convert_from(convert_to(name, 'WIN1252'), 'UTF8') else name end,
  sku = case when position(chr(195) in coalesce(sku, '')) > 0 or position(chr(226) in coalesce(sku, '')) > 0 then convert_from(convert_to(sku, 'WIN1252'), 'UTF8') else sku end
where concat_ws(' ', name, sku) ~ (chr(195) || '|' || chr(226));

update public.product_images
set alt_text = convert_from(convert_to(alt_text, 'WIN1252'), 'UTF8')
where position(chr(195) in coalesce(alt_text, '')) > 0 or position(chr(226) in coalesce(alt_text, '')) > 0;
