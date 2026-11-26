#!/bin/sh
# Finishes 2x recordings (capture.ts, EZ_CAPTURE=1): speeds each one up with retime.py, then renders
# two versions, final-zoom/<name>.mp4 (the zoom follows the cursor) and final-plain/<name>.mp4
# (framed, no zoom), and a contact sheet, out/fast/<name>-sheet.png, to check by eye. A phone
# recording (taller than wide) is only scaled, with no zoom version.
#
# Each step takes the recording lock (withlock.sh), so a render never slows a recording down, and
# it pauses between steps so a waiting recording gets the lock first.
#
# Usage, from the media folder:
#   [MODE=plain|zoom] [RETIME=0] ./finish.sh <out/x.mp4>[:<final name>[:<retime.py args>]] ...
# MODE renders one version only. RETIME=0 reuses the sped-up file and plan from an earlier run.
cd "$(dirname "$0")" || exit 1
mkdir -p out/fast final-plain final-zoom
for item in "$@"; do
  src=$(echo "$item" | cut -d: -f1)
  name=$(echo "$item" | cut -s -d: -f2); [ -n "$name" ] || name=$(basename "$src" .mp4)
  extra=$(echo "$item" | cut -s -d: -f3)
  events="${src%.mp4}.events.json"; fast="out/fast/$name.mp4"; plan="out/fast/$name.plan.json"
  [ -f "$src" ] || { echo "FAIL no recording $src"; continue; }
  if [ "$RETIME" != "0" ] || [ ! -f "$plan" ]; then
    # $extra is split into words on purpose: it holds retime.py options.
    ./withlock.sh python3 retime.py "$src" "$fast" --map "$plan" $extra < /dev/null || { echo "FAIL retime $name"; continue; }
    sleep 4
  fi
  w=$(ffprobe -v error -show_entries stream=width -of csv=p=0 "$fast")
  h=$(ffprobe -v error -show_entries stream=height -of csv=p=0 "$fast")
  if [ "$w" -gt "$h" ]; then
    [ -f "$events" ] || { echo "FAIL no input log $events (record with EZ_CAPTURE=1)"; continue; }
    if [ "$MODE" != "zoom" ]; then
      ./withlock.sh python3 zoom.py "$fast" "$events" "$plan" "final-plain/$name.mp4" --plain < /dev/null | tail -1
      sleep 4
    fi
    [ "$MODE" != "plain" ] && ./withlock.sh python3 zoom.py "$fast" "$events" "$plan" "final-zoom/$name.mp4" < /dev/null | tail -1
  else
    ./withlock.sh python3 frame.py "$fast" "final-plain/$name.mp4" < /dev/null && echo "final-plain/$name.mp4 (phone)"
  fi
  sheet_src="final-plain/$name.mp4"; [ -f "$sheet_src" ] || sheet_src="final-zoom/$name.mp4"
  ffmpeg -nostdin -v error -y -i "$sheet_src" -vf "fps=2,scale=480:-1,tile=6x8" -frames:v 1 -update 1 "out/fast/$name-sheet.png"
  sleep 4
done
echo "== done $(date +%H:%M:%S)"
