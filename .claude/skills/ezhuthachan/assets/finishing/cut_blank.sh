#!/bin/bash
# Cuts the frames where the app's content area is blank or a loading skeleton from a finished plain
# video, in place. Switching tabs or opening a page often shows a skeleton for a fraction of a second,
# even after every screen was visited off camera, because the app refetches its data. The uncut file
# is kept as out/fast/<name>-uncut.mp4.
#
# A frame counts as blank when the edge density of the content area is under THRESH. Real screens,
# even sparse ones such as a one-row list, measured 0.9 and up in November 2026; skeletons and blank
# frames measured under 0.5. The default area (CROP, ffmpeg crop w:h:x:y in the 1920x1304 frame)
# covers the page content right of an encounter's or a history page's tab list in a 1600x1000 window
# framed by zoom.py; set CROP for another layout. Check the frame list it prints: an empty state that
# is meant to be on screen would be cut too.
#
# It cuts the finished file, so a re-render brings the frames back: run it again after one.
#
# Usage, from the media folder: [CROP=w:h:x:y] [THRESH=0.6] ./cut_blank.sh final-plain/<name>.mp4 ...
cd "$(dirname "$0")" || exit 1
CROP=${CROP:-1300:640:500:330}
THRESH=${THRESH:-0.6}
mkdir -p out/fast
for f in "$@"; do
  [ -f "$f" ] || { echo "FAIL no video $f"; continue; }
  name=$(basename "$f" .mp4); uncut=out/fast/$name-uncut.mp4
  cp "$f" "$uncut"
  low=$(ffmpeg -nostdin -v error -i "$uncut" \
          -vf "crop=$CROP,edgedetect=low=0.1:high=0.3,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-" \
          -f null - 2>/dev/null | paste - - | sed -E 's/frame:([0-9]+).*YAVG=([0-9.]+)/\1 \2/' \
        | awk -v t="$THRESH" '$2 < t {print $1}')
  if [ -z "$low" ]; then echo "$f: no blank frames"; rm "$uncut"; continue; fi
  sel=$(echo "$low" | awk '{printf "%seq(n\\,%s)", (NR > 1 ? "+" : ""), $1}')
  # Same encoding and BT.709 tags as zoom.py, so the background stays exactly the slide's colour.
  if ffmpeg -nostdin -v error -y -i "$uncut" \
       -vf "select='not($sel)',setpts=N/FRAME_RATE/TB,setparams=range=tv:color_primaries=bt709:color_trc=bt709:colorspace=bt709" \
       -r 30 -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 16 -preset slow \
       -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -movflags +faststart -an "$f"; then
    echo "$f: cut $(echo "$low" | wc -l | tr -d ' ') blank frames ($(echo $low | tr ' ' ',')); now $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f") s"
  else
    cp "$uncut" "$f"; echo "FAIL cut $f (left uncut)"
  fi
done
