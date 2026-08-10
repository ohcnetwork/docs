# Flow Recording (Demo Videos)

How to record a screen-capture video for a flow doc and attach it.

Settled decisions:

- **Format:** MP4, H.264, `yuv420p` (widest browser compatibility)
- **Specs live in:** this repository, under `recordings/` (separate from the app test
  suite)

> [!IMPORTANT]
> **Unresolved for this repository.** These decisions were made when the docs were
> plain Markdown browsed on github.com. This site is Docusaurus, and MDX renders and
> bundles assets differently. Before the first recording here, settle with the user:
> where the MP4 and poster live so Docusaurus serves them, and what the embed markup
> is. Do not assume the github.com `<video src="../media/...">` convention still
> applies — verify it renders, in every locale, with `npm run build`.

## One-time bootstrap (not yet created)

This repository has a `package.json`, but it belongs to Docusaurus and has no
Playwright. Before the first recording it needs:

1. `@playwright/test` added as a dev dependency (match the version `care_fe` uses).
2. `playwright.config.ts` with a single `docs` project (see config below).
3. `.gitignore` entries for `test-results/` and the raw `*.webm` intermediates.
4. `ffmpeg` installed (`brew install ffmpeg`).

Ask the user before creating this bootstrap. Do not add it silently, and do not
reshape the Docusaurus `package.json` without approval.

## Prerequisites for every recording run

Recordings drive the real application, so the full local stack must be up:

### 0. STOP — verify the frontend targets localhost

```sh
grep -h "^REACT_CARE_API_URL" ../care_fe/.env.local ../care_fe/.env
```

The value MUST be a localhost address (for example `http://localhost:9000`).

`care_fe/.env.local` ships pointing at `https://careapi.ohc.network`, a shared hosted
environment, and the same file lists production URLs for other deployments. If the value
is not localhost, the recording creates **real patients and encounters on a live system**.

**If it is not localhost, STOP and tell the user. Do not continue. Do not edit the value
yourself** — the user must choose the correct backend and restart the dev server.

1. **Backend** running on port 9000 (see `care/CLAUDE.md`).
2. **Frontend production build** served at `http://localhost:4000`
   (`npm run build && npm run preview` in `care_fe`).
3. **Clean database** — in `care_fe`, run `npm run playwright:db-restore`.
   First time: `npm run playwright:db-reset` with `CARE_BACKEND_DIR` set.
   Note `care/.env` `DATABASE_URL` must use the `care` database, because
   `scripts/playwright-db.sh` defaults to `POSTGRES_DB=care`. A mismatch makes the reset
   rebuild a database nothing uses, while fixtures write into the live backend instead.
4. **Fresh auth state** — in `care_fe`, run `npx playwright test --project=setup`.
   This writes `care_fe/tests/.auth/*.json` and the fixture IDs in
   `care_fe/tests/support/`. Tokens rotate, so refresh them before a recording
   session. The config reads these files by relative path.
   Warning: this step restores the local database. Confirm with the user first.

## Recording config

```ts
// playwright.config.ts
use: {
  ...devices["Desktop Chrome"],
  baseURL: "http://localhost:4000",
  storageState: "../care_fe/tests/.auth/user.json",
  viewport: { width: 1440, height: 900 },
  video: { mode: "on", size: { width: 1440, height: 900 } },
}
```

Why these settings:

- 1440x900 is 16:10, the aspect ratio of a Mac display, and the frame looks natural in
  a document.
- **`video.size` must equal the viewport.** Playwright captures the viewport at CSS
  pixel size and places it in the TOP-LEFT of the output frame, padding the rest. A
  larger `size` does not produce a sharper video; it produces a small image on a grey
  background. `deviceScaleFactor` does not raise the capture resolution either.
- Do NOT set `launchOptions.slowMo`. It delays every Playwright action, including each
  individual `mouse.move` of an eased path, which turned a 12 second recording into 45
  seconds. Pace the recording with the pointer helper and explicit pauses instead.

Do NOT enable the `video.show` annotation options. They burn the action name and the
current `test.step()` title into the frame, which looks like debug output in a user-facing
document.

## Mouse cursor and clicks

Playwright does not render the OS cursor into the video, so
[pointer.ts](../../../../recordings/support/pointer.ts) injects a synthetic one:

- `installCursor(page)` adds an init script that draws an arrow following real
  `mousemove` events, and a ripple on `mousedown`.
  **Call it before `page.goto`.**
- `new Pointer(page)` moves the mouse along an ease-in-out path
  (`easeInOutCubic`, ~24+ steps) so the motion looks hand-driven rather than teleported.
  Use `pointer.click(locator)` instead of `locator.click()`, and call `pointer.reset()`
  once after the first page load to place the cursor.
- `Pointer.moveTo` scrolls the target into view with
  `scrollIntoView({ behavior: "smooth" })` and polls the bounding box until it stops
  moving. Do NOT use `scrollIntoViewIfNeeded()`; it jumps the frame in one video frame.
  It also skips scrolling entirely when the target is already comfortably in view, so
  the page does not shift for no reason.

Gotcha: init scripts run at document-start, when `document.documentElement` can still be
null. Every DOM touch in the injected script must be lazy, or the script throws and no
listeners get registered — the symptom is a recording with no cursor at all.

## Record only what a person can do

A viewer must be able to repeat every action in the video. Anything the browser does
that a human cannot do makes the recording useless as instruction.

- **Never navigate by URL after the recording starts.** Reach every screen the way a
  user reaches it: click the sidebar item, the tab, the row, the breadcrumb, the back
  button. A flow that visits two screens clicks its way from the first to the second.
- **One `page.goto` per recording, at the very start**, to open the entry screen the
  flow's first step names. Treat it as the user arriving with a bookmark. Everything
  after it is UI interaction.
- **Never use `page.evaluate` to change application state**, set values, or click
  elements. It is invisible on screen.
- **Never call the API from the spec to shortcut a step of the flow being recorded.**
- **Do the setup off camera.** If a flow needs data that another flow creates, build it
  on a separate page or context before the recorded page opens (see the `prepPage`
  pattern), never in the recorded frames.
- Prefer `pointer.click(locator)` over `locator.click()`, so the cursor travels to the
  target. Direct `locator.click()` clicks with no visible cursor movement.
- Keyboard shortcuts are fine — a user can press them — but only the ones the flow doc
  documents.

## Typing

Text must appear the way a person types it. `locator.fill()` inserts the whole string in
one frame, which reads as a glitch.

- Use `pointer.type(locator, text)` from
  [pointer.ts](../../../../recordings/support/pointer.ts). It clicks the field, then
  types character by character with jittered delays and a longer pause after spaces and
  punctuation.
- Pass `{ clear: true }` to replace existing content; it selects all and deletes, which
  is what a user does.
- Tune the speed with `{ delayMs }` (default 45 ms per character). Keep it fast but
  visible. Long free-text fields can go to about 25 ms.
- `fill()` is acceptable ONLY off camera, in setup that the recorded page never shows.
- After typing into a search or combobox, wait for the option list, then
  `pointer.click()` the option. Do not press Enter blindly.

## Writing a demo spec

One spec per flow doc, named to match the doc:
`recordings/<domain>/<slug>.demo.ts`

Rules:

- **Each `test.step()` title MUST equal the matching step heading in the flow doc.**
  The burned-in caption and the written doc then stay in sync by construction.
- **Specs run in parallel, so each spec must own the data it mutates.** The config sets
  `fullyParallel: true` with 3 workers (`RECORD_WORKERS` overrides it). A flow that
  changes shared state — completing, discharging or restarting an encounter — must
  create its own patient or encounter at the start rather than reusing the fixture that
  other flows read. Flows that only read shared data are safe as they are.
  Group flows that truly cannot be isolated with `test.describe.serial`.
- Keep the worker count modest. Video capture is CPU heavy; too many concurrent
  recordings drop frames and the output looks janky.
- Use the same locator style as `care_fe/tests/` (`getByRole`, `getByLabel`) and the
  helpers in `care_fe/tests/helper/ui.ts`.
- Use fixture IDs from `care_fe/tests/support/*Id.ts` instead of hardcoded IDs.
- Generate unique data with `faker` so re-runs do not collide.
- Add a short settle pause at the end so the final state stays on screen.
- Save the video to a stable name — Playwright's default filenames are hashes:

  ```ts
  await page.close(); // finalizes the video
  await page.video()?.saveAs(rawWebmPath);
  ```

- Do NOT assert like a test. A recording that fails mid-way produces a useless video.
  Keep assertions to the minimum needed to wait for the UI to settle.

## Converting to MP4

Playwright emits WebM only. Convert each recording:

```sh
ffmpeg -y -i "<raw>.webm" \
  -vf fps=30 \
  -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -crf 24 -preset slow -movflags +faststart -an \
  "<Parent>/<Module>/media/<index>. <Flow name>.mp4"
```

- `-pix_fmt yuv420p` is required, or Safari and QuickTime will not play the file.
- `-vf fps=30` converts Playwright's variable frame rate to constant, which removes stutter.
- `-movflags +faststart` lets playback begin before the whole file downloads.
- `-an` drops the (empty) audio track.
- `-crf 24` is a reasonable size/quality trade-off. Lower means larger and sharper.

Poster frame (used by the `poster` attribute of the embed). Seek to about 60% of the
duration — early frames are loading skeletons, and `-vf thumbnail` only samples the
first ~100 frames, so it picks one of them:

```sh
ffmpeg -y -ss <0.6 * duration> -i "<file>.mp4" -frames:v 1 "<file>.png"
```

## Embedding in the flow doc

Put the embed directly under the `## Overview` heading:

```markdown
<video src="../media/<file>.mp4" poster="../media/<file>.png" controls width="720"></video>

[Watch the demo](../media/<file>.mp4) — <short phrase describing the clip>.
```

Rules:

- **Use relative paths, never absolute URLs.** `../media/...` is relative to the flow
  doc and is confirmed to render on github.com. Do NOT use
  `https://github.com/<org>/<repo>/raw/...`.
- `<file>` is the flow doc's own filename without the extension, for example
  `1. Start a discussion`. The doc, spec, video and poster all share that stem.
- **Filenames contain spaces. Encode every space as `%20`** in `src`, `poster`, and
  the markdown link. For example
  `../media/1.%20Start%20a%20discussion.mp4`.
- The `poster` attribute supplies the thumbnail. Do NOT add a
  `[![Watch the demo](...png)](...mp4)` fallback line; it is redundant.
- Keep `controls width="720"`.

Reference implementation:
a flow doc under `versioned_docs/`.

`.markdownlint.json` lists `video` under `MD033.allowed_elements`, so the HTML form
lints clean.

## Size and storage

- Keep each recording under roughly 30 seconds. Split long flows.
- Expect a few hundred KB to about 2 MB per flow at these settings.
- Commit the MP4 and poster files. Do NOT commit the raw `.webm` intermediates.
- If a module's media folder grows past tens of megabytes, move to Git LFS.

## Gotchas

- The video is only written when the page or browser context closes.
- Videos capture the viewport only, never real browser chrome or OS windows.
- Everything on screen is baked into the video permanently. Use fixture data only.
  NEVER record against a database that holds real patient information.
- Run `playwright:db-restore` between takes, or repeat runs drift as data accumulates.
