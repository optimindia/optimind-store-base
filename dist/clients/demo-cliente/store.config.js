'use strict';

window.STORE_CONFIG = {
  "store": {
    "slug": "demo-cliente",
    "name": "Tienda Demo",
    "shortName": "Demo",
    "descriptor": "Tienda de demostración del motor OptiMind",
    "url": "https://tienda-demo.optimind.com.ar",
    "whatsapp": "5491100000000",
    "instagram": "@tienda.demo",
    "email": "hola@tienda-demo.com",
    "location": "Argentina"
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
        "label": "Retiro coordinado",
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
      "icon": "◒"
    },
    {
      "id": "tecnologia",
      "label": "Tecnología",
      "icon": "⌁"
    },
    {
      "id": "bienestar",
      "label": "Bienestar",
      "icon": "○"
    }
  ],
  "checkout": {
    "requiredFields": [
      "name",
      "city",
      "delivery"
    ],
    "intro": "Hola Demo, quiero hacer este pedido:",
    "paymentProvider": "disabled",
    "fallbackContact": "hola@tienda-demo.com"
  },
  "legal": {
    "responsibleName": "Tienda Demo",
    "email": "hola@tienda-demo.com",
    "city": "Argentina",
    "country": "AR"
  },
  "analytics": {
    "pixelId": "",
    "debug": true,
    "consentRequired": false
  },
  "seo": {
    "title": "Tienda Demo — motor de tiendas OptiMind",
    "description": "Tienda de demostración. Armá tu pedido online y coordiná la entrega por WhatsApp.",
    "canonical": "https://tienda-demo.optimind.com.ar/",
    "ogTitle": "Tienda Demo",
    "ogDescription": "Armá tu pedido online y coordiná la entrega por WhatsApp.",
    "ogImage": "assets/brand/og.svg",
    "themeColor": "#F2F5EA"
  },
  "features": {
    "search": true,
    "filters": true,
    "variants": true,
    "testimonials": false,
    "freeShippingBar": true
  }
};
