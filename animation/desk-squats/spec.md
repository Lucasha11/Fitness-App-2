# Desk squats (`desk-squats`)

## Motion
From standing tall with feet about hip-width apart, the panda sends its hips
back and down as if to sit on a chair behind it, knees bending over the toes,
chest staying tall and arms reaching forward to shoulder height for balance.
It stops just above where a seat would be (thighs a little above parallel),
then presses up through its feet to standing, arms lowering back to its
sides. Slow and steady both ways. Cues: "Sit back, stand up", "Chest tall",
"Nice and steady".

- Start drawing: panda-stand
- Motion spec: `motion.json` (lower over 2.0s, 0.4s pause, rise over 1.6s,
  0.4s rests at standing; trunk leans 38 degrees, hips 92, knees 118, head
  kept level, paws come together in front of the chest)
- Sided: no
- Pose name in the app: `squat` (replaces the `crouch` stand-in in
  `POSE_BY_EXERCISE`)
- Image model: Nano Banana Pro, through gemini.google.com (Images tool, Pro, 1:1). Video model: Kling, through kling.ai.

## Keyframes
| Frame | Prompt | Model | Media id |
|---|---|---|---|
| A | `panda-stand.webp` centred on 1024x1024 `#00FF00`, feet at y=870 | none | `78257cac-2ea0-4682-a7a9-98731012a921` |
| B | try 4 below (pose guide) | Nano Banana Pro via gemini.google.com, 1:1, 1024x1024 JPEG saved as PNG | n/a |

### B prompt

```
Redraw this exact panda character in a new pose. Keep everything else
identical: the same character design, proportions, face, blue headband, line
weight, shading, colours and size on the canvas, front-facing view, same
horizontal position centred on the canvas, with its feet planted on exactly
the same line and in the same place as in the reference.

New pose: the bottom of a gentle bodyweight squat. Feet stay flat and planted
where they are, about hip-width apart. Knees bent and pointing forward over
the toes, hips lowered and pushed back as if about to sit on a chair, thighs a
little above parallel to the ground. Chest tall and upright, head level and
looking straight ahead with the same calm, friendly smile. Both arms reach
straight forward at shoulder height for balance, paws relaxed.

Background: flat solid pure green #00FF00, no shadow, no floor, no gradient,
no chair, nothing else in the image. Square image.
```

## Reference
- Stick figure: `reference/review.mp4`, `reference/driver.mp4`, rendered
  2026-10-02, one repetition (4.8s). The user went ahead with it, which
  counts as Gate 1 approval.
- Video used for Motion Control: `driver.mp4` (the stick figure).

## Generation
| Take | Reference | Prompt and settings | Credits | Result |
|---|---|---|---|---|
| 1 | none: start frame A, end frame B (fallback method) | VIDEO 3.0, 720p, 3s, 1 output, audio off; prompt "The panda slowly lowers into a gentle squat ..." | 18 | Rejected by the user: very unnatural movement. Led to the workflow change to motion transfer from a body. Also showed the free plan's visible "KlingAI 3.0" watermark, bottom right. |
| 2 | `reference/driver.mp4`, 4.8s | Motion Control, VIDEO 3.0, 720p, 1 output, character orientation follows the video; this screen has no prompt box | 45 | Submitted 2026-10-02; free-plan queue estimated at 59 minutes. |

## Gate notes
- Gate 1 (attempts, 2026-10-02):
  1. B prompt as written: same panda, but turned three-quarters left with arms
     out to the side, and the head at standing height.
  2. Asked to face front, paws at chest, head a quarter lower: faces front,
     paws at chest, head still at standing height (torso squashed instead).
  3. Asked for ears level with the reference's eyes: unchanged head height.
  4. New chat with a stick-figure pose guide (`keyframes/B-pose-guide.png`,
     head lowered 70px, torso length kept, feet on the ground line): wide
     front-facing squat, paws at chest, head still at standing height.
  The guide's first draft lowered the head by a quarter of the panda's
  height; that is wrong for this character, whose legs are about a fifth of
  its height, so a real squat lowers the head by roughly 60-70px on the
  1024 canvas.
  Finding: the image model holds the head in place and compresses the body.
  Decision: the user accepted try 4 as B, knowing the head does not lower.
  B lines up with A: feet line y=869 and head top y=224 in both.
- Gate 2:
- Gate 3:

## Output
- `src/assets/panda-squat.webp`:
- `src/assets/panda-squat-still.webp`:
