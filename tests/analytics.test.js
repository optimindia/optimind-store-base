'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const Analytics = require('../analytics.js');

function createEnvironment() {
  const appended = [];
  const calls = [];
  const root = {
    fbq(...args) { calls.push(args); }
  };
  const document = {
    querySelector() { return null; },
    createElement() { return {}; },
    head: { appendChild(node) { appended.push(node); } }
  };
  return { root, document, appended, calls };
}

test('no carga Meta cuando falta el Pixel ID', () => {
  const env = createEnvironment();
  Analytics.init({ pixelId: '', debug: true }, env);

  assert.equal(env.appended.length, 0);
});

test('cada evento recibe ID y elimina datos personales del payload', () => {
  const env = createEnvironment();
  Analytics.init({ pixelId: '', debug: true }, env);
  const result = Analytics.track('Lead', {
    content_ids: ['lamp-nube'],
    content_name: 'Lámpara Nube',
    value: 42900,
    name: 'Martina',
    address: 'San Martín 123',
    note: 'Tocar timbre',
    phone: '2615555555'
  });

  assert.match(result.eventId, /^EVT-[A-Z0-9]{10}$/);
  assert.deepEqual(result.payload, {
    content_ids: ['lamp-nube'],
    content_name: 'Lámpara Nube',
    value: 42900
  });
});

test('ignora el mismo evento cuando nombre e ID están duplicados', () => {
  const env = createEnvironment();
  Analytics.init({ pixelId: '', debug: true }, env);

  const first = Analytics.track('Lead', { value: 100 }, { eventId: 'EVT-FIJO12345' });
  const second = Analytics.track('Lead', { value: 100 }, { eventId: 'EVT-FIJO12345' });

  assert.equal(first.duplicate, false);
  assert.equal(second.duplicate, true);
  assert.equal(Analytics.getDebugEvents().length, 1);
});

test('el historial de debug devuelve copias y puede limpiarse', () => {
  const env = createEnvironment();
  Analytics.init({ pixelId: '', debug: true }, env);
  Analytics.track('ViewContent', { content_ids: ['lamp-nube'] }, { eventId: 'EVT-COPY12345' });

  const events = Analytics.getDebugEvents();
  events[0].payload.content_ids.push('mutado');

  assert.deepEqual(Analytics.getDebugEvents()[0].payload.content_ids, ['lamp-nube']);
  Analytics.clearDebugEvents();
  assert.equal(Analytics.getDebugEvents().length, 0);
});

test('envía a fbq solo con Pixel configurado', () => {
  const env = createEnvironment();
  Analytics.init({ pixelId: '1234567890', debug: true }, env);
  const result = Analytics.track('AddToCart', { value: 42900, currency: 'ARS' }, { eventId: 'EVT-META123456' });

  assert.equal(env.appended.length, 1);
  assert.deepEqual(env.calls[0], ['init', '1234567890']);
  assert.deepEqual(env.calls[1], ['track', 'AddToCart', { value: 42900, currency: 'ARS' }, { eventID: 'EVT-META123456' }]);
  assert.equal(result.sent, true);
});
