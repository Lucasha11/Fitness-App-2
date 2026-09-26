import { MENU, type MenuItem } from '../data/menu'

/** Soups made only on certain weekdays, e.g. Sopa de Pollo on Mondays. */
export const DAY_SOUPS = MENU.filter((i) => i.category === 'soups' && i.days)

/** Soups on every day, e.g. Sopa de Mariscos. */
export const EVERYDAY_SOUPS = MENU.filter((i) => i.category === 'soups' && !i.days)

/** The day-only soups served on this weekday (0 = Sunday). Empty on a day without one. */
export function soupsForDay(weekday: number): MenuItem[] {
  return DAY_SOUPS.filter((s) => s.days!.includes(weekday))
}

/** The weekly schedule, one row per day that has a soup, Monday first. */
export function soupSchedule(): { weekday: number; soups: MenuItem[] }[] {
  return [1, 2, 3, 4, 5, 6, 0]
    .map((weekday) => ({ weekday, soups: soupsForDay(weekday) }))
    .filter((row) => row.soups.length > 0)
}
