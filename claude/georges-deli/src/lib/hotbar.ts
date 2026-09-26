import type { Localised } from '../data/menu'

/**
 * The daily hot bar post, as found in /public/hotbar.json. A future version
 * fills that file from the owners' WhatsApp posts, so everything about reading
 * and trusting it lives here and nowhere else.
 *
 * A plain string is a dish name that reads the same in both languages.
 */
export interface HotBarPost {
  date: string
  items: (string | Localised)[]
}

const isDate = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)
const isText = (v: unknown): v is string => typeof v === 'string' && v.trim() !== ''

/** Validate the raw JSON. Anything malformed is `null` — the site then says "not posted yet". */
export function parseHotBar(raw: unknown): HotBarPost | null {
  if (!raw || typeof raw !== 'object') return null
  const { date, items } = raw as Record<string, unknown>
  if (!isDate(date) || !Array.isArray(items)) return null

  const clean: (string | Localised)[] = []
  const seen = new Set<string>()
  for (const item of items) {
    let dish: string | Localised | null = null
    if (isText(item)) dish = item.trim()
    else if (item && typeof item === 'object') {
      const { en, es } = item as Record<string, unknown>
      if (isText(es)) dish = { es: es.trim(), en: isText(en) ? en.trim() : es.trim() }
    }
    if (!dish) continue
    const key = (typeof dish === 'string' ? dish : dish.es).toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    clean.push(dish)
  }
  return { date, items: clean }
}

/**
 * Today's dishes, or `null` when there is nothing trustworthy to show. An old
 * post is never shown as today's: yesterday's pollo guisado may be long gone.
 */
export function todaysHotBar(post: HotBarPost | null, today: string): (string | Localised)[] | null {
  if (!post || post.date !== today || post.items.length === 0) return null
  return post.items
}

export async function fetchHotBar(url: string): Promise<HotBarPost | null> {
  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return null
    return parseHotBar(await res.json())
  } catch {
    return null
  }
}
