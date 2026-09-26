// The menu, as the owners wrote it. This file is the source of truth — not the
// printed menu photos — so a price change is a one-line edit here.
//
// Dish names (`name`) stay in Spanish in both languages; only the descriptions
// switch. `menuName` is the English name printed on the menu, shown in small
// italics in English mode only.

export type Lang = 'en' | 'es'
export type Localised = { en: string; es: string }

export type CategoryId =
  | 'breakfast'
  | 'baleadas'
  | 'plates'
  | 'tacos'
  | 'pupusas'
  | 'soups'
  | 'drinks'

export type DrinkGroup = 'frescos' | 'sodas' | 'energy' | 'more' | 'hot'

export interface Price {
  amount: number
  label?: Localised
}

export interface MenuItem {
  id: string
  category: CategoryId
  /** Spanish name — the title in both languages. */
  name: string
  /** English name from the printed menu. */
  menuName: string
  prices: Price[]
  en: string
  es: string
  /** Weekdays the dish is served, 0 = Sunday. Absent means every day. */
  days?: number[]
  /** Path under /public, e.g. "photos/baleada-regular.jpg". Empty shows the star placeholder. */
  photo?: string
  featured?: boolean
  /** Mix-and-match fillings (pupusas). */
  fillings?: { name: string; en: string; es: string }[]
  /** Drinks only: which group of the compact list it belongs to. */
  group?: DrinkGroup
}

export const CATEGORIES: { id: CategoryId; en: string; es: string }[] = [
  { id: 'breakfast', en: 'Breakfast', es: 'Desayunos' },
  { id: 'baleadas', en: 'Baleadas', es: 'Baleadas' },
  { id: 'plates', en: 'Plates', es: 'Platos fuertes' },
  { id: 'tacos', en: 'Tacos & Antojitos', es: 'Tacos y antojitos' },
  { id: 'pupusas', en: 'Pupusas', es: 'Pupusas' },
  { id: 'soups', en: 'Soups', es: 'Sopas' },
  { id: 'drinks', en: 'Drinks', es: 'Bebidas' },
]

export const DRINK_GROUPS: { id: DrinkGroup; en: string; es: string }[] = [
  { id: 'frescos', en: 'Natural juices', es: 'Frescos naturales' },
  { id: 'sodas', en: 'Sodas', es: 'Refrescos' },
  { id: 'energy', en: 'Energy & sports drinks', es: 'Bebidas energéticas' },
  { id: 'more', en: 'More drinks', es: 'Otras bebidas' },
  { id: 'hot', en: 'Hot drinks', es: 'Bebidas calientes' },
]

const small = { en: 'Small', es: 'Pequeña' }
const large = { en: 'Large', es: 'Grande' }
const smallCup = { en: 'Small', es: 'Pequeño' }
const largeCup = { en: 'Large', es: 'Grande' }

const drink = (
  id: string,
  group: DrinkGroup,
  name: string,
  menuName: string,
  prices: Price[],
  en = '',
  es = '',
): MenuItem => ({ id, category: 'drinks', group, name, menuName, prices, en, es })

export const MENU: MenuItem[] = [
  // ── Desayunos · Breakfast ───────────────────────────────────────────────
  {
    id: 'desayuno-tipico',
    category: 'breakfast',
    name: 'Desayuno Típico',
    menuName: 'Typical Breakfast',
    prices: [{ amount: 24 }],
    en: 'The classic Honduran breakfast: eggs, refried beans, fried sweet plantain, sausage, meat, rice, fresh cheese and Honduran cream.',
    es: 'El desayuno hondureño de siempre: huevo, frijoles fritos, plátano frito, chorizo, carne, arroz, queso fresco y mantequilla.',
    featured: true,
  },

  // ── Baleadas ────────────────────────────────────────────────────────────
  {
    id: 'baleada-sencilla',
    category: 'baleadas',
    name: 'Baleada Sencilla',
    menuName: 'Simple',
    prices: [{ amount: 5 }],
    en: 'A thick, soft flour tortilla folded over refried beans, crumbled cheese and cream.',
    es: 'Tortilla de harina gruesa y suave con frijoles fritos, queso rallado y mantequilla.',
  },
  {
    id: 'baleada-regular',
    category: 'baleadas',
    name: 'Baleada Regular',
    menuName: 'Regular',
    prices: [{ amount: 6 }],
    en: 'The favourite: beans, cheese and cream with scrambled egg.',
    es: 'La favorita: frijoles, queso y mantequilla con huevo revuelto.',
    featured: true,
  },
  {
    id: 'baleada-con-carne',
    category: 'baleadas',
    name: 'Baleada con Carne',
    menuName: 'Meat',
    prices: [{ amount: 8 }],
    en: 'A full baleada (beans, cheese and cream) with grilled meat folded inside.',
    es: 'Baleada completa con frijoles, queso, mantequilla y carne asada.',
  },

  // ── Platos fuertes · Plates ─────────────────────────────────────────────
  {
    id: 'pechuga-a-la-plancha',
    category: 'plates',
    name: 'Pechuga a la Plancha',
    menuName: 'Grilled Chicken Breast',
    prices: [{ amount: 20 }],
    en: 'Grilled chicken breast served with rice, salad and fried plantain.',
    es: 'Pechuga de pollo a la plancha con arroz, ensalada y plátano frito.',
  },
  {
    id: 'pechuga-con-tajadas',
    category: 'plates',
    name: 'Pechuga con Tajadas',
    menuName: 'Grilled Chicken Breast with Fried Plantains',
    prices: [{ amount: 20 }],
    en: 'Grilled chicken breast over crispy green-plantain chips, topped with cabbage slaw and sauce.',
    es: 'Pechuga a la plancha sobre tajadas de plátano verde, con repollo y salsa.',
  },
  {
    id: 'pollo-con-tajadas',
    category: 'plates',
    name: 'Pollo con Tajadas',
    menuName: 'Chicken with Fried Plantains',
    prices: [{ amount: 20 }],
    en: 'A Honduran street-food classic: fried chicken piled on crispy plantain chips with cabbage slaw, pickled onion and sauce.',
    es: 'Un clásico catracho: pollo frito sobre tajadas con repollo, cebolla encurtida y salsa.',
    featured: true,
  },
  {
    id: 'bistec-con-huevo',
    category: 'plates',
    name: 'Bistec con Huevo',
    menuName: 'Steak with Egg',
    prices: [{ amount: 24 }],
    en: 'Pan-seared steak topped with a fried egg, with rice and sides.',
    es: 'Bistec a la plancha con huevo frito, arroz y acompañantes.',
  },
  {
    id: 'carne-asada-con-tajadas',
    category: 'plates',
    name: 'Carne Asada con Tajadas',
    menuName: 'Grilled Steak with Fried Plantains',
    prices: [{ amount: 24 }],
    en: 'Grilled steak over crispy plantain chips with cabbage slaw and sauce.',
    es: 'Carne asada sobre tajadas de plátano con repollo y salsa.',
  },
  {
    id: 'carne-asada',
    category: 'plates',
    name: 'Carne Asada',
    menuName: 'Grilled Steak',
    prices: [{ amount: 24 }],
    en: 'A grilled steak plate with rice, refried beans, fresh cheese and cream.',
    es: 'Plato de carne asada con arroz, frijoles fritos, queso fresco y mantequilla.',
  },
  {
    id: 'bistec-encebollado',
    category: 'plates',
    name: 'Bistec Encebollado',
    menuName: 'Steak with Onions',
    prices: [{ amount: 24 }],
    en: 'Steak smothered in sautéed onions, with rice and fried plantain.',
    es: 'Bistec con bastante cebolla salteada, arroz y plátano frito.',
  },
  {
    id: 'pescado-frito',
    category: 'plates',
    name: 'Pescado Frito',
    menuName: 'Fried Fish',
    prices: [{ amount: 22 }],
    en: 'A whole fried fish, crisp outside and tender inside, with plantain chips, cabbage slaw and rice.',
    es: 'Pescado entero frito, dorado por fuera y jugoso por dentro, con tajadas, repollo y arroz.',
  },
  {
    id: 'filete-de-pescado',
    category: 'plates',
    name: 'Filete de Pescado',
    menuName: 'Fish Fillet',
    prices: [{ amount: 20 }],
    en: 'A golden fried fish fillet with lime, pickled slaw and plantain.',
    es: 'Filete de pescado frito con limón, repollo encurtido y plátano.',
  },
  {
    id: 'yuca-con-chicharron',
    category: 'plates',
    name: 'Yuca con Chicharrón',
    menuName: 'Yuca with Pork Rinds',
    prices: [{ amount: 20 }],
    en: 'Boiled cassava topped with crispy pork cracklings, cabbage slaw and tomato sauce.',
    es: 'Yuca cocida con chicharrón, repollo y salsa de tomate.',
  },
  {
    id: 'ensalada-de-pollo',
    category: 'plates',
    name: 'Ensalada de Pollo a la Plancha',
    menuName: 'Grilled Chicken Salad',
    prices: [{ amount: 20 }],
    en: 'Fresh greens and vegetables topped with grilled chicken.',
    es: 'Lechuga y verduras frescas con pollo a la plancha.',
  },

  // ── Tacos y antojitos · Tacos & Antojitos ───────────────────────────────
  {
    id: 'tacos-hondurenos',
    category: 'tacos',
    name: 'Tacos Hondureños',
    menuName: 'Honduran Tacos',
    prices: [{ amount: 10 }],
    en: 'Crispy rolled, fried tacos topped with cabbage slaw, tomato sauce and grated dry cheese.',
    es: 'Tacos enrollados y fritos con repollo, salsa de tomate y queso seco rallado.',
    featured: true,
  },
  {
    id: 'tacos-hondurenos-con-tajadas',
    category: 'tacos',
    name: 'Tacos Hondureños con Tajadas',
    menuName: 'Honduran Tacos with Plantains',
    prices: [{ amount: 15 }],
    en: 'Our Honduran rolled tacos with a side of crispy plantain chips.',
    es: 'Nuestros tacos hondureños acompañados de tajadas.',
  },
  {
    id: 'tacos-mexicanos',
    category: 'tacos',
    name: 'Tacos Mexicanos',
    menuName: 'Mexican Tacos',
    prices: [{ amount: 14 }],
    en: 'Soft corn tortillas with seasoned meat, onion, cilantro and salsa.',
    es: 'Tortillas de maíz suaves con carne, cebolla, cilantro y salsa.',
  },
  {
    id: 'tacos-de-birria',
    category: 'tacos',
    name: 'Tacos de Birria',
    menuName: 'Birria Tacos',
    prices: [{ amount: 16 }],
    en: 'Crisp tacos filled with slow-braised beef and cheese, with consommé for dipping.',
    es: 'Tacos dorados de res guisada a fuego lento con queso, y consomé para mojar.',
  },
  {
    id: 'tortillas-con-queso',
    category: 'tacos',
    name: 'Tortillas con Queso',
    menuName: 'Tortillas with Cheese: cabbage & sauce',
    // The printed menu gives two prices without saying what separates them.
    prices: [{ amount: 7 }, { amount: 10 }],
    en: 'Corn tortillas with cheese, topped with cabbage slaw and sauce. Comes as an order of two.',
    es: 'Tortillas de maíz con queso, repollo y salsa. Orden de dos.',
  },
  {
    id: 'tortillas-con-frijoles-y-queso',
    category: 'tacos',
    name: 'Tortillas con Frijoles y Queso',
    menuName: 'Tortillas with Cheese: beans & cheese',
    prices: [{ amount: 7 }, { amount: 10 }],
    en: 'Corn tortillas spread with refried beans and topped with cheese. Comes as an order of two.',
    es: 'Tortillas de maíz con frijoles fritos y queso. Orden de dos.',
  },
  {
    id: 'enchiladas-hondurenas',
    category: 'tacos',
    name: 'Enchiladas Hondureñas',
    menuName: 'Enchiladas',
    prices: [{ amount: 8 }],
    en: 'Honduran-style enchiladas: a crispy flat tortilla topped with seasoned meat, cabbage, tomato sauce and cheese.',
    es: 'Enchiladas catrachas: tortilla tostada con carne molida, repollo, salsa de tomate y queso.',
  },

  // ── Pupusas ─────────────────────────────────────────────────────────────
  {
    id: 'pupusas',
    category: 'pupusas',
    name: 'Pupusas',
    menuName: 'Pupusas',
    prices: [
      { amount: 10, label: { en: 'Order of 3', es: 'Orden de 3' } },
      { amount: 13, label: { en: 'Order of 4', es: 'Orden de 4' } },
    ],
    en: 'Thick corn cakes stuffed and griddled until golden, served with pickled slaw and salsa. Mix and match fillings.',
    es: 'Tortillas gruesas de maíz rellenas y doradas a la plancha, con curtido y salsa. Combine los rellenos.',
    fillings: [
      { name: 'Revueltas', en: 'pork & cheese', es: 'chicharrón y queso' },
      { name: 'Frijol con queso', en: 'beans & cheese', es: 'frijoles y queso' },
      { name: 'Queso', en: 'cheese only', es: 'solo queso' },
    ],
    featured: true,
  },

  // ── Sopas · Soups ───────────────────────────────────────────────────────
  {
    id: 'sopa-de-pollo',
    category: 'soups',
    name: 'Sopa de Pollo',
    menuName: 'Chicken Soup',
    prices: [
      { amount: 10, label: small },
      { amount: 15, label: large },
    ],
    en: 'A hearty chicken soup with vegetables and root vegetables.',
    es: 'Sopa de pollo con verduras y tubérculos.',
    days: [1],
  },
  {
    id: 'sopa-de-frijoles',
    category: 'soups',
    name: 'Sopa de Frijoles',
    menuName: 'Bean Soup',
    prices: [
      { amount: 12, label: small },
      { amount: 18, label: large },
    ],
    en: 'Creamy red bean soup, traditionally with pork, egg and plantain.',
    es: 'Sopa de frijoles rojos, tradicionalmente con chicharrón, huevo y plátano.',
    days: [3],
  },
  {
    id: 'sopa-de-mariscos',
    category: 'soups',
    name: 'Sopa de Mariscos',
    menuName: 'Seafood Soup',
    prices: [{ amount: 25 }],
    en: 'A rich seafood soup with crab, shrimp and fish. Comes with rice, lime and tortillas.',
    es: 'Sopa de mariscos con cangrejo, camarón y pescado. Incluye arroz, limón y tortillas.',
  },
  {
    id: 'sopa-de-res',
    category: 'soups',
    name: 'Sopa de Res',
    menuName: 'Beef Soup',
    prices: [
      { amount: 12, label: small },
      { amount: 18, label: large },
    ],
    en: 'Sunday beef soup with corn, yuca, plantain and vegetables. Comes with rice, lime and tortillas.',
    es: 'Sopa de res dominguera con elote, yuca, plátano y verduras. Incluye arroz, limón y tortillas.',
    days: [0],
  },
  {
    id: 'sopa-de-mondongo',
    category: 'soups',
    name: 'Sopa de Mondongo',
    menuName: 'Tripe Soup',
    prices: [
      { amount: 13, label: small },
      { amount: 20, label: large },
    ],
    en: 'The traditional Honduran tripe soup, slow-cooked with vegetables. Comes with rice, lime and tortillas.',
    es: 'La tradicional sopa de mondongo, cocida a fuego lento con verduras. Incluye arroz, limón y tortillas.',
    days: [0],
  },

  // ── Bebidas · Drinks ────────────────────────────────────────────────────
  drink('horchata', 'frescos', 'Horchata', 'Horchata', [{ amount: 3 }], 'Sweet rice drink with cinnamon', 'Bebida dulce de arroz con canela'),
  drink('tamarindo', 'frescos', 'Tamarindo', 'Tamarind', [{ amount: 3 }]),
  drink('jamaica', 'frescos', 'Jamaica', 'Hibiscus', [{ amount: 3 }]),
  drink('melon', 'frescos', 'Melón', 'Cantaloupe', [{ amount: 3 }]),

  drink('refresco-botella', 'sodas', 'Refresco de Botella', 'Bottled soda', [{ amount: 2.5 }]),
  drink('refresco-lata', 'sodas', 'Refresco de Lata', 'Canned soda', [{ amount: 1.5 }]),
  drink('refresco-grande', 'sodas', 'Refresco Grande', 'Large soda', [{ amount: 5 }]),

  drink('red-bull', 'energy', 'Red Bull', 'Red Bull', [{ amount: 4 }]),
  drink('raptor', 'energy', 'Raptor', 'Raptor', [{ amount: 4 }]),
  drink('monster', 'energy', 'Monster', 'Monster', [{ amount: 4 }]),
  drink('gatorade', 'energy', 'Gatorade', 'Gatorade', [{ amount: 2.5 }]),

  drink('aloe', 'more', 'Bebida de Aloe', 'Aloe drink', [{ amount: 3 }]),
  drink('snapple', 'more', 'Snapple', 'Snapple', [{ amount: 2.5 }]),
  drink('jugo-lata', 'more', 'Jugo de Lata', 'Canned juice', [{ amount: 3 }]),
  drink('licuado', 'more', 'Licuado', 'Milkshake', [{ amount: 4 }]),
  drink('agua-de-coco', 'more', 'Agua de Coco', 'Coconut water', [{ amount: 3 }]),
  drink('agua', 'more', 'Agua', 'Water', [{ amount: 1 }]),
  drink('agua-grande', 'more', 'Agua Grande', 'Large water', [{ amount: 3 }]),

  drink('chocolate-caliente', 'hot', 'Chocolate Caliente', 'Hot chocolate', [
    { amount: 3, label: smallCup },
    { amount: 4, label: largeCup },
  ]),
  drink('cafe', 'hot', 'Café', 'Coffee', [
    { amount: 1.5, label: smallCup },
    { amount: 3, label: largeCup },
  ]),
]

export const itemById = (id: string): MenuItem | undefined => MENU.find((i) => i.id === id)
