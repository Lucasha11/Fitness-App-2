import { SITE } from '../data/site'
import { useLang, weekdayName } from '../i18n'
import { formatTime } from '../lib/format'
import { useClock } from './hooks'

// Monday first, as people read a week.
const ORDER = [1, 2, 3, 4, 5, 6, 0]

export function HoursTable() {
  const { lang, t } = useLang()
  const { weekday } = useClock()
  return (
    <table className="hours">
      <caption className="sr-only">{t.hours}</caption>
      <tbody>
        {ORDER.map((d) => {
          const h = SITE.hours[d]
          const isToday = d === weekday
          return (
            <tr key={d} className={isToday ? 'is-today' : undefined} aria-current={isToday ? 'date' : undefined}>
              <th scope="row">
                {weekdayName(d, lang)}
                {isToday && <span className="today-tag">{t.today}</span>}
              </th>
              <td>{h ? `${formatTime(h.open, lang)} – ${formatTime(h.close, lang)}` : t.callToConfirm}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

/** One-line summary for the footer and "Find us" strip. */
export function HoursSummary() {
  const { lang, t } = useLang()
  const days = lang === 'es' ? 'Domingo a viernes' : 'Sunday to Friday'
  const sat = lang === 'es' ? 'Sábado' : 'Saturday'
  const week = SITE.hours[0]!
  return (
    <span>
      {days}, {formatTime(week.open, lang)} – {formatTime(week.close, lang)}
      <br />
      {sat}: {t.callToConfirm.toLowerCase()}
    </span>
  )
}
