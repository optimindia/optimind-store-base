'use strict';

// Hidrata la marca y los datos de contacto en los documentos legales desde
// store.config.js. Así un cambio de cliente no requiere tocar el HTML legal.
(function () {
  var config = window.STORE_CONFIG;
  if (!config) return;
  var store = config.store;

  function setText(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) { el.textContent = value; });
  }

  setText('[data-brand-name]', store.shortName || store.name);
  setText('[data-store-name]', store.name);
  setText('[data-store-location]', store.location || '');
  setText('[data-store-copyright]', '© ' + new Date().getFullYear() + ' ' + store.name + ' · Tienda creada con OptiMind IA');

  document.querySelectorAll('[data-store-whatsapp]').forEach(function (el) {
    el.setAttribute('href', 'https://wa.me/' + store.whatsapp);
  });
  document.querySelectorAll('[data-store-email]').forEach(function (el) {
    el.setAttribute('href', 'mailto:' + store.email);
    if (el.getAttribute('data-store-email-text') !== 'false') el.textContent = store.email;
  });

  // El <title> del HTML lleva el nombre demo como fallback; acá se reemplaza
  // por el nombre real del comercio.
  document.title = document.title.replace('Tienda Demo', store.name);
})();