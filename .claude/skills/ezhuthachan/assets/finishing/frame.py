#!/usr/bin/env python3
"""Frame a 1x recording (Playwright's own video): the app in a rounded window, with a soft shadow,
over a gradient background, 1920x1304. The window is the recording's size, at most 1760x1144.
A 2x recording from capture.ts is framed by zoom.py --plain instead. Phone recordings (narrower
than they are tall) are only scaled to 884x1920, as a plain screen recording.

Usage: frame.py <in.mp4> <out.mp4>
"""
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
W, H = 1920, 1304
WIN_W, WIN_H = 1600, 1000
X, Y = (W - WIN_W) // 2, (H - WIN_H) // 2
RADIUS = 14
# Soft blue to teal to mint, close to the originals' wallpapers and Care's green.
COLORS = ("0x1e40af", "0x0ea5e9", "0x6ee7b7")


def run(args):
    done = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *args], capture_output=True, text=True)
    if done.returncode:
        sys.exit("ffmpeg failed:\n" + done.stderr[-2000:])


def probe(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:format=duration",
                          "-of", "default=nw=1:nk=1", path], capture_output=True, text=True, check=True).stdout.split()
    return int(out[0]), int(out[1]), float(out[2])


def assets():
    d = os.path.join(HERE, f"frame-assets-{WIN_W}x{WIN_H}")
    os.makedirs(d, exist_ok=True)
    mask, shadow, bg = (os.path.join(d, n) for n in ("mask.png", "shadow.png", "bg.png"))
    if not os.path.exists(mask):
        r = RADIUS
        expr = f"255*clip({r}+0.5-hypot(X-clip(X,{r},W-1-{r}),Y-clip(Y,{r},H-1-{r})),0,1)"
        run(["-f", "lavfi", "-i", f"color=white:s={WIN_W}x{WIN_H}", "-vf", f"format=gray,geq=lum='{expr}'", "-frames:v", "1", mask])
    if not os.path.exists(shadow):
        run(["-i", mask, "-filter_complex",
             f"[0:v]format=gray,pad={W}:{H}:{X}:{Y + 18}:black,gblur=sigma=30,lut=y=val*0.42[a];"
             f"color=black:s={W}x{H},format=rgba[c];[c][a]alphamerge", "-frames:v", "1", shadow])
    if not os.path.exists(bg):
        c0, c1, c2 = COLORS
        run(["-f", "lavfi", "-i", f"gradients=s={W}x{H}:c0={c0}:c1={c1}:c2={c2}:nb_colors=3:x0=0:y0=0:x1={W}:y1={H}:speed=0:type=linear",
             "-frames:v", "1", bg])
    return mask, shadow, bg


def main():
    src, dst = sys.argv[1:3]
    w, h, dur = probe(src)
    enc = ["-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "slow", "-r", "30",
           "-movflags", "+faststart", "-an", dst]
    if h > w:
        run(["-i", src, "-vf", "scale=884:1920:flags=lanczos", *enc])
        return
    global WIN_W, WIN_H, X, Y
    if w > W - 160 or h > H - 160:
        sys.exit(f"{src} is {w}x{h}; frame.py takes at most {W - 160}x{H - 160}. Use zoom.py --plain for a 2x recording.")
    WIN_W, WIN_H = w, h
    X, Y = (W - WIN_W) // 2, (H - WIN_H) // 2
    mask, shadow, bg = assets()
    loop = ["-loop", "1", "-framerate", "30"]  # loop the stills at the video rate, not the default 25 fps
    run(["-i", src, *loop, "-i", mask, *loop, "-i", shadow, *loop, "-i", bg, "-filter_complex",
         f"[1:v]format=gray[m];[0:v]format=rgba[v];[v][m]alphamerge[win];"
         f"[3:v]format=rgba[b];[b][2:v]overlay=0:0[bs];[bs][win]overlay={X}:{Y}:shortest=1,format=yuv420p",
         "-t", f"{dur:.3f}", *enc])


if __name__ == "__main__":
    main()
