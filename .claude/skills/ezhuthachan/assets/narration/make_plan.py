#!/usr/bin/env python3
"""Build plan.json from the recorded captions.

Reads ../out/<slug>.vtt, the captions the recording kit wrote, and writes plan.json
next to this script. Each caption cue becomes one spoken line, which says only what
the caption says:

    "3. Select Cancel Token"  ->  "Step 3. Select Cancel Token."
    "Set the primary queue"   ->  "Set the primary queue."

Usage: make_plan.py [--order slug,slug,...] VOICE[=voice_id] [VOICE[=voice_id] ...]

VOICE is a short folder name such as "gauri"; voice_id is its id from
creative_list_voices. One voice reads every flow. Several voices take turns flow by
flow in --order (give the sidebar order); flows missing from --order come last, by
name. Running it again keeps "hold_frame" (see stitch.py) from the existing plan.json.
"""
import hashlib
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(os.path.dirname(HERE), "out")
PLAN = os.path.join(HERE, "plan.json")


def seconds(stamp):
    h, m, s = stamp.split(":")
    return int(h) * 3600 + int(m) * 60 + float(s)


def cues(vtt):
    text = open(vtt, encoding="utf-8").read()
    found = re.findall(r"(\d\d:\d\d:\d\d\.\d+) --> (\d\d:\d\d:\d\d\.\d+)[^\n]*\n(.+?)(?:\n\n|\n*\Z)", text, re.S)
    return [(seconds(a), seconds(b), " ".join(t.split())) for a, b, t in found]


def spoken(caption):
    m = re.match(r"(\d+)\.\s+(.*)", caption)
    line = f"Step {m.group(1)}. {m.group(2)}" if m else caption
    return line if line[-1] in ".!?" else line + "."


def file_for(line):
    if line.isascii():
        name = re.sub(r"[^a-z0-9]+", "-", line.lower()).strip("-")
    else:
        name = hashlib.sha1(line.encode()).hexdigest()[:12]
    return name + ".mp3"


def main():
    args = sys.argv[1:]
    order = []
    if "--order" in args:
        i = args.index("--order")
        order = [s for s in args[i + 1].split(",") if s]
        del args[i:i + 2]
    if not args:
        sys.exit(__doc__)
    voices = dict((a.split("=", 1) + [""])[:2] for a in args)
    names = list(voices)

    flows = {}
    for f in sorted(os.listdir(SRC)):
        if f.endswith(".vtt"):
            flows[f[:-4]] = [dict(start=a, end=b, text=t, say=spoken(t), file=file_for(spoken(t)))
                             for a, b, t in cues(os.path.join(SRC, f))]
    unknown = [s for s in order if s not in flows]
    if unknown:
        sys.exit("no recording for: " + ", ".join(unknown))
    order += [s for s in sorted(flows) if s not in order]

    old = json.load(open(PLAN, encoding="utf-8")) if os.path.exists(PLAN) else {}
    plan = dict(voices=voices, order=order,
                assign={s: names[i % len(names)] for i, s in enumerate(order)},
                hold_frame=old.get("hold_frame", {}), flows=flows)
    with open(PLAN, "w", encoding="utf-8") as f:
        json.dump(plan, f, indent=1, ensure_ascii=False)
    for s in order:
        print(f"{plan['assign'][s]:>10}  {s}  ({len(flows[s])} lines)")


if __name__ == "__main__":
    main()
