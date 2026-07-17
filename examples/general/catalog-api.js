'use strict';

(function initCatalogApi(globalScope) {
  function numeric(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function inventoryStatus(product, variant) {
    if (!variant?.is_available) return 'out_of_stock';
    const tracked = variant?.stock_quantity ?? product.stock_quantity;
    if ((variant?.stock_quantity !== null && variant?.stock_quantity !== undefined) || product.track_inventory) {
      if (tracked <= 0) return 'out_of_stock';
      if (tracked <= 3) return 'low_stock';
    }
    return product.metadata?.stock_status || 'in_stock';
  }

  function normalizeStorefront(payload) {
    if (!payload?.store?.slug || !Array.isArray(payload.products) || !Array.isArray(payload.categories)) {
      throw new Error('El catálogo remoto no tiene el formato esperado.');
    }

    const categories = payload.categories.map((category) => ({
      id: category.slug,
      label: category.name,
      icon: category.metadata?.icon || ''
    }));
    const categorySlugs = new Map(payload.categories.map((category) => [category.id, category.slug]));
    const products = payload.products.map((product) => ({
      id: product.slug || product.id,
      slug: product.slug,
      name: product.name,
      shortDescription: product.short_description || '',
      description: product.description || product.short_description || '',
      category: categorySlugs.get(product.category_id) || 'general',
      tags: Array.isArray(product.metadata?.tags) ? product.metadata.tags : [],
      price: numeric(product.price),
      ...(product.compare_at_price ? { compareAtPrice: numeric(product.compare_at_price) } : {}),
      image: product.images?.[0]?.public_url || product.metadata?.image || '',
      alt: product.images?.[0]?.alt_text || product.metadata?.alt || product.name,
      featured: Boolean(product.is_featured),
      stockStatus: inventoryStatus(product),
      variants: (product.variants || []).map((variant) => ({
        id: variant.id || `${product.slug}-${variant.name}`,
        label: variant.name,
        priceDelta: numeric(variant.price_delta),
        stockStatus: inventoryStatus(product, variant)
      }))
    }));

    return {
      store: { slug: payload.store.slug, name: payload.store.name },
      settings: {
        whatsapp: payload.settings?.whatsapp || '',
        freeShippingFrom: payload.settings?.free_shipping_from ?? null,
        minimumOrder: payload.settings?.minimum_order ?? 0
      },
      categories,
      products
    };
  }

  async function loadStorefront(source, fallback, fetchImpl) {
    if (!source?.slug || !source?.supabaseUrl || !source?.publishableKey) {
      return { source: 'fallback', catalog: fallback };
    }
    const request = fetchImpl || globalScope.fetch;
    if (typeof request !== 'function') return { source: 'fallback', catalog: fallback };

    try {
      const response = await request(`${source.supabaseUrl.replace(/\/$/, '')}/rest/v1/rpc/get_public_storefront`, {
        method: 'POST',
        headers: {
          apikey: source.publishableKey,
          Authorization: `Bearer ${source.publishableKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requested_slug: source.slug })
      });
      if (!response?.ok) return { source: 'fallback', catalog: fallback };
      const payload = await response.json();
      return { source: 'supabase', catalog: normalizeStorefront(payload) };
    } catch (error) {
      return { source: 'fallback', catalog: fallback, error };
    }
  }

  const api = { normalizeStorefront, loadStorefront };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;

  if (globalScope.window === globalScope) {
    const source = globalScope.OPTIMIND_STORE_SOURCE;
    const fallback = {
      store: { slug: globalScope.STORE_CONFIG?.store?.slug || '', name: globalScope.STORE_CONFIG?.store?.name || '' },
      settings: {},
      categories: globalScope.STORE_CONFIG?.categories || [],
      products: globalScope.STORE_PRODUCTS || []
    };
    globalScope.OptiMindCatalog = api;
    globalScope.OptiMindCatalog.ready = loadStorefront(source, fallback).then((result) => {
      if (result.source !== 'supabase') return result;
      globalScope.STORE_PRODUCTS = result.catalog.products;
      globalScope.STORE_CONFIG = {
        ...globalScope.STORE_CONFIG,
        store: { ...globalScope.STORE_CONFIG.store, slug: result.catalog.store.slug, name: result.catalog.store.name },
        categories: result.catalog.categories,
        commerce: {
          ...globalScope.STORE_CONFIG.commerce,
          freeShippingFrom: result.catalog.settings.freeShippingFrom,
          minimumOrder: result.catalog.settings.minimumOrder
        }
      };
      return result;
    });
  }
})(typeof window !== 'undefined' ? window : globalThis);
