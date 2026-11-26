#!/usr/bin/env python3
"""Frame a 2x recording (capture.ts) and zoom in where the work happens.

The app sits in a rounded window with a soft shadow over a gradient, 1920x1304, as frame.py does,
but everything is composed at 2x (3840x2608), so a zoom of up to 2x still shows sharp text. The
window is the viewport the recording logged, at most 1760x1144 CSS px; 1600x1000 fills it best. Zoom
shots come from the input log that capture.ts wrote: a run of clicks, typing or a resting cursor
zooms in (about 1.8x) around them, pans when the work moves, and eases back out after a pause.
Single clicks that only navigate stay at full view.

Usage: zoom.py <retimed.mp4> <events.json> <plan.json> <out.mp4> [--zoom 1.6] [--plain] [--plan-only]
       [--skip N ...]  leave out the Nth zoom shot (1-based, as printed)
"""
import argparse
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
FPS = 30
K = 2                                 # composition scale (the capture is 2x)
W, H = 1920, 1304                     # output
WIN_W, WIN_H = 1600, 1000             # app window, CSS px; main() takes it from the events log
X0, Y0 = (W - WIN_W) // 2, (H - WIN_H) // 2
RADIUS = 14
COLORS = ("0x1e40af", "0x0ea5e9", "0x6ee7b7")

GAP = 1.4        # s; interactions closer than this belong to one shot
MAX_SPAN = 4.0   # s; a longer group is cut at its longest pause
MERGED_SPAN = 6.0  # s; shots on one screen closer than a zoom-out and back in are joined up to this
MIN_FULL = 0.6   # s of full view between two zooms
LEAD = 0.85      # s; the zoom starts this long before the first interaction
ZOOM_IN = 0.7    # s
ZOOM_OUT = 0.8   # s
HOLD = 1.1       # s; stays zoomed this long after the last interaction
PAN = 0.6        # s
HOVER = 0.7      # s (source time); a cursor resting this long counts as an interaction
MARGIN = 36      # px of wallpaper allowed inside a zoomed view
MAJOR = 0.3      # share of pixels that change when the screen is replaced (page, dialog, loading)
CENTRE = 0.25    # how far a zoomed view leans towards the middle of the window, for context


def run(args):
    done = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *args], capture_output=True, text=True)
    if done.returncode:
        sys.exit("ffmpeg failed:\n" + done.stderr[-3000:])


def duration(path):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", path],
                                capture_output=True, text=True, check=True).stdout)


def timeline(plan):
    """A function from source milliseconds to output seconds."""
    segs = plan["segs"]
    fps = plan["fps"]

    def to_out(ms):
        f = ms / 1000 * fps
        acc = 0.0
        for s, e, sp in segs:
            if f < s:
                return acc
            if f < e:
                return acc + (f - s) / sp / fps
            acc += (e - s) / sp / fps
        return acc
    return to_out


def points(log, to_out):
    """Moments of interest: (output s, x, y, kind) in composition px at 1x. Kind "nav" marks a
    route change, which ends a shot; a click that leads to one only navigates and is left out."""
    ev = sorted((e for e in log["events"] if e["t"] >= 0), key=lambda e: e["t"])
    navs = [e["t"] for e in ev if e["kind"] == "nav"]
    out = []
    for i, e in enumerate(ev):
        x, y = e["x"] + X0, e["y"] + Y0
        t = to_out(e["t"])
        if e["kind"] == "nav":
            out.append((t, 0, 0, "nav"))
        elif e["kind"] == "down":
            leaves = any(0 <= n - e["t"] <= 1200 for n in navs)
            out.append((t, x, y, "navclick" if leaves else "click"))
        elif e["kind"] == "key":
            out.append((t, x, y, "key"))
        elif e["kind"] == "move":
            nxt = next((f for f in ev[i + 1:] if f["kind"] != "nav"), None)
            if t > 0.6 and (nxt is None or (nxt["t"] - e["t"] >= HOVER * 1000 and nxt["kind"] != "down")):
                out.append((t, x, y, "hover"))
    out = sorted(p for p in out if p[0] >= 0.4)
    # Keys repeat for every character; keep the first and last of each run.
    slim = []
    for p in out:
        if p[3] == "key" and len(slim) > 1 and slim[-1][3] == "key" and slim[-2][3] == "key" and p[0] - slim[-1][0] < GAP:
            slim[-1] = p
        else:
            slim.append(p)
    return slim


def split_long(g):
    """Cuts a group longer than MAX_SPAN at its longest pause, so a zoom stays an emphasis."""
    if len(g) < 2 or g[-1][0] - g[0][0] <= MAX_SPAN:
        return [g]
    i = max(range(1, len(g)), key=lambda k: g[k][0] - g[k - 1][0])
    return split_long(g[:i]) + split_long(g[i:])


def shots(pts, end, majors=()):
    """Groups of points that earn a zoom. A group never spans a screen change."""
    groups, cur = [], []
    for p in pts:
        if p[3] in ("nav", "navclick"):
            continue
        crossed = cur and any(cur[-1][0] < s <= p[0] for s in majors)
        if cur and (crossed or p[0] - cur[-1][0] > GAP):
            groups.append(cur)
            cur = []
        cur.append(p)
    if cur:
        groups.append(cur)
    groups = [h for g in groups for h in split_long(g)]
    keep = [g for g in groups if len(g) >= 2 or any(p[3] in ("key", "hover") for p in g)]
    # A shot needs time to zoom in, show something and zoom out before the video ends.
    return [g for g in keep if g[0][0] < end - 1.8]


def clamp_center(cx, cy, z):
    vw, vh = W / z, H / z
    lo_x, hi_x = X0 - MARGIN + vw / 2, X0 + WIN_W + MARGIN - vw / 2
    lo_y, hi_y = Y0 - MARGIN + vh / 2, Y0 + WIN_H + MARGIN - vh / 2
    cx = min(max(cx, lo_x), hi_x) if lo_x <= hi_x else W / 2
    cy = min(max(cy, lo_y), hi_y) if lo_y <= hi_y else H / 2
    return cx, cy


def views(group, z):
    """Splits a shot into views: consecutive points that fit in one zoomed frame."""
    vw, vh = W / z * 0.8, H / z * 0.8
    out, cur = [], []
    for p in group:
        test = cur + [p]
        xs, ys = [q[1] for q in test], [q[2] for q in test]
        if cur and (max(xs) - min(xs) > vw or max(ys) - min(ys) > vh):
            out.append(cur)
            cur = [p]
        else:
            cur = test
    out.append(cur)
    res = []
    for v in out:
        xs, ys = [q[1] for q in v], [q[2] for q in v]
        cx = (min(xs) + max(xs)) / 2 * (1 - CENTRE) + (X0 + WIN_W / 2) * CENTRE
        cy = (min(ys) + max(ys)) / 2 * (1 - CENTRE) + (Y0 + WIN_H / 2) * CENTRE
        res.append((v[0][0], v[-1][0], clamp_center(cx, cy, z)))
    return res


def keyframes(groups, z, end, stops=(), majors=()):
    full = (1.0, W / 2, H / 2)
    kf = [(0.0, *full)]
    out_end = None
    for g in groups:
        vs = views(g, z)
        first, last = vs[0][0], vs[-1][1]
        settled = max((s + 0.25 for s in majors if s <= first), default=0.0)
        t_in = max(first - LEAD, 0.3, settled, kf[-1][0])
        if out_end is not None:
            t_in = max(t_in, out_end + MIN_FULL)
        if t_in > first + 0.3:
            continue  # no room to zoom in before the work is over
        kf.append((t_in, *full))
        kf.append((t_in + ZOOM_IN, z, *vs[0][2]))
        for (a, _, c), (_, _, prev) in zip(vs[1:], vs):
            t1 = max(a - 0.1, kf[-1][0] + 0.3)
            t0 = max(kf[-1][0], t1 - PAN)
            kf.append((t0, z, *prev))
            kf.append((t1, z, *c))
        # Zoom out after a pause, or as the cursor heads for a click that changes the screen.
        stop = min((s for s in stops if s > last), default=end)
        t_out = min(last + HOLD, stop - 0.45, end - ZOOM_OUT - 0.3)
        t_out = max(t_out, last + 0.15, t_in + ZOOM_IN + 0.5, kf[-1][0])
        kf.append((t_out, z, *vs[-1][2]))
        out_end = t_out + ZOOM_OUT
        kf.append((out_end, *full))
    return kf


def merge(groups, majors=()):
    """Joins shots on one screen that are too close for a zoom-out and back in: pan instead."""
    out = []
    for g in groups:
        if out:
            prev = out[-1]
            crossed = any(prev[-1][0] < s <= g[0][0] for s in majors)
            close = g[0][0] - LEAD < prev[-1][0] + HOLD + ZOOM_OUT + MIN_FULL
            if close and not crossed and g[-1][0] - prev[0][0] <= MERGED_SPAN:
                out[-1] = prev + g
                continue
        out.append(list(g))
    return out


FOLLOW = 5.0     # rad/s; how quickly a zoomed view catches up with the cursor (critically damped)
LOOKAHEAD = 0.2  # s; the view aims where the cursor is about to be, so it never trails behind
DEADZONE = 0.35  # share of the zoomed view around its middle in which the cursor moves without panning


def cursor_track(log, to_out):
    """The cursor position over output time: (s, x, y) in composition px at 1x."""
    ev = sorted((e for e in log["events"] if e["kind"] in ("move", "down")), key=lambda e: e["t"])
    track = [(max(0.0, to_out(e["t"])) if e["t"] >= 0 else 0.0, e["x"] + X0, e["y"] + Y0) for e in ev]
    return track or [(0.0, W / 2, H / 2)]


def cursor_at(track, t):
    if t <= track[0][0]:
        return track[0][1:]
    for (ta, xa, ya), (tb, xb, yb) in zip(track, track[1:]):
        if ta <= t <= tb:
            u = 0 if tb <= ta else (t - ta) / (tb - ta)
            return xa + (xb - xa) * u, ya + (yb - ya) * u
    return track[-1][1:]


def smootherstep(u):
    u = min(max(u, 0.0), 1.0)
    return u * u * u * (u * (6 * u - 15) + 10)


def zoom_at(kf, t):
    for (ta, za, *_), (tb, zb, *_) in zip(kf, kf[1:]):
        if ta <= t < tb:
            return za + (zb - za) * smootherstep((t - ta) / (tb - ta))
    return kf[-1][1] if t >= kf[-1][0] else kf[0][1]


def trajectory(kf, track, z_max, end):
    """Per output frame (zoom, x, y) for zoompan: the zoom follows the shot plan, and the view
    follows the cursor with a dead zone and a spring, so it moves smoothly but never loses it."""
    n = max(1, int(round(end * FPS)))
    dt = 1 / FPS
    mid_x, mid_y = X0 + WIN_W / 2, Y0 + WIN_H / 2
    anchor = list(cursor_at(track, 0))
    cam, vel = anchor[:], [0.0, 0.0]
    dz_w, dz_h = W / z_max * DEADZONE / 2, H / z_max * DEADZONE / 2
    out = []
    for i in range(n):
        t = i * dt
        z = zoom_at(kf, t)
        cx, cy = cursor_at(track, t + LOOKAHEAD)
        cx, cy = cx * (1 - CENTRE) + mid_x * CENTRE, cy * (1 - CENTRE) + mid_y * CENTRE
        # The anchor moves only when the cursor leaves the dead zone around it.
        for k, (c, half) in enumerate(((cx, dz_w), (cy, dz_h))):
            if c > anchor[k] + half:
                anchor[k] = c - half
            elif c < anchor[k] - half:
                anchor[k] = c + half
        for k in range(2):
            acc = FOLLOW * FOLLOW * (anchor[k] - cam[k]) - 2 * FOLLOW * vel[k]
            vel[k] += acc * dt
            cam[k] += vel[k] * dt
        p = 0.0 if z_max <= 1 else min(max((z - 1) / (z_max - 1), 0.0), 1.0)
        vx, vy = clamp_center(W / 2 + (cam[0] - W / 2) * p, H / 2 + (cam[1] - H / 2) * p, z)
        out.append((z, vx * K - W * K / z / 2, vy * K - H * K / z / 2))
    return out


def lookup(values, fmt):
    """An ffmpeg expression of the input frame number `in` that returns values[in]: a binary
    search over runs of equal values, so still stretches cost nothing."""
    runs = []
    for i, v in enumerate(values):
        text = fmt % v
        if not runs or runs[-1][1] != text:
            runs.append((i, text))

    def tree(lo, hi):
        if hi - lo == 1:
            return runs[lo][1]
        m = (lo + hi) // 2
        return f"if(lt(in,{runs[m][0]}),{tree(lo, m)},{tree(m, hi)})"
    return tree(0, len(runs))


def assets():
    d = os.path.join(HERE, f"frame-assets-2x-{WIN_W}x{WIN_H}")
    os.makedirs(d, exist_ok=True)
    mask, shadow, bg = (os.path.join(d, n) for n in ("mask.png", "shadow.png", "bg.png"))
    ww, wh, r = WIN_W * K, WIN_H * K, RADIUS * K
    cw, ch, x, y = W * K, H * K, X0 * K, Y0 * K
    if not os.path.exists(mask):
        e = f"255*clip({r}+0.5-hypot(X-clip(X,{r},W-1-{r}),Y-clip(Y,{r},H-1-{r})),0,1)"
        run(["-f", "lavfi", "-i", f"color=white:s={ww}x{wh}", "-vf", f"format=gray,geq=lum='{e}'", "-frames:v", "1", mask])
    if not os.path.exists(shadow):
        run(["-i", mask, "-filter_complex",
             f"[0:v]format=gray,pad={cw}:{ch}:{x}:{y + 18 * K}:black,gblur=sigma={30 * K},lut=y=val*0.42[a];"
             f"color=black:s={cw}x{ch},format=rgba[c];[c][a]alphamerge", "-frames:v", "1", shadow])
    if not os.path.exists(bg):
        c0, c1, c2 = COLORS
        run(["-f", "lavfi", "-i", f"gradients=s={cw}x{ch}:c0={c0}:c1={c1}:c2={c2}:nb_colors=3:x0=0:y0=0:x1={cw}:y1={ch}:speed=0:type=linear",
             "-frames:v", "1", bg])
    return mask, shadow, bg


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("events")
    ap.add_argument("plan")
    ap.add_argument("dst")
    ap.add_argument("--zoom", type=float, default=1.6)
    ap.add_argument("--skip", type=int, nargs="*", default=[])
    ap.add_argument("--plan-only", action="store_true")
    ap.add_argument("--plain", action="store_true", help="frame only, no zoom")
    a = ap.parse_args()

    global WIN_W, WIN_H, X0, Y0
    end = duration(a.src)
    log = json.load(open(a.events))
    vp = log.get("viewport") or {}
    WIN_W, WIN_H = int(vp.get("width", WIN_W)), int(vp.get("height", WIN_H))
    if WIN_W > W - 160 or WIN_H > H - 160:
        sys.exit(f"The window is {WIN_W}x{WIN_H}; record with a viewport of at most {W - 160}x{H - 160}.")
    X0, Y0 = (W - WIN_W) // 2, (H - WIN_H) // 2
    to_out = timeline(json.load(open(a.plan)))
    plan = json.load(open(a.plan))
    majors = [to_out(k / plan["fps"] * 1000) for k, f in enumerate(plan.get("frac", [])) if f > MAJOR]
    pts = points(log, to_out)
    majors = sorted({round(t, 2) for t in majors})
    stops = sorted(set(majors) | {p[0] for p in pts if p[3] == "navclick"})
    groups = shots(pts, end, majors)
    groups = [g for i, g in enumerate(groups, 1) if i not in a.skip and not a.plain]
    groups = merge(groups, majors)
    kf = keyframes(groups, a.zoom, end, stops, majors)
    for i, g in enumerate(groups, 1):
        print(f"shot {i}: {g[0][0]:.1f}-{g[-1][0]:.1f} s, {len(g)} points ({', '.join(sorted({p[3] for p in g}))})")
    print(f"{len(groups)} shots in {end:.1f} s")
    if a.plan_only:
        for k in kf:
            print("  %.2f z=%.2f c=(%.0f,%.0f)" % k)
        return

    traj = trajectory(kf, cursor_track(log, to_out), 1.0 if a.plain else a.zoom, end)
    mask, shadow, bg = assets()
    zz = lookup([v[0] for v in traj], "%.4f")
    zx = lookup([v[1] for v in traj], "%.1f")
    zy = lookup([v[2] for v in traj], "%.1f")
    graph = (
        # A 1x recording (some screens, such as a PDF viewer, need one) is scaled up to the 2x window.
        f"[1:v]format=gray[m];[0:v]scale={WIN_W * K}:{WIN_H * K}:flags=lanczos,format=rgba[v];[v][m]alphamerge[win];"
        f"[3:v]format=rgba[b];[b][2:v]overlay=0:0[bs];[bs][win]overlay={X0 * K}:{Y0 * K}:shortest=1,format=yuv444p,"
        f"zoompan=z='{zz}':x='{zx}':y='{zy}':d=1:s={W}x{H}:fps={FPS},format=yuv420p"
    )
    script = a.dst + ".filter.txt"
    with open(script, "w") as f:
        f.write(graph)
    # The still images must loop at the video's rate: at the default 25 fps the overlay would run at 25 fps,
    # and zoompan, which numbers frames at 30 fps, would play the video 1.2x fast and freeze its end.
    loop = ["-loop", "1", "-framerate", str(FPS)]
    run(["-i", a.src, *loop, "-i", mask, *loop, "-i", shadow, *loop, "-i", bg,
         "-/filter_complex", script, "-t", f"{end:.3f}",
         "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "slow", "-r", str(FPS),
         "-movflags", "+faststart", "-an", a.dst])
    os.remove(script)
    print(f"{a.dst}: {duration(a.dst):.1f} s")


if __name__ == "__main__":
    main()
