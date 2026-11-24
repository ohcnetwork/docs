# Narration

Stage 6, after the videos are recorded and checked, when the user wants them spoken. Each video gets a voice that reads its captions aloud. Where a line takes longer to say than its step takes on screen, the video holds a frame until the voice finishes, and the captions are re-timed to match. The pages do not change.

Narration is optional. Offer it once the videos are good; do not assume it.

## What the voice says

Only the captions. Each caption cue becomes one line: "3. Select Cancel Token" is read as "Step 3. Select Cancel Token.", and a cue without a number is read as it is. No greeting, no summary, no explanation of a step. A spoken sentence is a statement about Care like a written one; the captions are already verified, and anything more would need facts of its own.

## Agree on the voices

Speech comes from the ElevenLabs connector: `creative_list_voices`, `creative_create_flow`, `creative_generate_speech`, `creative_get_flow_run_status` and `account_get_usage`. If the session has no such connector, say so and stop here.

Ask in one round:

1. **Which voice?** List what the account has with `creative_list_voices`, searching by name when the user names one. Its labels give the language, and whether a voice is premade, from the library, or cloned. A voice id comes only from that list or from the user.
2. **More than one voice?** One voice reads a whole video; never change voices inside one. On 23 November 2026 the team chose two cloned voices taking turns flow by flow, in sidebar order.
3. **Another language?** That needs the captions translated and checked by a speaker of the language, and a translated page to show the video on: a language build without a translated page shows the English page, with the English video. Each is its own piece of work. Say so, and ask before starting either.

A cloned voice is a real person's voice. Use one only when the user chooses it, and name that person in the pull request.

Check the budget with `account_get_usage`. A line costs about one credit per character; the 52 lines of ten Token flows came to about 1,700 characters per voice. Tell the user how many characters the run needs before you start it.

## Set up

Copy the scripts into the session and make the plan from the recorded captions:

```bash
mkdir -p "$S/media/narration" && cp "<this skill>/assets/narration/"*.py "$S/media/narration/"
cd "$S/media/narration"
python3 make_plan.py --order <slug>,<slug>,... <voice>=<voice id> [<voice>=<voice id> ...]
```

- `<voice>` is a short folder name you choose, such as `gauri`.
- `--order` is the order of the flow sidebar (see "The flow sidebar" in `publishing.md`). With several voices, the first reads the first flow, the second the second, and so on. Change `assign` in `plan.json` to give a flow to another voice.
- `plan.json` holds every line, the voice of each flow, and `hold_frame` (see "Stitch"). Running `make_plan.py` again keeps `hold_frame`.

## Make the clips

```bash
python3 stitch.py --lines
```

prints each voice with its id and the lines it still needs. A line that two flows of one voice share is made once.

For each line, call `creative_generate_speech` with:

- `prompt`: the line exactly as printed.
- `voice_id` from the list, and `model_id: eleven_v4`.
- `generations_count: 1`. The default is 2, which pays for a second take nobody hears.
- `flow_id`: one flow for the whole run, made first with `creative_create_flow`.

As each call returns, add a row to `sessions.txt`: `<voice>|<session id>|<line>`. The clips are fetched by session id, and a context reset in the middle of a run loses whatever was not written down.

- Never call generate again for a line that is still pending. It starts, and charges, a second generation.
- On a free plan, several calls at once fail with "Free generations are busy … Nothing was charged." Send two to four at a time, and send again only the lines that failed. A paid plan took ten at a time on 23 November 2026.
- Ask `creative_get_flow_run_status` about up to 20 session ids per call, until all are completed. Its answers are long: copy out only each session id and its `content_url`.
- A `content_url` is signed and stops working within a few hours. Fetch the clips straight away:

```bash
python3 fetch.py <<'EOF'
<session id>|<content_url>
EOF
```

It saves `audio/<voice>/<file>.mp3` and prints each clip's length. `stitch.py --lines` should then have nothing left to make.

## Stitch

```bash
python3 stitch.py --dry       # which steps hold a frame, for how long, and which frame
python3 stitch.py --frames    # check/<slug>-holds.png for each flow
python3 stitch.py             # out/<slug>.mp4 and out/<slug>.vtt
```

How the voice is fitted to the video:

- Each clip is trimmed of silence and starts 0.25 s after its caption.
- When a line takes longer than its step allows, with 0.5 s to spare, the video holds one frame for the missing time. The voice is never sped up, and nothing is cut.
- The captions move by the same amounts.

A held frame must show a settled screen. Open every `check/<slug>-holds.png`. Each row is one held step: the frame it holds, then the step's first frame, the frame 0.5 s in, and its last frame. Look at the first one for a loading screen, grey skeleton rows, a dialog sliding in or a page fading. When you find one, choose a settled frame and set it in `hold_frame` in `plan.json`, keyed `"<slug> <step>"`: `"last"` for the last frame, or a number of seconds into the step. Then make the sheets again and look again.

On 24 November 2026, 4 of 27 held steps in the Token flows needed this: two held their last frame, and two held the frame 0.5 s in. An earlier look at only the first and last frames had passed a loading screen and a list of skeleton rows.

A different voice changes how long the holds are, and sometimes which steps hold. After any change, run `--dry`, make the sheets again, and look at every row.

## Check

```bash
python3 check.py
```

For each video it checks that the sound and the picture are the same length, that each voice starts just after its caption and ends before the next one, and that the peak level stays at or below -1 dB. Do not judge overlaps by counting the gaps in the sound: cloned voices pause after "Step 3.", which splits one line into two.

Then send the user one finished video per voice. Their ear is the last check: a wrong stress or a mispronounced label is not something the scripts can catch.

## Put it in the pages

The narrated video replaces the recorded one under the same name, together with its captions; the pages do not change.

```bash
cp out/*.mp4 out/*.vtt "$S/src/docs/static/media/<domain>/<module>/"
```

Before you copy over files that are already committed, compare them with what you expect them to be. When you change the voice, keep the earlier result in `out-<voice>/`, so the user can compare the two or go back.

Build again ("Validate" in `publishing.md`) and commit the narration in its own commit. In the pull request body, under the differences from the house style, add a Narration item: the voice reads only the captions; it is AI-generated, with the service and model; whose voice it is (a premade voice by its name, a cloned voice by the person it was cloned from); and that frames are held and captions re-timed where a line is longer than its step.

## Tools

Homebrew's `ffmpeg` may come without the `drawtext` filter (it is built without freetype). The scripts do not need it; the frame sheets carry no labels, and their columns are always in the order given above.
