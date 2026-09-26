import { useEffect, useRef, useState } from 'react'
import type { Lang } from '../data/menu'
import { fullAddress, SITE } from '../data/site'
import { useLang } from '../i18n'
import { href, type Page } from '../lib/route'
import { HoursSummary } from './HoursTable'
import { ClockIcon, CloseIcon, InstagramIcon, MenuIcon, PhoneIcon, PinIcon } from './icons'
import { Flag, Stars } from './motifs'
import { OpenBadge, Wordmark } from './ui'

const NAV: Page[] = ['home', 'menu', 'hot-bar', 'catering', 'gallery', 'about', 'visit']

function useNavLabel() {
  const { t } = useLang()
  return (p: Page) =>
    ({ home: t.home, menu: t.menu, 'hot-bar': t.hotBar, catering: t.catering, gallery: t.gallery, about: t.about, visit: t.visit })[p]
}

function LangToggle() {
  const { lang, setLang, t } = useLang()
  const opts: Lang[] = ['en', 'es']
  return (
    <div className="lang" role="group" aria-label={t.langLabel}>
      {opts.map((o) => (
        <button key={o} type="button" aria-pressed={lang === o} onClick={() => setLang(o)} lang={o}>
          {o.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

export function Header({ page }: { page: Page }) {
  const { t } = useLang()
  const label = useNavLabel()
  const [open, setOpen] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.classList.add('no-scroll')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('no-scroll')
    }
  }, [open])

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a className="site-header__brand" href={href('home')}>
          <Wordmark />
        </a>
        <nav className="site-nav" aria-label="Main">
          {NAV.slice(1).map((p) => (
            <a key={p} href={href(p)} aria-current={page === p ? 'page' : undefined}>
              {label(p)}
            </a>
          ))}
        </nav>
        <div className="site-header__actions">
          <LangToggle />
          <a className="btn btn--call header-call" href={SITE.phoneHref} aria-label={t.callAria}>
            <PhoneIcon /> <span>{SITE.phoneDisplay}</span>
          </a>
          <button type="button" className="icon-btn menu-btn" aria-expanded={open} aria-controls="drawer" onClick={() => setOpen(true)}>
            <MenuIcon />
            <span className="sr-only">{t.menuButton}</span>
          </button>
        </div>
      </div>

      {open && (
        <div className="drawer-backdrop" onClick={() => setOpen(false)}>
          <div id="drawer" className="drawer" role="dialog" aria-modal="true" aria-label={t.menuButton} onClick={(e) => e.stopPropagation()}>
            <div className="drawer__top">
              <Wordmark />
              <button ref={closeRef} type="button" className="icon-btn" onClick={() => setOpen(false)}>
                <CloseIcon />
                <span className="sr-only">{t.closeMenu}</span>
              </button>
            </div>
            <nav aria-label="Main">
              {NAV.map((p) => (
                <a key={p} href={href(p)} aria-current={page === p ? 'page' : undefined} onClick={() => setOpen(false)}>
                  {label(p)}
                </a>
              ))}
            </nav>
            <div className="drawer__foot">
              <OpenBadge />
              <a className="btn btn--call" href={SITE.phoneHref} aria-label={t.callAria}>
                <PhoneIcon /> {SITE.phoneDisplay}
              </a>
              <Stars className="drawer__stars" size={56} />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

/** Phones only: a slim bar pinned to the bottom — the menu first, calling second. */
export function BottomBar() {
  const { t } = useLang()
  return (
    <div className="bottom-bar">
      <a className="btn btn--primary" href={href('menu')}>
        {t.seeMenu}
      </a>
      <a className="btn btn--call btn--icon" href={SITE.phoneHref} aria-label={t.callAria}>
        <PhoneIcon />
      </a>
    </div>
  )
}

export function Footer() {
  const { t } = useLang()
  const label = useNavLabel()
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <Wordmark />
          <p>{t.footerTag}</p>
          <Flag />
        </div>
        <ul className="site-footer__facts">
          <li>
            <PinIcon />
            <span>{fullAddress}</span>
          </li>
          <li>
            <PhoneIcon />
            <a href={SITE.phoneHref} aria-label={t.callAria}>
              {SITE.phoneDisplay}
            </a>
          </li>
          <li>
            <ClockIcon />
            <HoursSummary />
          </li>
          <li>
            <InstagramIcon />
            <a href={SITE.instagram} rel="noopener">
              {t.instagram} <span className="muted-light">({t.comingSoon})</span>
            </a>
          </li>
        </ul>
        <nav className="site-footer__nav" aria-label="Footer">
          {NAV.map((p) => (
            <a key={p} href={href(p)}>
              {label(p)}
            </a>
          ))}
        </nav>
      </div>
      <p className="site-footer__rules">
        <Stars size={28} /> {t.footerRules}
      </p>
    </footer>
  )
}
