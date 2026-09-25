# MoveMate

MoveMate interrupts long sitting sessions with short movement breaks — 30 to 60
seconds, at your desk, in your clothes. No gym, no floor work, no change of
clothes. A panda coach does the nagging, and the tone is meant to be warm rather
than clinical: the app never scolds you for a skipped break.

The core loop is: a break comes due → one tap starts it → an animated coach
walks you through three short exercises → you go back to work.

This repository is a working front-end implementation of that product, built
from a [Claude Design](https://claude.ai/design/p/c3405957-924a-4d53-a615-724ed6a39d41)
canvas covering onboarding, the home screen, the full break flow, and the design
system itself.

## Running it locally

Requires [Node.js](https://nodejs.org) 20 or newer.

```bash
git clone https://github.com/Lucasha11/Fitness-App-2.git
cd Fitness-App-2
npm install
npm run dev
```

Then open:

| | |
| --- | --- |
| The app | <http://localhost:5173> |
| The design system | <http://localhost:5173/design-system.html> |
| Lock Screen mockups | <http://localhost:5173/#lock-screen> |

On a phone the app fills the viewport. On a desktop browser it renders inside a
390 × 844 frame — the artboard size the design was drawn against — so it can be
compared with the canvas side by side. To try it at phone size in a desktop
browser, open devtools and switch to a device viewport.

### Other commands

```bash
npm run build     # type-check and build both pages into dist/
npm run preview   # serve the production build
npm run lint      # oxlint
```

### Starting over

Onboarding runs once and the answers are saved to `localStorage`. To see it
again, clear the site's storage, or run this in the browser console:

```js
localStorage.removeItem('movemate.onboarding.v1');
localStorage.removeItem('movemate.session.v1');
location.reload();
```

## Built with

React 19, TypeScript, Vite 8, and plain CSS with custom properties — no UI
library and no CSS framework. Every colour, radius and shadow in the app comes
from the tokens in [`src/theme/tokens.css`](src/theme/tokens.css).

## What's implemented

### Onboarding

The fifteen screens the canvas draws, in
[`src/onboarding/steps/`](src/onboarding/steps): welcome, a value carousel, what
your day looks like, what bothers you (a tappable body diagram), how visible you
can be, movement level and adaptations, your sitting hours, how often to nudge,
your daily goal, notification and motion priming, a plan-building loading
state, your finished plan, and an optional sign-in.

### Today

[`src/today/Today.tsx`](src/today/Today.tsx) — the coach standing in a sunlit
bamboo clearing beside a lotus pond, with its line in a speech bubble and the
date and streak as pills, then a cream sheet holding the segmented goal bar, the next-break card, a sitting indicator
that turns amber past 45 minutes, the day's timeline (swipe a row to skip, swipe
back to restore), a quick-action shelf, weekly body coverage, and a tab bar with
a raised Break button that starts a break from anywhere.

### The break

Every stage lives in [`src/player/`](src/player), orchestrated by
[`BreakPlayer.tsx`](src/player/BreakPlayer.tsx):

| | |
| --- | --- |
| Intro | What you're about to do and why, auto-advancing |
| Player | Looping coach, rotating cue lines, ring timer |
| Discreet mode | Flat palette, linear timer, silent — for open offices |
| Switch sides | A timed overlay halfway through one-sided moves |
| Between exercises | A three-second breather with the next move named |
| Paused | Frozen timer, resume / restart / end |
| Complete | Break count, movement time, streak, auto-dismiss |
| Feedback | One tap, no typing; "hurt something" asks where |
| Ended early | Remind me in 10 / skip the rest / wrong exercise |
| Sequence overview | Drag to reorder, swap any exercise |
| Lock Screen | Notification, Live Activity and widget mockups |

### The design system

A documentation page at [`/design-system.html`](design-system.html), built from
[`src/design-system/`](src/design-system).

It's a *living* style guide rather than a transcription: colour values are read
from the live stylesheet at render time, and every specimen — buttons, chips,
segmented control, toggle rows, cards, sheet header, all three rings, the tab
bar, the sitting indicator — is the app's own component, not a copy of its
markup. Rename a token and the page changes; restyle a component and the page
changes. Each section also states its own coverage, so the gaps stay visible.

## Project structure

```
src/
  onboarding/     the setup flow, its answer sheet and persistence
  today/          the home screen
  player/         the break, stage by stage
  session/        what happens after setup — history, streaks, exclusions
  components/     shared primitives, icons, the mascot
  design-system/  the documentation page
  exercises.ts    the exercise catalogue
  schedule.ts     builds the day: slot times, meetings, statuses
  theme/          design tokens
```

## How it all connects

Nothing on screen is a mock. The onboarding answers drive everything downstream:

- The plan previewed at the end of setup is the plan Today shows — same
  function, same catalogue.
- Exercise choice honours your focus areas, your privacy level, the "seated
  only" adaptation and any active exclusions, and never repeats a body area back
  to back.
- Finishing a break advances the goal ring, marks its timeline row done, resets
  the sitting clock, and feeds the streak chip and weekly coverage.
- **The sitting clock also resets from Core Motion.** On iOS the app asks the
  activity log when you last got up and counts from there, so a walk at lunch
  clears the clock without opening the app. It never counts time from before
  your sitting window opened either, so an overnight gap can't greet you with
  "you've been sitting for 900 minutes".
- Feedback changes what gets scheduled: "Awkward here" drops that exercise for
  good, and "Hurt something" rests that body area for a week — the day's plan
  stops offering it immediately.
- "Remind me in 10" snoozes a break rather than dropping it; the timeline row
  moves and says where it came from.
- A meeting displaces any break that collides with it into the gap afterwards,
  and the card explains the move.
- Sound cues fire at the start, halfway point and end, synthesised in the
  browser so the core loop still works offline. Discreet mode forces them off.

## Notes and deviations

- **There is no calendar.** The scheduler still moves a break out of a meeting
  and the timeline still draws a meeting row, but nothing fills
  `session.meetings` — EventKit isn't wired up, and the setup screen that used
  to offer a calendar could only ever seed an invented event, so it was removed
  rather than shipped. `schedule.test.ts` covers the displacement rules.
- **Notifications are primed but not scheduled.** The priming screen requests
  the browser permission; no background scheduling exists, so breaks come due on
  the timeline rather than arriving as notifications.
- **The Lock Screen page is a reference mockup, not a screen.** A web build has
  no Lock Screen, so it lives behind `#lock-screen` rather than in the
  navigation.
- **Day one starts when setup finishes**, not at the start of your sitting
  window — breaks scheduled before the app existed are neither credited nor
  counted as missed.
- **Reaching the end of a break only counts if you moved.** Skipping every
  exercise exits without recording anything.
- **Skip and Next do the same thing.** The artboard shows both flanking the
  pause button and describes no difference between them.
- **The design system page documents this build**, not the earlier codebase its
  canvas file was written against. It keeps that file's structure, voice and
  section list, but its claims describe the code that exists.

## Not built yet

Library, Insights and You are disabled in the tab bar — they have no designs in
this canvas. Also open, and marked as such on the design system page: dark mode,
the Insights calendar, info and success banner tones, a slider with labelled
stops, and an empty-state block.

## Assets

The panda mascots live in [`src/assets/`](src/assets) and are imported as
modules, so Vite fingerprints them. [`poses.ts`](src/player/poses.ts) maps each
body area to a pose and a thumbnail tint. A parallel squirrel set is kept for an
alternate coach, but the squirrel is retired for now: onboarding no longer
offers it and a saved squirrel comes back as the panda.
