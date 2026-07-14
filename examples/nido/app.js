'use strict';

(function () {
  const config = window.STORE_CONFIG;
  const Core = window.StoreCore;
  const Analytics = window.StoreAnalytics;
  if (!config || !Core || !Analytics || !Array.isArray(window.STORE_PRODUCTS)) {
    document.documentElement.classList.add('store-error');
    console.error('[NIDO] No se pudo iniciar la tienda: faltan dependencias.');
    return;
  }

  const products = Core.normalizeProducts(window.STORE_PRODUCTS);
  const productGrid = document.getElementById('product-grid');
  const productTemplate = document.getElementById('product-card-template');
  const productDialog = document.getElementById('product-dialog');
  const searchInput = document.getElementById('product-search');
  const sortSelect = document.getElementById('product-sort');
  const noResults = document.getElementById('no-results');
  const resultCount = document.querySelector('[data-result-count]');
  const liveRegion = document.getElementById('live-region');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartTemplate = document.getElementById('cart-line-template');
  const checkoutDialog = document.getElementById('checkout-dialog');
  const checkoutForm = document.getElementById('checkout-form');
  const addressInput = document.getElementById('checkout-address');
  const addressField = document.querySelector('[data-address-field]');
  const storageKey = `optimind-store-cart:v1:${config.store.slug}`;
  const attributionKey = `optimind-store-attribution:v1:${config.store.slug}`;

  const state = {
    query: '',
    category: 'all',
    sort: 'relevance',
    currentProductId: '',
    selectedVariantId: '',
    cart: [],
    attribution: Core.captureAttribution(window.location.href)
  };

  let lastFocusedElement = null;
  let lastCartFocus = null;
  let lastCheckoutFocus = null;
  let searchTimer = 0;
  let cartCloseTimer = 0;
  let submitLocked = false;

  function categoryLabel(category) {
    const labels = { hogar: 'Hogar', cocina: 'Cocina', tecnologia: 'Tecnología', bienestar: 'Bienestar' };
    return labels[category] || 'Selección';
  }

  function announce(message) {
    liveRegion.textContent = '';
    window.setTimeout(() => { liveRegion.textContent = message; }, 20);
  }

  function money(amount) {
    return Core.formatMoney(amount, config.locale.locale, config.locale.currency);
  }

  function getProduct(productId) {
    return products.find((product) => product.id === productId) || null;
  }

  function handleImageError(event) {
    const image = event.target;
    if (!(image instanceof HTMLImageElement) || image.dataset.fallback === 'true') return;
    image.dataset.fallback = 'true';
    image.classList.add('image-fallback');
    image.src = 'assets/brand/logo.svg';
    image.alt = `Imagen no disponible de ${image.alt || 'este producto'}`;
  }

  function createProductCard(product) {
    const fragment = productTemplate.content.cloneNode(true);
    const card = fragment.querySelector('.product-card');
    const image = fragment.querySelector('img');
    const mediaButton = fragment.querySelector('[data-view-product]');
    const quickAdd = fragment.querySelector('[data-quick-add]');
    const badge = fragment.querySelector('[data-product-badge]');
    const price = fragment.querySelector('.current-price');
    const comparePrice = fragment.querySelector('s');

    card.dataset.productId = product.id;
    mediaButton.dataset.productId = product.id;
    mediaButton.setAttribute('aria-label', `Ver detalle de ${product.name}`);
    quickAdd.dataset.productId = product.id;
    image.src = product.image;
    image.alt = product.alt;
    image.addEventListener('error', handleImageError, { once: true });
    fragment.querySelector('.product-category').textContent = categoryLabel(product.category);
    fragment.querySelector('h3').textContent = product.name;
    fragment.querySelector('.product-summary').textContent = product.shortDescription;
    price.textContent = money(product.price);

    if (product.compareAtPrice) {
      comparePrice.hidden = false;
      comparePrice.textContent = money(product.compareAtPrice);
    }

    if (product.stockStatus === 'out_of_stock') {
      badge.hidden = false;
      badge.textContent = 'Agotado';
      quickAdd.disabled = true;
      quickAdd.textContent = 'Sin stock';
      card.classList.add('is-sold-out');
    } else if (product.stockStatus === 'low_stock') {
      badge.hidden = false;
      badge.textContent = config.commerce.lowStockLabel;
    } else if (product.compareAtPrice) {
      badge.hidden = false;
      badge.textContent = 'Precio especial';
    }

    if (product.variants.length) quickAdd.firstChild.textContent = 'Elegir opción ';
    return fragment;
  }

  function renderCatalog() {
    const visibleProducts = Core.filterAndSort(products, {
      query: state.query,
      category: state.category,
      sort: state.sort
    });
    const fragment = document.createDocumentFragment();
    visibleProducts.forEach((product) => fragment.appendChild(createProductCard(product)));
    productGrid.replaceChildren(fragment);
    productGrid.setAttribute('aria-busy', 'false');
    resultCount.textContent = String(visibleProducts.length);
    noResults.hidden = visibleProducts.length !== 0;
    productGrid.hidden = visibleProducts.length === 0;
    document.querySelectorAll('[data-clear-filters]').forEach((button) => {
      if (!button.closest('#no-results')) button.hidden = !state.query && state.category === 'all';
    });
    return visibleProducts;
  }

  function updateFilterButtons() {
    document.querySelectorAll('[data-category]').forEach((button) => {
      const active = button.dataset.category === state.category;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function clearFilters() {
    state.query = '';
    state.category = 'all';
    state.sort = 'relevance';
    searchInput.value = '';
    sortSelect.value = 'relevance';
    updateFilterButtons();
    renderCatalog();
    announce('Mostrando toda la selección.');
  }

  function renderVariantOptions(product) {
    const fieldset = productDialog.querySelector('[data-dialog-variants]');
    const options = productDialog.querySelector('[data-variant-options]');
    options.replaceChildren();
    fieldset.hidden = product.variants.length === 0;
    if (!product.variants.length) {
      state.selectedVariantId = '';
      return;
    }

    const firstAvailable = product.variants.find((variant) => variant.stockStatus !== 'out_of_stock');
    state.selectedVariantId = firstAvailable ? firstAvailable.id : '';
    product.variants.forEach((variant) => {
      const label = document.createElement('label');
      const input = document.createElement('input');
      const text = document.createElement('span');
      input.type = 'radio';
      input.name = 'product-variant';
      input.value = variant.id;
      input.checked = variant.id === state.selectedVariantId;
      input.disabled = variant.stockStatus === 'out_of_stock';
      text.textContent = `${variant.label}${variant.priceDelta ? ` · +${money(variant.priceDelta)}` : ''}${input.disabled ? ' · agotado' : ''}`;
      label.append(input, text);
      options.appendChild(label);
    });
  }

  function updateDialogState(product) {
    const variant = product.variants.find((item) => item.id === state.selectedVariantId) || null;
    const addButton = productDialog.querySelector('[data-dialog-add]');
    const stockMessage = productDialog.querySelector('[data-dialog-stock]');
    const available = product.stockStatus !== 'out_of_stock' && (!product.variants.length || (variant && variant.stockStatus !== 'out_of_stock'));
    productDialog.querySelector('[data-dialog-price]').textContent = money(product.price + (variant ? variant.priceDelta : 0));
    addButton.disabled = !available;
    addButton.textContent = available ? 'Sumar al ticket' : 'Sin stock';
    stockMessage.textContent = product.stockStatus === 'low_stock'
      ? config.commerce.lowStockLabel
      : available ? 'Disponible para pedir' : 'Este objeto no está disponible ahora';
    stockMessage.dataset.state = available ? product.stockStatus : 'out_of_stock';
  }

  function openProductDialog(productId, trigger) {
    const product = getProduct(productId);
    if (!product) return;
    lastFocusedElement = trigger || document.activeElement;
    state.currentProductId = product.id;
    productDialog.querySelector('[data-dialog-image]').src = product.image;
    productDialog.querySelector('[data-dialog-image]').alt = product.alt;
    productDialog.querySelector('[data-dialog-category]').textContent = categoryLabel(product.category);
    productDialog.querySelector('[data-dialog-name]').textContent = product.name;
    productDialog.querySelector('[data-dialog-description]').textContent = product.description;
    productDialog.querySelector('[data-dialog-quantity]').value = '1';
    renderVariantOptions(product);
    updateDialogState(product);

    if (typeof productDialog.showModal === 'function') productDialog.showModal();
    else productDialog.setAttribute('open', '');

    Analytics.track('ViewContent', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      value: product.price,
      currency: config.locale.currency
    });
  }

  function closeProductDialog() {
    if (productDialog.open && typeof productDialog.close === 'function') productDialog.close();
    else productDialog.removeAttribute('open');
    state.currentProductId = '';
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      window.setTimeout(() => lastFocusedElement.focus(), 0);
    }
  }

  function updateCartCount() {
    const count = state.cart.reduce((sum, line) => sum + line.quantity, 0);
    document.querySelectorAll('[data-cart-count]').forEach((element) => {
      element.textContent = String(count);
      element.setAttribute('aria-label', `${count} ${count === 1 ? 'producto' : 'productos'}`);
    });
  }

  function loadAttribution() {
    const current = Core.captureAttribution(window.location.href);
    const hasCampaignData = Object.values(current).some(Boolean);
    try {
      if (hasCampaignData) {
        window.sessionStorage.setItem(attributionKey, JSON.stringify(current));
        return current;
      }
      const stored = window.sessionStorage.getItem(attributionKey);
      return stored ? { ...current, ...JSON.parse(stored) } : current;
    } catch (_error) {
      return current;
    }
  }

  function loadCart() {
    try {
      const stored = window.localStorage.getItem(storageKey);
      return Core.normalizeCart(stored ? JSON.parse(stored) : [], products);
    } catch (_error) {
      return [];
    }
  }

  function persistCart() {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state.cart));
      return true;
    } catch (_error) {
      return false;
    }
  }

  function createCartLine(line) {
    const fragment = cartTemplate.content.cloneNode(true);
    const article = fragment.querySelector('.cart-line');
    const image = fragment.querySelector('img');
    article.dataset.lineKey = line.lineKey;
    image.src = line.product.image;
    image.alt = line.product.alt;
    image.addEventListener('error', handleImageError, { once: true });
    fragment.querySelector('h3').textContent = line.product.name;
    const variant = fragment.querySelector('[data-line-variant]');
    variant.textContent = line.variant ? line.variant.label : 'Opción única';
    fragment.querySelector('[data-line-quantity]').textContent = String(line.quantity);
    fragment.querySelector('[data-line-price]').textContent = money(line.lineTotal);
    for (const button of fragment.querySelectorAll('button')) button.dataset.lineKey = line.lineKey;
    return fragment;
  }

  function renderCart() {
    const totals = Core.calculateCart(state.cart, products, config.commerce);
    state.cart = totals.lines.map(({ lineKey, productId, variantId, quantity }) => ({ lineKey, productId, variantId, quantity }));
    const linesContainer = cartDrawer.querySelector('[data-cart-lines]');
    const fragment = document.createDocumentFragment();
    totals.lines.forEach((line) => fragment.appendChild(createCartLine(line)));
    linesContainer.replaceChildren(fragment);

    cartDrawer.querySelector('[data-cart-empty]').hidden = totals.itemCount > 0;
    cartDrawer.querySelector('[data-cart-footer]').hidden = totals.itemCount === 0;
    cartDrawer.querySelector('[data-cart-subtotal]').textContent = money(totals.subtotal);
    const savings = cartDrawer.querySelector('[data-cart-saving]');
    savings.hidden = totals.savings === 0;
    cartDrawer.querySelector('[data-cart-savings]').textContent = money(totals.savings);

    const shippingMessage = cartDrawer.querySelector('[data-shipping-message]');
    const shippingBar = cartDrawer.querySelector('[data-shipping-bar]');
    if (totals.qualifiesForFreeShipping) {
      shippingMessage.textContent = '¡Tu pedido alcanza el envío gratis!';
      shippingBar.style.width = '100%';
    } else if (totals.itemCount) {
      shippingMessage.textContent = `Te faltan ${money(totals.freeShippingRemaining)} para el envío gratis.`;
      const progress = config.commerce.freeShippingFrom ? (totals.subtotal / config.commerce.freeShippingFrom) * 100 : 0;
      shippingBar.style.width = `${Math.max(8, Math.min(100, progress))}%`;
    } else {
      shippingMessage.textContent = 'Sumá productos para conocer tu beneficio de envío.';
      shippingBar.style.width = '0%';
    }
    updateCartCount();
    return totals;
  }

  function openCart(trigger) {
    window.clearTimeout(cartCloseTimer);
    lastCartFocus = trigger || document.activeElement;
    cartDrawer.inert = false;
    cartDrawer.hidden = false;
    document.body.classList.add('overlay-open');
    document.querySelectorAll('[data-open-cart]').forEach((button) => button.setAttribute('aria-expanded', 'true'));
    window.requestAnimationFrame(() => {
      cartDrawer.classList.add('is-open');
      const closeButton = cartDrawer.querySelector('[data-close-cart]:not(.cart-backdrop)');
      if (closeButton) closeButton.focus();
    });
  }

  function closeCart(options = {}) {
    const restoreFocus = options.restoreFocus !== false;
    cartDrawer.classList.remove('is-open');
    cartDrawer.inert = true;
    document.body.classList.remove('overlay-open');
    document.querySelectorAll('[data-open-cart]').forEach((button) => button.setAttribute('aria-expanded', 'false'));
    cartCloseTimer = window.setTimeout(() => { cartDrawer.hidden = true; }, 320);
    if (restoreFocus && lastCartFocus && typeof lastCartFocus.focus === 'function') {
      window.setTimeout(() => lastCartFocus.focus(), 0);
    }
  }

  function handleAddToCart(productId, variantId = '', quantity = 1) {
    const product = getProduct(productId);
    if (!product) return false;
    const before = state.cart.reduce((sum, line) => sum + line.quantity, 0);
    state.cart = Core.addCartItem(state.cart, { productId, variantId, quantity }, products);
    const after = state.cart.reduce((sum, line) => sum + line.quantity, 0);
    if (after === before) {
      announce(`${product.name} no está disponible en esa opción.`);
      return false;
    }

    const variant = product.variants.find((item) => item.id === variantId) || null;
    persistCart();
    renderCart();
    updateCartCount();
    announce(`${quantity} ${quantity === 1 ? 'unidad' : 'unidades'} de ${product.name} en tu ticket.`);
    Analytics.track('AddToCart', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      value: (product.price + (variant ? variant.priceDelta : 0)) * quantity,
      currency: config.locale.currency,
      quantity,
      variant: variant ? variant.label : ''
    });
    return true;
  }

  function setDeliveryAddressState() {
    const delivery = document.getElementById('checkout-delivery').value;
    const mode = config.commerce.deliveryModes.find((item) => item.id === delivery);
    const required = Boolean(mode && mode.requiresAddress);
    addressField.hidden = !required;
    addressInput.required = required;
    if (!required) {
      addressInput.value = '';
      addressInput.removeAttribute('aria-invalid');
      document.querySelector('[data-error-for="checkout-address"]').textContent = '';
    }
  }

  function openCheckout(trigger) {
    const totals = renderCart();
    if (!totals.itemCount) {
      announce('Sumá al menos un producto antes de continuar.');
      return;
    }
    lastCheckoutFocus = trigger || document.activeElement;
    closeCart({ restoreFocus: false });
    if (typeof checkoutDialog.showModal === 'function') checkoutDialog.showModal();
    else checkoutDialog.setAttribute('open', '');
    window.setTimeout(() => document.getElementById('checkout-name').focus(), 0);
    Analytics.track('InitiateCheckout', {
      content_ids: totals.lines.map((line) => line.product.id),
      content_type: 'product',
      num_items: totals.itemCount,
      value: totals.subtotal,
      currency: config.locale.currency
    });
  }

  function closeCheckout() {
    if (checkoutDialog.open && typeof checkoutDialog.close === 'function') checkoutDialog.close();
    else checkoutDialog.removeAttribute('open');
    if (lastCheckoutFocus && typeof lastCheckoutFocus.focus === 'function') {
      window.setTimeout(() => lastCheckoutFocus.focus(), 0);
    }
  }

  function fieldError(field, message) {
    const error = document.querySelector(`[data-error-for="${field.id}"]`);
    field.toggleAttribute('aria-invalid', Boolean(message));
    if (error) error.textContent = message;
  }

  function validateCheckout() {
    const nameInput = document.getElementById('checkout-name');
    const cityInput = document.getElementById('checkout-city');
    const deliveryInput = document.getElementById('checkout-delivery');
    const noteInput = document.getElementById('checkout-note');
    const checks = [
      [nameInput, nameInput.value.trim() ? '' : 'Escribí tu nombre.'],
      [cityInput, cityInput.value.trim() ? '' : 'Indicá tu localidad o barrio.'],
      [deliveryInput, deliveryInput.value ? '' : 'Elegí cómo querés recibir el pedido.'],
      [addressInput, addressInput.required && !addressInput.value.trim() ? 'Escribí la dirección de entrega.' : '']
    ];
    checks.forEach(([field, message]) => fieldError(field, message));
    const firstInvalid = checks.find(([, message]) => message);
    const mode = config.commerce.deliveryModes.find((item) => item.id === deliveryInput.value);
    return {
      valid: !firstInvalid,
      firstInvalid: firstInvalid ? firstInvalid[0] : null,
      customer: {
        name: nameInput.value.trim(),
        city: cityInput.value.trim(),
        delivery: deliveryInput.value,
        deliveryLabel: mode ? mode.label : '',
        address: addressInput.value.trim(),
        note: noteInput.value.trim()
      }
    };
  }

  function submitOrder(event) {
    event.preventDefault();
    if (submitLocked) return;
    const validation = validateCheckout();
    const errorBox = checkoutDialog.querySelector('[data-checkout-error]');
    if (!validation.valid) {
      errorBox.hidden = false;
      errorBox.textContent = 'Revisá los campos marcados para continuar.';
      validation.firstInvalid.focus();
      return;
    }

    const totals = Core.calculateCart(state.cart, products, config.commerce);
    if (!totals.itemCount) {
      errorBox.hidden = false;
      errorBox.textContent = 'Tu ticket quedó vacío. Volvé a la tienda y sumá un producto.';
      return;
    }

    errorBox.hidden = true;
    const orderId = Core.createOrderId(config.store.name.slice(0, 3));
    const message = Core.buildWhatsAppMessage({
      cart: state.cart,
      products,
      totals,
      customer: validation.customer,
      attribution: state.attribution,
      config: {
        storeName: config.store.name,
        intro: config.checkout.intro,
        locale: config.locale.locale,
        currency: config.locale.currency
      },
      orderId
    });
    const whatsappUrl = Core.buildWhatsAppUrl(config.store.whatsapp, message);
    const eventId = Core.createOrderId('EVT');
    submitLocked = true;
    const submitButton = checkoutForm.querySelector('[data-submit-order]');
    submitButton.disabled = true;
    submitButton.textContent = 'Abriendo WhatsApp…';

    Analytics.track('Lead', {
      content_ids: totals.lines.map((line) => line.product.id),
      content_type: 'product',
      num_items: totals.itemCount,
      value: totals.subtotal,
      currency: config.locale.currency,
      order_id: orderId,
      source: 'whatsapp_checkout'
    }, { eventId });

    const opened = window.open(whatsappUrl, '_blank');
    if (opened) opened.opener = null;
    else window.location.assign(whatsappUrl);
    announce(`Pedido ${orderId} listo para enviar por WhatsApp.`);

    window.setTimeout(() => {
      submitLocked = false;
      submitButton.disabled = false;
      submitButton.textContent = 'Enviar mi pedido ↗';
    }, 800);
  }

  function trapFocus(container, event) {
    if (event.key !== 'Tab') return;
    const focusable = [...container.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      .filter((element) => !element.hidden && element.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function initializeCommerceEvents() {
    document.querySelectorAll('[data-open-cart]').forEach((button) => {
      button.addEventListener('click', () => openCart(button));
    });
    cartDrawer.querySelectorAll('[data-close-cart]').forEach((button) => {
      button.addEventListener('click', () => {
        closeCart();
        if (button.hasAttribute('data-scroll-shop')) document.getElementById('tienda').scrollIntoView({ behavior: 'smooth' });
      });
    });
    cartDrawer.querySelector('[data-cart-lines]').addEventListener('click', (event) => {
      const button = event.target.closest('button[data-line-key]');
      if (!button) return;
      const line = state.cart.find((item) => item.lineKey === button.dataset.lineKey);
      if (!line) return;
      if (button.hasAttribute('data-increase')) state.cart = Core.updateCartItem(state.cart, line.lineKey, line.quantity + 1);
      if (button.hasAttribute('data-decrease')) state.cart = Core.updateCartItem(state.cart, line.lineKey, line.quantity - 1);
      if (button.hasAttribute('data-remove')) state.cart = Core.removeCartItem(state.cart, line.lineKey);
      persistCart();
      renderCart();
      announce('Ticket actualizado.');
    });
    cartDrawer.querySelector('[data-open-checkout]').addEventListener('click', (event) => openCheckout(event.currentTarget));
    checkoutDialog.querySelector('[data-close-checkout]').addEventListener('click', closeCheckout);
    checkoutDialog.addEventListener('click', (event) => {
      if (event.target === checkoutDialog) closeCheckout();
    });
    document.getElementById('checkout-delivery').addEventListener('change', (event) => {
      setDeliveryAddressState();
      fieldError(event.target, '');
      checkoutDialog.querySelector('[data-checkout-error]').hidden = true;
    });
    checkoutForm.addEventListener('input', (event) => {
      const errorBox = checkoutDialog.querySelector('[data-checkout-error]');
      fieldError(event.target, '');
      errorBox.hidden = true;
    });
    checkoutForm.addEventListener('submit', submitOrder);
    window.addEventListener('storage', (event) => {
      if (event.key !== storageKey) return;
      try {
        state.cart = Core.normalizeCart(event.newValue ? JSON.parse(event.newValue) : [], products);
        renderCart();
      } catch (_error) {
        state.cart = [];
        renderCart();
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && cartDrawer.classList.contains('is-open')) closeCart();
      if (cartDrawer.classList.contains('is-open')) trapFocus(cartDrawer.querySelector('.cart-panel'), event);
    });
  }

  function initializeCatalogEvents() {
    productGrid.addEventListener('click', (event) => {
      const viewButton = event.target.closest('[data-view-product]');
      const addButton = event.target.closest('[data-quick-add]');
      if (viewButton) openProductDialog(viewButton.dataset.productId, viewButton);
      if (addButton) {
        const product = getProduct(addButton.dataset.productId);
        if (!product) return;
        if (product.variants.length) openProductDialog(product.id, addButton);
        else handleAddToCart(product.id);
      }
    });

    searchInput.addEventListener('input', () => {
      window.clearTimeout(searchTimer);
      state.query = searchInput.value.trim();
      renderCatalog();
      searchTimer = window.setTimeout(() => {
        if (state.query.length >= 2) {
          Analytics.track('Search', {
            search_string: state.query,
            result_count: Core.filterAndSort(products, state).length
          });
        }
      }, 350);
    });

    sortSelect.addEventListener('change', () => {
      state.sort = sortSelect.value;
      renderCatalog();
    });

    document.querySelectorAll('[data-category]').forEach((button) => {
      button.addEventListener('click', () => {
        state.category = button.dataset.category;
        updateFilterButtons();
        renderCatalog();
      });
    });

    document.querySelectorAll('[data-category-shortcut]').forEach((button) => {
      button.addEventListener('click', () => {
        state.category = button.dataset.categoryShortcut;
        updateFilterButtons();
        renderCatalog();
        document.getElementById('tienda').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    document.querySelectorAll('[data-clear-filters]').forEach((button) => button.addEventListener('click', clearFilters));
    document.querySelector('[data-close-product]').addEventListener('click', closeProductDialog);
    productDialog.addEventListener('click', (event) => {
      if (event.target === productDialog) closeProductDialog();
    });
    productDialog.querySelector('[data-variant-options]').addEventListener('change', (event) => {
      if (event.target.name !== 'product-variant') return;
      state.selectedVariantId = event.target.value;
      updateDialogState(getProduct(state.currentProductId));
    });
    productDialog.querySelector('[data-dialog-add]').addEventListener('click', () => {
      const quantity = Number(productDialog.querySelector('[data-dialog-quantity]').value) || 1;
      if (handleAddToCart(state.currentProductId, state.selectedVariantId, quantity)) closeProductDialog();
    });
    productDialog.querySelector('[data-dialog-image]').addEventListener('error', handleImageError);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && productDialog.hasAttribute('open')) closeProductDialog();
    });
  }

  Analytics.init(config.analytics);
  state.attribution = loadAttribution();
  state.cart = loadCart();
  Analytics.track('PageView', {
    page_title: document.title,
    page_type: 'storefront',
    utm_source: state.attribution.source,
    utm_campaign: state.attribution.campaign
  });
  initializeCatalogEvents();
  initializeCommerceEvents();
  renderCatalog();
  renderCart();

  window.StoreApp = { state, renderCatalog, openProductDialog, closeProductDialog, handleAddToCart };
})();
