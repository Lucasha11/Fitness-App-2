import type { DayHours } from '../data/site'
import type { LocalClock } from './nyTime'

export type OpenStatus =
  | { kind: 'open'; closes: string }
  | { kind: 'closed'; opens?: string }
  | { kind: 'unconfirmed' }

const toMinutes = (hm: string) => {
  const [h, m] = hm.split(':').map(Number)
  return h * 60 + m
}

/**
 * Open or closed, from the deli's own clock. A day whose hours are not
 * confirmed never guesses: it asks the visitor to call.
 */
export function openStatus(clock: LocalClock, hours: DayHours[]): OpenStatus {
  const today = hours[clock.weekday]
  if (!today) return { kind: 'unconfirmed' }

  const open = toMinutes(today.open)
  const close = toMinutes(today.close)
  if (clock.minutes >= open && clock.minutes < close) return { kind: 'open', closes: today.close }
  if (clock.minutes < open) return { kind: 'closed', opens: today.open }

  // After closing: tomorrow's opening time, unless tomorrow is unconfirmed too.
  const tomorrow = hours[(clock.weekday + 1) % 7]
  return tomorrow ? { kind: 'closed', opens: tomorrow.open } : { kind: 'closed' }
}
