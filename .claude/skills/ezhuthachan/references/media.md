# Media

Stage 6, when the user asked for screenshots or videos. A recording does three jobs at once: it produces the media, it proves the written steps can really be followed, and it shows which API calls the flow makes, which completes the permission path.

Every recording drives a real Care instance and creates real records in it. So the first part of this stage is a conversation, not a command.

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

One trap to check every time: the frontend decides which backend to call from its own configuration (`REACT_CARE_API_URL` in its env files, read in `care.config.ts`), and the default in the repository points at a shared hosted backend. A frontend started without changing that talks to the hosted backend, not to your local one. After signing in, confirm which backend the app is calling before you create anything.

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
grep '"@playwright/test"' "$S/src/care_fe/package.json"       # the version to install
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

- `kit.ts`: `startRecording(page, slug)` returns a recording with `step()`, `shot()`, `pointer` and `finish()`. `t(key)` gives the text of a label from the pinned locale file and fails on an unknown key.
- `pointer.ts`: a visible cursor that moves along eased paths, clicks with a ripple, and types at human speed.
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
| `<slug>.vtt` | Captions, one cue per step |
| `<slug>.api.json` | The API calls the flow made, with status codes |
| `<slug>-1.png`, `<slug>-2.png`, ... | Step screenshots, with the target outlined |

Look at the results before you call them done. Open every screenshot. Pull frames from the video at a few caption times and look at those too:

```bash
ffmpeg -loglevel error -y -ss 4 -i out/<slug>.mp4 -frames:v 1 out/check.png
```

Check that the cursor is visible, the right element is outlined, nothing is half-loaded, and no real-looking personal data is on screen.

An empty `api.json` after a flow that clearly loaded data means the app is calling a backend other than `EZ_API_URL`. Stop and find out which.

## When the screen does not match the page

If a step cannot be performed as written, the page is wrong or the instance runs different code. Do not quietly bend the spec until it passes.

1. Find out which it is: compare the instance's commit with your pin, and re-read the code for that step.
2. If the page was wrong, correct the fact, then the page, then the spec, and send the page through review again.
3. If the instance differs from the pin, tell the user.
4. If one flow fails, carry on with the others and report the failure.

## Use the API log

Take each `<slug>.api.json` back to the permission path of that flow, as "Confirming at runtime" in `permissions.md` describes. This is where missed gates are caught. If the user agreed to proof runs, do them now.

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
