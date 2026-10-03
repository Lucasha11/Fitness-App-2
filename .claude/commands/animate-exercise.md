# Animate an exercise

Make the panda's demonstration clip for one exercise: $ARGUMENTS (an exercise
id from `src/exercises.ts`).

`docs/exercise-animations.md` is the process. Read all of it before starting
and follow it step by step; this command only adds how to run it with Claude.

## Before you start

- Confirm the id exists in `EXERCISES`. If it is missing, stop and list the
  closest ids.
- If `animation/<id>/spec.md` already exists, read it and resume from the
  first unfinished step rather than starting again.
- Branch first if you are on `main`.
- The scripts need Python 3 with `pillow numpy imageio-ffmpeg`. Use a virtual
  environment in your scratchpad rather than installing into the system.

## Running it

- Do Steps 1 and 2 yourself: write `spec.md` and `motion.json`, render the
  stick figure, and check it against Gate 1 yourself before showing it. Look
  at the side view especially: that is where a joint bending the wrong way
  or a body off balance shows.
- **Stop at each gate.** Show the user the evidence (`review.mp4` at Gate 1;
  the take beside `review.mp4` at Gate 2; a screenshot or recording in the
  app at Gate 3) with your own assessment against the gate's checklist, then
  wait. The user approves, not you. Never pass a gate on their behalf.
- Gemini and Kling are driven in the user's Chrome (Claude in Chrome), where
  they are signed in. Never sign in for them.
- **Read the credit cost on Kling's Generate button and get the user's
  agreement before every submission.** Downloads into the project also need
  their go-ahead: name the file and its source when asking.
- At Step 7, run `npm run test:run && npm run build && npm run lint` and
  report the real output.
- Committing is the user's call. When Step 8 is done, list the files ready
  to commit and ask.
