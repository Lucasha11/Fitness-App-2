import type { Localised, MenuItem } from '../data/menu'
import { HOT_BAR_PRICES, SITE } from '../data/site'
import { daysOnly, useLang } from '../i18n'
import { formatPrice, formatTime } from '../lib/format'
import { openStatus } from '../lib/hours'
import { todaysHotBar } from '../lib/hotbar'
import { href } from '../lib/route'
import { useClock, useHotBarPost } from './hooks'
import { PhoneIcon } from './icons'
import { Leaf, Stars } from './motifs'

export function Wordmark({ as: Tag = 'span', className }: { as?: 'span' | 'h1'; className?: string }) {
  return <Tag className={`wordmark ${className ?? ''}`}>George’s Deli</Tag>
}

/** A photo, or the sky-blue five-star placeholder until the owners upload one. */
export function Photo({ src, alt, placeholderLabel, className }: { src?: string; alt: string; placeholderLabel: string; className?: string }) {
  if (src) {
    return <img className={`photo ${className ?? ''}`} src={`${import.meta.env.BASE_URL}${src}`} alt={alt} loading="lazy" decoding="async" />
  }
  return (
    <div className={`photo photo--placeholder ${className ?? ''}`} role="img" aria-label={placeholderLabel}>
      <Stars size={64} />
    </div>
  )
}

export function CallButton({ label, big }: { label?: string; big?: boolean }) {
  const { t } = useLang()
  return (
    <a className={`btn btn--call ${big ? 'btn--big' : ''}`} href={SITE.phoneHref} aria-label={t.callAria}>
      <PhoneIcon />
      <span>{label ?? SITE.phoneDisplay}</span>
    </a>
  )
}

export function Prices({ item }: { item: MenuItem }) {
  const { l } = useLang()
  return (
    <p className="prices">
      {item.prices.map((p, i) => (
        <span className="price" key={i}>
          {p.label && <span className="price__label">{l(p.label)}</span>}
          <span className="price__amount">{formatPrice(p.amount)}</span>
        </span>
      ))}
    </p>
  )
}

export function DaysBadge({ days }: { days?: number[] }) {
  const { lang } = useLang()
  if (!days) return null
  return <span className="badge">{daysOnly(days, lang)}</span>
}

/**
 * The main call to action of the whole site. As a link it opens the menu at
 * the dish; on the menu page itself it is a plain article.
 */
export function DishCard({ item, link, highlight }: { item: MenuItem; link?: boolean; highlight?: boolean }) {
  const { lang, t } = useLang()
  const body = (
    <>
      <div className="dish__media">
        <Photo src={item.photo} alt={`${item.name}: ${item[lang]}`} placeholderLabel={t.photoSoon(item.name)} />
        {item.days && <DaysBadge days={item.days} />}
      </div>
      <div className="dish__body">
        <h3 className="dish__name">{item.name}</h3>
        {lang === 'en' && item.menuName !== item.name && <p className="dish__en">{item.menuName}</p>}
        <p className="dish__desc">{item[lang]}</p>
        {item.fillings && (
          <p className="dish__fillings">
            <strong>{t.fillings}:</strong>{' '}
            {item.fillings.map((f, i) => (
              <span key={f.name}>
                {i > 0 && ' · '}
                {f.name} <span className="muted">({f[lang]})</span>
              </span>
            ))}
          </p>
        )}
        <Prices item={item} />
      </div>
    </>
  )
  if (link) {
    return (
      <a className="dish dish--link" href={href('menu', { item: item.id })} aria-label={t.viewOnMenu(item.name)}>
        {body}
      </a>
    )
  }
  return (
    <article className={`dish ${highlight ? 'dish--highlight' : ''}`} id={`dish-${item.id}`} tabIndex={-1}>
      {body}
    </article>
  )
}

export function OpenBadge() {
  const { lang, t } = useLang()
  const status = openStatus(useClock(), SITE.hours)
  const text =
    status.kind === 'open'
      ? t.openUntil(formatTime(status.closes, lang))
      : status.kind === 'unconfirmed'
        ? t.unconfirmedToday
        : status.opens
          ? t.closedOpens(formatTime(status.opens, lang))
          : t.closed
  return (
    <span className={`status status--${status.kind}`}>
      <span className="status__dot" aria-hidden="true" />
      {text}
    </span>
  )
}

const localisedDish = (d: string | Localised, lang: 'en' | 'es') => (typeof d === 'string' ? d : d[lang])

/** Today's hot bar dishes — only when the post is dated today in New Jersey. */
export function HotBarToday() {
  const { lang, t } = useLang()
  const clock = useClock()
  const post = useHotBarPost()
  if (post === undefined) return <p className="hotbar__empty" aria-busy="true">…</p>
  const items = todaysHotBar(post, clock.date)
  if (!items) return <p className="hotbar__empty">{t.notPosted}</p>
  return (
    <ul className="hotbar__items">
      {items.map((d) => {
        const es = typeof d === 'string' ? d : d.es
        const shown = localisedDish(d, lang)
        return (
          <li key={es}>
            <Stars size={18} />
            <span>
              {es}
              {lang === 'en' && shown !== es && <span className="hotbar__en"> · {shown}</span>}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

export function HotBarPrices() {
  const { l } = useLang()
  return (
    <dl className="hotbar__prices">
      {HOT_BAR_PRICES.map((p) => (
        <div key={p.label.en}>
          <dt>{l(p.label)}</dt>
          <dd>{p.price}</dd>
        </div>
      ))}
    </dl>
  )
}

export function Leaves() {
  return (
    <>
      <Leaf className="leaf--tl" />
      <Leaf className="leaf--br" flip />
    </>
  )
}

export function Steps({ steps }: { steps: { title: string; body: string }[] }) {
  return (
    <ol className="steps">
      {steps.map((s, i) => (
        <li key={s.title} className="step">
          <span className="step__num" aria-hidden="true">
            {i + 1}
          </span>
          <div>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
