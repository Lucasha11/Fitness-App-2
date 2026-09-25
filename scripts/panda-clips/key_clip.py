"""
Turn a Higgsfield panda clip (MP4 on white) into the app's looping,
transparent animated WebP.

    pip install pillow numpy imageio-ffmpeg
    python scripts/panda-clips/key_clip.py neck-rolls.mp4 neck-rolls

writes src/assets/clips/panda-neck-rolls.webp, which the app picks up by name.

Only white that touches the frame's edge is keyed out. The panda's own white
fur is enclosed by its navy outline, so it stays opaque, which is how the
keyframe stills were cut too. The clip is then cropped to the panda's reach. Edge pixels get partial alpha from how white
they are, so the outline doesn't pick up a white fringe on tinted tiles.
"""

import subprocess
import sys
from pathlib import Path

import imageio_ffmpeg
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

FPS = 12
SIZE = 400  # the player shows it at 270 CSS px
SOURCE = 480  # frames are keyed at this size, then cropped and scaled to SIZE
MARGIN = 0.06  # room left around the panda's widest reach, per side
WHITE = 232  # min(R, G, B) above this counts as background white
QUALITY = 75

ROOT = Path(__file__).resolve().parents[2]


def frames(src: Path):
    raw = subprocess.run(
        [
            imageio_ffmpeg.get_ffmpeg_exe(), '-loglevel', 'error', '-i', str(src),
            '-vf', f'fps={FPS},scale={SOURCE}:{SOURCE}:force_original_aspect_ratio=decrease,'
                   f'pad={SOURCE}:{SOURCE}:(ow-iw)/2:(oh-ih)/2:white',
            '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-',
        ],
        check=True, capture_output=True,
    ).stdout
    step = SOURCE * SOURCE * 3
    for i in range(0, len(raw), step):
        yield np.frombuffer(raw[i:i + step], np.uint8).reshape(SOURCE, SOURCE, 3)


def key(rgb: np.ndarray) -> Image.Image:
    lightest = rgb.min(axis=2)
    # copy(): an image made by fromarray shares the array's read-only buffer,
    # and floodfill then writes nothing without complaint.
    mask = Image.fromarray(np.where(lightest > WHITE, 255, 0).astype(np.uint8)).copy()
    # Flood the white from every edge pixel; 128 marks "background".
    for x in range(SOURCE):
        for y in (0, SOURCE - 1):
            if mask.getpixel((x, y)) == 255:
                ImageDraw.floodfill(mask, (x, y), 128)
            if mask.getpixel((y, x)) == 255:
                ImageDraw.floodfill(mask, (y, x), 128)
    background = np.array(mask) == 128

    # A one-pixel band around the background fades by whiteness.
    band = np.array(Image.fromarray(background.astype(np.uint8) * 255)
                    .filter(ImageFilter.MaxFilter(3))) > 0
    soft = np.clip((255 - lightest.astype(float)) / (255 - 180), 0, 1) * 255
    alpha = np.full((SOURCE, SOURCE), 255, np.uint8)
    alpha[band] = soft[band].astype(np.uint8)
    alpha[background] = 0
    return Image.fromarray(np.dstack([rgb, alpha]), 'RGBA')


def crop_box(keyed: list[Image.Image]) -> tuple[int, int, int, int]:
    """One square around everywhere the panda reaches, shared by every frame.

    The keyframes leave wide margins, so an uncropped clip plays smaller than
    the drawn poses around it. One box for the whole clip keeps the panda
    from swimming as its arms move.
    """
    boxes = [frame.getchannel('A').point(lambda a: 255 if a > 16 else 0).getbbox()
             for frame in keyed]
    boxes = [box for box in boxes if box]
    left, top = min(b[0] for b in boxes), min(b[1] for b in boxes)
    right, bottom = max(b[2] for b in boxes), max(b[3] for b in boxes)
    side = round(max(right - left, bottom - top) * (1 + 2 * MARGIN))
    cx, cy = (left + right) // 2, (top + bottom) // 2
    return cx - side // 2, cy - side // 2, cx - side // 2 + side, cy - side // 2 + side


def main(src: str, exercise_id: str) -> None:
    keyed = [key(frame) for frame in frames(Path(src))]
    box = crop_box(keyed)
    keyed = [frame.crop(box).resize((SIZE, SIZE), Image.LANCZOS) for frame in keyed]
    out = ROOT / 'src' / 'assets' / 'clips' / f'panda-{exercise_id}.webp'
    keyed[0].save(
        out, save_all=True, append_images=keyed[1:], duration=round(1000 / FPS),
        loop=0, quality=QUALITY, method=6,
    )
    print(f'{out.relative_to(ROOT)}: {len(keyed)} frames, {out.stat().st_size // 1024} KB')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
