#!/usr/bin/env python3
"""Frame a 1x recording (Playwright's own video) the way zoom.py --plain frames a 2x one: the app in a
rounded window with a light shadow over the deck slide's grey, 1920x1304, the window scaled to leave
zoom.PAD px around it. The look (THEMES, PAD, SHADOW) lives in zoom.py, which must sit beside this
file. A 2x recording from capture.ts is framed by zoom.py --plain instead. Phone recordings (narrower
than they are tall) are only scaled to 884x1920, as a plain screen recording.

Usage: frame.py <in.mp4> <out.mp4> [--theme slide|white|care|blue]
"""
import argparse
import os
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import zoom  # noqa: E402


def probe(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:format=duration",
                          "-of", "default=nw=1:nk=1", path], capture_output=True, text=True, check=True).stdout.split()
    return int(out[0]), int(out[1]), float(out[2])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("dst")
    ap.add_argument("--theme", choices=sorted(zoom.THEMES), default=zoom.THEME)
    a = ap.parse_args()
    w, h, dur = probe(a.src)
    enc = ["-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "slow", "-r", "30",
           "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
           "-movflags", "+faststart", "-an", a.dst]
    tags = "setparams=range=tv:color_primaries=bt709:color_trc=bt709:colorspace=bt709"
    if h > w:
        zoom.run(["-i", a.src, "-vf", f"scale=884:1920:flags=lanczos:out_color_matrix=bt709:out_range=tv,format=yuv420p,{tags}", *enc])
        return
    zoom.THEME = a.theme
    zoom.WIN_W, zoom.WIN_H = w, h
    zoom.S, zoom.DW, zoom.DH, zoom.X0, zoom.Y0 = zoom.fit(w, h)
    mask, shadow, bg = zoom.assets()
    K = zoom.K
    loop = ["-loop", "1", "-framerate", "30"]  # loop the stills at the video rate, not the default 25 fps
    zoom.run(["-i", a.src, *loop, "-i", mask, *loop, "-i", shadow, *loop, "-i", bg, "-filter_complex",
              f"[1:v]format=gray[m];[0:v]scale={zoom.DW * K}:{zoom.DH * K}:flags=lanczos,format=rgba[v];[v][m]alphamerge[win];"
              # Composed and scaled in RGB, so the background comes out exactly the slide's colour.
              f"[3:v]format=rgba[b];[b][2:v]overlay=0:0:format=rgb[bs];[bs][win]overlay={zoom.X0 * K}:{zoom.Y0 * K}:shortest=1:format=rgb,"
              f"scale={zoom.W}:{zoom.H}:flags=lanczos:out_color_matrix=bt709:out_range=tv,format=yuv420p,{tags}",
              "-t", f"{dur:.3f}", *enc])


if __name__ == "__main__":
    main()
