'use strict';

// Configuración de la tienda. Este archivo + products.js + assets/ son lo único
// que se edita para crear una tienda nueva. El motor (store-core.js, analytics.js,
// app.js) no se toca. La piel visual (index.html, styles.css) se rehace por cliente
// siguiendo el sistema de diseño OptiMind.

window.STORE_CONFIG = {
  store: {
    slug: 'tienda-demo',
    name: 'Tienda Demo',
    shortName: 'Demo',
    descriptor: 'Tienda de demostración del motor OptiMind',
    url: 'https://tienda-demo.optimind.com.ar',
    whatsapp: '5491100000000',
    instagram: '@tienda.demo',
    email: 'hola@tienda-demo.com',
    location: 'Argentina'
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
  // Categorías del catálogo. El storefront renderiza los filtros a partir de acá;
  // si agregás o sacás categorías, los chips y el atajo se actualizan solos.
  categories: [
    { id: 'hogar', label: 'Hogar', icon: '⌂' },
    { id: 'cocina', label: 'Cocina', icon: '◒' },
    { id: 'tecnologia', label: 'Tecnología', icon: '⌁' },
    { id: 'bienestar', label: 'Bienestar', icon: '○' }
  ],
  checkout: {
    requiredFields: ['name', 'city', 'delivery'],
    intro: 'Hola, quiero hacer este pedido:',
    paymentProvider: 'disabled',
    fallbackContact: 'hola@tienda-demo.com'
  },
  // Datos del responsable para los documentos legales. Los legales se hidratan
  // desde acá (legal.js), así que un cambio de cliente no requiere tocar el HTML.
  legal: {
    responsibleName: 'Tienda Demo',
    email: 'hola@tienda-demo.com',
    city: 'Argentina',
    country: 'AR'
  },
  analytics: {
    pixelId: '',
    debug: true,
    consentRequired: false
  },
  seo: {
    title: 'Tienda Demo — motor de tiendas OptiMind',
    description: 'Tienda de demostración. Armá tu pedido online y coordiná la entrega por WhatsApp.',
    canonical: 'https://tienda-demo.optimind.com.ar/',
    ogTitle: 'Tienda Demo',
    ogDescription: 'Armá tu pedido online y coordiná la entrega por WhatsApp.',
    ogImage: 'assets/brand/og.svg',
    themeColor: '#F2F5EA'
  },
  features: {
    search: true,
    filters: true,
    variants: true,
    testimonials: false,
    freeShippingBar: true
  }
};