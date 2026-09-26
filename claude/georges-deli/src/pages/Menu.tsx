import { useEffect, useMemo, useRef, useState } from 'react'
import { CATEGORIES, DRINK_GROUPS, MENU, type CategoryId, type MenuItem } from '../data/menu'
import { CategoryIcon, CloseIcon, SearchIcon } from '../components/icons'
import { Leaves, DishCard, Prices } from '../components/ui'
import { useLang } from '../i18n'
import { matchesQuery } from '../lib/search'
import type { Route } from '../lib/route'

export function Menu({ route }: { route: Route }) {
  const { lang, l, t } = useLang()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState<CategoryId>('breakfast')
  const tabsRef = useRef<HTMLDivElement>(null)

  const results = useMemo(() => MENU.filter((i) => matchesQuery(i, query)), [query])
  const byCategory = useMemo(() => {
    const map = new Map<CategoryId, MenuItem[]>()
    for (const c of CATEGORIES) map.set(c.id, results.filter((i) => i.category === c.id))
    return map
  }, [results])

  // Arrive at a dish or a section, from a favourite card or a home tile.
  useEffect(() => {
    const target = route.item
      ? document.getElementById(`dish-${route.item}`)
      : route.section
        ? document.getElementById(`section-${route.section}`)
        : null
    if (!target) return
    requestAnimationFrame(() => {
      target.scrollIntoView({ block: route.item ? 'center' : 'start' })
      if (route.item) target.focus({ preventScroll: true })
    })
  }, [route.item, route.section])

  // Highlight the tab of the section in view.
  useEffect(() => {
    const sections = CATEGORIES.map((c) => document.getElementById(`section-${c.id}`)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (top) setActive(top.target.id.replace('section-', '') as CategoryId)
      },
      { rootMargin: '-130px 0px -55% 0px' },
    )
    sections.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [results])

  // Keep the active tab visible in the sideways strip without moving the page.
  useEffect(() => {
    const strip = tabsRef.current
    const tab = strip?.querySelector<HTMLElement>(`[data-cat="${active}"]`)
    if (strip && tab) strip.scrollTo({ left: tab.offsetLeft - 16, behavior: 'smooth' })
  }, [active])

  const jump = (id: CategoryId) => {
    document.getElementById(`section-${id}`)?.scrollIntoView({ block: 'start' })
    setActive(id)
  }

  return (
    <div className="menu-page">
      <section className="page-head">
        <Leaves />
        <h1>{t.menuTitle}</h1>
        <p>{t.menuIntro}</p>
        <p className="rules-pill">{t.orderRules}</p>
      </section>

      <div className="menu-tools">
        <div className="search">
          <label htmlFor="menu-search" className="sr-only">
            {t.searchLabel}
          </label>
          <SearchIcon />
          <input
            id="menu-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            autoComplete="off"
          />
          {query && (
            <button type="button" className="icon-btn search__clear" onClick={() => setQuery('')}>
              <CloseIcon />
              <span className="sr-only">{t.clearSearch}</span>
            </button>
          )}
        </div>
        <p className="sr-only" aria-live="polite">
          {query ? t.resultsCount(results.length) : ''}
        </p>
      </div>

      <nav className="tabs" aria-label={t.categoryNav}>
        <div className="tabs__strip" ref={tabsRef}>
          {CATEGORIES.filter((c) => byCategory.get(c.id)!.length > 0).map((c) => (
            <button
              key={c.id}
              type="button"
              data-cat={c.id}
              className="tab"
              aria-current={active === c.id ? 'true' : undefined}
              onClick={() => jump(c.id)}
            >
              <CategoryIcon id={c.id} />
              {l(c)}
            </button>
          ))}
        </div>
      </nav>

      {results.length === 0 && (
        <div className="no-results">
          <p>{t.noResults(query)}</p>
          <button type="button" className="btn btn--outline" onClick={() => setQuery('')}>
            {t.clearSearch}
          </button>
        </div>
      )}

      {CATEGORIES.map((c) => {
        const items = byCategory.get(c.id)!
        if (items.length === 0) return null
        return (
          <section key={c.id} id={`section-${c.id}`} className="menu-section" aria-labelledby={`h-${c.id}`}>
            <h2 id={`h-${c.id}`}>
              <span className="menu-section__icon">
                <CategoryIcon id={c.id} />
              </span>
              {c.es}
              {lang === 'en' && c.en !== c.es && <span className="menu-section__en"> · {c.en}</span>}
            </h2>
            {c.id === 'drinks' ? (
              <DrinksList items={items} />
            ) : (
              <div className="dish-grid">
                {items.map((item) => (
                  <DishCard key={item.id} item={item} highlight={route.item === item.id} />
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

// Group headings are Spanish, like dish names; English follows in English mode.
function DrinksList({ items }: { items: MenuItem[] }) {
  const { lang } = useLang()
  return (
    <div className="drinks">
      {DRINK_GROUPS.map((g) => {
        const group = items.filter((i) => i.group === g.id)
        if (group.length === 0) return null
        return (
          <div key={g.id} className="drinks__group">
            <h3>
              {g.es}
              {lang === 'en' && <span className="drinks__en"> · {g.en}</span>}
            </h3>
            <ul>
              {group.map((d) => (
                <li key={d.id} id={`dish-${d.id}`} tabIndex={-1}>
                  <span className="drinks__name">
                    {d.name}
                    {lang === 'en' && d.menuName !== d.name && <em> {d.menuName}</em>}
                    {d[lang] && <span className="drinks__desc">{d[lang]}</span>}
                  </span>
                  <span className="drinks__dots" aria-hidden="true" />
                  <Prices item={d} />
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
