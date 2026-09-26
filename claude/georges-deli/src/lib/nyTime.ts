import { SITE } from '../data/site'

export interface LocalClock {
  /** Calendar date in the restaurant's time zone, "YYYY-MM-DD". */
  date: string
  /** 0 = Sunday. */
  weekday: number
  /** Minutes since local midnight. */
  minutes: number
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * What the clock on the deli's wall says right now. Everything day-dependent
 * (today's soup, open/closed, whether the hot bar post is today's) must go
 * through this, never `Date#getDay()` — a visitor in California at 10 pm is
 * already on tomorrow in Morristown.
 */
export function localClock(now: Date, timeZone: string = SITE.timeZone): LocalClock {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    weekday: WEEKDAYS.indexOf(get('weekday')),
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  }
}
