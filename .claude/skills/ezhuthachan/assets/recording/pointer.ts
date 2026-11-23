import type { Locator, Page } from "@playwright/test";

// Playwright never renders the OS cursor into the video, so draw a synthetic one that
// follows the real input events and reacts to clicks.
function cursorOverlay(): void {
  const ID = "__demo_cursor__";

  // Init scripts run at document-start, when documentElement may not exist yet, so
  // every DOM touch has to be lazy.
  const ensure = (): HTMLElement | null => {
    const root = document.documentElement;
    if (!root) return null;

    if (!document.getElementById("__demo_cursor_style__")) {
      const style = document.createElement("style");
      style.id = "__demo_cursor_style__";
      style.textContent = `@keyframes __demo_ripple__ {
        from { transform: translate(-50%,-50%) scale(.3); opacity:.55; }
        to   { transform: translate(-50%,-50%) scale(1);  opacity:0; }
      }`;
      root.appendChild(style);
    }

    let el = document.getElementById(ID);
    if (el) return el;

    el = document.createElement("div");
    el.id = ID;
    el.setAttribute(
      "style",
      [
        "position:fixed",
        "top:0",
        "left:0",
        "width:24px",
        "height:24px",
        "z-index:2147483647",
        "pointer-events:none",
        "will-change:transform",
        "transform:translate(-100px,-100px)",
      ].join(";"),
    );
    el.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
           style="filter:drop-shadow(0 1px 2px rgba(0,0,0,.45))">
        <path d="M5 2.5 L5 19 L9.2 15.1 L11.9 21.2 L14.9 19.9 L12.2 13.9 L18 13.6 Z"
              fill="#fff" stroke="#111" stroke-width="1.2" stroke-linejoin="round"/>
      </svg>`;
    root.appendChild(el);
    return el;
  };

  addEventListener(
    "mousemove",
    (e) => {
      const el = ensure();
      if (el) el.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    },
    true,
  );

  addEventListener(
    "mousedown",
    (e) => {
      const root = document.documentElement;
      if (!root) return;
      ensure();
      const ring = document.createElement("div");
      ring.setAttribute(
        "style",
        [
          "position:fixed",
          `left:${e.clientX}px`,
          `top:${e.clientY}px`,
          "width:44px",
          "height:44px",
          "border-radius:50%",
          "background:rgba(37,99,235,.35)",
          "border:2px solid rgba(37,99,235,.9)",
          "z-index:2147483646",
          "pointer-events:none",
          "animation:__demo_ripple__ .45s ease-out forwards",
        ].join(";"),
      );
      root.appendChild(ring);
      setTimeout(() => ring.remove(), 500);
    },
    true,
  );
}

export const installCursor = (page: Page) => page.addInitScript(cursorOverlay);

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Moves the mouse along eased paths so the recording looks hand-driven. */
export class Pointer {
  private x = 0;
  private y = 0;

  constructor(private readonly page: Page) {}

  async reset(): Promise<void> {
    const vp = this.page.viewportSize();
    this.x = (vp?.width ?? 1440) / 2;
    this.y = (vp?.height ?? 900) * 0.8;
    await this.page.mouse.move(this.x, this.y);
  }

  /** Scrolls with animation and waits for it to settle, so the frame never jumps. */
  private async smoothScrollIntoView(target: Locator): Promise<void> {
    const offscreen = await target.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const margin = 32;
      return (
        r.top < margin ||
        r.bottom > window.innerHeight - margin ||
        r.left < margin ||
        r.right > window.innerWidth - margin
      );
    });
    if (!offscreen) return;

    await target.evaluate((el) =>
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      }),
    );

    // Poll until the element stops moving rather than guessing a duration.
    let previous = Number.NaN;
    for (let i = 0; i < 40; i += 1) {
      const box = await target.boundingBox();
      const y = box?.y ?? 0;
      if (Math.abs(y - previous) < 0.5) return;
      previous = y;
      await this.page.waitForTimeout(50);
    }
  }

  async moveTo(target: Locator, durationMs = 700): Promise<void> {
    await this.smoothScrollIntoView(target);
    const box = await target.boundingBox();
    if (!box) throw new Error("Cannot move to a target with no bounding box.");

    const toX = box.x + box.width / 2;
    const toY = box.y + box.height / 2;
    const fromX = this.x;
    const fromY = this.y;

    const steps = Math.max(24, Math.round(durationMs / 16));
    for (let i = 1; i <= steps; i += 1) {
      const t = easeInOutCubic(i / steps);
      await this.page.mouse.move(
        fromX + (toX - fromX) * t,
        fromY + (toY - fromY) * t,
      );
      await this.page.waitForTimeout(durationMs / steps);
    }

    this.x = toX;
    this.y = toY;
  }

  async click(target: Locator, durationMs = 700): Promise<void> {
    await this.moveTo(target, durationMs);
    // Small settle so the viewer sees the cursor land before it presses.
    await this.page.waitForTimeout(180);
    await this.page.mouse.down();
    await this.page.waitForTimeout(110);
    await this.page.mouse.up();
  }

  /**
   * Clicks the field, then types one character at a time with jittered delays, so the
   * text appears the way a person types it instead of landing in a single frame.
   */
  async type(
    target: Locator,
    text: string,
    options: { clear?: boolean; delayMs?: number } = {},
  ): Promise<void> {
    const { clear = false, delayMs = 45 } = options;

    await this.click(target);
    await this.page.waitForTimeout(150);

    if (clear) {
      await this.page.keyboard.press("ControlOrMeta+A");
      await this.page.waitForTimeout(120);
      await this.page.keyboard.press("Backspace");
      await this.page.waitForTimeout(180);
    }

    for (const character of text) {
      await this.page.keyboard.type(character);
      // Jitter keeps the rhythm irregular; a pause after word breaks reads as thinking.
      const pause = delayMs * (0.6 + Math.random() * 0.8);
      await this.page.waitForTimeout(
        /[\s,.;:]/.test(character) ? pause + delayMs : pause,
      );
    }
  }
}
