#!/usr/bin/env python3
"""Download generated clips to audio/<voice>/<file>.

Reads lines "session_id|content_url" on stdin, copied from creative_get_flow_run_status.
sessions.txt gives each session's voice and line: one row "voice|session_id|line" per
generation, appended as you start them. plan.json gives the file name for the line.
Prints each saved clip with its length, and exits 1 if any row failed.
"""
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))


def main():
    plan = json.load(open(os.path.join(HERE, "plan.json"), encoding="utf-8"))
    files = {c["say"]: c["file"] for cues in plan["flows"].values() for c in cues}
    sessions = {}
    for row in open(os.path.join(HERE, "sessions.txt"), encoding="utf-8"):
        parts = row.rstrip("\n").split("|", 2)
        if len(parts) == 3:
            sessions[parts[1]] = (parts[0], parts[2])

    failed = False
    for row in sys.stdin:
        row = row.strip()
        if not row:
            continue
        sid, url = row.split("|", 1)
        if sid not in sessions:
            print(f"UNKNOWN {sid}: not in sessions.txt")
            failed = True
            continue
        voice, line = sessions[sid]
        if line not in files:
            print(f"UNKNOWN {sid}: {line!r} is not a line in plan.json")
            failed = True
            continue
        dst = os.path.join(HERE, "audio", voice, files[line])
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        if subprocess.run(["curl", "-sS", "--fail", "-o", dst, url]).returncode != 0:
            print(f"FAIL {voice}/{files[line]}")
            failed = True
            continue
        length = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", dst],
                                capture_output=True, text=True).stdout.strip()
        print(f"{voice:>10}  {files[line]:56s} {length}s")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
