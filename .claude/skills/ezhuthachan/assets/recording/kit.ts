// Recording kit for Ezhuthachan flow recordings.
//
// One recording run of a flow produces, in the output folder:
//   <name>.mp4          the demo video (H.264, plays in every browser)
//   <name>.poster.png   the poster frame for the video
//   <name>.vtt          captions, one cue per step, kept outside the video so they can be translated
//   <name>.api.json     every API call the flow made, used to confirm the permission path
//   <name>-<n>.png      step screenshots, with the target outlined
//
// Settings come from environment variables so the same spec runs against any environment:
//   EZ_FE_URL       frontend URL (read by playwright.config.ts)
//   EZ_API_URL      backend URL; API calls are recognised by this prefix
//   EZ_LOCALE_FILE  path to the locale file in the pinned care_fe checkout, e.g. .../public/locale/en.json
//   EZ_OUT          output folder (default ./out)
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { test, type Locator, type Page } from "@playwright/test";

import { installCursor, Pointer } from "./pointer";

export const OUT = path.resolve(process.env.EZ_OUT ?? "out");
const API_URL = (process.env.EZ_API_URL ?? "").replace(/\/+$/, "");

// ---------------------------------------------------------------- labels

let labels: Record<string, string> | null = null;

/**
 * The text of a UI label, looked up by its translation key in the pinned locale file.
 * Finding elements by key keeps the recording tied to the same source as the written page,
 * and lets the same spec record in another language by pointing EZ_LOCALE_FILE at it.
 * An unknown key throws, so a wrong label fails loudly instead of recording the wrong thing.
 */
export function t(key: string, vars: Record<string, string | number> = {}): string {
  if (!labels) {
    const file = process.env.EZ_LOCALE_FILE;
    if (!file) throw new Error("EZ_LOCALE_FILE is not set. Point it at public/locale/en.json in the pinned care_fe checkout.");
    labels = JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, string>;
  }
  const value = labels[key];
  if (value === undefined) throw new Error(`No label with key "${key}" in ${process.env.EZ_LOCALE_FILE}. Check the key against the pinned commit.`);
  return value.replace(/\{\{\s*(\w+)\s*\}\}/g, (whole, name: string) => (name in vars ? String(vars[name]) : whole));
}

// ---------------------------------------------------------------- recording

type ApiCall = { method: string; path: string; status: number; count: number };
type Cue = { from: number; to: number; title: string };

const ID_SEGMENT = /\/(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|\d+)(?=\/|$)/gi;

function ffmpeg(args: string[]): void {
  try {
    execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args]);
  } catch (error) {
    const reason = (error as { code?: string }).code === "ENOENT" ? "ffmpeg is not installed" : String((error as Error).message);
    throw new Error(`ffmpeg failed: ${reason}`);
  }
}

const vttTime = (ms: number) => {
  const pad = (n: number, width = 2) => String(Math.floor(n)).padStart(width, "0");
  return `${pad(ms / 3600000)}:${pad((ms / 60000) % 60)}:${pad((ms / 1000) % 60)}.${pad(ms % 1000, 3)}`;
};

export class Recording {
  readonly pointer: Pointer;
  private readonly startedAt = Date.now();
  private readonly cues: Cue[] = [];
  private readonly calls = new Map<string, ApiCall>();
  private shots = 0;

  constructor(
    private readonly page: Page,
    private readonly name: string,
  ) {
    this.pointer = new Pointer(page);
    page.on("response", (response) => {
      const url = response.url();
      // The frontend and the API can share an origin, so the /api/v<n>/ path decides, not the host alone.
      if ((API_URL && !url.startsWith(API_URL)) || !/\/api\/v\d+\//.test(url)) return;
      const method = response.request().method();
      if (method === "OPTIONS") return;
      const pathname = new URL(url).pathname.replace(ID_SEGMENT, "/{id}");
      const key = `${method} ${pathname} ${response.status()}`;
      const seen = this.calls.get(key);
      if (seen) seen.count += 1;
      else this.calls.set(key, { method, path: pathname, status: response.status(), count: 1 });
    });
  }

  /** One step of the flow. Use the step heading from the flow page as the title, word for word. */
  async step(title: string, body: () => Promise<void>): Promise<void> {
    const from = Date.now() - this.startedAt;
    await test.step(title, body);
    this.cues.push({ from, to: Date.now() - this.startedAt, title });
  }

  /**
   * A screenshot of the page as it is now. The outline around `highlight` is drawn onto the image
   * afterwards, so nothing extra ever appears on screen or in the video.
   */
  async shot(options: { highlight?: Locator; name?: string } = {}): Promise<string> {
    fs.mkdirSync(OUT, { recursive: true });
    this.shots += 1;
    const file = path.join(OUT, `${options.name ?? `${this.name}-${this.shots}`}.png`);
    const box = options.highlight ? await options.highlight.boundingBox() : null;
    if (options.highlight && !box) throw new Error(`The element to highlight is not visible (${file}).`);
    await this.page.screenshot({ path: file });
    if (box) {
      const scale = await this.page.evaluate(() => window.devicePixelRatio);
      const pad = 6;
      const [x, y, w, h] = [box.x - pad, box.y - pad, box.width + pad * 2, box.height + pad * 2].map((v) => Math.max(0, Math.round(v * scale)));
      const outlined = `${file}.tmp.png`;
      ffmpeg(["-i", file, "-vf", `drawbox=x=${x}:y=${y}:w=${w}:h=${h}:color=0x2563EB:t=${Math.round(3 * scale)}`, "-frames:v", "1", "-update", "1", outlined]);
      fs.renameSync(outlined, file);
    }
    return file;
  }

  /** Holds the final screen, then writes the video, poster, captions and API log. */
  async finish(holdMs = 2500): Promise<void> {
    await this.page.waitForTimeout(holdMs);
    const video = this.page.video();
    await this.page.close();
    fs.mkdirSync(OUT, { recursive: true });
    const base = path.join(OUT, this.name);

    fs.writeFileSync(`${base}.api.json`, `${JSON.stringify([...this.calls.values()], null, 2)}\n`);
    fs.writeFileSync(
      `${base}.vtt`,
      `WEBVTT\n\n${this.cues.map((cue, i) => `${i + 1}\n${vttTime(cue.from)} --> ${vttTime(cue.to)}\n${cue.title}\n`).join("\n")}`,
    );

    // Video is off in a screenshots-only run.
    if (!video) return;
    const webm = `${base}.webm`;
    await video.saveAs(webm);
    // yuv420p is required by Safari and QuickTime. A constant 30 fps removes the stutter of
    // Playwright's variable frame rate. faststart lets playback begin before the download ends.
    ffmpeg(["-i", webm, "-vf", "fps=30", "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p", "-crf", "22", "-preset", "slow", "-movflags", "+faststart", "-an", `${base}.mp4`]);
    const duration = Number(
      execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", `${base}.mp4`]).toString().trim(),
    );
    // Early frames are loading skeletons, so take the poster from later in the clip.
    ffmpeg(["-ss", (duration * 0.6).toFixed(2), "-i", `${base}.mp4`, "-frames:v", "1", "-update", "1", `${base}.poster.png`]);
    fs.rmSync(webm);
  }
}

/**
 * Call this first in a spec, before any navigation: the cursor overlay has to be installed
 * before the first page loads, or the video has no visible cursor.
 */
export async function startRecording(page: Page, name: string): Promise<Recording> {
  await installCursor(page);
  return new Recording(page, name);
}
