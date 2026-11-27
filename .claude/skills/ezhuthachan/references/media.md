# Media

Stage 6, when the user asked for screenshots or videos. A recording does three jobs at once: it produces the media, it proves the written steps can really be followed, and it shows which API calls the flow makes, which completes the permission path.

Every recording drives a real Care instance and creates real records in it. So the first part of this stage is a conversation, not a command.

When the session's job is deck videos (see `SKILL.md`), read "Videos for the deck" at the end of this file first. The parts about pages, such as step titles that match a page, the API log, and putting media in pages, do not apply to it.

## Agree on an environment

People run Care in different ways, and some do not run it at all. Ask; do not pick. Offer what you saw in the setup check as context ("something is listening on ports 9000 and 4000; is that a Care you want me to use?").

The options:

- **A stack you start for this session**, from the pinned checkouts, natively or in Docker, whichever they prefer. It matches the researched commit exactly, and you can reset its database. It takes the longest to set up.
- **A stack they already run locally.**
- **A provisioned instance**, a hosted Care kept for demos and testing.

For any instance you did not start yourself, settle two things before you open it.

**1. Which commit is it running?** If the instance runs different code from what you researched, the screenshots will contradict the text. Look at what it reports:

```bash
curl -s https://<backend>/app_version/      # {"version": "<commit>"} when the deployment sets it; "unknown" otherwise
curl -s https://<frontend>/build-meta.json  # when the frontend was built; it does not say which commit
```

The frontend never reports its commit, and the backend does only when the deployment was built to. Whatever is missing, ask the user. If the instance differs from your pin, tell them what that means and let them decide: record anyway and accept the risk, point you at another instance, or move the pin to match the instance and re-verify the facts.

**2. What may you do there?** Get a clear answer from a person, by name, to both of these:

- Does this instance hold any real patient data? If yes, or if nobody can say, do not use it.
- Which data policy applies?
  - **Disposable.** You may create, change and delete anything, and the database can be reset.
  - **Create allowed.** You may create records, named so they are recognisable as yours. You do not change or delete anything you did not create.
  - **Read only.** You save nothing. Only flows that end before a save can be recorded; say which flows that excludes.

Also ask for an account to sign in with, and what role it has. Pass the credentials as environment variables for the run. Do not write them down anywhere.

Write the environment into `session.md`: the kind, both URLs, the commit it runs and how you know, the data policy, and who approved it and when. At wrap-up, offer to remember the instance and its policy, never the credentials.

### Starting a stack yourself

Do not follow remembered commands; the repositories document how to run themselves and that changes between versions. Read these at the pinned commit and follow them:

```text
$S/src/care/README.md and $S/src/care/Makefile
$S/src/care_fe/README.md, $S/src/care_fe/tests/README.md and $S/src/care_fe/scripts/playwright-db.sh
```

Before you start a service, install dependencies, or reset a database, tell the user what you are about to run and get their agreement. Installing frontend dependencies takes about 1 GB.

Give a Docker stack its own Compose project name, for example `docker compose -p ez-<session id> -f docker-compose.yaml -f docker-compose.local.yaml up -d --build --wait`, run in `$S/src/care`. Without `-p`, Compose names the project after the folder, `care`, and would share containers and volumes with a stack the user runs from their own clone; a `teardown` would then delete their database. Use the same `-p` for every later command, including `exec`, `stop` and `down`. If the build stops with `DeadlineExceeded` while loading the base image's metadata, pull that image first (the `FROM` line of `docker/dev.Dockerfile`) and build again.

One trap to check every time: the frontend decides which backend to call from its own configuration (`REACT_CARE_API_URL` in its env files, read in `care.config.ts`), and the default in the repository points at a shared hosted backend. A frontend started without changing that talks to the hosted backend, not to your local one. After signing in, confirm which backend the app is calling before you create anything.

A second dependency sits outside the stack. Searches for coded values, such as diagnoses, medicines and the codes in a value set, go from the backend to a SNOMED terminology server, set by `SNOWSTORM_DEPLOYMENT_URL` (`config/settings/base.py` in `care`; read the default at your pin, which in November 2026 was a public server). When that server is down, those searches fail and every flow that uses one breaks, which looks like a product bug. Before you report one, or change a spec, check that it answers:

```bash
curl -s -m 15 -o /dev/null -w '%{http_code}\n' "<SNOWSTORM_DEPLOYMENT_URL>/metadata"   # 200 when it is up
```

If it does not, record the other flows and come back to these later.

### One recording at a time per environment

Two sessions recording against the same database spoil each other's data. Take a lock before recording and release it after:

```bash
mkdir -p "$EZ/locks" && mkdir "$EZ/locks/<backend-host>" && echo "$ID" > "$EZ/locks/<backend-host>/owner"
# ... record ...
rm -r "$EZ/locks/<backend-host>"
```

If `mkdir` fails, another session holds it. Read `owner`, tell the user, and wait or ask.

## Set up the recording kit

Copy the kit into the session and install Playwright at the version the product uses, so the two agree on browser builds:

```bash
cp "<this skill>/assets/recording/"*.ts "$S/media/"
cd "$S/media"
node -p "require('$S/src/care_fe/package-lock.json').packages['node_modules/@playwright/test'].version"   # the version to install
npm init -y >/dev/null && npm install --save-dev @playwright/test@<that version>
npx playwright install chromium
```

`ffmpeg` and `ffprobe` must be installed; the kit uses them for the video and the screenshot outlines.

The kit takes its settings from the environment:

```bash
export EZ_FE_URL=<frontend URL>
export EZ_API_URL=<backend URL>
export EZ_LOCALE_FILE="$S/src/care_fe/public/locale/en.json"
export EZ_USERNAME=<account>  EZ_PASSWORD=<password>
```

What is in the kit:

- `kit.ts`: `startRecording(page, slug)` returns a recording with `step()`, `shot()`, `ready()`, `pointer` and `finish()`. `t(key)` gives the text of a label from the pinned locale file and fails on an unknown key. `package.json` gives only a version range; the lock file gives the version care_fe really installs, which is the one the command above reads.
- `pointer.ts`: a visible cursor that moves along eased paths, clicks with a ripple, and types at human speed.
- `capture.ts`: with `EZ_CAPTURE=1`, the kit records through the browser's screencast at device pixels (2x, so 2880 by 1800 at the default window) instead of Playwright's own video, and logs every mouse move, click, key and page change to `<slug>.events.json`. Playwright's video is too soft to zoom into. Use this when the video will be zoomed or shown large, as deck videos are. It writes no poster and the files are large, so a docs page keeps Playwright's video.
- `login.setup.ts`: signs in through the login page. Compare its selectors with `tests/setup/auth.setup.ts` in the pinned `care_fe` before the first run.
- `playwright.config.ts`: 1440 by 900, video on, one worker.
- `example.demo.ts`: the shape of a flow spec. Its keys and URL are placeholders.

## Write one spec per flow

Name it `<flow-slug>.demo.ts`. Start from `example.demo.ts`.

**Keep the spec and the page in step.**

- Each `rec.step()` title is the step heading from the flow page, word for word. The captions come from these titles.
- Find elements by label key with `t()`, taken from your facts. Never type the English text into the spec. The same spec can then record in another language by pointing `EZ_LOCALE_FILE` at that locale file.
- Take a screenshot at each step that a reader would want to see, with `rec.shot({ highlight: <the element the step is about> })`.

**Record only what a person can do.** A viewer must be able to repeat everything they see.

- One `page.goto`, at the start, to the screen where the flow begins. Reach every later screen by clicking: the sidebar, a tab, a row, a breadcrumb.
- Call `rec.ready()` once that first screen has loaded, before the first pointer move. The video and the captions then start there, not on the app's loading screen.
- Use `pointer.click()` and `pointer.type()`, so the cursor travels and text appears as typed. Plain `click()` and `fill()` are for setup the camera never sees.
- Never use `page.evaluate` or a direct API call to do a step of the flow.
- After typing into a search or picker, wait for the options and click one. Do not press Enter blind.
- Use only keyboard shortcuts that the page documents.

**Own your data.**

- Do the preparation off camera: if the flow needs a record that another flow creates, make it before the recorded page opens, in a separate browser context or through the API.
- Each flow creates what it changes. Do not rely on what another recording left behind.
- Respect the data policy. Under "create allowed", name records so they are recognisably yours.
- Use invented people, the same small cast in every recording. If `$EZ/personas.md` exists, use it. If not, propose a few clearly fictional names that suit the deployment's region, get the user's agreement, and save them there.

**Keep it watchable.** Aim for under a minute per flow; split a longer flow into two pages. Assert only what you need in order to wait for the screen to settle.

## Run and inspect

```bash
npx playwright test                       # all flows
npx playwright test create-a-workspace    # one flow
EZ_SHOTS_ONLY=1 npx playwright test       # screenshots only, no video, faster
```

Each flow writes to `$S/media/out/`:

| File | What it is |
| --- | --- |
| `<slug>.mp4` | The video |
| `<slug>.poster.png` | Its poster frame |
| `<slug>.vtt` | Captions, one cue per step; narration replaces them with subtitles of the spoken words |
| `<slug>.api.json` | The API calls the flow made, with status codes |
| `<slug>-1.png`, `<slug>-2.png`, ... | Step screenshots, with the target outlined |

Look at the results before you call them done. Open every screenshot. Pull frames from the video at a few caption times and look at those too:

```bash
ffmpeg -loglevel error -y -ss 4 -i out/<slug>.mp4 -frames:v 1 out/check.png
```

Check that the cursor is visible, the right element is outlined, nothing is half-loaded, and no real-looking personal data is on screen.

An empty `api.json` after a flow that clearly loaded data means the app is calling a backend other than `EZ_API_URL`. Stop and find out which.

## Finish: speed up, zoom and frame

A deck video, or any video the user wants with the zoom-in look, is finished from a 2x recording (`EZ_CAPTURE=1`) with the scripts in `assets/finishing/`. Documentation videos are not: they stay Playwright's plain video, narrated and subtitled.

```bash
cp "<this skill>/assets/finishing/"* "$S/media/"
cd "$S/media"
./finish.sh out/<slug>.mp4                       # or out/<slug>.mp4:<final name>, several at once
```

- `retime.py` speeds the recording up. Movement plays 1.8 times faster, a stretch where nothing changes is cut to 0.8 seconds, and the last screen holds 1.5 seconds. Pass `--speed`, `--still` or `--end` after a second colon: `out/x.mp4:x:--speed 1.5`.
- `zoom.py` puts the app in a rounded window with a light shadow, 1920 by 1304, over the deck slide's own grey (#f2f2f2), so on a slide only the window and its shadow show. Any window is scaled to leave 48 px around it; 1600 by 1000 shows at 1822 by 1140. `--theme` picks another background: `white` for a white slide, or the wallpapers `care` (Care UI's emerald) and `blue`. It zooms in where the clicks, the typing and a resting cursor are, follows the cursor, and zooms back out when the screen is replaced. `--plan-only` prints the zoom shots, `--skip N` leaves out a shot that looks wrong, and `--plain` frames without zooming.
- `frame.py` frames a 1x video the same way (it takes the look from `zoom.py`, so copy both), and scales a phone recording (taller than wide) to 884 by 1920 without a frame.

`finish.sh` writes `final-zoom/<name>.mp4` and `final-plain/<name>.mp4`, and a contact sheet, `out/fast/<name>-sheet.png`. `MODE=plain` renders only the plain one, as deck videos need now. A phone recording gets only the plain one. Look at the sheet and at a few full frames before you call a video done: it opens on a settled screen, shows no error toast or spinner, and each result stays on screen for about a second.

If you change these scripts, three ffmpeg traps:

- A still image looped as an input (`-loop 1`) runs at 25 frames a second unless you pass `-framerate`. Combined with 30 fps video through `zoompan`, the result plays 1.2 times too fast and freezes at the end. The scripts pass `-framerate 30`. After a change, check that a finished video lasts exactly as long as the sped-up one.
- Current ffmpeg (9.0 when this was written) no longer has `-filter_complex_script`. Pass a filter file as `-/filter_complex <file>`.
- ffmpeg and Playwright read standard input. In a `while read` loop they swallow the rest of the list. Give ffmpeg `-nostdin`, and give both `< /dev/null`.

## Several recorders at once

When many videos are wanted, hand them to helpers (subagents) that record in parallel on the one environment. The session holds the environment lock for all of them. Within it:

- Write a brief in `$S/media/` that every helper reads first: the URLs, the accounts by role (credentials stay in the environment), the story of each video, the data rules below, how to check the result, and what to report. A helper knows nothing else.
- Record one at a time. Browsers recording at once make one another's videos stutter. Every recording and every render goes through `./withlock.sh` from `assets/finishing/`, which waits for `.recording.lock` in the media folder: `EZ_OUT=out/<run> ./withlock.sh npx playwright test <spec>`. Never delete the lock by hand; a lock older than 30 minutes is cleared by the script.
- Give each run its own output folder (`EZ_OUT=out/<run>`), so runs do not overwrite one another's files.
- Each helper creates its own patients and encounters off camera, with invented names it has checked are not in the database yet, and changes nothing it did not create.
- Anything created on camera gets a real-sounding name, the kind a hospital would use for a form, a workspace, a schedule or a value set. Never "Test" or "Demo".

## When the screen does not match the page

If a step cannot be performed as written, the page is wrong or the instance runs different code. Do not quietly bend the spec until it passes.

1. Find out which it is: compare the instance's commit with your pin, check the terminology server (see "Starting a stack yourself") when the step searches for a code, and re-read the code for that step.
2. If the page was wrong, correct the fact, then the page, then the spec, and send the page through review again.
3. If the instance differs from the pin, tell the user.
4. If one flow fails, carry on with the others and report the failure.

## Use the API log

Take each `<slug>.api.json` back to the permission path of that flow, as "Confirming at runtime" in `permissions.md` describes. This is where missed gates are caught. If the user agreed to proof runs, do them now.

## Narration

Documentation videos are narrated and subtitled, and stay plain (no zoom). Do it now, before the media goes into the pages; see `narration.md`.

## Put the media in the pages

Decide the domain and module folder first; they are set in `publishing.md`. Media files are published under `/media/<domain>/<module>/`.

The video goes directly under the Overview heading, the way existing flow pages have it:

```mdx
<video src="/media/<domain>/<module>/<slug>.mp4" poster="/media/<domain>/<module>/<slug>.poster.png" controls width="720">
  <track kind="captions" src="/media/<domain>/<module>/<slug>.vtt" srcLang="en" label="English" default />
</video>
```

A screenshot goes right after the step it shows:

```mdx
![The Create workspace button in the workspace list](/media/<domain>/<module>/<slug>-1.png)
```

Write alt text that says what the image shows, for readers who cannot see it.

The captions track and the screenshots are new to the docs site; before this, pages had a video and nothing else. This markup passed the docs build for every language on 20 November 2026. The build is still the judge each time: if it rejects something here, fix or remove it and say so in the pull request.

Set each recorded flow to `recorded` in `plan.md`, and release the environment lock.

## Videos for the deck

When the session's job is videos for the deck at deck.ohc.network, the same kit records them. The user set these rules between 24 and 27 November 2026; follow all of them:

- **What to make.** The deck's existing videos, remade on the current Care screens (ask which slides; in November 2026 they were slide 16 onward of the Canva deck), and one video for each main new feature of the release when asked. Each tells one small story that shows what a feature is for, to hospital decision makers. When the user asks for a comparison, show the variants first: for workspaces, two or three different workspaces before the work in one of them.
- **Data that looks real.** Realistic invented names for people, patients and everything created on camera; no real hospital or person, and never "Test" or "Demo".
- **Silent.** No voice and no captions, unless the user asks for them (`narration.md`).
- **Sped up like the originals.** About 15 to 30 seconds after the speed-up; the raw recording is usually 1.5 to 2.5 times longer. `retime.py` does this.
- **Sharp.** Record with `EZ_CAPTURE=1` and a 1600 by 1000 viewport (set `viewport` in `playwright.config.ts`).
- **On the slide's grey.** The app in a window with rounded corners (28 px, `CORNER` in `zoom.py`) and a light shadow, as large as the frame allows, over the slide's own background colour, 1920 by 1304: no coloured border or wallpaper. The slides were #f2f2f2 in November 2026; check the slide in Canva before rendering (sample a screenshot), and use `--theme white` for a white slide. The shadow must fade out inside the frame, or the video's edge shows on the slide. `zoom.py` does all this by default. Coloured wallpapers (a blue-to-mint gradient, Care emerald, muted blue) were tried and set aside on 27 November.
- **Plain only.** No zoom version unless the user asks for one again: render with `MODE=plain` into `final-plain/`. A phone video (a phone-sized viewport, 442 by 960 worked, with `isMobile: true`) is a plain screen recording with no frame, like the deck's original.
- **Show one first.** When the look changes, render one video and show it, with a mock-up of it in its slide, before rendering the rest. Then send each video as soon as it is ready, with where the file is. The user takes the files straight from the output folders. A re-render reuses the sped-up file and plan (`RETIME=0`), so the timing stays as approved; keep the previous files in a dated folder.
- **File names.** The feature name only, in lower case, such as `bed-management.mp4`: no product, version or slide prefix such as `care31-` or `slide-22-`. A file that is not finished starts with `in-progress-`.
- **Clean frames.** Each video opens on a settled screen and shows no error, spinner or flash. Cut a flash that only the recording caught (a code or a message that appears for a moment) from the raw recording before finishing, and shift the times in `<slug>.events.json` by the length removed.
- **Real roles.** A facility administrator for facility settings, a doctor or nurse for clinical work. Never the superuser.

Several videos usually go to several helpers; see "Several recorders at once". There is no pull request.
