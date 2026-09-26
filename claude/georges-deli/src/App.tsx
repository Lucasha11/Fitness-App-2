import { useEffect, useState } from 'react'
import { BottomBar, Footer, Header } from './components/Layout'
import { useLang } from './i18n'
import { parseRoute, type Page } from './lib/route'
import { Home } from './pages/Home'
import { Menu } from './pages/Menu'
import { AboutPage, CateringPage, GalleryPage, HotBarPage, VisitPage } from './pages/Other'

function useRoute() {
  const [route, setRoute] = useState(() => parseRoute(location.hash))
  useEffect(() => {
    const onHash = () => setRoute(parseRoute(location.hash))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return route
}

function setMeta(selector: string, content: string) {
  document.querySelector(selector)?.setAttribute('content', content)
}

export default function App() {
  const route = useRoute()
  const { t } = useLang()

  const meta: Record<Page, [string, string]> = {
    home: [`George’s Deli · ${t.tagline}`, t.metaHome],
    menu: [`${t.menuTitle} · George’s Deli`, t.metaMenu],
    'hot-bar': [`${t.hotBarTitle} · George’s Deli`, t.metaHotBar],
    catering: [`${t.catering} · George’s Deli`, t.metaCatering],
    gallery: [`${t.galleryTitle} · George’s Deli`, t.metaGallery],
    about: [`${t.aboutTitle} · George’s Deli`, t.metaAbout],
    visit: [`${t.visitTitle} · George’s Deli`, t.metaVisit],
  }
  const [title, description] = meta[route.page]

  useEffect(() => {
    document.title = title
    setMeta('meta[name="description"]', description)
    setMeta('meta[property="og:title"]', title)
    setMeta('meta[property="og:description"]', description)
  }, [title, description])

  // A new page starts at the top — unless it is the menu opening at a dish.
  useEffect(() => {
    if (!route.item && !route.section) window.scrollTo(0, 0)
    document.getElementById('main')?.focus({ preventScroll: true })
  }, [route.page, route.item, route.section])

  return (
    <>
      <a className="skip-link" href="#main" onClick={(e) => (e.preventDefault(), document.getElementById('main')?.focus())}>
        {t.skip}
      </a>
      <Header page={route.page} />
      <main id="main" tabIndex={-1}>
        {route.page === 'home' && <Home />}
        {route.page === 'menu' && <Menu route={route} />}
        {route.page === 'hot-bar' && <HotBarPage />}
        {route.page === 'catering' && <CateringPage />}
        {route.page === 'gallery' && <GalleryPage />}
        {route.page === 'about' && <AboutPage />}
        {route.page === 'visit' && <VisitPage />}
      </main>
      <Footer />
      <BottomBar />
    </>
  )
}
