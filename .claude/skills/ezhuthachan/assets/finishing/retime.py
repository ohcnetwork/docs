#!/usr/bin/env python3
"""Tighten a recording to a brisk pace: motion (cursor moves, typing, page changes) plays
faster, and still stretches (nothing on screen changes) are cut down to a short pause.

Usage: retime.py <in.mp4> <out.mp4> [--speed 1.8] [--still 0.8] [--end 1.5] [--map plan.json]

--map writes the kept segments, so zoom.py can move the input log onto the new timeline.

A frame counts as still when no pixel of a 160 px wide greyscale copy differs from the frame
before by more than a small threshold; the cursor alone is enough to count as motion.
"""
import argparse
import json
import subprocess
import sys

FPS = 30
SW = 160          # analysis width
THRESH = 10       # grey levels
MIN_STILL = 0.25  # seconds; shorter pauses are left as they are (part of the motion)
BIG = 0.03        # share of pixels that change when the page changes


def probe(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
                          "-of", "csv=p=0", path], capture_output=True, text=True, check=True).stdout.strip()
    w, h = map(int, out.split(","))
    return w, h


def changed_frames(path):
    w, h = probe(path)
    sh = max(2, round(h * SW / w / 2) * 2)
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-vf", f"fps={FPS},scale={SW}:{sh}:flags=area,format=gray",
                          "-f", "rawvideo", "-"], capture_output=True, check=True).stdout
    size = SW * sh
    frames = [raw[i:i + size] for i in range(0, len(raw) - size + 1, size)]
    moved, big, frac = [True], [False], [0.0]
    for prev, cur in zip(frames, frames[1:]):
        n = 0 if prev == cur else sum(1 for a, b in zip(prev, cur) if abs(a - b) > THRESH)
        moved.append(n > 0)
        big.append(n > BIG * size)
        frac.append(round(n / size, 3))
    return moved, big, frac


def plan(moved, big, speed, still, end, lead):
    """Segments (start_frame, end_frame, speed) of the source to keep, in order.
    The opening is cut to `lead` seconds (output time) before the first page change."""
    first = next((k for k, b in enumerate(big) if b and k > 0), 0)
    skip = max(0, first - round(lead * speed * FPS))
    moved = moved[skip:]
    n = len(moved)
    runs, i = [], 0
    while i < n:
        j = i
        while j < n and moved[j] == moved[i]:
            j += 1
        runs.append((i, j, moved[i]))
        i = j
    # Short still runs are part of the motion around them.
    merged = []
    for a, b, m in runs:
        m = m or (b - a) < MIN_STILL * FPS
        if merged and merged[-1][2] == m:
            merged[-1] = (merged[-1][0], b, m)
        else:
            merged.append((a, b, m))
    segs = []
    for k, (a, b, m) in enumerate(merged):
        if m:
            segs.append((a + skip, b + skip, speed))
        else:
            cap = end if k == len(merged) - 1 else still
            segs.append((a + skip, min(b, a + round(cap * FPS)) + skip, 1.0))
    return segs


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("dst")
    ap.add_argument("--speed", type=float, default=1.8)
    ap.add_argument("--still", type=float, default=0.8)
    ap.add_argument("--end", type=float, default=1.5)
    ap.add_argument("--lead", type=float, default=1.2)
    ap.add_argument("--map")
    a = ap.parse_args()
    moved, big, frac = changed_frames(a.src)
    segs = plan(moved, big, a.speed, a.still, a.end, a.lead)
    if a.map:
        with open(a.map, "w") as f:
            json.dump({"fps": FPS, "segs": segs, "big": [k for k, b in enumerate(big) if b], "frac": frac}, f)
    parts, labels = [], []
    for i, (s, e, sp) in enumerate(segs):
        parts.append(f"[0:v]trim=start_frame={s}:end_frame={e},setpts=(PTS-STARTPTS)/{sp}[s{i}]")
        labels.append(f"[s{i}]")
    graph = ";".join(parts) + ";" + "".join(labels) + f"concat=n={len(segs)}:v=1:a=0,fps={FPS}[v]"
    done = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", a.src, "-filter_complex", graph,
                           "-map", "[v]", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "12", "-preset", "fast", "-an", a.dst],
                          capture_output=True, text=True)
    if done.returncode:
        sys.exit("ffmpeg failed:\n" + done.stderr[-2000:])
    out_len = sum((e - s) / sp for s, e, sp in segs) / FPS
    print(f"{a.src}: {len(segs)} segments, {out_len:.1f} s out")


if __name__ == "__main__":
    main()
