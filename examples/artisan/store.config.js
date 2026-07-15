'use strict';

window.STORE_CONFIG = {
  "store": {
    "slug": "artisan",
    "name": "Raíces del Norte",
    "shortName": "Raíces",
    "descriptor": "Artesanías textiles, cerámicas y de madera del norte argentino",
    "url": "https://optimind-store-base.pages.dev/raices-del-norte/",
    "whatsapp": "5492616027055",
    "instagram": "@raicesdelnorte.norte",
    "email": "hola@raicesdelnorte.com",
    "location": "Salta, Argentina"
  },
  "locale": {
    "lang": "es-AR",
    "locale": "es-AR",
    "currency": "ARS"
  },
  "commerce": {
    "minimumOrder": 0,
    "freeShippingFrom": 70000,
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
      "id": "textiles",
      "label": "Textiles",
      "icon": "▣"
    },
    {
      "id": "ceramica",
      "label": "Cerámica",
      "icon": "◉"
    },
    {
      "id": "madera",
      "label": "Madera",
      "icon": "▦"
    }
  ],
  "checkout": {
    "requiredFields": [
      "name",
      "city",
      "delivery"
    ],
    "intro": "Hola Raíces del Norte, quiero hacer este pedido:",
    "paymentProvider": "disabled",
    "fallbackContact": "hola@raicesdelnorte.com"
  },
  "legal": {
    "responsibleName": "Raíces del Norte",
    "email": "hola@raicesdelnorte.com",
    "city": "Jujuy, Argentina",
    "country": "AR"
  },
  "analytics": {
    "pixelId": "",
    "debug": true,
    "consentRequired": false
  },
  "seo": {
    "title": "Raíces del Norte — artesanías de Jujuy",
    "description": "Elegí artesanías hechas a mano y coordiná la entrega por WhatsApp.",
    "canonical": "https://optimind-store-base.pages.dev/raices-del-norte/",
    "ogTitle": "Raíces del Norte",
    "ogDescription": "Armá tu pedido online y coordiná la entrega por WhatsApp.",
    "ogImage": "assets/brand/og.svg",
    "themeColor": "#F7F3EB"
  },
  "features": {
    "search": true,
    "filters": true,
    "variants": true,
    "testimonials": false,
    "freeShippingBar": true
  }
};
