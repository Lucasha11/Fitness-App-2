import type { Localised } from './menu.ts'

/** Opening hours for one weekday, 24h "HH:MM". `null` means not confirmed yet. */
export type DayHours = { open: string; close: string } | null

export const SITE = {
  name: "George's Deli",
  url: 'https://georgesdeli.example.com/', // placeholder until the domain is chosen
  phoneDisplay: '(973) 285-0950',
  phoneHref: 'tel:+19732850950',
  phoneE164: '+19732850950',
  address: {
    street: '15 Martin Luther King Ave #1',
    city: 'Morristown',
    region: 'NJ',
    postcode: '07960',
    country: 'US',
  },
  timeZone: 'America/New_York',
  // Index 0 = Sunday. Saturday is unconfirmed, so the site says "call to
  // confirm" rather than guessing.
  hours: [
    { open: '06:00', close: '22:00' },
    { open: '06:00', close: '22:00' },
    { open: '06:00', close: '22:00' },
    { open: '06:00', close: '22:00' },
    { open: '06:00', close: '22:00' },
    { open: '06:00', close: '22:00' },
    null,
  ] as DayHours[],
  instagram: 'https://instagram.com/', // placeholder — account coming soon
  /** Storefront or food photo for the home hero. Empty shows the navy star pattern. */
  heroPhoto: '',
  aboutPhoto: '',
}

export const fullAddress = `${SITE.address.street}, ${SITE.address.city}, ${SITE.address.region} ${SITE.address.postcode}`

export const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`
export const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(`George's Deli, ${fullAddress}`)}&output=embed`

/** The hot bar ("buffet" on the printed menu). Prices are ranges because the dishes change daily. */
export const HOT_BAR_PRICES: { label: Localised; price: string }[] = [
  { label: { en: 'Small plate', es: 'Plato pequeño' }, price: '$8–$12' },
  { label: { en: 'Large plate', es: 'Plato grande' }, price: '$11–$20' },
  { label: { en: 'Extra meat', es: 'Carne extra' }, price: '+$2–$3' },
  { label: { en: 'Extra salad', es: 'Ensalada extra' }, price: '+$2–$3' },
]

// Placeholder story — the owners will replace this with their own words.
export const ABOUT: Localised[] = [
  {
    en: 'George’s Deli is a family kitchen. We cook the food we grew up with in Honduras — baleadas pressed by hand, beans simmered slow, plantains fried until they crackle.',
    es: 'George’s Deli es una cocina familiar. Cocinamos la comida con la que crecimos en Honduras: baleadas hechas a mano, frijoles a fuego lento y plátanos fritos bien doraditos.',
  },
  {
    en: 'Every morning the hot bar fills up with whatever smells best that day, and on Sundays the big pots of sopa de res and mondongo come out, just like at home.',
    es: 'Cada mañana la barra caliente se llena con lo que mejor huele ese día, y los domingos salen las ollas grandes de sopa de res y mondongo, como en casa.',
  },
  {
    en: 'Whether you grew up on this food or are trying it for the first time, pull up a chair. You are family here.',
    es: 'Ya sea que creciste con esta comida o la pruebas por primera vez, siéntate con nosotros. Aquí eres de la familia.',
  },
]

/** Gallery slots. Add a `photo` path to replace a placeholder. */
export const GALLERY: { photo?: string; caption: Localised }[] = [
  { caption: { en: 'Baleadas fresh off the comal', es: 'Baleadas recién salidas del comal' } },
  { caption: { en: 'Pollo con tajadas', es: 'Pollo con tajadas' } },
  { caption: { en: 'The hot bar at lunchtime', es: 'La barra caliente al mediodía' } },
  { caption: { en: 'Sunday sopa de res', es: 'Sopa de res del domingo' } },
  { caption: { en: 'Pupusas on the griddle', es: 'Pupusas en la plancha' } },
  { caption: { en: 'Our counter on MLK Ave', es: 'Nuestro mostrador en MLK Ave' } },
  { caption: { en: 'Horchata and jamaica', es: 'Horchata y jamaica' } },
  { caption: { en: 'Desayuno típico', es: 'Desayuno típico' } },
]
