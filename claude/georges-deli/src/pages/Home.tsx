import { CATEGORIES, MENU } from '../data/menu'
import { directionsUrl, fullAddress, SITE } from '../data/site'
import { HoursSummary } from '../components/HoursTable'
import { useClock } from '../components/hooks'
import { ArrowIcon, CategoryIcon, ClockIcon, PinIcon } from '../components/icons'
import { Leaf, StarDivider, Stars } from '../components/motifs'
import { CallButton, DishCard, HotBarPrices, HotBarToday, Leaves, OpenBadge, Prices, Wordmark } from '../components/ui'
import { useLang, weekdayName } from '../i18n'
import { href } from '../lib/route'
import { EVERYDAY_SOUPS, soupSchedule, soupsForDay } from '../lib/soup'

const FEATURED = MENU.filter((i) => i.featured)

export function Home() {
  const { t } = useLang()
  return (
    <>
      <section className={`hero ${SITE.heroPhoto ? 'hero--photo' : ''}`}>
        {SITE.heroPhoto && (
          <img className="hero__bg" src={`${import.meta.env.BASE_URL}${SITE.heroPhoto}`} alt="" fetchPriority="high" />
        )}
        <div className="hero__pattern" aria-hidden="true" />
        <Leaf className="leaf--tl" />
        <Leaf className="leaf--br" flip />
        <div className="hero__inner">
          <Stars className="hero__stars" size={72} />
          <Wordmark as="h1" className="hero__wordmark" />
          <p className="hero__tagline">{t.tagline}</p>
          <a className="btn btn--primary btn--big" href={href('menu')}>
            {t.seeMenu} <ArrowIcon />
          </a>
          <p className="hero__rules">{t.orderRules}</p>
        </div>
      </section>

      <section className="section" aria-labelledby="fav-h">
        <div className="section__head">
          <h2 id="fav-h">{t.favourites}</h2>
          <p className="section__sub">{t.favouritesSub}</p>
        </div>
        <ul className="carousel" aria-label={t.favourites}>
          {FEATURED.map((item) => (
            <li key={item.id}>
              <DishCard item={item} link />
            </li>
          ))}
        </ul>
        <p className="carousel__hint" aria-hidden="true">
          {t.swipeHint} →
        </p>
      </section>

      <section className="section section--tight">
        <HotBarCard />
      </section>

      <section className="band" aria-labelledby="soup-h">
        <Leaves />
        <div className="band__inner">
          <TodaysSoup />
        </div>
      </section>

      <section className="section" aria-labelledby="cat-h">
        <h2 id="cat-h">{t.categories}</h2>
        <ul className="tiles">
          {CATEGORIES.map((c) => (
            <li key={c.id}>
              <CategoryTile id={c.id} />
            </li>
          ))}
        </ul>
      </section>

      <StarDivider />

      <section className="section" aria-labelledby="find-h">
        <div className="find-us">
          <h2 id="find-h">{t.findUs}</h2>
          <OpenBadge />
          <p className="fact">
            <PinIcon /> <span>{fullAddress}</span>
          </p>
          <p className="fact">
            <ClockIcon /> <HoursSummary />
          </p>
          <div className="find-us__actions">
            <a className="btn btn--outline" href={directionsUrl} target="_blank" rel="noopener">
              {t.getDirections}
            </a>
            <CallButton />
          </div>
        </div>
      </section>
    </>
  )
}

function CategoryTile({ id }: { id: (typeof CATEGORIES)[number]['id'] }) {
  const { l } = useLang()
  const c = CATEGORIES.find((x) => x.id === id)!
  return (
    <a className="tile" href={href('menu', { section: id })}>
      <span className="tile__icon">
        <CategoryIcon id={id} />
      </span>
      <span className="tile__name">{l(c)}</span>
    </a>
  )
}

export function HotBarCard({ full }: { full?: boolean }) {
  const { t } = useLang()
  return (
    <div className="hotbar-card" aria-labelledby="hotbar-h">
      <Stars className="hotbar-card__stars" size={56} />
      <p className="kicker kicker--gold">{t.hotBarKicker}</p>
      <h2 id="hotbar-h">{t.hotBarTitle}</h2>
      <p>{t.hotBarNote}</p>
      <HotBarPrices />
      <h3>{t.todaysDishes}</h3>
      <HotBarToday />
      {!full && (
        <a className="btn btn--light" href={href('hot-bar')}>
          {t.hotBarMore} <ArrowIcon />
        </a>
      )}
    </div>
  )
}

function TodaysSoup() {
  const { lang, t } = useLang()
  const { weekday } = useClock()
  const today = soupsForDay(weekday)

  if (today.length > 0) {
    return (
      <>
        <h2 id="soup-h">{t.todaysSoup}</h2>
        <ul className="soup-list">
          {today.map((s) => (
            <li key={s.id}>
              <a className="soup" href={href('menu', { item: s.id })}>
                <span className="soup__name">{s.name}</span>
                {lang === 'en' && <span className="soup__en">{s.menuName}</span>}
                <Prices item={s} />
              </a>
            </li>
          ))}
        </ul>
      </>
    )
  }

  return (
    <>
      <h2 id="soup-h">{t.soupSchedule}</h2>
      <p>{t.noDaySoupToday}</p>
      <ul className="soup-schedule">
        {soupSchedule().map((row) => (
          <li key={row.weekday}>
            <span className="soup-schedule__day">{weekdayName(row.weekday, lang)}</span>
            <span>
              {row.soups.map((s, i) => (
                <a key={s.id} href={href('menu', { item: s.id })}>
                  {i > 0 && ' · '}
                  {s.name}
                </a>
              ))}
            </span>
          </li>
        ))}
        <li>
          <span className="soup-schedule__day">{t.everyDay}</span>
          <span>
            {EVERYDAY_SOUPS.map((s) => (
              <a key={s.id} href={href('menu', { item: s.id })}>
                {s.name}
              </a>
            ))}
          </span>
        </li>
      </ul>
    </>
  )
}
