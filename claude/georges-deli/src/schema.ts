import { CATEGORIES, MENU } from './data/menu.ts'
import { SITE } from './data/site.ts'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/**
 * schema.org Restaurant data, built from the same files the site renders, so
 * search engines never see a price the page doesn't. Injected into index.html
 * at build time by vite.config.ts.
 */
export function restaurantJsonLd() {
  const confirmed = SITE.hours.flatMap((h, d) => (h ? [{ d, h }] : []))
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: SITE.name,
    url: SITE.url,
    telephone: SITE.phoneE164,
    servesCuisine: 'Honduran',
    priceRange: '$',
    acceptsReservations: false,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address.street,
      addressLocality: SITE.address.city,
      addressRegion: SITE.address.region,
      postalCode: SITE.address.postcode,
      addressCountry: SITE.address.country,
    },
    openingHoursSpecification: confirmed.map(({ d, h }) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${DAY_NAMES[d]}`,
      opens: h!.open,
      closes: h!.close,
    })),
    hasMenu: {
      '@type': 'Menu',
      url: `${SITE.url}#/menu`,
      inLanguage: ['en', 'es'],
      hasMenuSection: CATEGORIES.map((c) => ({
        '@type': 'MenuSection',
        name: `${c.es} · ${c.en}`,
        hasMenuItem: MENU.filter((i) => i.category === c.id).map((i) => ({
          '@type': 'MenuItem',
          name: i.name,
          ...(i.en ? { description: i.en } : {}),
          offers: i.prices.map((p) => ({
            '@type': 'Offer',
            price: p.amount.toFixed(2),
            priceCurrency: 'USD',
            ...(p.label ? { name: p.label.en } : {}),
          })),
        })),
      })),
    },
  }
}
