'use strict';

(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.StoreAnalytics = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const SENSITIVE_KEYS = new Set(['name', 'address', 'note', 'phone', 'email', 'customer', 'city']);
  let settings = { pixelId: '', debug: false };
  let environment = { root: typeof globalThis !== 'undefined' ? globalThis : {}, document: null };
  let debugEvents = [];
  let seenEvents = new Set();

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function sanitize(value) {
    if (Array.isArray(value)) return value.map(sanitize);
    if (!value || typeof value !== 'object') return value;
    return Object.entries(value).reduce((safe, [key, entry]) => {
      if (!SENSITIVE_KEYS.has(key.toLowerCase())) safe[key] = sanitize(entry);
      return safe;
    }, {});
  }

  function createEventId() {
    const token = `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`
      .replace(/[^a-z0-9]/gi, '')
      .slice(-10)
      .padStart(10, '0')
      .toUpperCase();
    return `EVT-${token}`;
  }

  function ensureMetaPixel() {
    if (!settings.pixelId) return;
    const envRoot = environment.root;
    const document = environment.document;
    if (!document || !document.head || typeof document.createElement !== 'function') return;

    if (typeof envRoot.fbq !== 'function') {
      const queue = function () {
        if (queue.callMethod) queue.callMethod.apply(queue, arguments);
        else queue.queue.push(arguments);
      };
      queue.push = queue;
      queue.loaded = true;
      queue.version = '2.0';
      queue.queue = [];
      envRoot.fbq = queue;
    }

    if (!document.querySelector || !document.querySelector('script[data-meta-pixel]')) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      script.dataset = script.dataset || {};
      script.dataset.metaPixel = 'true';
      document.head.appendChild(script);
    }
    envRoot.fbq('init', settings.pixelId);
  }

  function init(config = {}, env = {}) {
    settings = {
      pixelId: String(config.pixelId || '').trim(),
      debug: Boolean(config.debug)
    };
    environment = {
      root: env.root || (typeof window !== 'undefined' ? window : globalThis),
      document: env.document || (typeof document !== 'undefined' ? document : null)
    };
    debugEvents = [];
    seenEvents = new Set();
    ensureMetaPixel();
    return api;
  }

  function track(name, payload = {}, options = {}) {
    const eventName = String(name || '').trim();
    if (!eventName) throw new Error('El evento necesita un nombre');
    const eventId = String(options.eventId || createEventId());
    const dedupeKey = `${eventName}:${eventId}`;
    const cleanPayload = sanitize(payload);
    if (seenEvents.has(dedupeKey)) {
      return { eventId, payload: cleanPayload, sent: false, duplicate: true };
    }
    seenEvents.add(dedupeKey);

    const record = {
      name: eventName,
      eventId,
      payload: clone(cleanPayload),
      timestamp: new Date().toISOString()
    };
    if (settings.debug) debugEvents.push(record);

    let sent = false;
    try {
      if (settings.pixelId && typeof environment.root.fbq === 'function') {
        environment.root.fbq('track', eventName, cleanPayload, { eventID: eventId });
        sent = true;
      }
    } catch (error) {
      if (settings.debug && typeof console !== 'undefined') console.warn('[StoreAnalytics] Meta no disponible', error);
    }
    return { eventId, payload: cleanPayload, sent, duplicate: false };
  }

  function getDebugEvents() {
    return clone(debugEvents);
  }

  function clearDebugEvents() {
    debugEvents = [];
  }

  const api = { init, track, getDebugEvents, clearDebugEvents };
  return api;
});
