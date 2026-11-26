#!/usr/bin/env python3
"""Check the narrated videos in out/.

For each video: the sound and the picture are the same length; each caption's voice
starts within MAX_LAG of the caption and ends at least MIN_MARGIN before the next
caption; the peak level stays at or below MAX_PEAK. Prints one row per video, and
exits 1 if any check fails.

Overlaps are judged by where each caption's speech ends, not by counting the gaps
in the sound: cloned voices pause after "Step 3.", which splits one line in two.

Usage: check.py [slug ...]    (no slug: every video in out/)
"""
import glob
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")
MAX_LAG = 0.45      # seconds from caption start to voice start
MIN_MARGIN = 0.3    # seconds from the end of a line to the next caption
MAX_PEAK = -1.0     # dB
MAX_DRIFT = 0.05    # seconds between sound and picture length


def stream_length(path, stream):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", stream, "-show_entries", "stream=duration",
                          "-of", "csv=p=0", path], capture_output=True, text=True).stdout
    return float(out.strip())


def captions(vtt):
    t = lambda s: sum(float(x) * m for x, m in zip(s.split(":"), (3600, 60, 1)))
    return [(t(a), t(b)) for a, b in re.findall(r"(\d\d:\d\d:\d\d\.\d+) --> (\d\d:\d\d:\d\d\.\d+)", open(vtt).read())]


def check(slug):
    mp4 = os.path.join(OUT, f"{slug}.mp4")
    log = subprocess.run(["ffmpeg", "-hide_banner", "-i", mp4, "-map", "0:a",
                          "-af", "silencedetect=n=-40dB:d=0.25,volumedetect", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
    speech = [(e, min([s for s in starts if s > e], default=float("inf"))) for e in ends]
    peak = float(re.search(r"max_volume: (-?[\d.]+) dB", log).group(1))
    drift = abs(stream_length(mp4, "v:0") - stream_length(mp4, "a:0"))
    cues = captions(os.path.join(OUT, f"{slug}.vtt"))
    problems = []
    if drift > MAX_DRIFT:
        problems.append(f"sound and picture differ by {drift:.2f}s")
    if peak > MAX_PEAK:
        problems.append(f"peak {peak} dB")
    for i, (a, b) in enumerate(cues):
        mine = [(s, e) for s, e in speech if a - 0.05 <= s < b]
        if not mine:
            problems.append(f"step {i + 1}: no voice")
            continue
        lag = mine[0][0] - a
        if lag > MAX_LAG:
            problems.append(f"step {i + 1}: voice starts {lag:.2f}s late")
        if i + 1 < len(cues) and cues[i + 1][0] - max(e for _, e in mine) < MIN_MARGIN:
            problems.append(f"step {i + 1}: voice runs into step {i + 2}")
    print(f"{'BAD' if problems else 'ok '}  {slug:34s} {len(cues):2d} steps  peak {peak:5.1f} dB  " + "; ".join(problems))
    return not problems


def main():
    slugs = sys.argv[1:] or sorted(os.path.basename(p)[:-4] for p in glob.glob(os.path.join(OUT, "*.mp4")))
    results = [check(s) for s in slugs]
    sys.exit(0 if all(results) else 1)


if __name__ == "__main__":
    main()
