# PR Review

You are acting as a senior code reviewer for the current feature branch, checking it against main before any merge.

## Step 1 — Identify the branch and diff

Run:
- `git branch --show-current` — confirm you are NOT on main
- `git fetch origin && git diff origin/main...HEAD` — everything this branch adds or changes

If you are on main, stop and tell the user: "You're on main — switch to your feature branch first."

Read the full diff before doing anything else.

## Step 1b — Check CI status

Run `gh pr checks`. If no PR exists yet, skip this step.

- **All pass** — note it and proceed.
- **Any failing or pending** — stop and report before reviewing the diff. Show the job name, status, and the failing log lines via `gh run view --log-failed`. A red CI is a **CRITICAL** regardless of how the diff looks.
- **No checks at all** — note that CI has not run, proceed, but flag it.

## Step 2 — Run the checks yourself

Do not rely on the author having run them. Run all three and report the real output:

```
npm run test:run
npm run build
npm run lint
```

A failure in any of these is a **CRITICAL**. Never approve on a red suite or a broken build.

## Step 3 — Review the diff

### Logic and correctness
- Edge cases the code doesn't handle, silent failures, swallowed errors, wrong defaults.
- Does control flow match the stated intent of the PR?

### The scheduler's load-bearing invariant
If the diff touches `src/schedule.ts` or `src/session/state.ts`, check specifically:
- A break slot's identity is `at`; its display time is `showsAt`. Snoozes and meeting displacement move `showsAt` only. `done` and `skipped` records key on `at`. Conflating them detaches history from the timeline **silently** — no error, no crash.
- Every exercise filter must fall back to unfiltered candidates rather than returning an empty plan.

### Testing policy (see CLAUDE.md)
- Does the change encode a **domain rule** — something you could state in one sentence about what the app promises the user? If so, it needs a test named as that sentence. Missing it is a **CRITICAL**.
- Did it add or edit a **data table** (`EXERCISES`, `EXERCISE_SETS`, `COACH_PROFILES`, pose maps)? Cross-references are by string id, so it needs a tier-1 invariant test.
- Did it add a **parser or device/storage adapter**? It needs a tier-3 boundary test covering missing, denied and malformed data.
- Pure UI needs no test — but the PR should say so, so the absence is a decision rather than an oversight.
- Tests must be named as product sentences, not function names. `activeExclusions filters correctly` is a **SUGGESTION** to rename.

### Project conventions (see CLAUDE.md)
- No hard-coded colours, radii or shadows — everything comes from `src/theme/tokens.css`.
- Types imported as `import type { … }` (`verbatimModuleSyntax` is on).
- No unused imports, locals or params — these fail the build, not just the linter.
- A new UI primitive should gain a specimen on the design system page rather than duplicated markup.
- The coach is read from context, never passed as a prop. The one exception is the A1b picker.
- Comments explain *why* (a design-brief rule, a canvas decision, a trap), not *what*. British spelling.
- Copy is warm and never scolds the user for a skipped break.

### Readability
- Naming consistent with surrounding code, no dead code or stray `console.log`, no abstractions the task didn't require.

## Step 4 — Present findings

```
[CRITICAL]   src/schedule.ts:142 — what is wrong and why it matters
[SUGGESTION] src/today/Today.tsx:88 — a real improvement, not a blocker
[NIT]        src/exercises.ts:14 — polish only
```

- **CRITICAL** — logic error, broken behaviour, failing check, or a domain rule shipped without a test. Must be fixed before merge.
- **SUGGESTION** — worth addressing, not a blocker.
- **NIT** — fine to ignore.

If a category is empty, say so explicitly so the author knows it was checked.

## Step 5 — Verdict

**Approved** — no CRITICALs. State it clearly.

**Changes requested** — list every CRITICAL by file:line with what specifically needs to change.

Then stop. Run no git commands yet.

## Step 6 — Merge if approved

If **Changes requested**, stop and wait.

If **Approved**, tell the user you're proceeding (they can ESC to abort), then:

1. `gh pr merge --merge` if a PR exists — this keeps the repo's existing "Merge pull request #N" history.
2. If no PR exists, ask before merging locally rather than assuming.
3. Confirm with `git log --oneline -5`.
4. Delete the merged branch locally and on origin.
5. Report: "Merged and deleted `<branch-name>`."

Never force-push, and never merge a PR you did not review in this session.
