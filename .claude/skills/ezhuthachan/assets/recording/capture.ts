// Sharp capture, used when EZ_CAPTURE=1. Playwright's own video is VP8 at the CSS size of the window,
// too soft to zoom into, so this records the page with the DevTools screencast at device pixels
// (2x), one JPEG per painted frame, and logs every mouse and key event to <name>.events.json.
// assets/finishing/zoom.py later uses the log to zoom in where the work happens. Chromium only.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import type { CDPSession, Page } from "@playwright/test";

type Frame = { file: string; ts: number };
export type InputEvent = { t: number; kind: "move" | "down" | "key" | "nav"; x: number; y: number };

export class Capture {
  private cdp: CDPSession | null = null;
  private readonly frames: Frame[] = [];
  private readonly events: InputEvent[] = [];
  private readonly writes: Promise<void>[] = [];
  private width = 0;
  private height = 0;

  constructor(
    private readonly page: Page,
    private readonly dir: string,
  ) {}

  async start(): Promise<void> {
    fs.rmSync(this.dir, { recursive: true, force: true });
    fs.mkdirSync(this.dir, { recursive: true });
    const vp = this.page.viewportSize() ?? { width: 1600, height: 1000 };
    const scale = await this.page.evaluate(() => window.devicePixelRatio);
    this.width = Math.round(vp.width * scale);
    this.height = Math.round(vp.height * scale);

    // Mouse moves are logged as Playwright sends them. Presses and keys are logged by the page itself,
    // so locator.click(), fill() and pressSequentially() count too; a key is placed on the focused
    // field. Route changes split zoom shots. Times are wall-clock milliseconds, like the frames.
    const mouse = this.page.mouse;
    const move = mouse.move.bind(mouse);
    mouse.move = async (x, y, options) => {
      this.events.push({ t: Date.now(), kind: "move", x, y });
      return move(x, y, options);
    };
    await this.page.exposeBinding("__ezInput", (_source, kind: InputEvent["kind"], x: number, y: number) => {
      this.events.push({ t: Date.now(), kind, x, y });
    });
    await this.page.addInitScript(() => {
      const send = (kind: string, x: number, y: number) =>
        (window as unknown as { __ezInput?: (k: string, x: number, y: number) => void }).__ezInput?.(kind, x, y);
      addEventListener("mousedown", (e) => send("down", e.clientX, e.clientY), true);
      // keydown misses keyboard.insertText() and fill(); input catches both.
      const typed = (e: Event) => {
        const el = (e.type === "input" ? e.target : document.activeElement) as Element | null;
        const r = el?.getBoundingClientRect?.();
        if (r && r.width) send("key", r.left + Math.min(r.width / 2, 220), r.top + r.height / 2);
      };
      addEventListener("keydown", typed, true);
      addEventListener("input", typed, true);
    });
    // Only a new path counts: sheets and filters change the query string on the same screen.
    let pathname = "";
    this.page.on("framenavigated", (frame) => {
      if (frame !== this.page.mainFrame()) return;
      const next = new URL(frame.url()).pathname;
      if (next !== pathname) this.events.push({ t: Date.now(), kind: "nav", x: 0, y: 0 });
      pathname = next;
    });

    this.cdp = await this.page.context().newCDPSession(this.page);
    this.cdp.on("Page.screencastFrame", (frame) => {
      const file = path.join(this.dir, `${String(this.frames.length).padStart(6, "0")}.jpg`);
      this.frames.push({ file, ts: (frame.metadata.timestamp ?? Date.now() / 1000) * 1000 });
      this.writes.push(fs.promises.writeFile(file, Buffer.from(frame.data, "base64")));
      this.cdp?.send("Page.screencastFrameAck", { sessionId: frame.sessionId }).catch(() => {});
    });
    await this.cdp.send("Page.startScreencast", {
      format: "jpeg",
      quality: 92,
      maxWidth: this.width,
      maxHeight: this.height,
      everyNthFrame: 1,
    });
  }

  async stop(): Promise<void> {
    await this.cdp?.send("Page.stopScreencast").catch(() => {});
    await Promise.all(this.writes);
  }

  /**
   * Writes <base>.mp4 (30 fps, device pixels) from the frames between `from` and `to`, and
   * <base>.events.json with the input events in milliseconds from `from`.
   */
  write(base: string, from: number, to: number): void {
    const frames = this.frames.filter((f) => f.ts < to).sort((a, b) => a.ts - b.ts);
    let first = 0;
    for (let i = 0; i < frames.length; i += 1) if (frames[i].ts <= from) first = i;
    const lines: string[] = [];
    for (let i = first; i < frames.length; i += 1) {
      const start = Math.max(frames[i].ts, from);
      const end = i + 1 < frames.length ? frames[i + 1].ts : to;
      if (end - start <= 0) continue;
      lines.push(`file '${frames[i].file}'`, `duration ${((end - start) / 1000).toFixed(4)}`);
    }
    if (!lines.length) throw new Error("The screencast sent no frames.");
    lines.push(lines[lines.length - 2]);
    const list = path.join(this.dir, "frames.txt");
    fs.writeFileSync(list, `${lines.join("\n")}\n`);
    execFileSync("ffmpeg", [
      "-hide_banner", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", list,
      "-vf", `fps=30,scale=${this.width}:${this.height}:flags=lanczos,format=yuv420p`,
      "-c:v", "libx264", "-crf", "12", "-preset", "fast", "-an", `${base}.mp4`,
    ]);
    const events = this.events.filter((e) => e.t >= from - 2000 && e.t <= to).map((e) => ({ ...e, t: e.t - from }));
    const viewport = this.page.viewportSize();
    fs.writeFileSync(`${base}.events.json`, `${JSON.stringify({ viewport, scale: this.width / (viewport?.width ?? this.width), events })}\n`);
    fs.rmSync(this.dir, { recursive: true, force: true });
  }
}
