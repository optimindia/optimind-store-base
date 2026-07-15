'use strict';

// Catálogo de productos de demostración. Cada tienda nueva reemplaza este
// archivo con sus productos reales. La estructura la valida store-core.js
// (normalizeProducts) y la cubre tests/config.test.js.

window.STORE_PRODUCTS = [
  {
    id: 'lamp',
    slug: 'lampara-de-mesa',
    name: 'Lámpara de mesa',
    shortDescription: 'Luz cálida, tres intensidades y una silueta discreta.',
    description: 'Lámpara de mesa compacta para leer o bajar el ritmo. Se controla con un toque y carga por USB-C.',
    category: 'hogar',
    tags: ['luz', 'mesa', 'dormitorio'],
    price: 42900,
    compareAtPrice: 48900,
    image: 'assets/products/lamp.svg',
    alt: 'Lámpara de mesa con pantalla redondeada',
    featured: true,
    adLanding: true,
    stockStatus: 'low_stock',
    variants: [
      { id: 'arena', label: 'Arena', priceDelta: 0, stockStatus: 'in_stock' },
      { id: 'azul', label: 'Azul bruma', priceDelta: 0, stockStatus: 'low_stock' }
    ]
  },
  {
    id: 'organizer',
    slug: 'organizador-modular',
    name: 'Organizador modular',
    shortDescription: 'Todo lo chico encuentra lugar sin esconderse.',
    description: 'Bandejas modulares para escritorio, recibidor o mesa de luz. Usalas juntas o separadas y cambiá la composición cuando cambie tu rutina.',
    category: 'hogar',
    tags: ['orden', 'escritorio', 'llaves'],
    price: 28900,
    image: 'assets/products/organizer.svg',
    alt: 'Organizador modular de tres bandejas',
    featured: true,
    stockStatus: 'in_stock',
    variants: [
      { id: 'verde', label: 'Verde pino', priceDelta: 0, stockStatus: 'in_stock' },
      { id: 'coral', label: 'Coral', priceDelta: 0, stockStatus: 'in_stock' }
    ]
  },
  {
    id: 'mug',
    slug: 'taza-de-ceramica',
    name: 'Taza de cerámica',
    shortDescription: 'Cerámica gruesa y asa amplia para el café sin apuro.',
    description: 'Hecha para acompañar todos los días: estable, cómoda y con 380 ml de capacidad. Apta para microondas y lavavajillas.',
    category: 'cocina',
    tags: ['taza', 'café', 'cerámica'],
    price: 15900,
    compareAtPrice: 17900,
    image: 'assets/products/mug.svg',
    alt: 'Taza de cerámica con asa amplia',
    featured: false,
    stockStatus: 'in_stock',
    variants: [
      { id: 'lima', label: 'Lima suave', priceDelta: 0, stockStatus: 'in_stock' },
      { id: 'blanco', label: 'Blanco tiza', priceDelta: 0, stockStatus: 'in_stock' }
    ]
  },
  {
    id: 'speaker',
    slug: 'parlante-portatil',
    name: 'Parlante portátil',
    shortDescription: 'Sonido claro para moverlo de un ambiente a otro.',
    description: 'Parlante Bluetooth de tamaño pequeño, doce horas de batería y cuerpo resistente a salpicaduras. Incluye correa textil.',
    category: 'tecnologia',
    tags: ['audio', 'bluetooth', 'música'],
    price: 54900,
    image: 'assets/products/speaker.svg',
    alt: 'Parlante portátil de color azul',
    featured: true,
    stockStatus: 'in_stock',
    variants: [
      { id: 'azul', label: 'Azul etiqueta', priceDelta: 0, stockStatus: 'in_stock' },
      { id: 'tinta', label: 'Tinta', priceDelta: 3000, stockStatus: 'in_stock' }
    ]
  },
  {
    id: 'blanket',
    slug: 'manta-liviana',
    name: 'Manta liviana',
    shortDescription: 'Textura suave para sillón, cama o picnic.',
    description: 'Tejido suave de algodón reciclado con terminación de flecos cortos. Abriga sin pesar y suma color sin dominar el ambiente.',
    category: 'hogar',
    tags: ['textil', 'sillón', 'dormitorio'],
    price: 46900,
    compareAtPrice: 52900,
    image: 'assets/products/blanket.svg',
    alt: 'Manta liviana plegada con trama geométrica',
    featured: false,
    stockStatus: 'low_stock',
    variants: [
      { id: 'cobalto', label: 'Cobalto', priceDelta: 0, stockStatus: 'low_stock' },
      { id: 'coral', label: 'Coral', priceDelta: 0, stockStatus: 'in_stock' }
    ]
  },
  {
    id: 'bottle',
    slug: 'botella-termica',
    name: 'Botella térmica',
    shortDescription: 'Agua fresca, tapa segura y agarre cómodo.',
    description: 'Botella térmica de acero de 650 ml. Conserva la temperatura, no transpira y entra en el portavasos del auto.',
    category: 'bienestar',
    tags: ['agua', 'térmica', 'movimiento'],
    price: 21900,
    image: 'assets/products/bottle.svg',
    alt: 'Botella térmica de acero color coral',
    featured: false,
    stockStatus: 'in_stock',
    variants: [
      { id: 'coral', label: 'Coral', priceDelta: 0, stockStatus: 'in_stock' },
      { id: 'verde', label: 'Verde hoja', priceDelta: 0, stockStatus: 'out_of_stock' }
    ]
  },
  {
    id: 'clock',
    slug: 'reloj-de-pared',
    name: 'Reloj de pared',
    shortDescription: 'La hora a la vista, el ruido fuera de escena.',
    description: 'Reloj de pared silencioso con números amplios y marco liviano. Funciona con una pila AA y no emite tic-tac.',
    category: 'hogar',
    tags: ['reloj', 'pared', 'silencioso'],
    price: 35900,
    image: 'assets/products/clock.svg',
    alt: 'Reloj de pared con marco verde',
    featured: false,
    stockStatus: 'in_stock',
    variants: []
  },
  {
    id: 'tray',
    slug: 'bandeja-circular',
    name: 'Bandeja circular',
    shortDescription: 'Una base liviana para servir, ordenar o exhibir.',
    description: 'Bandeja circular de madera laminada con borde alto. Resiste el uso diario y se limpia con un paño húmedo.',
    category: 'cocina',
    tags: ['bandeja', 'servir', 'mesa'],
    price: 25900,
    image: 'assets/products/tray.svg',
    alt: 'Bandeja circular con borde coral',
    featured: false,
    stockStatus: 'out_of_stock',
    variants: []
  }
];