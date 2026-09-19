# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workflow — on every task, unprompted

Two people work on this repo with different Claude setups. Follow this whether
or not the user asks for it.

1. **Branch first** if the task changes code and you are on `main`.
2. **Verify before reporting done:** `npm run test:run && npm run build && npm run lint`.
   Report the real output. A failure or a skipped step gets said out loud.
3. **A domain rule ships with its test in the same commit** (see Testing below).
   Write it; don't ask permission.
4. **Committing, pushing and merging are the user's calls.** Prepare, then ask.

`.claude/commands/` holds `/pr-review` and `/update-claudemd`, checked in so
they work for any contributor. They are available, not mandatory.

## Commands

```bash
npm run dev       # Vite dev server on :5173
npm run test      # vitest, watch
npm run test:run  # vitest, single run
npm run build     # tsc -b && vite build
npm run lint      # oxlint
```

`tsc` is not `strict`, but `noUnusedLocals`, `noUnusedParameters` and
`verbatimModuleSyntax` are on — a stray import or a value-position type import
fails the **build**, not just the linter.

Two Vite entry points: `index.html` (the app) and `design-system.html`
(`/design-system.html`).

**iOS:** `npm run build && npx cap sync ios && npx cap open ios`, macOS only.
`ios/App/App/*Plugin.swift` are hand-written; `cap sync` does not regenerate them.

**Reset local state:** clear `movemate.onboarding.v1` and `movemate.session.v1`
from localStorage. `?mockHealth=1` fakes a HealthKit week in the browser;
`#lock-screen` opens the Lock Screen mockups.

## Architecture

A phone-shaped React 19 SPA. Plain CSS with custom properties — no router, no
UI library, no state library. The README has the product tour.

**Navigation is a `View` union in `useState`** (`src/App.tsx`), not a router.
Add a screen by extending that union.

**Two persisted stores:** `onboarding/state.ts` is the answer sheet from setup,
passed down as an `answers` prop. `session/state.ts` is everything learned
after — history, skips, snoozes, exclusions, sitting clock — reached via
`useSession()`. Session mutations are pure `withX(session, …)` functions;
`SessionProvider` is their only caller. Streaks and coverage are selectors over
date-keyed records, not counters, so there is nothing to keep in sync.

**`schedule.ts` is the single source of the day's plan.** Onboarding's preview
and Today's timeline call the same functions. Change scheduling here, not in a
screen.

> **Invariant: a break slot's identity is `at`; its display time is `showsAt`.**
> Snoozes and meeting displacement move `showsAt` only. `done` and `skipped`
> records key on `at`. Conflating them detaches history from the timeline
> **silently** — nothing throws.

A break prefers a curated set (`EXERCISE_SETS`) and keeps that set's order.
Sets repeat a body area on purpose — "Neck relief" is four neck exercises. The
"no same area twice in a row" rule applies only to the dynamic top-up path.
*(The README still states that rule unconditionally; it predates sets.)*

**The coach is context, never a prop.** A screen never mixes panda and
squirrel. `Mascot`'s `coach` override exists only for the A1b picker.

**HealthKit:** the `METRICS` names in `health/plugin.ts` are the contract with
the Swift plugin. `null` is never `0` — a denied read and an empty day both
render as a gap. Multiple sources reconcile to the richest one, not the sum.

**Tokens:** every colour, radius and shadow comes from `src/theme/tokens.css`.
Never hard-code one. `/design-system.html` is generated from the app's own
components and live stylesheet, so add a specimen rather than duplicating
markup.

## Testing

The suite covers **logic, never rendering**. The deciding question:

> **If this broke, would anyone notice?**

A broken screen is obvious on sight. A broken *rule* is invisible — a wrong
day, a lost streak, a body area that never returns. That is what the suite is
for. Tests live beside their source as `<name>.test.ts`.

**Tier 1 · Invariants** — *trigger: you touched a data table.* `EXERCISES`,
`EXERCISE_SETS`, `COACH_PROFILES`, pose maps. They cross-reference by string
id, so a typo compiles and throws at runtime. Assert ids are unique,
references resolve, every enum case is covered.

**Tier 2 · Domain rules** — *trigger: your change encodes a rule you could
state in one sentence about what the app promises.* **The test name is that
sentence**, so `npm test` output reads as a spec. Write `lets a rested body
area come back once its window expires`, never `activeExclusions works`.

**Tier 3 · Boundary shapes** — *trigger: you added a parser or a device/storage
adapter.* Test this side of the bridge only. Cover missing, denied, malformed
and duplicated data.

**Not tested:** components, CSS, animation, copy, Swift. Verified by eye. If
you want to test a component, extract the logic into a pure function and test
that — the refactor is the point.

Pure-UI work needs no test, but say so in the PR so the absence is a decision.
A PR adding a rule without its test is incomplete — that is what lets either
contributor accept a diff they did not read line by line.

## Known stubs

- **Calendar is fake.** `DEMO_MEETINGS` in `App.tsx` seeds one meeting to keep
  the scheduler's move-into-the-gap path exercised. No EventKit access.
- **Notifications are primed but never scheduled.** Breaks come due on the
  timeline only.
- Library, Insights and You are disabled — no designs exist.

## Conventions

- Comments explain *why* — a design rule, a canvas decision, a trap. Match that.
- British spelling. Commit subjects are plain imperative prose, no `feat:`/`fix:`.
- Copy is warm and never scolds the user for a skipped break.
