"""
Step 2 of docs/exercise-animations.md: turn an exercise's motion spec into a
stick-figure animation of a human body, so the movement is approved before
any generation is paid for, and so there is a reference video to drive
motion transfer with.

    python animation/stick_figure.py <exercise-id>

Reads animation/<exercise-id>/motion.json and writes, beside it:
  reference/review.mp4   front and side views together, for the gate
  reference/driver.mp4   front view alone, square, for motion transfer

The figure is posed by joint angles on an adult's proportions, so it can only
move the way a body moves, and it eases between keyframes on a minimum-jerk
profile: the bell-shaped speed curve of a human reach, slow out of a pose,
fastest midway, slow into the next. Linear or constant-speed tweens are what
make generated movement look mechanical.

Joint angles, in degrees, all 0 when standing tall with arms by the sides:
  trunk.flex   lean forward (+) / back (-)      trunk.side  bend to the right (+)
  trunk.twist  turn the chest to the left (+)
  neck.flex    chin down (+) / up (-)           neck.side   ear to right shoulder (+)
  neck.twist   look to the left (+)
  <side>.shoulder.flex  arm forward and up: 90 forward, 180 overhead
  <side>.shoulder.abd   arm out to the side: 90 level with the shoulder
  <side>.elbow          bend
  <side>.hip.flex       thigh forward and up    <side>.hip.abd   thigh out
  <side>.knee           bend, shin going back
where <side> is left or right: the figure's own left and right. A pose may
give "both" instead to set left and right together.

"planted": true keeps the feet fixed on the ground and moves the body over
them, as in a squat; false lets the body stay put and the feet move, as in
a march.

Needs Python 3 with: pip install pillow numpy imageio-ffmpeg
"""

import json
import sys
from pathlib import Path

import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
FPS = 24

# An adult of 1.75 m, in metres: Drillis and Contini's segment proportions.
NECK = 0.52          # pelvis centre to the base of the neck
HEAD_UP = 0.13       # base of the neck to the centre of the head
HEAD_R = 0.11
SHOULDER = 0.19      # half the shoulder width
HIP = 0.10           # half the hip width
UPPER_ARM, FOREARM = 0.30, 0.27
THIGH, SHIN = 0.43, 0.43
ANKLE_Y = 0.08       # ankle height above the floor
FOOT = 0.16
PELVIS_Y = THIGH + SHIN + ANKLE_Y

DOWN = np.array([0.0, -1.0, 0.0])
UP = np.array([0.0, 1.0, 0.0])


def rx(a):  # positive tips +y towards +z: a lean forward
    a = np.radians(a)
    return np.array([[1, 0, 0], [0, np.cos(a), -np.sin(a)], [0, np.sin(a), np.cos(a)]])


def ry(a):
    a = np.radians(a)
    return np.array([[np.cos(a), 0, np.sin(a)], [0, 1, 0], [-np.sin(a), 0, np.cos(a)]])


def rz(a):  # positive tips +y towards -x
    a = np.radians(a)
    return np.array([[np.cos(a), -np.sin(a), 0], [np.sin(a), np.cos(a), 0], [0, 0, 1]])


# The figure faces the viewer (+z). Its own left is the viewer's right (+x).
SIDES = {"left": 1.0, "right": -1.0}


def expand(pose: dict) -> dict:
    """Flatten {"both": {...}} into left and right."""
    out = {k: v for k, v in pose.items() if k != "both"}
    for side in SIDES:
        merged = dict(pose.get("both", {}))
        merged.update(pose.get(side, {}))
        out[side] = merged
    return out


def get(pose, path, default=0.0):
    node = pose
    for key in path.split("."):
        if not isinstance(node, dict) or key not in node:
            return default
        node = node[key]
    return node


def joints(pose: dict, planted: bool) -> dict:
    p = expand(pose)
    pelvis = np.array([0.0, PELVIS_Y, 0.0])
    trunk = ry(get(p, "trunk.twist")) @ rz(get(p, "trunk.side")) @ rx(get(p, "trunk.flex"))
    neck = pelvis + trunk @ UP * NECK
    head_r = trunk @ ry(get(p, "neck.twist")) @ rz(get(p, "neck.side")) @ rx(get(p, "neck.flex"))
    head = neck + head_r @ UP * HEAD_UP
    nose = head + head_r @ np.array([0.0, 0.0, HEAD_R])
    j = {"pelvis": pelvis, "neck": neck, "head": head, "nose": nose}
    for side, s in SIDES.items():
        q = p[side]
        shoulder = neck + trunk @ np.array([s * SHOULDER, -0.02, 0])
        arm = trunk @ rz(s * get(q, "shoulder.abd")) @ rx(-get(q, "shoulder.flex"))
        elbow = shoulder + arm @ DOWN * UPPER_ARM
        hand = elbow + arm @ rx(-get(q, "elbow")) @ DOWN * FOREARM
        hip = pelvis + np.array([s * HIP, 0, 0])
        leg = rz(s * get(q, "hip.abd")) @ rx(-get(q, "hip.flex"))
        knee = hip + leg @ DOWN * THIGH
        ankle = knee + leg @ rx(get(q, "knee")) @ DOWN * SHIN
        j.update({f"{side}_shoulder": shoulder, f"{side}_elbow": elbow,
                  f"{side}_hand": hand, f"{side}_hip": hip,
                  f"{side}_knee": knee, f"{side}_ankle": ankle})
    if planted:
        # Feet stay where a standing body puts them; the body moves over them.
        a = (j["left_ankle"] + j["right_ankle"]) / 2
        shift = np.array([0.0, ANKLE_Y - min(j["left_ankle"][1], j["right_ankle"][1]), -a[2]])
        j = {k: v + shift for k, v in j.items()}
    return j


def min_jerk(u: float) -> float:
    return u ** 3 * (10 - 15 * u + 6 * u ** 2)


def blend(a, b, w):
    if isinstance(a, dict) or isinstance(b, dict):
        a, b = a if isinstance(a, dict) else {}, b if isinstance(b, dict) else {}
        return {k: blend(a.get(k, 0.0), b.get(k, 0.0), w) for k in set(a) | set(b)}
    return a + (b - a) * w


def pose_at(keys: list, t: float) -> dict:
    for k0, k1 in zip(keys, keys[1:]):
        if k0["t"] <= t <= k1["t"]:
            span = k1["t"] - k0["t"]
            u = 0 if span == 0 else (t - k0["t"]) / span
            return blend(expand(k0["pose"]), expand(k1["pose"]), min_jerk(u))
    return expand(keys[-1]["pose"])


BONES = [("pelvis", "neck")] + [
    (f"{s}_{a}", f"{s}_{b}") for s in SIDES for a, b in
    [("shoulder", "elbow"), ("elbow", "hand"), ("hip", "knee"), ("knee", "ankle")]
] + [("left_shoulder", "right_shoulder"), ("left_hip", "right_hip")]


def draw(j: dict, view: str, size: int) -> Image.Image:
    img = Image.new("RGB", (size, size), "white")
    d = ImageDraw.Draw(img)
    scale = size / 2.2
    def xy(v):
        horiz = v[0] if view == "front" else -v[2]
        return (size / 2 + horiz * scale, size - 0.12 * size - v[1] * scale)
    d.line([(0, xy([0, 0, 0])[1]), (size, xy([0, 0, 0])[1])], fill=(210, 210, 210), width=2)
    w = max(4, size // 40)
    # The figure's left side is drawn darker so a twist or a one-sided move
    # can be read at a glance.
    for a, b in BONES:
        col = (130, 130, 130) if a.startswith("right") else (40, 40, 40)
        d.line([xy(j[a]), xy(j[b])], fill=col, width=w)
    for s in SIDES:
        ax, ay = xy(j[f"{s}_ankle"])
        if view == "front":
            d.line([(ax - w, ay + w), (ax + w, ay + w)], fill=(40, 40, 40), width=w)
        else:
            d.line([(ax, ay), (ax - FOOT * scale, ay + 0.3 * w)], fill=(40, 40, 40), width=w)
    for jn in j:
        if jn not in ("head", "nose"):
            x, y = xy(j[jn]); r = w * 0.7
            d.ellipse((x - r, y - r, x + r, y + r), fill=(40, 40, 40))
    hx, hy = xy(j["head"]); r = HEAD_R * scale
    d.ellipse((hx - r, hy - r, hx + r, hy + r), outline=(40, 40, 40), width=w)
    # A nose, so the facing direction is visible in both views.
    nx, ny = xy(j["nose"])
    d.ellipse((nx - w * 0.6, ny - w * 0.6, nx + w * 0.6, ny + w * 0.6), fill=(200, 60, 60))
    return img


def write_mp4(frames, path: Path):
    path.parent.mkdir(parents=True, exist_ok=True)
    w, h = frames[0].size
    writer = imageio_ffmpeg.write_frames(
        str(path), (w, h), fps=FPS, codec="libx264", pix_fmt_out="yuv420p",
        quality=9, macro_block_size=16)
    writer.send(None)
    for f in frames:
        writer.send(np.asarray(f).tobytes())
    writer.close()


def main():
    exercise = sys.argv[1]
    base = ROOT / "animation" / exercise
    spec = json.loads((base / "motion.json").read_text())
    keys, planted = spec["keyframes"], spec.get("planted", True)
    repeats = spec.get("repeats", 1)
    length = keys[-1]["t"]
    times = [i / FPS for i in range(round(length * FPS * repeats))]
    review, driver = [], []
    for t in times:
        j = joints(pose_at(keys, t % length), planted)
        front, side = draw(j, "front", 512), draw(j, "side", 512)
        both = Image.new("RGB", (1024, 512), "white")
        both.paste(front, (0, 0)); both.paste(side, (512, 0))
        review.append(both)
        driver.append(draw(j, "front", 720))
    write_mp4(review, base / "reference" / "review.mp4")
    write_mp4(driver, base / "reference" / "driver.mp4")
    print(f"{len(times)} frames, {len(times) / FPS:.1f}s -> {base.relative_to(ROOT)}/reference/")


if __name__ == "__main__":
    main()
