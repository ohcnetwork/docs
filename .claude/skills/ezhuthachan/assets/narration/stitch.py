#!/usr/bin/env python3
"""Put the narration clips into the recorded videos.

Reads plan.json (from make_plan.py), the recordings in ../out/ and the clips in
audio/<voice>/, and writes out/<slug>.mp4 and out/<slug>.vtt next to this script.
The recordings are not changed.

Each clip is trimmed of silence and starts LEAD seconds after its caption. When a
line does not fit before the next caption with GAP to spare, the video holds a frame
for the missing time. The voice is never sped up. The captions are re-timed to match.

The subtitles in out/<slug>.vtt are the spoken words, split into pieces of at most
MAX_CUE characters and timed along the voice. A piece's cue id is "<step>.<piece>".

Which frame is held is set per step in "hold_frame" in plan.json, keyed "<slug> <step>":
  (not listed)   the step's first frame
  "last"         the step's last frame
  0.5            the frame 0.5 s into the step (any number of seconds)

Usage:
  stitch.py --lines [slug ...]    each voice's id and the lines it still needs
  stitch.py --dry [slug ...]      which steps hold a frame, and for how long
  stitch.py --frames [slug ...]   check/<slug>-holds.png, one row per held step:
                                  the frame that will be held | first | 0.5 s in | last
  stitch.py [slug ...]            encode out/<slug>.mp4 and out/<slug>.vtt
No slug means every flow. NARRATOR=<voice> makes that voice read every flow.
"""
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(os.path.dirname(HERE), "out")
OUT = os.path.join(HERE, "out")
TRIM = os.path.join(HERE, "trimmed")
CHECK = os.path.join(HERE, "check")
LEAD = 0.25   # silence before the voice, from the start of the caption
GAP = 0.5     # silence after the voice, before the next caption may start
MAX_CUE = 84  # characters in one subtitle: two lines of about 42
GAIN_DB = -1.0  # on the mixed voice: some clips come at -0.9 dB and AAC lifts them past check.py's -1 dB peak
PLAN = json.load(open(os.path.join(HERE, "plan.json"), encoding="utf-8"))
FRAME = 1 / 30


def held_at(slug, step, seg):
    """Seconds into the step of the frame to hold: 0 for the first frame."""
    a, b = seg
    where = PLAN.get("hold_frame", {}).get(f"{slug} {step}", "first")
    if where == "first":
        return 0.0
    if where == "last":
        return b - a
    if not 0 < float(where) < b - a:
        sys.exit(f"hold_frame for {slug} {step}: {where} is outside the step (0 to {b - a:.2f} s)")
    return float(where)


def run(args):
    done = subprocess.run(args, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True)
    if done.returncode != 0:
        sys.exit(f"{args[0]} failed:\n" + "\n".join(done.stderr.strip().splitlines()[-8:]))


def still(video, t, png, before=False):
    """The frame at t (the first at or after t), or with before=True the last frame before t."""
    if before:
        start = max(0.0, t - 0.5)
        run(["ffmpeg", "-y", "-ss", f"{start:.3f}", "-i", video, "-t", f"{t - start:.3f}",
             "-vf", "scale=480:-2", "-update", "1", png])
    else:
        run(["ffmpeg", "-y", "-ss", f"{t:.3f}", "-i", video, "-frames:v", "1", "-vf", "scale=480:-2", png])
    if not os.path.exists(png):
        sys.exit(f"no frame at {t:.3f}s in {video}")


def duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                         check=True, capture_output=True, text=True).stdout
    return float(out.strip())


def voice_of(slug):
    return os.environ.get("NARRATOR") or PLAN["assign"][slug]


def clip(slug, cue):
    return os.path.join(HERE, "audio", voice_of(slug), cue["file"])


def trimmed(slug, cue):
    """The clip without leading and trailing silence, as 48 kHz mono wav."""
    dst = os.path.join(TRIM, voice_of(slug), cue["file"].replace(".mp3", ".wav"))
    if not os.path.exists(dst) or os.path.getmtime(dst) < os.path.getmtime(clip(slug, cue)):
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        sr = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03"
        run(["ffmpeg", "-y", "-i", clip(slug, cue), "-af", f"{sr},areverse,{sr},areverse",
             "-ar", "48000", "-ac", "1", dst])
    return dst


def ts(t):
    h, rem = divmod(t, 3600)
    m, s = divmod(rem, 60)
    return f"{int(h):02d}:{int(m):02d}:{s:06.3f}"


def layout(slug):
    """Where each line goes, and how long each step must hold a frame."""
    cues = PLAN["flows"][slug]
    vlen = duration(os.path.join(SRC, f"{slug}.mp4"))
    n = len(cues)
    plan, shift = [], 0.0
    for i, c in enumerate(cues):
        seg_end = cues[i + 1]["start"] if i + 1 < n else vlen
        wav = trimmed(slug, c)
        speech = duration(wav)
        # The last cue may run on into the video's tail; the others must fit their own slot.
        room = (c["end"] if i + 1 == n else seg_end) - c["start"]
        hold = max(0.0, LEAD + speech + GAP - room)
        new_start = c["start"] + shift
        plan.append(dict(text=c["text"], say=c["say"], wav=wav, seg=(c["start"], seg_end), hold=hold, speech=speech,
                         new_start=new_start, voice_at=new_start + LEAD))
        shift += hold
    return plan, vlen, shift


def subtitle_pieces(text):
    """A spoken line in subtitle-sized pieces: whole sentences where they fit, else cut at a comma or a space."""
    parts = []
    for sentence in re.split(r"(?<=[.!?])\s+", " ".join(text.split())):
        while len(sentence) > MAX_CUE:
            cut = sentence.rfind(", ", 0, MAX_CUE)
            cut = cut + 1 if cut >= MAX_CUE // 3 else sentence.rfind(" ", 0, MAX_CUE)
            if cut <= 0:
                break
            parts.append(sentence[:cut].strip())
            sentence = sentence[cut:].strip()
        parts.append(sentence)
    joined = []
    for part in parts:
        if joined and len(joined[-1]) + 1 + len(part) <= MAX_CUE:
            joined[-1] += " " + part
        else:
            joined.append(part)
    return joined


def lines(slugs):
    for voice in sorted({voice_of(s) for s in slugs}):
        need = {}
        for s in slugs:
            if voice_of(s) == voice:
                for c in PLAN["flows"][s]:
                    if not os.path.exists(clip(s, c)):
                        need.setdefault(c["say"], c["file"])
        vid = PLAN.get("voices", {}).get(voice) or "no voice id in plan.json"
        print(f"{voice} ({vid}): {len(need)} lines to generate, {sum(map(len, need))} characters")
        for say in need:
            print(f"  {say}")


def frames(slug, plan):
    held = [(i, p) for i, p in enumerate(plan) if p["hold"] > 0]
    if not held:
        print(f"{slug}: no step holds a frame")
        return
    os.makedirs(CHECK, exist_ok=True)
    video = os.path.join(SRC, f"{slug}.mp4")
    pngs = []
    for i, p in held:
        a, b = p["seg"]
        at = held_at(slug, i + 1, p["seg"])
        # (time, take the last frame before it): held | first | 0.5 s in | last
        for col, (t, before) in enumerate(((a + at, at >= b - a), (a, False), (min(a + 0.5, b - FRAME), False), (b, True))):
            png = os.path.join(CHECK, f"{slug}-{i + 1}-{col}.png")
            still(video, t, png, before)
            pngs.append(png)
    rows = [f"[{4 * k}][{4 * k + 1}][{4 * k + 2}][{4 * k + 3}]hstack=inputs=4[r{k}]" for k in range(len(held))]
    if len(held) == 1:
        graph = rows[0].replace("[r0]", "[s]")
    else:
        graph = ";".join(rows) + ";" + "".join(f"[r{k}]" for k in range(len(held))) + f"vstack=inputs={len(held)}[s]"
    sheet = os.path.join(CHECK, f"{slug}-holds.png")
    args = ["ffmpeg", "-y"]
    for png in pngs:
        args += ["-i", png]
    run(args + ["-filter_complex", graph, "-map", "[s]", sheet])
    for png in pngs:
        os.remove(png)
    print(f"{slug}: {sheet}  (rows: steps " + ", ".join(str(i + 1) for i, _ in held) + ")")


def encode(slug, plan, vlen, shift):
    cues = PLAN["flows"][slug]
    n = len(plan)
    total = vlen + shift
    args = ["ffmpeg", "-y", "-i", os.path.join(SRC, f"{slug}.mp4")]
    for p in plan:
        args += ["-i", p["wav"]]
    parts, pieces = [], []

    def piece(a, b, pad=""):
        parts.append(f"[0:v]trim=start={a:.3f}:end={b:.3f},setpts=PTS-STARTPTS{pad}[v{len(pieces)}]")
        pieces.append(f"[v{len(pieces)}]")

    for i, p in enumerate(plan):
        a, b = p["seg"]
        if p["hold"] <= 0:
            piece(a, b)
            continue
        at = held_at(slug, i + 1, p["seg"])
        if at >= b - a:
            piece(a, b, f",tpad=stop_mode=clone:stop_duration={p['hold']:.3f}")
        else:
            if at > 0:
                piece(a, a + at)
            piece(a + at, b, f",tpad=start_mode=clone:start_duration={p['hold']:.3f}")
    parts.append("".join(pieces) + f"concat=n={len(pieces)}:v=1:a=0[v]")
    for i, p in enumerate(plan):
        parts.append(f"[{i + 1}:a]adelay={int(round(p['voice_at'] * 1000))}:all=1[a{i}]")
    parts.append("".join(f"[a{i}]" for i in range(n))
                 + f"amix=inputs={n}:normalize=0:dropout_transition=0,volume={GAIN_DB}dB,apad,atrim=end={total:.3f}[a]")
    os.makedirs(OUT, exist_ok=True)
    mp4 = os.path.join(OUT, f"{slug}.mp4")
    run(args + ["-filter_complex", ";".join(parts), "-map", "[v]", "-map", "[a]",
                "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p", "-crf", "22", "-preset", "slow",
                "-r", "30", "-c:a", "aac", "-b:a", "96k", "-ac", "1", "-ar", "48000",
                "-movflags", "+faststart", mp4])
    with open(os.path.join(OUT, f"{slug}.vtt"), "w", encoding="utf-8") as f:
        f.write("WEBVTT\n")
        for i, p in enumerate(plan):
            end = plan[i + 1]["new_start"] if i + 1 < n else cues[i]["end"] + shift
            # Each piece shows while its share of the voice plays: the first from the step's start, the last until the next step.
            chunks = subtitle_pieces(p["say"])
            total = sum(len(x) for x in chunks)
            at = p["voice_at"]
            for k, chunk in enumerate(chunks):
                a = p["new_start"] if k == 0 else at
                at += p["speech"] * len(chunk) / total
                b = end if k + 1 == len(chunks) else at
                f.write(f"\n{i + 1}.{k + 1}\n{ts(a)} --> {ts(b)}\n{chunk}\n")
    return duration(mp4)


def main():
    args = sys.argv[1:]
    mode = next((a for a in args if a.startswith("--")), "")
    slugs = [a for a in args if not a.startswith("--")] or PLAN.get("order") or sorted(PLAN["flows"])
    unknown = [s for s in slugs if s not in PLAN["flows"]]
    if unknown:
        sys.exit("not in plan.json: " + ", ".join(unknown))
    if mode == "--lines":
        return lines(slugs)
    missing = sorted({f"{voice_of(s)}/{c['file']}" for s in slugs for c in PLAN["flows"][s]
                      if not os.path.exists(clip(s, c))})
    if missing:
        sys.exit("missing clips (see --lines): " + ", ".join(missing))
    for s in slugs:
        plan, vlen, shift = layout(s)
        if mode == "--frames":
            frames(s, plan)
            continue
        length = vlen + shift if mode == "--dry" else encode(s, plan, vlen, shift)
        print(f"\n{s} ({voice_of(s)}): {vlen:.2f}s -> {length:.2f}s (+{shift:.2f}s held)")
        for i, p in enumerate(plan):
            if p["hold"] > 0:
                where = PLAN.get("hold_frame", {}).get(f"{s} {i + 1}", "first")
                where = f"{where} s in" if isinstance(where, (int, float)) else f"{where} frame"
                print(f"  step {i + 1} holds {p['hold']:4.2f}s ({where}) at {p['seg'][0]:6.2f}s  {p['text']}")


if __name__ == "__main__":
    main()
