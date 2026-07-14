'use strict';

window.STORE_PRODUCTS = [
  {
    id: 'lamp-nube',
    slug: 'lampara-nube',
    name: 'Lámpara Nube',
    shortDescription: 'Luz cálida, tres intensidades y una silueta que calma.',
    description: 'Una lámpara de mesa compacta para leer, bajar el ritmo o encender una esquina sin invadirla. Se controla con un toque y carga por USB-C.',
    category: 'hogar',
    tags: ['luz', 'mesa', 'dormitorio', 'regalo'],
    price: 42900,
    compareAtPrice: 48900,
    image: 'assets/products/lamp-nube.svg',
    alt: 'Lámpara Nube de mesa con pantalla redondeada',
    featured: true,
    adLanding: true,
    stockStatus: 'low_stock',
    variants: [
      { id: 'arena', label: 'Arena', priceDelta: 0, stockStatus: 'in_stock' },
      { id: 'azul', label: 'Azul bruma', priceDelta: 0, stockStatus: 'low_stock' }
    ]
  },
  {
    id: 'organizer-loop',
    slug: 'organizador-loop',
    name: 'Organizador Loop',
    shortDescription: 'Todo lo chico encuentra lugar sin esconderse.',
    description: 'Bandejas modulares para escritorio, recibidor o mesa de luz. Usalas juntas o separadas y cambiá la composición cuando cambie tu rutina.',
    category: 'hogar',
    tags: ['orden', 'escritorio', 'llaves'],
    price: 28900,
    image: 'assets/products/organizer-loop.svg',
    alt: 'Organizador Loop modular de tres bandejas',
    featured: true,
    stockStatus: 'in_stock',
    variants: [
      { id: 'verde', label: 'Verde pino', priceDelta: 0, stockStatus: 'in_stock' },
      { id: 'coral', label: 'Coral', priceDelta: 0, stockStatus: 'in_stock' }
    ]
  },
  {
    id: 'mug-calma',
    slug: 'taza-calma',
    name: 'Taza Calma',
    shortDescription: 'Cerámica gruesa y asa amplia para el café sin apuro.',
    description: 'Hecha para acompañar todos los días: estable, cómoda y con 380 ml de capacidad. Apta para microondas y lavavajillas.',
    category: 'cocina',
    tags: ['taza', 'café', 'cerámica'],
    price: 15900,
    compareAtPrice: 17900,
    image: 'assets/products/mug-calma.svg',
    alt: 'Taza Calma de cerámica con asa amplia',
    featured: false,
    stockStatus: 'in_stock',
    variants: [
      { id: 'lima', label: 'Lima suave', priceDelta: 0, stockStatus: 'in_stock' },
      { id: 'blanco', label: 'Blanco tiza', priceDelta: 0, stockStatus: 'in_stock' }
    ]
  },
  {
    id: 'speaker-mini',
    slug: 'parlante-mini',
    name: 'Parlante Mini',
    shortDescription: 'Sonido claro para moverlo de un ambiente a otro.',
    description: 'Parlante Bluetooth de tamaño pequeño, doce horas de batería y cuerpo resistente a salpicaduras. Incluye correa textil.',
    category: 'tecnologia',
    tags: ['audio', 'bluetooth', 'música'],
    price: 54900,
    image: 'assets/products/speaker-mini.svg',
    alt: 'Parlante Mini portátil de color azul',
    featured: true,
    stockStatus: 'in_stock',
    variants: [
      { id: 'azul', label: 'Azul etiqueta', priceDelta: 0, stockStatus: 'in_stock' },
      { id: 'tinta', label: 'Tinta', priceDelta: 3000, stockStatus: 'in_stock' }
    ]
  },
  {
    id: 'blanket-norte',
    slug: 'manta-norte',
    name: 'Manta Norte',
    shortDescription: 'Textura liviana para sillón, cama o picnic.',
    description: 'Tejido suave de algodón reciclado con terminación de flecos cortos. Abriga sin pesar y suma color sin dominar el ambiente.',
    category: 'hogar',
    tags: ['textil', 'sillón', 'dormitorio'],
    price: 46900,
    compareAtPrice: 52900,
    image: 'assets/products/blanket-norte.svg',
    alt: 'Manta Norte plegada con trama geométrica',
    featured: false,
    stockStatus: 'low_stock',
    variants: [
      { id: 'cobalto', label: 'Cobalto', priceDelta: 0, stockStatus: 'low_stock' },
      { id: 'coral', label: 'Coral', priceDelta: 0, stockStatus: 'in_stock' }
    ]
  },
  {
    id: 'bottle-onda',
    slug: 'botella-onda',
    name: 'Botella Onda',
    shortDescription: 'Agua fresca, tapa segura y agarre cómodo.',
    description: 'Botella térmica de acero de 650 ml. Conserva la temperatura, no transpira y entra en el portavasos del auto.',
    category: 'bienestar',
    tags: ['agua', 'térmica', 'movimiento'],
    price: 21900,
    image: 'assets/products/bottle-onda.svg',
    alt: 'Botella Onda térmica de acero color coral',
    featured: false,
    stockStatus: 'in_stock',
    variants: [
      { id: 'coral', label: 'Coral', priceDelta: 0, stockStatus: 'in_stock' },
      { id: 'verde', label: 'Verde hoja', priceDelta: 0, stockStatus: 'out_of_stock' }
    ]
  },
  {
    id: 'clock-pausa',
    slug: 'reloj-pausa',
    name: 'Reloj Pausa',
    shortDescription: 'La hora a la vista, el ruido fuera de escena.',
    description: 'Reloj de pared silencioso con números amplios y marco liviano. Funciona con una pila AA y no emite tic-tac.',
    category: 'hogar',
    tags: ['reloj', 'pared', 'silencioso'],
    price: 35900,
    image: 'assets/products/clock-pausa.svg',
    alt: 'Reloj Pausa de pared con marco verde',
    featured: false,
    stockStatus: 'in_stock',
    variants: []
  },
  {
    id: 'tray-orbita',
    slug: 'bandeja-orbita',
    name: 'Bandeja Órbita',
    shortDescription: 'Una base liviana para servir, ordenar o exhibir.',
    description: 'Bandeja circular de madera laminada con borde alto. Resiste el uso diario y se limpia con un paño húmedo.',
    category: 'cocina',
    tags: ['bandeja', 'servir', 'mesa'],
    price: 25900,
    image: 'assets/products/tray-orbita.svg',
    alt: 'Bandeja Órbita circular con borde coral',
    featured: false,
    stockStatus: 'out_of_stock',
    variants: []
  }
];
