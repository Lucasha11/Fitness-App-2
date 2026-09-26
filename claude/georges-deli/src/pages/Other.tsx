import { ABOUT, directionsUrl, fullAddress, GALLERY, mapEmbedUrl, SITE } from '../data/site'
import { HoursTable } from '../components/HoursTable'
import { BagIcon, ClockIcon, PhoneIcon, PinIcon } from '../components/icons'
import { StarDivider } from '../components/motifs'
import { CallButton, HotBarPrices, HotBarToday, Leaves, OpenBadge, Photo, Steps } from '../components/ui'
import { useLang } from '../i18n'
import { href } from '../lib/route'

function PageHead({ title, intro, kicker }: { title: string; intro: string; kicker?: string }) {
  return (
    <section className="page-head">
      <Leaves />
      {kicker && <p className="kicker">{kicker}</p>}
      <h1>{title}</h1>
      <p>{intro}</p>
    </section>
  )
}

export function HotBarPage() {
  const { t } = useLang()
  return (
    <>
      <PageHead title={t.hotBarTitle} kicker={t.hotBarKicker} intro={t.hotBarIntro} />
      <section className="section" aria-labelledby="how-h">
        <h2 id="how-h">{t.howItWorks}</h2>
        <Steps
          steps={[
            { title: t.step1, body: t.step1Body },
            { title: t.step2, body: t.step2Body },
            { title: t.step3, body: t.step3Body },
          ]}
        />
      </section>
      <section className="section section--tight">
        <div className="hotbar-card" aria-labelledby="hb-today">
          <h2 id="hb-today">{t.todaysDishes}</h2>
          <HotBarToday />
          <h3>{t.prices}</h3>
          <HotBarPrices />
          <p className="hotbar-card__note">{t.pricesNote}</p>
        </div>
        <p className="notice">
          <BagIcon /> {t.inPersonOnly}
        </p>
      </section>
    </>
  )
}

export function CateringPage() {
  const { t } = useLang()
  return (
    <>
      <PageHead title={t.cateringTitle} intro={t.cateringIntro} />
      <section className="section" aria-labelledby="c-how">
        <h2 id="c-how">{t.howItWorks}</h2>
        <Steps
          steps={[
            { title: t.cStep1, body: t.cStep1Body },
            { title: t.cStep2, body: t.cStep2Body },
            { title: t.cStep3, body: t.cStep3Body },
          ]}
        />
        <div className="center-cta">
          <CallButton big label={t.callToOrder} />
          <p className="muted">{SITE.phoneDisplay}</p>
          <p className="rules-pill">{t.footerRules}</p>
          <a className="text-link" href={href('menu')}>
            {t.seeMenu} →
          </a>
        </div>
      </section>
    </>
  )
}

export function GalleryPage() {
  const { l, t } = useLang()
  return (
    <>
      <PageHead title={t.galleryTitle} intro={t.galleryIntro} />
      <section className="section">
        <ul className="gallery">
          {GALLERY.map((g) => (
            <li key={g.caption.en}>
              <figure>
                <Photo src={g.photo} alt={l(g.caption)} placeholderLabel={`${t.photoComing}: ${l(g.caption)}`} />
                <figcaption>{l(g.caption)}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

export function AboutPage() {
  const { l, t } = useLang()
  return (
    <>
      <PageHead title={t.aboutTitle} intro={t.aboutKicker} />
      <section className="section about">
        <Photo className="about__photo" src={SITE.aboutPhoto} alt={t.aboutPhotoAlt} placeholderLabel={`${t.photoComing}: ${t.aboutPhotoAlt}`} />
        <div className="about__text">
          {ABOUT.map((p) => (
            <p key={p.en}>{l(p)}</p>
          ))}
          <p className="about__sign">— George’s Deli</p>
          <a className="btn btn--primary" href={href('menu')}>
            {t.seeMenu}
          </a>
        </div>
      </section>
    </>
  )
}

export function VisitPage() {
  const { t } = useLang()
  return (
    <>
      <PageHead title={t.visitTitle} intro={t.visitIntro} />
      <section className="section visit">
        <div className="visit__facts">
          <OpenBadge />
          <h2>{t.address}</h2>
          <p className="fact">
            <PinIcon /> <span>{fullAddress}</span>
          </p>
          <a className="btn btn--outline" href={directionsUrl} target="_blank" rel="noopener">
            {t.getDirections}
          </a>
          <h2>{t.phone}</h2>
          <p className="fact">
            <PhoneIcon />
            <a href={SITE.phoneHref} aria-label={t.callAria}>
              {SITE.phoneDisplay}
            </a>
          </p>
          <h2>
            <ClockIcon /> {t.hours}
          </h2>
          <HoursTable />
          <h2>{t.howToOrder}</h2>
          <p className="rules-pill">{t.orderRules}</p>
          <p className="muted">{t.inPersonOnly}</p>
        </div>
        <div className="visit__map">
          <iframe title={t.mapTitle} src={mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      </section>
      <StarDivider />
    </>
  )
}
