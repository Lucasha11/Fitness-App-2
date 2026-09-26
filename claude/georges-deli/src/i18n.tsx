import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Lang, Localised } from './data/menu'

// Every piece of interface text, in both languages. Dish names are not here:
// they stay Spanish in both, and their descriptions live in data/menu.ts.

const en = {
  skip: 'Skip to content',
  menuButton: 'Menu',
  closeMenu: 'Close menu',
  langLabel: 'Language',
  home: 'Home',
  menu: 'Menu',
  hotBar: 'Hot bar',
  catering: 'Catering',
  gallery: 'Gallery',
  about: 'About us',
  visit: 'Visit',
  seeMenu: 'See the menu',
  call: 'Call',
  callUs: 'Call us',
  callAria: 'Call George’s Deli at (973) 285-0950',
  tagline: 'A taste of Honduras, made fresh every day',
  orderRules: 'Order by phone or at the counter · Pick-up and dine-in only · No delivery.',
  footerRules: 'Pick-up & dine-in only · No delivery',
  favourites: 'Favourites',
  favouritesSub: 'The dishes people come back for.',
  swipeHint: 'Swipe for more',
  viewOnMenu: (name: string) => `${name} — view on the menu`,

  hotBarTitle: 'The hot bar',
  hotBarKicker: 'Changes every day · In person only',
  hotBarNote: 'Eat in or take it away — the hot bar can’t be ordered by phone.',
  todaysDishes: 'Today’s dishes',
  notPosted: 'Today’s dishes aren’t posted yet — come in and see what’s cooking, or give us a call.',
  hotBarMore: 'How the hot bar works',

  todaysSoup: 'Today’s soup',
  soupSchedule: 'Our soups this week',
  noDaySoupToday: 'No day-only soup today — here’s when to come for one.',
  everyDay: 'Every day',

  categories: 'What are you hungry for?',
  findUs: 'Find us',
  getDirections: 'Get directions',
  hours: 'Hours',

  openUntil: (t: string) => `Open now · until ${t}`,
  closedOpens: (t: string) => `Closed · opens ${t}`,
  closed: 'Closed now',
  unconfirmedToday: 'Call to check today’s hours',
  callToConfirm: 'Call to confirm',
  today: 'Today',

  menuTitle: 'Our menu',
  menuIntro: 'Everything is made fresh in our kitchen. Order by phone or at the counter.',
  searchLabel: 'Search the menu',
  searchPlaceholder: 'Search dishes — e.g. baleada, soup',
  clearSearch: 'Clear search',
  noResults: (q: string) => `Nothing matches “${q}”. Try another word, or give us a call and ask.`,
  resultsCount: (n: number) => (n === 1 ? '1 dish found' : `${n} dishes found`),
  fillings: 'Fillings',
  categoryNav: 'Menu categories',
  photoSoon: (name: string) => `Photo of ${name} coming soon`,

  hotBarIntro: 'A counter full of home cooking that changes every day. Come in, look, and point at what you want.',
  howItWorks: 'How it works',
  step1: 'Pick your dishes at the counter',
  step1Body: 'See what’s cooking today and choose what you like.',
  step2: 'Small or large plate',
  step2Body: 'Pick a plate size. Extra meat or salad costs a little more.',
  step3: 'Eat in or take away',
  step3Body: 'Grab a table, or we’ll pack it up for you.',
  prices: 'Prices',
  pricesNote: 'Prices depend on what you choose.',
  inPersonOnly: 'In person only — the hot bar can’t be ordered by phone.',

  cateringTitle: 'Feeding a crowd?',
  cateringIntro: 'Birthdays, office lunches, family get-togethers — let us cook. Catering is ordered in advance, by phone.',
  cStep1: 'Call us ahead of time',
  cStep1Body: 'Tell us the date and how many people you’re feeding.',
  cStep2: 'Choose your dishes',
  cStep2Body: 'We’ll help you pick from the menu and suggest how much to order.',
  cStep3: 'Pick it up',
  cStep3Body: 'Collect it hot from the counter. Catering is pick-up only — no delivery.',
  callToOrder: 'Call to order catering',

  galleryTitle: 'Gallery',
  galleryIntro: 'A look inside our kitchen. Real photos are on their way.',
  aboutTitle: 'About us',
  aboutKicker: 'A family kitchen in Morristown',
  aboutPhotoAlt: 'The family behind George’s Deli',
  photoComing: 'Photo coming soon',

  visitTitle: 'Visit us',
  visitIntro: 'Come by for breakfast, lunch or dinner.',
  address: 'Address',
  phone: 'Phone',
  howToOrder: 'How to order',
  mapTitle: 'Map showing George’s Deli on Martin Luther King Ave, Morristown',

  instagram: 'Instagram',
  comingSoon: 'coming soon',
  footerTag: 'Honduran home cooking in Morristown, NJ.',

  // Page titles and descriptions for <title> and <meta name="description">.
  metaHome: 'Honduran home cooking in Morristown, NJ: baleadas, pollo con tajadas, pupusas, Sunday soups and a daily hot bar. Pick-up and dine-in.',
  metaMenu: 'The full menu at George’s Deli: breakfast, baleadas, plates, tacos, pupusas, soups and drinks, with prices.',
  metaHotBar: 'Our hot bar changes every day. Pick your dishes at the counter, choose a small or large plate, eat in or take away.',
  metaCatering: 'Honduran catering from George’s Deli. Order in advance by phone, pick up in Morristown.',
  metaGallery: 'Photos from George’s Deli, a family-run Honduran kitchen in Morristown, NJ.',
  metaAbout: 'The family story behind George’s Deli in Morristown, NJ.',
  metaVisit: 'Address, map, hours and phone number for George’s Deli, 15 Martin Luther King Ave, Morristown, NJ.',
}

export type Strings = typeof en

const es: Strings = {
  skip: 'Ir al contenido',
  menuButton: 'Menú',
  closeMenu: 'Cerrar menú',
  langLabel: 'Idioma',
  home: 'Inicio',
  menu: 'Menú',
  hotBar: 'Barra caliente',
  catering: 'Catering',
  gallery: 'Galería',
  about: 'Nosotros',
  visit: 'Visítanos',
  seeMenu: 'Ver el menú',
  call: 'Llamar',
  callUs: 'Llámanos',
  callAria: 'Llamar a George’s Deli al (973) 285-0950',
  tagline: 'Un sabor de Honduras, hecho fresco cada día',
  orderRules: 'Pida por teléfono o en el mostrador · Para llevar o comer aquí · Sin servicio a domicilio.',
  footerRules: 'Para llevar o comer aquí · Sin servicio a domicilio',
  favourites: 'Favoritos',
  favouritesSub: 'Los platos que siempre vuelven a pedir.',
  swipeHint: 'Desliza para ver más',
  viewOnMenu: (name) => `${name} — ver en el menú`,

  hotBarTitle: 'La barra caliente',
  hotBarKicker: 'Cambia cada día · Solo en persona',
  hotBarNote: 'Para comer aquí o llevar — la barra caliente no se puede pedir por teléfono.',
  todaysDishes: 'Los platos de hoy',
  notPosted: 'Todavía no hemos publicado los platos de hoy — ven a ver qué se está cocinando, o llámanos.',
  hotBarMore: 'Cómo funciona la barra caliente',

  todaysSoup: 'La sopa de hoy',
  soupSchedule: 'Nuestras sopas de la semana',
  noDaySoupToday: 'Hoy no hay sopa del día — aquí tienes cuándo venir por una.',
  everyDay: 'Todos los días',

  categories: '¿De qué tienes antojo?',
  findUs: 'Encuéntranos',
  getDirections: 'Cómo llegar',
  hours: 'Horario',

  openUntil: (t) => `Abierto ahora · hasta las ${t}`,
  closedOpens: (t) => `Cerrado · abre a las ${t}`,
  closed: 'Cerrado ahora',
  unconfirmedToday: 'Llama para confirmar el horario de hoy',
  callToConfirm: 'Llama para confirmar',
  today: 'Hoy',

  menuTitle: 'Nuestro menú',
  menuIntro: 'Todo se prepara fresco en nuestra cocina. Pida por teléfono o en el mostrador.',
  searchLabel: 'Buscar en el menú',
  searchPlaceholder: 'Busca platos — p. ej. baleada, sopa',
  clearSearch: 'Borrar búsqueda',
  noResults: (q) => `Nada coincide con “${q}”. Prueba otra palabra, o llámanos y pregunta.`,
  resultsCount: (n) => (n === 1 ? '1 plato encontrado' : `${n} platos encontrados`),
  fillings: 'Rellenos',
  categoryNav: 'Categorías del menú',
  photoSoon: (name) => `Pronto habrá foto de ${name}`,

  hotBarIntro: 'Un mostrador lleno de comida casera que cambia cada día. Ven, mira y señala lo que quieras.',
  howItWorks: 'Cómo funciona',
  step1: 'Escoge tus platos en el mostrador',
  step1Body: 'Mira lo que hay hoy y elige lo que te guste.',
  step2: 'Plato pequeño o grande',
  step2Body: 'Elige el tamaño. Carne o ensalada extra cuesta un poquito más.',
  step3: 'Para comer aquí o llevar',
  step3Body: 'Siéntate con nosotros, o te lo empacamos.',
  prices: 'Precios',
  pricesNote: 'El precio depende de lo que escojas.',
  inPersonOnly: 'Solo en persona — la barra caliente no se puede pedir por teléfono.',

  cateringTitle: '¿Vas a alimentar a muchos?',
  cateringIntro: 'Cumpleaños, almuerzos de oficina, reuniones familiares — déjanos cocinar. El catering se pide con anticipación, por teléfono.',
  cStep1: 'Llámanos con tiempo',
  cStep1Body: 'Dinos la fecha y para cuántas personas es.',
  cStep2: 'Escoge tus platos',
  cStep2Body: 'Te ayudamos a elegir del menú y a calcular cuánto pedir.',
  cStep3: 'Pasa a recogerlo',
  cStep3Body: 'Recógelo calientito en el mostrador. El catering es solo para recoger — sin servicio a domicilio.',
  callToOrder: 'Llama para pedir catering',

  galleryTitle: 'Galería',
  galleryIntro: 'Un vistazo a nuestra cocina. Pronto tendremos fotos reales.',
  aboutTitle: 'Nosotros',
  aboutKicker: 'Una cocina familiar en Morristown',
  aboutPhotoAlt: 'La familia detrás de George’s Deli',
  photoComing: 'Foto próximamente',

  visitTitle: 'Visítanos',
  visitIntro: 'Ven a desayunar, almorzar o cenar.',
  address: 'Dirección',
  phone: 'Teléfono',
  howToOrder: 'Cómo pedir',
  mapTitle: 'Mapa de George’s Deli en Martin Luther King Ave, Morristown',

  instagram: 'Instagram',
  comingSoon: 'próximamente',
  footerTag: 'Comida casera hondureña en Morristown, NJ.',

  metaHome: 'Comida casera hondureña en Morristown, NJ: baleadas, pollo con tajadas, pupusas, sopas del domingo y barra caliente diaria. Para llevar o comer aquí.',
  metaMenu: 'El menú completo de George’s Deli: desayunos, baleadas, platos fuertes, tacos, pupusas, sopas y bebidas, con precios.',
  metaHotBar: 'Nuestra barra caliente cambia cada día. Escoge tus platos en el mostrador, elige plato pequeño o grande, come aquí o llévalo.',
  metaCatering: 'Catering hondureño de George’s Deli. Pida con anticipación por teléfono y recoja en Morristown.',
  metaGallery: 'Fotos de George’s Deli, una cocina hondureña familiar en Morristown, NJ.',
  metaAbout: 'La historia familiar detrás de George’s Deli en Morristown, NJ.',
  metaVisit: 'Dirección, mapa, horario y teléfono de George’s Deli, 15 Martin Luther King Ave, Morristown, NJ.',
}

const STRINGS: Record<Lang, Strings> = { en, es }

const WEEKDAY_NAMES: Record<Lang, string[]> = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  es: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
}

// Plurals for "Mondays only" / "Solo los lunes".
const WEEKDAY_PLURALS: Record<Lang, string[]> = {
  en: ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'],
  es: ['domingos', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábados'],
}

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export function weekdayName(day: number, lang: Lang): string {
  return capitalise(WEEKDAY_NAMES[lang][day])
}

export function daysOnly(days: number[], lang: Lang): string {
  const names = days.map((d) => WEEKDAY_PLURALS[lang][d])
  const joined = names.length > 1 ? `${names.slice(0, -1).join(', ')} ${lang === 'es' ? 'y' : '&'} ${names.at(-1)}` : names[0]
  return lang === 'es' ? `Solo los ${joined}` : `${joined} only`
}

const STORAGE_KEY = 'georgesdeli.lang'

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'es') return saved
  } catch {
    /* storage blocked — fall back to English */
  }
  return 'en'
}

interface LangValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: Strings
  /** Pick the visitor's language from a bilingual value. */
  l: (v: Localised) => string
}

const LangContext = createContext<LangValue | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* remembered for this visit only */
    }
  }, [])

  const value = useMemo<LangValue>(
    () => ({ lang, setLang, t: STRINGS[lang], l: (v) => v[lang] }),
    [lang, setLang],
  )
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang(): LangValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang outside LangProvider')
  return ctx
}
