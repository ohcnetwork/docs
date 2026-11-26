#!/bin/sh
# Runs a command under the recording lock of this folder: one recording or render at a time, so
# none slows another down. A lock older than 30 minutes is from a run that died and is cleared.
# Usage: ./withlock.sh npx playwright test <spec>   or   ./withlock.sh python3 zoom.py ...
LOCK="$(dirname "$0")/.recording.lock"
while ! mkdir "$LOCK" 2>/dev/null; do
  if [ -n "$(find "$LOCK" -maxdepth 0 -mmin +30 2>/dev/null)" ]; then rmdir "$LOCK" 2>/dev/null || true; fi
  sleep 3
done
trap 'rmdir "$LOCK" 2>/dev/null' EXIT INT TERM
"$@"
