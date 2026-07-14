'use strict';

window.STORE_CONFIG = {
  store: {
    slug: 'nido-market',
    name: 'NIDO Market',
    descriptor: 'Objetos simples para disfrutar más tu casa',
    url: 'https://ejemplo.optimind.com.ar',
    whatsapp: '5492616027055',
    instagram: '@nido.market',
    email: 'hola@nido.market',
    location: 'Mendoza, Argentina'
  },
  locale: {
    lang: 'es-AR',
    locale: 'es-AR',
    currency: 'ARS'
  },
  commerce: {
    minimumOrder: 0,
    freeShippingFrom: 90000,
    lowStockLabel: 'Últimas unidades',
    deliveryModes: [
      { id: 'shipping', label: 'Envío a domicilio', requiresAddress: true },
      { id: 'pickup', label: 'Retiro coordinado', requiresAddress: false }
    ]
  },
  checkout: {
    requiredFields: ['name', 'city', 'delivery'],
    intro: 'Hola NIDO, quiero hacer este pedido:',
    paymentProvider: 'disabled',
    fallbackContact: 'hola@nido.market'
  },
  analytics: {
    pixelId: '',
    debug: true,
    consentRequired: false
  },
  seo: {
    title: 'NIDO Market — objetos simples para disfrutar más tu casa',
    description: 'Objetos útiles, lindos y fáciles de elegir. Armá tu pedido online y coordiná la entrega por WhatsApp.',
    canonical: 'https://ejemplo.optimind.com.ar/',
    ogImage: 'assets/brand/og-nido.svg'
  },
  features: {
    search: true,
    filters: true,
    variants: true,
    testimonials: true,
    freeShippingBar: true
  }
};
