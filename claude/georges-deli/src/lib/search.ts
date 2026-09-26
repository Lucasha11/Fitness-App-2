import type { MenuItem } from '../data/menu'

/** Lower-case and strip accents, so "chicharron" finds "Chicharrón" and "melon" finds "Melón". */
export const normalise = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

/** A dish matches if every word of the query appears in its Spanish or English name. */
export function matchesQuery(item: MenuItem, query: string): boolean {
  const words = normalise(query).split(/\s+/).filter(Boolean)
  if (words.length === 0) return true
  const haystack = normalise(
    [item.name, item.menuName, ...(item.fillings?.flatMap((f) => [f.name, f.en]) ?? [])].join(' '),
  )
  return words.every((w) => haystack.includes(w))
}
