import type { Lang } from '../data/menu'

/** Like the printed menu: whole dollars without cents ($24), anything else with two decimals ($2.50). */
export function formatPrice(amount: number): string {
  return Number.isInteger(amount) ? `$${amount}` : `$${amount.toFixed(2)}`
}

/** "22:00" → "10 PM" / "10 p. m."; minutes only when they are not :00. */
export function formatTime(hm: string, lang: Lang): string {
  const [h, m] = hm.split(':').map(Number)
  const h12 = h % 12 === 0 ? 12 : h % 12
  const mins = m ? `:${String(m).padStart(2, '0')}` : ''
  const suffix = lang === 'es' ? (h < 12 ? 'a. m.' : 'p. m.') : h < 12 ? 'AM' : 'PM'
  return `${h12}${mins} ${suffix}`
}
