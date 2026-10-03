"""
Step 6 of docs/exercise-animations.md: key the green out of the chosen takes,
join them into one loop and encode the loop and its still for the app.

    python animation/key_and_encode.py <exercise-id> <pose> \
        --clips takes/a-b.mp4 [takes/b-a.mp4 ...] [--pingpong] \
        [--hold-start 0.3] [--hold-end 0.4]

Clips are joined in the order given. --pingpong plays the last clip back in
reverse to close the loop, for an out-and-back move with only an A->B take;
never use it on a circle, which would change direction halfway.

Writes src/assets/panda-<pose>.webp (looping, with alpha) and
src/assets/panda-<pose>-still.webp (its first frame), both 640x640: the
still has to be the loop's first frame so pausing never jumps between
drawings (see src/components/demos.ts).

Needs Python 3 with: pip install pillow numpy imageio-ffmpeg
"""

import argparse
import sys
from pathlib import Path

import imageio_ffmpeg
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SIZE = 640

# How green a pixel must be, beyond its red and blue, to count as backdrop.
# The panda is navy, grey, white and blue, so nothing on it gets near these;
# the soft band between them anti-aliases the outline instead of cutting a
# hard, jagged edge into it.
KEY_SOFT = 40
KEY_HARD = 90


def read_frames(path: Path) -> tuple[list[np.ndarray], float]:
    reader = imageio_ffmpeg.read_frames(str(path))
    meta = next(reader)
    w, h = meta["size"]
    frames = [
        np.frombuffer(buf, np.uint8).reshape(h, w, 3).copy() for buf in reader
    ]
    return frames, meta["fps"]


def key(frame: np.ndarray) -> Image.Image:
    rgb = frame.astype(np.float32)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    greenness = g - np.maximum(r, b)
    alpha = 1 - np.clip((greenness - KEY_SOFT) / (KEY_HARD - KEY_SOFT), 0, 1)
    # Despill: green light bleeds into the fur along the edge. Nothing on the
    # panda is meant to be green, so green is never allowed above red/blue.
    rgb[..., 1] = np.minimum(g, np.maximum(r, b))
    rgba = np.dstack([rgb, alpha * 255]).round().astype(np.uint8)
    return Image.fromarray(rgba, "RGBA")


def square(img: Image.Image) -> Image.Image:
    w, h = img.size
    side = min(w, h)
    left, top = (w - side) // 2, (h - side) // 2
    img = img.crop((left, top, left + side, top + side))
    return img.resize((SIZE, SIZE), Image.LANCZOS)


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("exercise")
    p.add_argument("pose")
    p.add_argument("--clips", nargs="+", required=True)
    p.add_argument("--pingpong", action="store_true")
    p.add_argument("--hold-start", type=float, default=0.0,
                   help="seconds to rest on the first frame each loop")
    p.add_argument("--hold-end", type=float, default=0.0,
                   help="seconds to rest at the turn of a ping-pong")
    p.add_argument("--quality", type=int, default=80)
    args = p.parse_args()

    base = ROOT / "animation" / args.exercise
    frames: list[np.ndarray] = []
    fps = None
    for i, clip in enumerate(args.clips):
        clip_frames, clip_fps = read_frames(base / clip)
        fps = fps or clip_fps
        # Each clip starts on the frame the last one ended on; keep one copy.
        frames.extend(clip_frames if i == 0 else clip_frames[1:])

    hold_start = round(args.hold_start * fps)
    hold_end = round(args.hold_end * fps)
    if args.pingpong:
        frames = frames + [frames[-1]] * hold_end + frames[-2:0:-1]
    frames = [frames[0]] * hold_start + frames

    keyed = [square(key(f)) for f in frames]
    out = ROOT / "src" / "assets"
    loop = out / f"panda-{args.pose}.webp"
    still = out / f"panda-{args.pose}-still.webp"
    duration = round(1000 / fps)
    keyed[0].save(
        loop, save_all=True, append_images=keyed[1:], duration=duration,
        loop=0, quality=args.quality, method=6, lossless=False,
    )
    keyed[0].save(still, quality=90, method=6)
    print(f"{len(keyed)} frames at {fps:g} fps ({len(keyed) / fps:.1f}s)")
    for f in (loop, still):
        print(f"{f.relative_to(ROOT)}: {f.stat().st_size / 1024:.0f} KB")


if __name__ == "__main__":
    sys.exit(main())
