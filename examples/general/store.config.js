'use strict';

window.STORE_CONFIG = {
  "store": {
    "slug": "general",
    "name": "Todo en Casa",
    "shortName": "Todo en Casa",
    "descriptor": "Objetos útiles para el día a día, sin salir de tu barrio",
    "url": "https://todoencasa.optimindia.site",
    "whatsapp": "5492616123457",
    "instagram": "@todoencasa.ar",
    "email": "hola@todoencasa.ar",
    "location": "Buenos Aires, Argentina"
  },
  "locale": {
    "lang": "es-AR",
    "locale": "es-AR",
    "currency": "ARS"
  },
  "commerce": {
    "minimumOrder": 0,
    "freeShippingFrom": 90000,
    "lowStockLabel": "Últimas unidades",
    "deliveryModes": [
      {
        "id": "shipping",
        "label": "Envío a domicilio",
        "requiresAddress": true
      },
      {
        "id": "pickup",
        "label": "Retiro en el local",
        "requiresAddress": false
      }
    ]
  },
  "categories": [
    {
      "id": "hogar",
      "label": "Hogar",
      "icon": "⌂"
    },
    {
      "id": "cocina",
      "label": "Cocina",
      "icon": "◈"
    },
    {
      "id": "escritorio",
      "label": "Escritorio",
      "icon": "▭"
    }
  ],
  "checkout": {
    "requiredFields": [
      "name",
      "city",
      "delivery"
    ],
    "intro": "Hola Todo en Casa, quiero hacer este pedido:",
    "paymentProvider": "disabled",
    "fallbackContact": "hola@todoencasa.ar"
  },
  "legal": {
    "responsibleName": "Todo en Casa",
    "email": "hola@todoencasa.ar",
    "city": "Buenos Aires, Argentina",
    "country": "AR"
  },
  "analytics": {
    "pixelId": "",
    "debug": true,
    "consentRequired": false
  },
  "seo": {
    "title": "Todo en Casa — objetos útiles para el día a día",
    "description": "Encontrá lo que necesitás y coordiná la entrega por WhatsApp.",
    "canonical": "https://todoencasa.optimindia.site/",
    "ogTitle": "Todo en Casa",
    "ogDescription": "Armá tu pedido online y coordiná la entrega por WhatsApp.",
    "ogImage": "assets/brand/og.svg",
    "themeColor": "#F5F3EF"
  },
  "features": {
    "search": true,
    "filters": true,
    "variants": true,
    "testimonials": false,
    "freeShippingBar": true
  }
};
