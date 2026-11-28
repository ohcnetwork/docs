#!/usr/bin/env python3
"""Build plan.json from the recorded captions and the narration script.

Reads ../out/<slug>.vtt, the captions the recording kit wrote, and writes plan.json
next to this script. Each caption cue becomes one spoken line. The line comes from
script/<slug>.txt when that file exists: one line of text per caption, in order, and
a line may hold several sentences ("#" lines and blank lines are skipped). Without a
script, the line says only what the caption says:

    "3. Select Cancel Token"  ->  "Step 3. Select Cancel Token."
    "Set the primary queue"   ->  "Set the primary queue."

Usage: make_plan.py --draft [slug ...]
           write script/<slug>.txt with those caption-only lines, for each flow that
           has no script yet, to be extended with context by hand
       make_plan.py [--order slug,slug,...] VOICE[=voice_id] [VOICE[=voice_id] ...]

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
SCRIPTS = os.path.join(HERE, "script")


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
    digest = hashlib.sha1(line.encode()).hexdigest()
    if not line.isascii():
        return digest[:12] + ".mp3"
    name = re.sub(r"[^a-z0-9]+", "-", line.lower()).strip("-")
    # A line with context is long; keep the file name short and unique.
    return (name if len(name) <= 60 else f"{name[:50].rstrip('-')}-{digest[:8]}") + ".mp3"


def script_lines(slug, caps):
    """The spoken lines of a flow: its script when there is one, else the captions."""
    path = os.path.join(SCRIPTS, f"{slug}.txt")
    if not os.path.exists(path):
        return [spoken(t) for _, _, t in caps]
    lines = [" ".join(x.split()) for x in open(path, encoding="utf-8") if x.strip() and not x.lstrip().startswith("#")]
    if len(lines) != len(caps):
        sys.exit(f"{path} has {len(lines)} lines; the recording has {len(caps)} captions. Write one line per caption.")
    return lines


def draft(slugs):
    os.makedirs(SCRIPTS, exist_ok=True)
    for f in sorted(os.listdir(SRC)):
        slug = f[:-4]
        if not f.endswith(".vtt") or (slugs and slug not in slugs):
            continue
        path = os.path.join(SCRIPTS, f"{slug}.txt")
        if os.path.exists(path):
            print(f"kept     {path}")
            continue
        caps = cues(os.path.join(SRC, f))
        with open(path, "w", encoding="utf-8") as out:
            out.write("# One line per caption, in order. Add a sentence or two of context from the page to each.\n")
            out.write("".join(f"# caption: {t}\n{spoken(t)}\n" for _, _, t in caps))
        print(f"drafted  {path} ({len(caps)} lines)")


def main():
    args = sys.argv[1:]
    if not args or args[0] in ("-h", "--help"):
        sys.exit(__doc__)
    if args[:1] == ["--draft"]:
        draft(args[1:])
        return
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
            caps = cues(os.path.join(SRC, f))
            flows[f[:-4]] = [dict(start=a, end=b, text=t, say=say, file=file_for(say))
                             for (a, b, t), say in zip(caps, script_lines(f[:-4], caps))]
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
