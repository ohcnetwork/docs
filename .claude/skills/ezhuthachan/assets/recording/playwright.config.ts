import { defineConfig, devices } from "@playwright/test";

// Every setting that differs between environments comes from the environment, so the same
// specs record against a local stack or a provisioned instance without edits.
const feUrl = process.env.EZ_FE_URL;
if (!feUrl) throw new Error("EZ_FE_URL is not set. Set it to the frontend URL of the environment the user approved.");

const AUTH = ".auth/user.json";
// EZ_SHOTS_ONLY=1 takes the screenshots without recording video, which is much faster.
const video = process.env.EZ_SHOTS_ONLY ? "off" : { mode: "on" as const, size: { width: 1440, height: 900 } };

export default defineConfig({
  testDir: ".",
  timeout: 180_000,
  // One at a time by default. Recordings share one application and one database, and video
  // capture drops frames under load. Raise EZ_WORKERS only when every flow creates its own data.
  workers: Number(process.env.EZ_WORKERS ?? 1),
  fullyParallel: false,
  retries: 0,
  reporter: "list",
  outputDir: "./test-results",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: feUrl,
    // 16:10. The video size must equal the viewport: Playwright captures the viewport at CSS
    // pixel size and pads a larger frame with grey instead of sharpening it.
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    video,
    // No slowMo: it would delay every step of an eased mouse path. The pointer helper sets the pace.
    navigationTimeout: 30_000,
    actionTimeout: 15_000,
  },
  projects: [
    { name: "login", testMatch: /login\.setup\.ts/ },
    {
      name: "flows",
      testMatch: /.*\.demo\.ts/,
      // The example is a template with placeholder keys, never a flow to run.
      testIgnore: /example\.demo\.ts/,
      dependencies: ["login"],
      // The login project always runs first (dependency) and writes this file before any flow context opens.
      use: { storageState: AUTH },
    },
  ],
});
