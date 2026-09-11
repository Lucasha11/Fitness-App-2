import { useEffect, useState, type ReactNode } from 'react';
import { GoalRing } from '../components/GoalRing';
import { Mascot, type MascotName } from '../components/Mascot';
import {
  BandageIcon,
  CheckIcon,
  ChevronRightIcon,
  DiceIcon,
  EyeIcon,
  FlameIcon,
  FootprintsIcon,
  HeartIcon,
  LockIcon,
  PauseIcon,
  PlayIcon,
  StopwatchIcon,
  SwapIcon,
  TargetIcon,
} from '../components/icons';
import {
  Button,
  Chip,
  ProgressBar,
  Segmented,
  TextButton,
  ToggleRow,
} from '../components/ui';
import '../onboarding/onboarding.css';
import { LinearTimer, RingTimer } from '../player/timers';
import { TabBar } from '../today/Today';
import './design-system.css';
import {
  COLOR_TOKENS,
  RADIUS_TOKENS,
  SHADOW_TOKENS,
  type TokenSpec,
  tokenValue,
} from './tokens';

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'colors', label: 'Colors' },
  { id: 'type', label: 'Typography' },
  { id: 'shape', label: 'Radius & elevation' },
  { id: 'icon', label: 'Iconography & mascot' },
  { id: 'buttons', label: 'Buttons' },
  { id: 'chips', label: 'Badges & chips' },
  { id: 'cards', label: 'Cards' },
  { id: 'progress', label: 'Progress & rings' },
  { id: 'stats', label: 'Streaks & stats' },
  { id: 'nav', label: 'Navigation' },
  { id: 'banners', label: 'Banners & states' },
  { id: 'extend', label: 'Extending the system' },
];

export function DesignSystem() {
  const active = useActiveSection(SECTIONS.map((section) => section.id));

  return (
    <div className="ds">
      <nav className="ds__nav" aria-label="Sections">
        <div className="ds__brand">
          <div className="ds__mark" />
          <div className="ds__brand-name">
            MoveMate
            <br />
            <span className="ds__brand-sub">Design System</span>
          </div>
        </div>
        <div className="ds__links">
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              className="ds__link"
              href={`#${section.id}`}
              aria-current={active === section.id}
            >
              {section.label}
            </a>
          ))}
        </div>
      </nav>

      <main className="ds__main">
        <Overview />
        <Colors />
        <Typography />
        <Shape />
        <Iconography />
        <Buttons />
        <Chips />
        <Cards />
        <Progress />
        <Stats />
        <Navigation />
        <Banners />
        <Extending />
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

function Section({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="ds__section">
      <h2 className="ds__h2">{title}</h2>
      <p className="ds__intro">{intro}</p>
      {children}
    </section>
  );
}

/** A "built" / "open gap" marker, so the page states its own coverage. */
function Status({ built, children }: { built: boolean; children: ReactNode }) {
  return (
    <span className={`ds__status ds__status--${built ? 'built' : 'open'}`}>
      {children}
    </span>
  );
}

/** Highlights the link for whichever section is currently on screen. */
function useActiveSection(ids: string[]): string {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      // Only count a section once it reaches the upper third of the viewport.
      { rootMargin: '0px 0px -66% 0px' },
    );

    for (const id of ids) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

const PRINCIPLES = [
  {
    title: 'Energetic, not clinical',
    body: 'A panda coach, streaks and a segmented goal ring — motivation reads as encouragement, never as a scolding.',
  },
  {
    title: 'Loud type, soft shapes',
    body: 'Nunito at black and extra-bold weights, paired with generously rounded corners. Nothing sharp-cornered ships.',
  },
  {
    title: 'Mobile-first',
    body: 'A single-column phone shell with a bottom tab bar; on a wide screen it sits inside a 390×844 frame.',
  },
];

function Overview() {
  return (
    <section id="overview" className="ds__section">
      <div className="ds__eyebrow-pill">Design system · v1</div>
      <h1 className="ds__h1">MoveMate</h1>
      <p className="ds__lede">
        A playful movement-reminder app. A panda coach nudges you to stand,
        stretch and move — every screen is bold, rounded, and a little bit silly
        on purpose.
      </p>
      <div className="ds__grid ds__grid--3">
        {PRINCIPLES.map((principle) => (
          <div key={principle.title} className="ds__card">
            <div className="ds__card-title">{principle.title}</div>
            <div className="ds__card-body">{principle.body}</div>
          </div>
        ))}
      </div>
      <p className="ds__note">
        Every specimen below is rendered with the app&rsquo;s own components and
        tokens rather than copied markup, and the colour values are read from
        the live stylesheet — so this page cannot drift away from the build.
      </p>
    </section>
  );
}

function Swatch({ token }: { token: TokenSpec }) {
  return (
    <div>
      <div
        className={`ds__swatch-chip${token.outlined ? ' ds__swatch-chip--outlined' : ''}`}
        style={{ background: `var(${token.name})` }}
      />
      <div className="ds__swatch-name">{token.name}</div>
      <div className="ds__swatch-value">{tokenValue(token.name)}</div>
      <div className="ds__swatch-use">{token.use}</div>
    </div>
  );
}

function Colors() {
  return (
    <Section
      id="colors"
      title="Colors"
      intro="All tokens are defined in oklch. Warm off-white base, coral-orange primary, soft green secondary, lavender accent, deep plum for emphasis surfaces, and amber for the sitting warning."
    >
      <div className="ds__grid ds__grid--4">
        {COLOR_TOKENS.map((token) => (
          <Swatch key={token.name} token={token} />
        ))}
      </div>
      <p className="ds__note">
        <code>--warning</code> is the amber the brief asks for in §2 —
        &ldquo;never use red as the primary alert&rdquo;. It ships as a wash
        behind the sitting indicator with <code>--warning-strong</code> on the
        dot. <code>--danger</code> stays reserved: no destructive action exists
        in the app yet.
      </p>
      <p className="ds__note">
        Dark mode is an open gap, not a finished mode
        <Status built={false}>Not started</Status> — the break player is the only
        dark surface, and it uses its own <code>--player-gradient</code> rather
        than a full dark palette.
      </p>
    </Section>
  );
}

const TYPE_SPECIMENS = [
  { text: 'Your panda hates chairs', size: 40, weight: 900, meta: '40px · black 900 · screen titles' },
  { text: 'Keep the streak alive', size: 24, weight: 900, meta: '20–24px · black 900 · section headings' },
  { text: 'Desk squats', size: 15, weight: 900, meta: '14–15px · black 900 · card and row titles' },
  { text: 'You’ve been sitting for 52 minutes', size: 13, weight: 700, meta: '13px · bold 700 · supporting copy', muted: true },
  { text: "Today's progress", size: 11, weight: 800, meta: '11–12px · extra-bold 800, uppercase · eyebrow labels', muted: true, upper: true },
  { text: 'Day streak', size: 10, weight: 900, meta: '9–10px · black 900, uppercase · micro stat labels', muted: true, upper: true },
];

function Typography() {
  return (
    <Section
      id="type"
      title="Typography"
      intro="One family, Nunito, used across the full weight range — the boldness of the type does most of the energetic work."
    >
      <div className="ds__specimen">
        {TYPE_SPECIMENS.map((specimen) => (
          <div key={specimen.meta} className="ds__specimen-row">
            <div
              style={{
                fontSize: specimen.size,
                fontWeight: specimen.weight,
                color: specimen.muted ? 'var(--ink-muted)' : undefined,
                textTransform: specimen.upper ? 'uppercase' : undefined,
                letterSpacing: specimen.upper ? '0.04em' : undefined,
              }}
            >
              {specimen.text}
            </div>
            <div className="ds__specimen-meta">{specimen.meta}</div>
          </div>
        ))}
      </div>
      <p className="ds__note">
        Rule of thumb: never drop below weight 700 for anything that isn&rsquo;t
        a long paragraph — the whole UI reads as bold by design. Line-heights
        stay tight on numerals and relaxed on paragraph copy.
      </p>
    </Section>
  );
}

function Shape() {
  return (
    <Section
      id="shape"
      title="Radius & elevation"
      intro="Radii scale from 12px tags up to the 40px phone shell. Shadows are always plum-tinted, never neutral grey."
    >
      <div className="ds__grid ds__grid--5" style={{ marginBottom: 24 }}>
        {RADIUS_TOKENS.map((token) => (
          <div key={token.name} className="ds__radius">
            <div
              className="ds__radius-block"
              style={{ borderRadius: `var(${token.name})` }}
            />
            <div className="ds__radius-name">
              {token.name.replace('--radius-', '')} · {tokenValue(token.name)}
            </div>
            <div className="ds__swatch-use">{token.use}</div>
          </div>
        ))}
      </div>

      <div className="ds__grid ds__grid--4">
        {SHADOW_TOKENS.map((token) => (
          <div
            key={token.name}
            className="ds__card"
            style={{ boxShadow: `var(${token.name})` }}
          >
            <div className="ds__card-title">
              {token.name.replace('--shadow-', 'shadow-')}
            </div>
            <div className="ds__card-body">{token.use}</div>
          </div>
        ))}
      </div>

      <p className="ds__note">
        Two gradients carry the brand: <code>--header-gradient</code> at 135°
        behind Today&rsquo;s header, and <code>--warm-gradient</code> at 165°
        for full-screen moments like A1 and the break-complete screen.
      </p>
    </Section>
  );
}

const MASCOTS: MascotName[] = [
  'lifting',
  'walking',
  'pullups',
  'squats',
  'thumbsup',
  'water',
];

const ICON_SAMPLES = [
  { Icon: TargetIcon, name: 'Today' },
  { Icon: PlayIcon, name: 'Start' },
  { Icon: PauseIcon, name: 'Pause' },
  { Icon: SwapIcon, name: 'Swap' },
  { Icon: FlameIcon, name: 'Streak' },
  { Icon: StopwatchIcon, name: 'Duration' },
  { Icon: EyeIcon, name: 'Eye break' },
  { Icon: BandageIcon, name: 'Something hurts' },
  { Icon: FootprintsIcon, name: 'Motion' },
  { Icon: HeartIcon, name: 'Health' },
  { Icon: LockIcon, name: 'Privacy' },
  { Icon: DiceIcon, name: 'Surprise me' },
];

function Iconography() {
  return (
    <Section
      id="icon"
      title="Iconography & mascot"
      intro="Line icons at 14–22px with a 2px stroke and no fill, drawn in one place so they inherit currentColor. The panda coach is the only illustrated element — never mix in another illustration style."
    >
      <div className="ds__row" style={{ marginBottom: 20 }}>
        {ICON_SAMPLES.map(({ Icon, name }) => (
          <div key={name} style={{ textAlign: 'center', width: 84 }}>
            <div className="ds__card" style={{ padding: 14 }}>
              <Icon size={20} />
            </div>
            <div className="ds__swatch-use">{name}</div>
          </div>
        ))}
      </div>

      <div className="ds__mascots">
        {MASCOTS.map((name) => (
          <div key={name} className="ds__mascot">
            <Mascot name={name} size={100} alt={`Panda coach, ${name}`} />
          </div>
        ))}
      </div>

      <p className="ds__note">
        Pattern: the mascot sits on a soft mint circle with a gentle 3.2s bob
        (skipped under reduced motion). The break player picks the pose from the
        exercise&rsquo;s body area, so the figure always matches the movement. A
        parallel <code>squirrel-*</code> asset set exists for an alternate coach
        — swap consistently, never mix species on one screen.
      </p>
    </Section>
  );
}

function Buttons() {
  return (
    <Section
      id="buttons"
      title="Buttons"
      intro="Rounded, font-black, 120ms transitions, pressing scales to 98%. Primary buttons are full-width and pinned to the bottom of a screen; the variants below are width-constrained for display only."
    >
      <div className="ds__row">
        {(['primary', 'inverse', 'dark', 'outline'] as const).map((variant) => (
          <div key={variant} className="ds__button-cell">
            <div
              style={
                variant === 'inverse'
                  ? {
                      background: 'var(--warm-gradient)',
                      borderRadius: 'var(--radius-control)',
                      padding: 10,
                      display: 'grid',
                    }
                  : { display: 'grid' }
              }
            >
              <Button variant={variant} onClick={() => {}}>
                {variant[0].toUpperCase() + variant.slice(1)}
              </Button>
            </div>
            <div className="ds__swatch-use" style={{ marginTop: 6 }}>
              {variant === 'primary' && 'Every screen’s main CTA'}
              {variant === 'inverse' && 'On warm gradient grounds'}
              {variant === 'dark' && 'Continue with Apple'}
              {variant === 'outline' && 'Secondary account actions'}
            </div>
          </div>
        ))}

        <div className="ds__button-cell">
          <div style={{ display: 'grid' }}>
            <Button onClick={() => {}} disabled>
              Disabled
            </Button>
          </div>
          <div className="ds__swatch-use" style={{ marginTop: 6 }}>
            Gates a step until it is answered
          </div>
        </div>

        <div className="ds__button-cell">
          <div style={{ display: 'grid' }}>
            <TextButton onClick={() => {}}>Text button</TextButton>
          </div>
          <div className="ds__swatch-use" style={{ marginTop: 6 }}>
            The quiet way past a screen
          </div>
        </div>
      </div>

      <p className="ds__note">
        There is one button system, not two. Anything that needs a different
        shape — the player&rsquo;s circular transport control, Today&rsquo;s
        split Start/Snooze pair, the raised Break tab — is its own named
        component rather than another button variant.
      </p>
    </Section>
  );
}

function Chips() {
  return (
    <Section
      id="chips"
      title="Badges & chips"
      intro="Fully rounded, font-black, used for focus areas, durations and streak counts."
    >
      <div className="ds__stack">
        <div>
          <div className="ds__label">Selectable chips — selected / unselected</div>
          <div className="chip-wrap" style={{ marginTop: 0 }}>
            <Chip selected onClick={() => {}}>
              Neck
            </Chip>
            <Chip selected={false} onClick={() => {}}>
              Shoulders
            </Chip>
            <Chip selected={false} onClick={() => {}}>
              Wrists
            </Chip>
            <Chip selected={false} disabled onClick={() => {}}>
              At the limit
            </Chip>
          </div>
        </div>

        <div>
          <div className="ds__label">Static tags — one tone per meaning</div>
          <div className="ds__row">
            <span className="chip chip--static">Neck</span>
            <span className="mini-chip mini-chip--area">Shoulders</span>
            <span className="mini-chip">45 sec</span>
            <span className="intro__chip" style={{ background: 'var(--violet)', color: 'var(--ink-on-accent)' }}>
              Mobility
            </span>
          </div>
        </div>

        <div>
          <div className="ds__label">Streak chip & completion bubbles</div>
          <div className="ds__row">
            <span className="streak">
              <FlameIcon size={16} />7
            </span>
            <span className="tl-row__state" style={{ background: 'var(--accent)', color: 'var(--ink-on-accent)' }}>
              <CheckIcon size={15} />
            </span>
            <span className="tl-row__state">
              <CheckIcon size={15} />
            </span>
            <span className="tl-row__state" style={{ background: 'var(--lime)', color: 'var(--lime-ink)' }}>
              <PlayIcon size={13} />
            </span>
          </div>
        </div>

        <div>
          <div className="ds__label">Segmented control</div>
          <div style={{ maxWidth: 340 }}>
            <Segmented
              label="Example"
              value="moderate"
              onChange={() => {}}
              options={[
                { value: 'gentle', label: 'Gentle' },
                { value: 'moderate', label: 'Moderate' },
                { value: 'energetic', label: 'Energetic' },
              ]}
            />
          </div>
        </div>

        <div>
          <div className="ds__label">Toggle row</div>
          <div className="rows" style={{ maxWidth: 340 }}>
            <ToggleRow
              title="Use motion & step data"
              subtitle="Detect sitting streaks"
              icon={<FootprintsIcon size={19} />}
              iconBackground="var(--lime)"
              iconColor="var(--lime-ink)"
              on
              onToggle={() => {}}
            />
            <ToggleRow title="Seated only" lightTitle on={false} onToggle={() => {}} />
          </div>
        </div>
      </div>
    </Section>
  );
}

function Cards() {
  return (
    <Section
      id="cards"
      title="Cards"
      intro="28px radius, plum-tinted shadow, white on the warm canvas. Sheets are the same recipe anchored to the bottom of the shell with a drag handle."
    >
      <div className="ds__grid" style={{ gridTemplateColumns: '1.3fr 1fr' }}>
        <div className="next-card">
          <div className="next-card__top">
            <div className="next-card__text">
              <div className="next-card__eyebrow">NEXT BREAK IN 24 MIN</div>
              <h3 className="next-card__name">Shoulder rolls</h3>
              <div className="next-card__chips">
                <span className="mini-chip mini-chip--area">Shoulders</span>
                <span className="mini-chip">45 sec</span>
              </div>
            </div>
            <div className="next-card__art bob">
              <Mascot name="thumbsup" size={70} alt="" />
            </div>
          </div>
          <div className="next-card__actions">
            <button type="button" className="next-card__start">
              Start now
            </button>
            <button type="button" className="next-card__snooze">
              Snooze
            </button>
          </div>
        </div>

        <div className="card card--strong">
          <div className="eyebrow">Stat card</div>
          <div className="summary__value" style={{ fontSize: 28, marginTop: 6 }}>
            68%
          </div>
          <div className="summary__label">OF DAILY GOAL</div>
        </div>
      </div>

      <div style={{ marginTop: 16, maxWidth: 520 }}>
        <div className="ds__label">Sheet header</div>
        <div
          className="sheet"
          style={{ position: 'static', borderRadius: 'var(--radius-sheet)' }}
        >
          <div className="sheet__grabber" />
          <h3 className="sheet__title">How was that?</h3>
          <p className="sheet__sub">One tap. No typing, we promise.</p>
        </div>
      </div>
    </Section>
  );
}

function Progress() {
  return (
    <Section
      id="progress"
      title="Progress & rings"
      intro="Three shapes, each with a job: the segmented goal ring counts breaks, the timer ring drains through an exercise, and a flat bar carries anything nested in a row."
    >
      <div className="ds__on-gradient" style={{ marginBottom: 16 }}>
        <GoalRing done={3} goal={6} />
      </div>

      <div className="ds__on-dark" style={{ marginBottom: 16 }}>
        <div style={{ width: 200 }}>
          <RingTimer remaining={28} progress={0.38} />
        </div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <LinearTimer name="Shoulder rolls" remaining={28} progress={0.38} />
        </div>
      </div>

      <div className="ds__progress">
        <div className="ds__bar-block">
          <div className="ds__bar-labels">
            <span>Setup progress</span>
            <span className="ds__bar-left">62%</span>
          </div>
          <ProgressBar percent={62} />
        </div>
      </div>

      <p className="ds__note">
        The goal ring is drawn one arc per break rather than as a continuous
        sweep, so a completed break is visibly its own segment — the geometry
        lives in <code>components/goal-ring.ts</code> and is shared by
        Today&rsquo;s header and the A10 stepper. The timer rings are SVG
        strokes, not conic gradients, because they animate a single value and
        need a rounded cap.
      </p>
    </Section>
  );
}

const CALENDAR = [
  { day: 17, state: 'met' },
  { day: 18, state: 'partial' },
  { day: 19, state: 'rest' },
  { day: 20, state: 'met', today: true },
  { day: 21, state: 'met' },
  { day: 22, state: 'future' },
  { day: 23, state: 'future' },
] as const;

const LEGEND = [
  { label: 'Goal met', color: 'var(--accent)' },
  { label: 'Partial', color: 'var(--lime)' },
  { label: 'Rest', color: 'var(--fill)' },
];

const STATS = [
  { value: '7', label: 'DAY STREAK' },
  { value: '12', label: 'BEST STREAK' },
  { value: '18', label: 'GOALS MET' },
];

function Stats() {
  return (
    <Section
      id="stats"
      title="Streaks & stats"
      intro="A four-tone system marks calendar completion: goal met, partial, rest, and future."
    >
      <div className="ds__calendar">
        {CALENDAR.map((entry) => (
          <span
            key={entry.day}
            className="ds__day"
            data-state={entry.state}
            data-today={'today' in entry ? true : undefined}
          >
            {entry.day}
          </span>
        ))}
      </div>

      <div className="ds__legend">
        {LEGEND.map((item) => (
          <span key={item.label} className="ds__legend-item">
            <span className="ds__legend-dot" style={{ background: item.color }} />
            {item.label}
          </span>
        ))}
      </div>

      <div className="ds__grid ds__grid--3" style={{ maxWidth: 420 }}>
        {STATS.map((stat) => (
          <div key={stat.label} className="ds__stat">
            <div className="ds__stat-value">{stat.value}</div>
            <div className="ds__stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <p className="ds__note">
        Today&rsquo;s weekly body-coverage strip uses the same three-step
        intensity: accent for twice or more, lime for once, muted for untouched.
        The calendar itself belongs to Insights
        <Status built={false}>Section H, not built</Status>.
      </p>
    </Section>
  );
}

function Navigation() {
  return (
    <Section
      id="nav"
      title="Navigation"
      intro="A bottom tab bar floating over content on blurred white, with the active tab tinted behind a muted pill and the Break button raised out of the bar."
    >
      <div className="ds__tabbar-frame">
        <TabBar onBreak={() => {}} />
      </div>
      <p className="ds__note">
        The raised centre button is the most important control in the app: one
        tap starts a break from anywhere, with no intermediate screen. Library,
        Insights and You are disabled until those sections exist
        <Status built={false}>Sections D, H, I</Status>.
      </p>
    </Section>
  );
}

function Banners() {
  return (
    <Section
      id="banners"
      title="Banners & states"
      intro="Three tones now carry state: plum for scheduled information, amber for the sitting warning, and a reserved destructive red."
    >
      <div className="ds__banners">
        <div className="ds__banner ds__banner--plum">
          <div className="ds__banner-icon">
            <StopwatchIcon size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="ds__banner-title">Next nudge at 11:30</div>
            <div className="ds__banner-body">A gentle reminder in 28 minutes</div>
          </div>
          <span className="ds__banner-action">Snooze</span>
        </div>

        <button type="button" className="sitting sitting--warning">
          <span className="sitting__dot" />
          <span className="sitting__label">
            You&rsquo;ve been sitting for 52 minutes
          </span>
          <ChevronRightIcon size={16} className="sitting__chevron" />
        </button>

        <div className="ds__banner ds__banner--error">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0 }}
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
          </svg>
          <div style={{ flex: 1 }}>
            <div className="ds__banner-title">Destructive — not yet used</div>
            <div className="ds__banner-body">
              Reserved token, styled here for consistency
            </div>
          </div>
        </div>
      </div>

      <p className="ds__note">
        The amber row is the real sitting indicator, not a copy of it — it turns
        from muted to amber past the 45-minute threshold. Info and success tones
        are still open gaps
        <Status built={false}>Open</Status>; the toast used after break feedback
        is the closest thing to a success state today.
      </p>
    </Section>
  );
}

const EXTENSIONS = [
  {
    title: 'A real warning token',
    built: true,
    body: 'Shipped as --warning (amber, the value the system prescribed) plus --warning-strong for the indicator dot and --warning-wash for its background. Neither highlight nor destructive was repurposed.',
  },
  {
    title: 'Break player & timer ring',
    built: true,
    body: 'The player scales the ring pattern up — larger diameter, 20px stroke, big numeral centre — rather than inventing a new progress shape. It is an SVG stroke rather than a conic gradient, because a draining ring needs a rounded cap the gradient cannot give.',
  },
  {
    title: 'Sheets (feedback, ended early)',
    built: true,
    body: 'Both reuse the card recipe anchored to the bottom of the shell with a drag-handle bar. No new radius or shadow was needed.',
  },
  {
    title: 'Schedule editor & day toggles',
    built: true,
    body: 'A8 reuses the day-cell chip pattern for the weekly picker rather than a checkbox row, and pairs it with two tappable time cards over native pickers.',
  },
  {
    title: 'Still missing from the brief’s Section L',
    built: false,
    body: 'Segmented control, stepper-with-ring, toggle row and sheet header now exist. Slider with labelled stops, empty-state block, and info/success banner tones are still unbuilt — design each once, add it here, then reuse.',
  },
];

function Extending() {
  return (
    <Section
      id="extend"
      title="Extending the system"
      intro="The brief sketches a much larger product — library, insights, programs, reminder settings. Keep MoveMate's playful language as those get built; don't drift towards the brief's calmer mood. Where this page previously listed gaps, it now records what closed them."
    >
      <div className="ds__stack" style={{ maxWidth: 720 }}>
        {EXTENSIONS.map((item) => (
          <div key={item.title} className="ds__card" style={{ padding: 16 }}>
            <div className="ds__card-title">
              {item.title}
              <Status built={item.built}>{item.built ? 'Built' : 'Open'}</Status>
            </div>
            <div className="ds__card-body">{item.body}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}
