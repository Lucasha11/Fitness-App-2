# Panda exercise clips

Each exercise can have a looping clip of the panda demonstrating it. A clip
goes live when `src/assets/clips/panda-<exercise id>.webp` exists; until then
the exercise shows its drawn pose (see `src/player/clips.ts`).

## Recipe

Settings the Neck rolls test clip used on Higgsfield:

| | |
|---|---|
| Model | Seedance 1.5 Pro (`seedance1_5`), about 2.4 credits a clip |
| Length | 4 s, 480p, 1:1, audio off |
| Start image and end image | the same keyframe (`src/assets/panda-<pose>.webp` flattened onto white) |

Passing the keyframe as both the start and the end frame makes the clip
begin and end on the same drawing, so it loops without a jump.

Prompt template, with the movement filled in per exercise:

> Flat 2D cartoon animation of this exact panda mascot doing *{exercise}*.
> *{One or two sentences describing the movement, ending back in the start
> pose.}* Calm, gentle, friendly expression. Keep the character design, thick
> navy outlines, blue headband, colours and proportions identical to the
> reference. Pure plain white background, no shadow, no ground, no props, no
> text. Locked static camera, no zoom, no pan. Smooth, simple, clean cel
> animation.

## Keying

```bash
pip install pillow numpy imageio-ffmpeg
python scripts/panda-clips/key_clip.py downloaded.mp4 neck-rolls
```

The white background is keyed out and the result is written as a transparent
animated WebP, which Safari and WKWebView play in a plain `<img>`. `npm run
test:run` then checks that the file name matches an exercise.
