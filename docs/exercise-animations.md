# Exercise animations

How every panda demonstration in the app is made. One exercise goes through
the same nine steps, with three points where a person signs it off before any
more money or time is spent on it.

```
1 Plan the motion        ->  2 Stick-figure reference  ->  GATE 1 Motion approved
3 Reference video        ->  4 Start frame             ->  5 Generate in Kling
                                                       ->  GATE 2 Take chosen
6 Key and encode         ->  7 Wire into the app       ->  GATE 3 Signed off on device
8 Record the result
```

`/animate-exercise <exercise-id>` runs this with Claude. The steps below are
the source of truth either way.

**Tools:** Gemini (gemini.google.com, Images, Pro) only for drawings that
don't exist yet. Kling (kling.ai) for video. Python 3 with
`pip install pillow numpy imageio-ffmpeg` for the two scripts in `animation/`.

---

## Why the movement comes from a body

The first attempt (desk squats, 2026-10-02) gave Kling two drawings, standing
and squatting, and asked it to move between them. The result was unnatural:
the model morphs one drawing into the other, so nothing moves the way a
body does. Separately, Gemini would not lower the panda's head in a squat
however it was asked; it anchors the head and squashes the body.

So the movement is now always taken from a body moving: a stick figure posed
by real joint angles, and preferably a filmed person doing the same thing.
Kling's **Motion Control** transfers that movement onto the panda drawing.
The start-and-end-frame method stays only as a fallback (end of this file).

---

## The rules every clip obeys

These are what make 36 separately generated clips read as one panda that
moves like a person.

1. **One drawing starts everything.** Standing exercises start from
   `src/assets/panda-stand.webp`, seated ones from `panda-sit.webp`. Never
   start from a freshly generated image.
2. **The loop begins and ends on the start pose.** The app shows the first
   frame as the still while paused or under reduced motion, so the first and
   last frames must be the same drawing (see `src/components/demos.ts`).
3. **Same canvas, every frame.** Square, the panda the same size, feet (or
   seat) on the same line, centred.
4. **Flat chroma green behind the panda** (`#00FF00`), no shadow, no floor.
   The green is keyed out afterwards; anything that isn't flat green becomes a
   fringe.
5. **The camera never moves.** No pan, zoom, cut or lighting change.
6. **The motion is correct before it is pretty.** A demo that shows the wrong
   side or the wrong path teaches the stretch wrong. Check it against the
   exercise's cues in `src/exercises.ts`.
7. **The movement is a human body's.** Specifically:
   - joints bend only the way they bend, within a comfortable range;
   - the body moves as one connected chain: a squat is led by the hips
     going back, the knees follow over the toes, the chest leans to balance,
     the arms counterbalance;
   - weight stays over the feet, and planted feet never slide;
   - speed eases in and out of every position, never constant; a lowering
     phase is slower than the rise, as in a controlled exercise;
   - a hold is alive: a slight settle and breath, not a frozen frame;
   - the head stays level and the gaze forward unless the move is about the
     neck.
   Never a morph between two drawings.

---

## Step 1 · Plan the motion

Read the exercise in `src/exercises.ts`: its `name`, `cues`, `part` and
whether it has `sides`. Then write two files in `animation/<exercise-id>/`.

**`spec.md`** (template at the end of this file): the movement described as
a physiotherapist would, joint by joint, with its tempo, and which
start drawing it uses (`panda-stand` or `panda-sit`).

**`motion.json`**: the same movement as joint angles at keyframe times. The
joint names, sign conventions and options are documented at the top of
`animation/stick_figure.py`; `animation/desk-squats/motion.json` is a worked
example. Guidelines:

- Take angles from real exercise form, not guesses. Keep ranges gentle: these
  are desk breaks, not training.
- Start and end on the start pose, with about 0.4 s held at each end, so the
  loop closes.
- Lowering, reaching or stretching takes about 2 s; returning about 1.5 s;
  holds 0.4 s or longer.
- Move several joints in each keyframe. A body never moves one joint alone.
- **Sided exercises** (`sides: true`) are animated on the figure's **right
  side only**. Mirroring for the second half is a separate app change.

## Step 2 · Stick-figure reference

```bash
python animation/stick_figure.py <exercise-id>
```

This writes `reference/review.mp4` (front and side views together) and
`reference/driver.mp4` (front view, square). Joints ease between keyframes on
a minimum-jerk curve, the speed profile of a human reach, so the timing is
human by construction; the angles are what you are checking.

### GATE 1 · Approve the motion

Watch `review.mp4` at full speed, then frame by frame. Approve only if every
line is true; otherwise edit `motion.json` and render again. This gate is free,
so iterate here rather than in Kling.

- [ ] It is the exercise in the cues, on the correct side.
- [ ] Seen from the side, every joint bends the way it can and the body
      stays balanced over the feet (rule 7).
- [ ] Nothing moves alone: the trunk, arms and head take part where a person's
      would.
- [ ] The timing feels like someone doing the exercise calmly: unhurried
      lowering, easier rise, a breath at the holds.
- [ ] The first and last frames are the same pose.

## Step 3 · Reference video

Motion Control copies the movement of a body in a video. Use the best source
available:

1. **A filmed person (preferred).** Someone performs the exercise copying the
   approved stick figure: same tempo, same range, same start and end pose.
   Phone on a stand at chest height, **front-on, the same view as the panda
   drawing**, whole body in frame with space around it, plain background,
   fitted clothes, good even light, landscape or square, 5 to 15 seconds,
   two repetitions. Save as `reference/person.mp4`. Watch it against the
   stick figure before using it.
2. **The stick figure's `driver.mp4`.** Faster, and needs no one on camera,
   but it is not yet proven that Kling reads a stick figure as reliably as a
   person. Try it first on each new kind of movement and keep it only if
   Gate 2 passes.

Both must start and end on the start pose.

## Step 4 · Start frame

Put the start drawing on a 1024x1024 flat `#00FF00` canvas, centred, as
`keyframes/A.png` (see `animation/desk-squats/keyframes/A.png`). Its pose must
match the reference video's first frame: standing tall for a standing move,
seated for a seated one. If the exercise needs a starting position no
drawing has (half-kneeling, say), generate it once in Gemini from the start
drawing and approve it against Gate 1's checklist before going on.

## Step 5 · Generate in Kling

At kling.ai, open **Motion Control** (beside Video Generation):

1. Character image: `keyframes/A.png`.
2. Motion reference: `reference/person.mp4` or `reference/driver.mp4`.
3. Character orientation: match the image, so the panda keeps facing front.
4. Prompt:

```
The panda performs the movement from the reference video exactly, as a
real person would: the same joints, range and timing, weight over its
feet, smooth and calm. Keep the same character design, proportions,
colours and line style throughout. Static locked-off camera, no zoom, no
pan, no cut. Flat solid green background that never changes, no shadows,
no lighting change. Only the panda moves.
```

5. 720p is enough (the app shows clips at 640x640). Kling's Motion Control
   screen has no prompt box; if it gains one, use the prompt above.
6. **Read the credit cost on the Generate button and confirm it before
   submitting.** One take first; a second only if the first fails Gate 2.
   Cost scales with the reference video's length: at 720p, about 9.4
   credits a second on VIDEO 3.0 and 5.2 on VIDEO 2.6 (October 2026). So
   render one repetition (`"repeats": 1`): the app loops it anyway.

**The free Kling plan is not enough to ship with.** Its videos carry a
visible "KlingAI" watermark in the bottom-right corner, and its queue can
run to an hour. Use it only to try the method out. Before shipping, confirm
that the plan you pay for downloads without the watermark.

Download the take into `animation/<id>/takes/`.

### GATE 2 · Choose the take

Watch it at full size, beside `review.mp4`, then frame by frame around the
start and end. Reject it if:

- [ ] the panda changes: face, markings, proportions, an extra or missing
      limb, paws that melt or merge;
- [ ] the movement differs from the approved reference: wrong side, wrong
      direction, wrong range, a joint bending the wrong way;
- [ ] any part of rule 7 fails: sliding feet, a morph instead of a movement,
      constant speed, a frozen hold, a body part moving on its own;
- [ ] the camera moves, the panda drifts, or the background shifts colour;
- [ ] the first frame doesn't match A, or the last doesn't return to it.

If it fails, change one thing: the reference video if the movement is wrong,
the prompt if the look drifts. Record what you changed in `spec.md`.

## Step 6 · Key and encode

```bash
python animation/key_and_encode.py <exercise-id> <pose> --clips takes/<take>.mp4
```

It keys out the green, removes green spill from the fur, crops square,
scales to 640x640, and writes `src/assets/panda-<pose>.webp` (looping, with
alpha) and `src/assets/panda-<pose>-still.webp` (its first frame).
`--hold-start` adds a rest on the first frame. Trim the take first if it
doesn't begin and end on the start pose.

Watch it loop at least five times. It should be impossible to see where it
starts. The neck-rolls loop is 3.8 MB for 6 seconds; note each new loop's size
in `spec.md`, because the whole set must fit a phone app.

## Step 7 · Wire into the app

1. Add the pose name to `MascotName` in `src/components/Mascot.tsx`, with its
   still in `SOURCES` for every coach.
2. Point the exercise at it in `POSE_BY_EXERCISE` in `src/player/poses.ts`.
3. Import the loop and still in `src/components/demos.ts` and add them to
   `DEMOS.panda`.
4. `npm run test:run && npm run build && npm run lint`. The pose maps are
   data tables, so their invariant tests must still pass.

### GATE 3 · Sign off on device

Run the app (`npm run dev`, then the iOS build) and play the exercise from the
library. Check:

- [ ] it plays in the grove's clearing at the right size and place, with no
      green fringe against the bamboo;
- [ ] pausing holds the still with no jump; resuming continues cleanly;
- [ ] with Reduce Motion on, only the still shows;
- [ ] it loops for the whole exercise length without a visible seam;
- [ ] it moves like the other demos already shipped, and like a person.

## Step 8 · Record the result

Finish `spec.md`: the motion spec, the reference used, the prompt and
settings, the chosen take, every change made at a gate, and the final file
sizes. Commit `spec.md`, `motion.json`, `keyframes/`, `reference/` and the
shipped assets; `takes/` stays out of git.

---

## Fallback: start and end frames

For a movement too small for motion transfer to pick up (the eye exercises,
say), Kling's Video Generation can move between two drawings: A as the start
frame and a second drawing B as the end frame. B is drawn in Gemini from A,
with the end pose's frame from `reference/review.mp4` attached as a second
image to fix the pose. Expect to fight the model on
anything the head or body must travel for, and hold the result to rule 7 at
Gate 2 just the same. The video prompt must describe the movement as a
person does it (which joint leads, at what pace), not as a change of
picture.

---

## `animation/<exercise-id>/spec.md` template

```markdown
# <Exercise name> (`<exercise-id>`)

## Motion
<joint by joint, as a physiotherapist would describe it, with tempo>

- Start drawing: panda-stand | panda-sit
- Sided: no | yes, right side shown
- Pose name in the app: `<pose>`
- Motion spec: `motion.json`

## Reference
- Stick figure: rendered <date>, approved at Gate 1 <date>
- Video used for Motion Control: person.mp4 | driver.mp4

## Generation
| Take | Reference | Prompt and settings | Credits | Result |
|---|---|---|---|---|

## Gate notes
- Gate 1:
- Gate 2:
- Gate 3:

## Output
- `src/assets/panda-<pose>.webp`: <size>, <frames>, <seconds>
- `src/assets/panda-<pose>-still.webp`: <size>
```
