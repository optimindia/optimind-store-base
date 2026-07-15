'use strict';

window.STORE_CONFIG = {
  "store": {
    "slug": "fashion",
    "name": "Moda Lucía",
    "shortName": "Lucía",
    "descriptor": "Indumentaria femenina pensada para el día a día",
    "url": "https://moda-lucia.optimindia.site",
    "whatsapp": "5492616123456",
    "instagram": "@moda.lucia",
    "email": "hola@modalucia.com",
    "location": "Mendoza, Argentina"
  },
  "locale": {
    "lang": "es-AR",
    "locale": "es-AR",
    "currency": "ARS"
  },
  "commerce": {
    "minimumOrder": 0,
    "freeShippingFrom": 85000,
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
      "id": "remeras",
      "label": "Remeras",
      "icon": "◒"
    },
    {
      "id": "vestidos",
      "label": "Vestidos",
      "icon": "◇"
    },
    {
      "id": "abrigos",
      "label": "Abrigos",
      "icon": "○"
    }
  ],
  "checkout": {
    "requiredFields": [
      "name",
      "city",
      "delivery"
    ],
    "intro": "Hola Lucía, quiero hacer este pedido:",
    "paymentProvider": "disabled",
    "fallbackContact": "hola@modalucia.com"
  },
  "legal": {
    "responsibleName": "Moda Lucía",
    "email": "hola@modalucia.com",
    "city": "Mendoza, Argentina",
    "country": "AR"
  },
  "analytics": {
    "pixelId": "",
    "debug": true,
    "consentRequired": false
  },
  "seo": {
    "title": "Moda Lucía — indumentaria femenina",
    "description": "Elegí tu próxima prenda y coordiná la entrega por WhatsApp.",
    "canonical": "https://moda-lucia.optimindia.site/",
    "ogTitle": "Moda Lucía",
    "ogDescription": "Armá tu pedido online y coordiná la entrega por WhatsApp.",
    "ogImage": "assets/brand/og.svg",
    "themeColor": "#F6F4F1"
  },
  "features": {
    "search": true,
    "filters": true,
    "variants": true,
    "testimonials": false,
    "freeShippingBar": true
  }
};
