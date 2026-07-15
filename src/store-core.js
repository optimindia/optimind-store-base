'use strict';

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.StoreCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const STOCK_STATES = new Set(['in_stock', 'low_stock', 'out_of_stock']);

  function normalizeText(value = '') {
    return String(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function normalizeVariant(variant, index) {
    if (!variant || typeof variant !== 'object') return null;
    const id = String(variant.id || `variant-${index + 1}`).trim();
    const label = String(variant.label || '').trim();
    const priceDelta = Number(variant.priceDelta || 0);
    if (!id || !label || !Number.isFinite(priceDelta)) return null;
    return {
      id,
      label,
      priceDelta,
      stockStatus: STOCK_STATES.has(variant.stockStatus) ? variant.stockStatus : 'in_stock'
    };
  }

  function normalizeProducts(products) {
    if (!Array.isArray(products)) return [];
    const ids = new Set();
    const normalized = [];

    products.forEach((product, order) => {
      if (!product || typeof product !== 'object') return;
      const id = String(product.id || '').trim();
      const name = String(product.name || '').trim();
      const price = Number(product.price);
      if (!id || ids.has(id) || !name || !Number.isFinite(price) || price < 0) return;

      ids.add(id);
      normalized.push({
        id,
        slug: String(product.slug || id).trim(),
        name,
        shortDescription: String(product.shortDescription || '').trim(),
        description: String(product.description || product.shortDescription || '').trim(),
        category: String(product.category || 'general').trim(),
        tags: Array.isArray(product.tags) ? product.tags.map(String) : [],
        price,
        compareAtPrice: Number(product.compareAtPrice) > price ? Number(product.compareAtPrice) : 0,
        image: String(product.image || '').trim(),
        alt: String(product.alt || name).trim(),
        featured: Boolean(product.featured),
        adLanding: Boolean(product.adLanding),
        stockStatus: STOCK_STATES.has(product.stockStatus) ? product.stockStatus : 'in_stock',
        variants: Array.isArray(product.variants)
          ? product.variants.map(normalizeVariant).filter(Boolean)
          : [],
        order
      });
    });

    return normalized;
  }

  function searchProducts(products, query) {
    const needle = normalizeText(query);
    if (!needle) return [...products];
    return products.filter((product) => normalizeText([
      product.name,
      product.shortDescription,
      product.description,
      product.category,
      ...(product.tags || [])
    ].join(' ')).includes(needle));
  }

  function filterAndSort(products, options = {}) {
    const category = normalizeText(options.category || 'all');
    let result = searchProducts(products, options.query || '');
    if (category && category !== 'all') {
      result = result.filter((product) => normalizeText(product.category) === category);
    }

    const sorters = {
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
      'name-asc': (a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }),
      relevance: (a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order
    };

    return [...result].sort(sorters[options.sort] || sorters.relevance);
  }

  function findProduct(products, productId) {
    return products.find((product) => product.id === productId) || null;
  }

  function findVariant(product, variantId) {
    if (!product || !product.variants.length) return null;
    return product.variants.find((variant) => variant.id === variantId) || null;
  }

  function createLineKey(productId, variantId = '') {
    return `${productId}::${variantId || 'base'}`;
  }

  function addCartItem(cart, item, products) {
    const safeCart = Array.isArray(cart) ? cart.map((line) => ({ ...line })) : [];
    const product = findProduct(products, item && item.productId);
    const quantity = Math.max(1, Math.min(99, Math.trunc(Number(item && item.quantity) || 1)));
    if (!product || product.stockStatus === 'out_of_stock') return safeCart;

    const variant = product.variants.length ? findVariant(product, item.variantId) : null;
    if (product.variants.length && (!variant || variant.stockStatus === 'out_of_stock')) return safeCart;

    const variantId = variant ? variant.id : '';
    const lineKey = createLineKey(product.id, variantId);
    const existing = safeCart.find((line) => line.lineKey === lineKey);
    if (existing) {
      existing.quantity = Math.min(99, existing.quantity + quantity);
    } else {
      safeCart.push({ lineKey, productId: product.id, variantId, quantity });
    }
    return safeCart;
  }

  function updateCartItem(cart, lineKey, quantity) {
    const nextQuantity = Math.max(0, Math.min(99, Math.trunc(Number(quantity) || 0)));
    if (nextQuantity === 0) return cart.filter((line) => line.lineKey !== lineKey);
    return cart.map((line) => line.lineKey === lineKey ? { ...line, quantity: nextQuantity } : { ...line });
  }

  function removeCartItem(cart, lineKey) {
    return updateCartItem(cart, lineKey, 0);
  }

  function normalizeCart(cart, products) {
    if (!Array.isArray(cart)) return [];
    return cart.reduce((normalized, line) => {
      const quantity = Math.max(0, Math.min(99, Math.trunc(Number(line && line.quantity) || 0)));
      if (!line || !line.productId || quantity === 0) return normalized;
      return addCartItem(normalized, {
        productId: line.productId,
        variantId: line.variantId || '',
        quantity
      }, products);
    }, []);
  }

  function calculateCart(cart, products, commerce = {}) {
    const normalized = normalizeCart(cart, products);
    const lines = normalized.map((line) => {
      const product = findProduct(products, line.productId);
      const variant = findVariant(product, line.variantId);
      const priceDelta = variant ? variant.priceDelta : 0;
      const unitPrice = product.price + priceDelta;
      const compareUnitPrice = (product.compareAtPrice || product.price) + priceDelta;
      return {
        ...line,
        product,
        variant,
        unitPrice,
        lineTotal: unitPrice * line.quantity,
        compareLineTotal: compareUnitPrice * line.quantity
      };
    });
    const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    const compareTotal = lines.reduce((sum, line) => sum + line.compareLineTotal, 0);
    const freeShippingFrom = Math.max(0, Number(commerce.freeShippingFrom) || 0);

    return {
      lines,
      itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
      subtotal,
      compareTotal,
      savings: Math.max(0, compareTotal - subtotal),
      freeShippingRemaining: freeShippingFrom ? Math.max(0, freeShippingFrom - subtotal) : 0,
      qualifiesForFreeShipping: Boolean(freeShippingFrom && subtotal >= freeShippingFrom)
    };
  }

  function captureAttribution(url) {
    let parsed;
    try {
      parsed = new URL(url || '', 'https://local.invalid');
    } catch (_error) {
      parsed = new URL('https://local.invalid');
    }
    return {
      source: parsed.searchParams.get('utm_source') || '',
      medium: parsed.searchParams.get('utm_medium') || '',
      campaign: parsed.searchParams.get('utm_campaign') || '',
      content: parsed.searchParams.get('utm_content') || '',
      term: parsed.searchParams.get('utm_term') || '',
      fbclid: parsed.searchParams.get('fbclid') || ''
    };
  }

  function createOrderId(prefix = 'ORD', random = Math.random) {
    const safePrefix = String(prefix || 'ORD').replace(/[^a-z0-9]/gi, '').slice(0, 3).toUpperCase() || 'ORD';
    const token = Math.floor(random() * 60466176).toString(36).padStart(5, '0').slice(-5).toUpperCase();
    return `${safePrefix}-${token}`;
  }

  function formatMoney(amount, locale = 'es-AR', currency = 'ARS') {
    if (currency === 'ARS') return `$ ${Math.round(Number(amount) || 0).toLocaleString(locale)}`;
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    }).format(Number(amount) || 0).replace(/\u00a0/g, ' ');
  }

  function buildWhatsAppMessage(options = {}) {
    const totals = options.totals || calculateCart(options.cart || [], options.products || [], {});
    if (!totals.lines || totals.lines.length === 0) throw new Error('El carrito está vacío');

    const config = options.config || {};
    const customer = options.customer || {};
    const attribution = options.attribution || {};
    const lines = [
      config.intro || `Hola ${config.storeName || ''}, quiero hacer este pedido:`,
      '',
      `Pedido: ${options.orderId || createOrderId(config.storeName)}`
    ];

    totals.lines.forEach((line) => {
      const variant = line.variant ? ` — ${line.variant.label}` : '';
      lines.push(`• ${line.quantity} × ${line.product.name}${variant}`);
    });

    lines.push('', `Subtotal: ${formatMoney(totals.subtotal, config.locale, config.currency)}`);
    if (customer.deliveryLabel) lines.push(`Entrega: ${customer.deliveryLabel}`);
    if (customer.city) lines.push(`Localidad: ${String(customer.city).trim()}`);
    if (customer.address) lines.push(`Dirección: ${String(customer.address).trim()}`);
    if (customer.name) lines.push(`Nombre: ${String(customer.name).trim()}`);
    if (customer.note) lines.push(`Nota: ${String(customer.note).trim()}`);

    const origin = [attribution.source, attribution.campaign].filter(Boolean).join(' / ');
    if (origin) lines.push('', `Origen: ${origin}`);
    return lines.join('\n');
  }

  function buildWhatsAppUrl(phone, message) {
    const digits = String(phone || '').replace(/\D/g, '');
    if (digits.length < 8) throw new Error('El número de WhatsApp no es válido');
    if (!String(message || '').trim()) throw new Error('El mensaje de WhatsApp está vacío');
    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  }

  return {
    normalizeText,
    normalizeProducts,
    searchProducts,
    filterAndSort,
    createLineKey,
    addCartItem,
    updateCartItem,
    removeCartItem,
    normalizeCart,
    calculateCart,
    captureAttribution,
    createOrderId,
    formatMoney,
    buildWhatsAppMessage,
    buildWhatsAppUrl
  };
});
