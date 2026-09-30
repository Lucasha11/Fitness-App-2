import type { ReactNode } from 'react';
import {
  CarIcon,
  ChairIcon,
  CheckIcon,
  ChevronLeftIcon,
  ClockIcon,
  GraduationIcon,
  HeartIcon,
  HomeIcon,
  LockIcon,
  MonitorIcon,
  PersonIcon,
  SofaIcon,
  TrophyIcon,
} from '../../components/icons';
import { Mascot, type MascotName } from '../../components/Mascot';
import {
  Button,
  Screen,
  ScreenBody,
  ScreenFooter,
  Spacer,
  TextButton,
} from '../../components/ui';
import { EXERCISES } from '../../exercises';
import '../onboarding.css';
import './mockups.css';

/*
 * The proposed onboarding, drawn as static phone frames.
 *
 * Every screen is built from the app's own primitives (Screen, Button,
 * option cards, the plan rows) and its tokens, so the board
 * cannot drift from the design system. The few new pieces the redesign needs
 * (the trail, the score pill, the coach's reaction line, the plan picker) are
 * defined here once and reused across frames, ready to be lifted into
 * `components/` when the flow is built.
 *
 * Nothing on the board is wired: a frame is one state of one screen.
 */

/* ------------------------------------------------------------------ */
/* The five chapters                                                   */
/* ------------------------------------------------------------------ */

const STAGES = ['The ache', 'The fix', 'Your plan', 'Unlock'];

/** Numbers the frames quote, so the copy and the maths can't disagree. */
const SAT_HOURS = 8;
const WORKDAYS_A_YEAR = 240;
const CHAIR_HOURS_A_YEAR = SAT_HOURS * WORKDAYS_A_YEAR;
const CHAIR_DAYS_A_YEAR = Math.round(CHAIR_HOURS_A_YEAR / 24);

/* Placeholder prices until the App Store products exist. */
const PRICES = {
  yearly: 39.99,
  monthly: 7.99,
  lifetime: 79.99,
};
const TRIAL_DAYS = 7;
const YEARLY_SAVING = Math.round(
  (1 - PRICES.yearly / (PRICES.monthly * 12)) * 100,
);

function money(value: number): string {
  return `$${value.toFixed(2)}`;
}

/* ------------------------------------------------------------------ */
/* New primitives the redesign introduces                              */
/* ------------------------------------------------------------------ */

/**
 * The trail across the top of every non-hero screen: five stops, one per
 * chapter. It replaces the thin progress rail, so the user can see how much
 * is left in terms they understand ("two stops to go") rather than a bar.
 */
function Trail({ stage, back = true }: { stage: number; back?: boolean }) {
  return (
    <div className="mk-trail-row">
      {back ? (
        <span className="mk-back" aria-hidden="true">
          <ChevronLeftIcon size={20} />
        </span>
      ) : null}
      <ol className="mk-trail" aria-label={`Stop ${stage + 1} of ${STAGES.length}`}>
        {STAGES.map((name, index) => (
          <li
            key={name}
            className="mk-trail__stop"
            data-state={
              index < stage ? 'done' : index === stage ? 'current' : 'ahead'
            }
            title={name}
          >
            <span className="mk-trail__node">
              {index < stage ? <CheckIcon size={11} /> : null}
            </span>
          </li>
        ))}
      </ol>
      <span className="mk-trail__label">{STAGES[stage]}</span>
    </div>
  );
}

/**
 * You vs. The Chair, the running score the whole flow plays for. It is the
 * same contest Insights keeps once the app is in use, so the game onboarding
 * teaches is the game the app actually plays.
 */
function ScorePill({
  you,
  chair,
  onWarm = false,
}: {
  you: number;
  chair: number;
  onWarm?: boolean;
}) {
  const leader = you > chair ? 'you' : you < chair ? 'chair' : 'tied';
  return (
    <div
      className={`mk-score${onWarm ? ' mk-score--warm' : ''}`}
      aria-label={`You ${you}, The Chair ${chair}`}
    >
      <span className="mk-score__side" data-leading={leader === 'you'}>
        <PersonIcon size={15} />
        You <b>{you}</b>
      </span>
      <span className="mk-score__vs">vs</span>
      <span className="mk-score__side" data-leading={leader === 'chair'}>
        <b>{chair}</b> Chair
        <ChairIcon size={15} />
      </span>
    </div>
  );
}

/*
 * The avatar is a head-and-shoulders crop of the full pose. Every keyframe
 * pose stands on the same baseline of an 800px canvas, but the seated one
 * starts lower, so it needs a deeper lift to put its face in the circle.
 */
const AVATAR_SIZE = 110;
const AVATAR_LIFT: Partial<Record<MascotName, number>> = { sit: -15 };
const DEFAULT_LIFT = -9;

/** The coach answering the last tap, so every question gets a reaction. */
function CoachSays({
  pose = 'stand',
  children,
}: {
  pose?: MascotName;
  children: ReactNode;
}) {
  return (
    <div className="mk-says">
      <span className="mk-says__face">
        <span style={{ top: AVATAR_LIFT[pose] ?? DEFAULT_LIFT }}>
          <Mascot name={pose} size={AVATAR_SIZE} />
        </span>
      </span>
      <p className="mk-says__bubble">{children}</p>
    </div>
  );
}

/*
 * Hand-placed rather than random, so the welcome frame reads the same on
 * every render and nothing lands on the headline: [left %, top %, turn, tone].
 */
const CONFETTI: [number, number, number, string][] = [
  [8, 9, 20, 'lime'],
  [22, 5, -30, 'mint'],
  [38, 12, 45, 'surface'],
  [61, 6, -10, 'lime'],
  [78, 11, 30, 'violet'],
  [91, 7, -40, 'mint'],
  [5, 24, 60, 'violet'],
  [93, 22, 15, 'surface'],
  [13, 38, -25, 'mint'],
  [86, 35, 50, 'lime'],
  [6, 72, 10, 'surface'],
  [95, 48, -55, 'violet'],
  [17, 16, 80, 'surface'],
  [70, 18, -70, 'mint'],
  [49, 3, 35, 'violet'],
  [30, 27, -15, 'lime'],
];

/** Flecks for the welcome screen. Decorative only. */
function Confetti() {
  return (
    <div className="mk-confetti" aria-hidden="true">
      {CONFETTI.map(([left, top, turn, tone], index) => (
        <span
          key={index}
          className={`mk-confetti__bit mk-confetti__bit--${tone}`}
          style={{
            left: `${left}%`,
            top: `${top}%`,
            transform: `rotate(${turn}deg)`,
            animationDelay: `${index * 90}ms`,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 1 · The ache                                                        */
/* ------------------------------------------------------------------ */

function Hook() {
  return (
    <Screen tone="warm" className="a1 mk-hook">
      <div className="mk-hook__art bob">
        <Mascot name="hips" size={290} />
      </div>

      <div className="mk-aches" aria-hidden="true">
        <span className="mk-ache">Stiff neck</span>
        <span className="mk-ache">Shoulders up by your ears</span>
        <span className="mk-ache">Achy lower back</span>
        <span className="mk-ache">3pm slump</span>
      </div>

      <h1 className="a1__title">
        Your body
        <br />
        aches by 3pm
      </h1>
      <p className="a1__sub">
        Not because you&rsquo;re unfit. Because you&rsquo;ve been sitting since
        nine.
      </p>

      <div className="a1__gap" aria-hidden="true" />

      <ScreenFooter>
        <Button variant="inverse" onClick={() => {}}>
          That&rsquo;s me
        </Button>
        <TextButton onWarm onClick={() => {}}>
          I already have an account
        </TextButton>
      </ScreenFooter>
    </Screen>
  );
}

const HOUR_OPTIONS = [
  { label: 'Under 4', tag: 'Light' },
  { label: '4 – 6', tag: 'Typical' },
  { label: '6 – 8', tag: 'Heavy' },
  { label: `${SAT_HOURS}+`, tag: 'Chair-bound' },
];

function SittingQuiz() {
  return (
    <Screen>
      <Trail stage={0} />
      <ScreenBody>
        <h1 className="title">How long did you sit yesterday?</h1>
        <p className="subtitle">A rough guess. The commute and the sofa count.</p>

        <div className="option-grid">
          {HOUR_OPTIONS.map((option, index) => {
            const selected = index === HOUR_OPTIONS.length - 1;
            return (
              <button
                key={option.label}
                type="button"
                className="option mk-hours"
                aria-pressed={selected}
              >
                <span className="option__head">
                  <ClockIcon />
                  {selected ? <CheckIcon size={20} /> : null}
                </span>
                <span className="mk-hours__value">
                  {option.label}
                  <small> h</small>
                </span>
                <span className="mk-hours__tag">{option.tag}</span>
              </button>
            );
          })}
        </div>

        <Spacer />
        <CoachSays pose="stand">Be honest. I&rsquo;ve seen worse.</CoachSays>
      </ScreenBody>
      <ScreenFooter>
        <Button onClick={() => {}}>See my score</Button>
      </ScreenFooter>
    </Screen>
  );
}

function Scoreboard() {
  return (
    <Screen>
      <Trail stage={0} />
      <ScreenBody>
        <span className="eyebrow mk-center mk-eyebrow-gap">Round one</span>

        <div className="card card--strong mk-versus">
          <div className="mk-versus__side">
            <span className="mk-versus__icon mk-versus__icon--you">
              <PersonIcon size={24} />
            </span>
            <span className="mk-versus__name">You</span>
            <span className="mk-versus__value">0</span>
            <span className="mk-versus__unit">breaks</span>
          </div>

          <span className="mk-versus__vs">VS</span>

          <div className="mk-versus__side" data-leading="true">
            <span className="mk-versus__crown">
              <TrophyIcon size={13} /> Leading
            </span>
            <span className="mk-versus__icon mk-versus__icon--chair">
              <ChairIcon size={24} />
            </span>
            <span className="mk-versus__name">The Chair</span>
            <span className="mk-versus__value">
              {CHAIR_HOURS_A_YEAR.toLocaleString('en-GB')}
            </span>
            <span className="mk-versus__unit">hours a year</span>
          </div>
        </div>

        <h1 className="title mk-center">
          That&rsquo;s {CHAIR_DAYS_A_YEAR} whole days a year in a chair.
        </h1>
        <p className="subtitle subtitle--lg mk-center">
          Round one goes to the chair. Let&rsquo;s even the score, one minute at a
          time.
        </p>

        <div className="art-fill bob">
          <Mascot name="crouch" size={200} />
        </div>
      </ScreenBody>
      <ScreenFooter>
        <Button onClick={() => {}}>Even the score</Button>
      </ScreenFooter>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* 2 · The fix                                                         */
/* ------------------------------------------------------------------ */

/** Six breaks spread across 9:00 to 5:30, as the default plan lays them. */
const DAY_BREAKS = [11, 24, 38, 55, 70, 86];

function BetterDay() {
  return (
    <Screen>
      <Trail stage={1} />
      <ScreenBody>
        <h1 className="title">Same desk. Better day.</h1>
        <p className="subtitle">Nothing about your job changes. Just the gaps.</p>

        <div className="card mk-day mk-day--before">
          <div className="mk-day__head">
            <span className="eyebrow">A normal day</span>
            <span className="mk-day__verdict">
              <ChairIcon size={15} /> Chair wins
            </span>
          </div>
          <div className="mk-day__rail">
            <span className="mk-day__block" style={{ left: 0, right: 0 }} />
          </div>
          <div className="mk-day__scale">
            <span>9 AM</span>
            <span>8 h 30 m without standing</span>
            <span>5:30</span>
          </div>
        </div>

        <div className="card card--strong mk-day">
          <div className="mk-day__head">
            <span className="eyebrow">With MoveMate</span>
            <span className="mk-day__verdict mk-day__verdict--you">
              <PersonIcon size={15} /> You win
            </span>
          </div>
          <div className="mk-day__rail">
            {DAY_BREAKS.map((at, index) => (
              <span
                key={at}
                className="mk-day__block"
                style={{
                  left: `${index === 0 ? 0 : DAY_BREAKS[index - 1] + 2}%`,
                  right: `${100 - at + 2}%`,
                }}
              />
            ))}
            <span
              className="mk-day__block"
              style={{ left: `${DAY_BREAKS[DAY_BREAKS.length - 1] + 2}%`, right: 0 }}
            />
            {DAY_BREAKS.map((at) => (
              <span key={`dot-${at}`} className="mk-day__break" style={{ left: `${at}%` }} />
            ))}
          </div>
          <div className="mk-day__scale">
            <span>9 AM</span>
            <span>One minute up, every 75</span>
            <span>5:30</span>
          </div>
          <div className="summary__stats mk-day__stats">
            <div>
              <div className="summary__value">6</div>
              <div className="summary__label">BREAKS</div>
            </div>
            <div>
              <div className="summary__value">6 min</div>
              <div className="summary__label">MOVING</div>
            </div>
            <div>
              <div className="summary__value">0</div>
              <div className="summary__label">GYM TRIPS</div>
            </div>
          </div>
        </div>

        <div className="mk-intro">
          <div className="mk-intro__art bob">
            <Mascot name="wave" size={150} alt="Panda coach waving" />
          </div>
          <p className="mk-intro__bubble">
            I&rsquo;m your panda. Six minutes a day is shorter than the coffee
            queue.
          </p>
        </div>
      </ScreenBody>
      <ScreenFooter>
        <Button onClick={() => {}}>Build my plan</Button>
      </ScreenFooter>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* 3 · Your plan                                                       */
/* ------------------------------------------------------------------ */

/** "Question 1 of 7" under the trail, so the long chapter still feels short. */
function QuestionCount({ n, of }: { n: number; of: number }) {
  return (
    <div className="mk-qcount">
      <span>
        Question {n} of {of}
      </span>
      <span className="mk-qcount__pips" aria-hidden="true">
        {Array.from({ length: of }, (_, index) => (
          <span key={index} data-done={index < n} />
        ))}
      </span>
    </div>
  );
}

const DAY_OPTIONS: { label: string; icon: ReactNode }[] = [
  { label: 'Desk job', icon: <MonitorIcon /> },
  { label: 'Hybrid', icon: <HomeIcon /> },
  { label: 'Driver', icon: <CarIcon /> },
  { label: 'Student', icon: <GraduationIcon /> },
  { label: 'Shift work', icon: <ClockIcon /> },
  { label: 'Mostly home', icon: <SofaIcon /> },
];

function DayType() {
  return (
    <Screen>
      <Trail stage={2} />
      <QuestionCount n={1} of={7} />
      <ScreenBody>
        <h1 className="title mk-title-tight">What does your day look like?</h1>
        <p className="subtitle">Pick the closest one. You can change it later.</p>

        <div className="option-grid">
          {DAY_OPTIONS.map((option, index) => (
            <button
              key={option.label}
              type="button"
              className="option"
              aria-pressed={index === 0}
            >
              <span className="option__head">
                {option.icon}
                {index === 0 ? <CheckIcon size={20} /> : null}
              </span>
              <span className="option__label">{option.label}</span>
            </button>
          ))}
        </div>

        <Spacer />
        <CoachSays pose="hips">A desk job. Chair territory. We&rsquo;ll fix that.</CoachSays>
      </ScreenBody>
      <ScreenFooter>
        <Button onClick={() => {}}>Continue</Button>
      </ScreenFooter>
    </Screen>
  );
}

const TIERS = [
  { name: 'Easy going', breaks: 4, note: 'Dip a toe in' },
  { name: 'Steady', breaks: 6, note: 'Where most people start' },
  { name: 'Chair slayer', breaks: 8, note: 'For the truly restless' },
];

function Difficulty() {
  return (
    <Screen>
      <Trail stage={2} />
      <QuestionCount n={6} of={7} />
      <ScreenBody>
        <h1 className="title mk-title-tight">Pick your difficulty</h1>
        <p className="subtitle">How many breaks a day count as a win?</p>

        <div className="option-list">
          {TIERS.map((tier, index) => {
            const selected = index === 1;
            return (
              <button
                key={tier.name}
                type="button"
                className="option-row mk-tier"
                aria-pressed={selected}
              >
                <span className="mk-tier__segments" aria-hidden="true">
                  {Array.from({ length: 8 }, (_, segment) => (
                    <span key={segment} data-on={segment < tier.breaks} />
                  ))}
                </span>
                <span className="option-row__text">
                  <span className="option-row__title">{tier.name}</span>
                  <span className="option-row__sub">
                    {tier.breaks} breaks · {tier.breaks} min a day
                  </span>
                </span>
                {selected ? (
                  <span className="mk-tier__tag">{tier.note}</span>
                ) : (
                  <span className="mk-tier__note">{tier.note}</span>
                )}
              </button>
            );
          })}
        </div>

        <Spacer />
        <CoachSays pose="wave">Steady it is. Six a day and the chair doesn&rsquo;t stand a chance.</CoachSays>
      </ScreenBody>
      <ScreenFooter>
        <Button onClick={() => {}}>Continue</Button>
      </ScreenFooter>
    </Screen>
  );
}

const PLAN_ROWS = [
  { at: '10:15', name: 'Neck rolls' },
  { at: '11:30', name: 'Shoulder shrugs' },
  { at: '12:45', name: 'Seated spinal twist' },
];

function PlanReady() {
  return (
    <Screen>
      <Trail stage={2} />
      <ScreenBody>
        <h1 className="title title--lg mk-plan-title">Your plan is ready</h1>

        <div className="card card--strong mk-plan-card">
          <div className="chip-wrap mk-chip-flush">
            <span className="chip chip--static">Desk job</span>
            <span className="chip chip--static mk-chip-lime">Steady</span>
          </div>
          <div className="summary__stats">
            <div>
              <div className="summary__value">6</div>
              <div className="summary__label">BREAKS A DAY</div>
            </div>
            <div>
              <div className="summary__value">9–5:30</div>
              <div className="summary__label">ACTIVE HOURS</div>
            </div>
          </div>
        </div>

        <h2 className="section-title">Today, from here</h2>
        <ul className="plan">
          {PLAN_ROWS.map((row) => (
            <li key={row.at} className="plan__row">
              <span className="plan__time">{row.at}</span>
              <span className="plan__name">{row.name}</span>
              <span className="plan__duration">1 min</span>
            </li>
          ))}
          <li className="plan__row mk-plan-more">
            <span className="plan__time" />
            <span className="plan__name">+ 3 more after lunch</span>
          </li>
        </ul>

        <div className="art-fill bob">
          <Mascot name="stride" size={130} />
        </div>
      </ScreenBody>
      <ScreenFooter>
        <Button onClick={() => {}}>
          <span className="mk-btn-icon">
            <LockIcon size={18} /> Unlock my plan
          </span>
        </Button>
      </ScreenFooter>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* 4 · Unlock                                                          */
/* ------------------------------------------------------------------ */

function PlanPicker() {
  const perMonth = money(Math.floor((PRICES.yearly / 12) * 100) / 100);
  const perks = [
    'Your plan, laid out fresh every workday',
    `All ${EXERCISES.length} desk moves, with the panda demonstrating`,
    'Streaks, milestones and You vs. The Chair',
  ];

  return (
    <Screen className="mk-paywall">
      <div className="mk-paywall__top">
        <span className="mk-paywall__restore">Restore</span>
      </div>

      <div className="mk-paywall__hero">
        <span className="mk-paywall__halo">
          <Mascot name="wave" size={112} />
        </span>
        <h1 className="title mk-title-flush">Unlock your plan</h1>
      </div>

      <ul className="mk-perks">
        {perks.map((perk) => (
          <li key={perk}>
            <span className="mk-perks__tick">
              <CheckIcon size={13} />
            </span>
            {perk}
          </li>
        ))}
      </ul>

      <div className="note mk-saved">
        <span className="mk-saved__icon">
          <LockIcon size={18} />
        </span>
        <span>
          Your plan is saved and waiting: built for a desk day, six breaks a day,
          and a score to settle.
        </span>
      </div>

      <div className="mk-plans" role="radiogroup" aria-label="Plans">
        <button type="button" role="radio" aria-checked="true" className="mk-plan">
          <span className="mk-plan__ribbon">
            Best value · Save {YEARLY_SAVING}%
          </span>
          <span className="mk-plan__radio" />
          <span className="mk-plan__text">
            <span className="mk-plan__name">Yearly</span>
            <span className="mk-plan__sub">
              {TRIAL_DAYS} days free, then {money(PRICES.yearly)} a year
            </span>
          </span>
          <span className="mk-plan__price">
            {perMonth}
            <small>/mo</small>
          </span>
        </button>

        <button type="button" role="radio" aria-checked="false" className="mk-plan">
          <span className="mk-plan__radio" />
          <span className="mk-plan__text">
            <span className="mk-plan__name">Monthly</span>
            <span className="mk-plan__sub">Billed monthly, no trial</span>
          </span>
          <span className="mk-plan__price">
            {money(PRICES.monthly)}
            <small>/mo</small>
          </span>
        </button>

        <button type="button" role="radio" aria-checked="false" className="mk-plan">
          <span className="mk-plan__radio" />
          <span className="mk-plan__text">
            <span className="mk-plan__name">Lifetime</span>
            <span className="mk-plan__sub">Pay once, keep it forever</span>
          </span>
          <span className="mk-plan__price">{money(PRICES.lifetime)}</span>
        </button>
      </div>

      <ScreenFooter>
        <Button onClick={() => {}}>Start my free week</Button>
        <p className="mk-fine">
          Free for {TRIAL_DAYS} days, then {money(PRICES.yearly)} a year.
          We&rsquo;ll remind you two days before. Cancel any time in Settings.
          <br />
          <span>Terms</span> · <span>Privacy</span>
        </p>
      </ScreenFooter>
    </Screen>
  );
}

function Welcome() {
  return (
    <Screen tone="warm" className="mk-earned">
      <Confetti />
      <div className="mk-earned__body">
        <div className="bob">
          <Mascot name="wave" size={210} />
        </div>
        <span className="mk-earned__eyebrow">Plan unlocked</span>
        <h1 className="a1__title mk-earned__title">First point to you</h1>
        <p className="a1__sub">
          Your first break is ready whenever you are. Starting it takes the lead.
        </p>
        <ScorePill you={1} chair={1} onWarm />
        <span className="mk-earned__note">All square. Your move.</span>
      </div>

      <ScreenFooter>
        <Button variant="inverse" onClick={() => {}}>
          Start my first break
        </Button>
        <TextButton onWarm onClick={() => {}}>
          Take me to the app
        </TextButton>
      </ScreenFooter>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* The board                                                           */
/* ------------------------------------------------------------------ */

interface FrameSpec {
  code: string;
  name: string;
  /** What the screen is for, or the mechanic it plays. */
  note: string;
  screen: () => ReactNode;
}

interface Chapter {
  title: string;
  purpose: string;
  frames: FrameSpec[];
  /** Existing screens that keep their place in this chapter. */
  keeps?: string;
}

const CHAPTERS: Chapter[] = [
  {
    title: 'The ache',
    purpose:
      'Name the problem before offering anything. One honest question turns it into a score the user wants to change.',
    frames: [
      {
        code: '1.1',
        name: 'Hook',
        note: 'Replaces A1. The grumpy panda and the aches the user feels by mid-afternoon.',
        screen: Hook,
      },
      {
        code: '1.2',
        name: 'How long did you sit?',
        note: 'One tap. The answer feeds the scoreboard on the next screen.',
        screen: SittingQuiz,
      },
      {
        code: '1.3',
        name: 'You vs. The Chair',
        note: `Round one to the chair: ${SAT_HOURS} h × ${WORKDAYS_A_YEAR} workdays, computed from 1.2.`,
        screen: Scoreboard,
      },
    ],
  },
  {
    title: 'The fix',
    purpose: 'Show how MoveMate answers the ache: the panda, and a day with the gaps put back in.',
    frames: [
      {
        code: '2.1',
        name: 'Same desk, better day',
        note: 'The panda introduces itself over a before and after on one clock. Six breaks is six minutes.',
        screen: BetterDay,
      },
    ],
  },
  {
    title: 'Your plan',
    purpose:
      'The existing questions, rehung on the trail. The coach answers every tap, and the goal becomes a difficulty pick.',
    keeps:
      'Also in this chapter, restyled the same way: A6 visibility, A7 level & needs, A8 schedule, A9 frequency, A11 notifications, A13 motion & Health, A14 building. A5 (what bothers you) is dropped, so plans draw on the whole catalogue rather than chosen body areas.',
    frames: [
      {
        code: '3.1',
        name: 'Your day',
        note: 'A3 with the trail and a question counter in place of the rail.',
        screen: DayType,
      },
      {
        code: '3.2',
        name: 'Pick your difficulty',
        note: 'A10 as three tiers. Each still writes a plain dailyGoal.',
        screen: Difficulty,
      },
      {
        code: '3.3',
        name: 'Plan ready',
        note: 'A15, now ending on the unlock rather than straight into the app.',
        screen: PlanReady,
      },
    ],
  },
  {
    title: 'Unlock',
    purpose:
      'The paywall sits between a finished plan and its first use. The trial terms sit under the button, in plain words.',
    frames: [
      {
        code: '4.1',
        name: 'Choose a plan',
        note: 'Yearly with a trial, monthly, lifetime. Prices are placeholders.',
        screen: PlanPicker,
      },
      {
        code: '4.2',
        name: 'Welcome in',
        note: 'Unlocking earns the first point back. The first break takes the lead.',
        screen: Welcome,
      },
    ],
  },
];

const SCREEN_COUNT = CHAPTERS.reduce(
  (total, chapter) => total + chapter.frames.length,
  0,
);

const MECHANICS: { icon: ReactNode; title: string; body: string }[] = [
  {
    icon: <ChairIcon size={20} />,
    title: 'You vs. The Chair',
    body: 'The score Insights keeps. The chair leads from screen three, and unlocking the plan levels it.',
  },
  {
    icon: <CheckIcon size={18} />,
    title: 'The trail',
    body: 'Four named stops replace the progress rail, so what is left reads as places, not percent.',
  },
  {
    icon: <HeartIcon size={20} />,
    title: 'The coach answers back',
    body: 'Every question gets a line from the panda. Warm, a little smug, never scolding.',
  },
];

export function OnboardingMockups() {
  return (
    <div className="mk-board">
      <header className="mk-board__header">
        <span className="eyebrow">MoveMate · Onboarding redesign</span>
        <h1 className="mk-board__title">From the ache to the unlock</h1>
        <p className="mk-board__lede">
          {SCREEN_COUNT} screens in {CHAPTERS.length} chapters, drawn with the
          app&rsquo;s own components and tokens. The flow is a game against the
          chair, and unlocking the plan is the user&rsquo;s first point.
        </p>

        <ol className="mk-board__flow">
          {CHAPTERS.map((chapter, index) => (
            <li key={chapter.title}>
              <span className="mk-board__flow-n">{index + 1}</span>
              <span className="mk-board__flow-name">{chapter.title}</span>
              <span className="mk-board__flow-count">
                {chapter.frames.length}{' '}
                {chapter.frames.length === 1 ? 'screen' : 'screens'}
              </span>
            </li>
          ))}
        </ol>

        <div className="mk-mechanics">
          {MECHANICS.map((mechanic) => (
            <div key={mechanic.title} className="mk-mechanic">
              <span className="mk-mechanic__icon">{mechanic.icon}</span>
              <span className="mk-mechanic__title">{mechanic.title}</span>
              <span className="mk-mechanic__body">{mechanic.body}</span>
            </div>
          ))}
        </div>
      </header>

      {CHAPTERS.map((chapter, index) => (
        <section key={chapter.title} className="mk-chapter" id={`chapter-${index + 1}`}>
          <div className="mk-chapter__head">
            <span className="mk-chapter__n">{index + 1}</span>
            <div>
              <h2 className="mk-chapter__title">{chapter.title}</h2>
              <p className="mk-chapter__purpose">{chapter.purpose}</p>
              {chapter.keeps ? <p className="mk-chapter__keeps">{chapter.keeps}</p> : null}
            </div>
          </div>

          <div className="mk-frames">
            {chapter.frames.map((frame) => (
              <figure key={frame.code} className="mk-frame">
                <div className="mk-device">{frame.screen()}</div>
                <figcaption className="mk-frame__caption">
                  <span className="mk-frame__code">{frame.code}</span>
                  <span className="mk-frame__name">{frame.name}</span>
                  <span className="mk-frame__note">{frame.note}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
