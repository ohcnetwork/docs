# Set up and intake

This covers stages 1 and 2: the state folder, memory, the session, what the machine has, the questions to ask first, and getting the code pinned to exact commits.

If you were started inside the docs repository, that working tree belongs to the user. Read it to learn the site (`existing-docs.md`), and do the writing in the session's own checkout of docs, on a new branch. Do not switch the branch they already have open.

## State folder

```bash
EZ="$HOME/.ezhuthachan"
mkdir -p "$EZ/repos" "$EZ/sessions" "$EZ/answers" "$EZ/provenance"
```

## Memory

Read `$EZ/memory.md` before anything else. It tells you how this person likes to work, so you can offer their last answers as defaults.

If the file does not exist, create it:

```markdown
# Ezhuthachan memory

Capped at 200 lines. Preferences and human decisions only.
Never evidence for what the code does. Never credentials.

## Preferences

## Version map

## Environments

## Standing answers
```

What belongs in each section:

- **Preferences.** How to get the code (managed or their own clone, and where that is), how they run Care, recording choices, how they like questions asked.
- **Version map.** Which branch of each repository was confirmed for which Care version, and on what date. This is a default to offer, never an answer to assume.
- **Environments.** Instances a person approved for recording, with the data policy and who approved it. No passwords.
- **Standing answers.** Decisions a person made that apply across modules, with who and when.

Answers that concern one module go in `$EZ/answers/<version>/<module>.md` instead. Read that file only when that module is the subject.

Rules for writing to memory:

- Write only at wrap-up, and only lines the user approved after seeing them.
- End each line with the date, for example `- Uses managed sources. (2026-11-20)`.
- Before adding, run `wc -l "$EZ/memory.md"`. If the file would pass 200 lines, first merge duplicates, remove entries that a newer one replaces, and move module-specific lines to `answers/`. Tell the user what you removed.
- A memory entry about how the code behaves is always wrong to add. Code facts go stale; they belong in `facts.md` with a commit.

## Start or resume a session

List open sessions first:

```bash
ls "$EZ/sessions" 2>/dev/null | while read -r id; do grep -HE "^- (Module|Stage):" "$EZ/sessions/$id/session.md"; done
```

If an open session matches what the user is asking for, ask whether to resume it. To resume, read its `session.md`, then `plan.md` and `questions.md`, then do the upstream check in "Resuming" below.

To start a new one:

```bash
ID="$(date +%F)-<module-slug>-$(openssl rand -hex 2)"     # for example 2026-11-20-workspaces-a1b2
S="$EZ/sessions/$ID"
mkdir -p "$S/src" "$S/drafts" "$S/media"
```

Create `session.md`, `facts.md`, `plan.md`, `questions.md` and `report.md` in `$S`. Start `session.md` like this and keep it current:

```markdown
# Session 2026-11-20-workspaces-a1b2

- Module: Workspaces
- Request: "generate documentation for the workspace module"
- Requested by: <name, if known>
- Stage: intake
- Care version: not confirmed
- Pages wanted: not confirmed
- Media wanted: not confirmed
- Docs versions to write: not confirmed

## Sources

| Repository | Mode | Branch | Commit | Commit date | Checked against upstream |
| --- | --- | --- | --- | --- | --- |

## Environment

Not chosen.

## Code map notes

## Log

- 2026-11-20 18:35 Session created.
```

Several sessions can run at the same time. Each has its own folder and its own checkouts, so they do not disturb one another.

## What the machine has

Look, so that your later questions are informed. Do not choose anything yet.

```bash
for c in git node npm python3 docker ffmpeg ffprobe gh psql; do
  printf "%-8s %s\n" "$c" "$(command -v "$c" || echo missing)"
done
docker info --format '{{.ServerVersion}}' 2>/dev/null || echo "docker daemon not running"
for p in 9000 4000 5432 6379; do (nc -z 127.0.0.1 "$p" 2>/dev/null && echo "listening :$p") || echo "nothing on :$p"; done
```

Ports 9000 and 4000 are the defaults for the Care backend and frontend. Something listening there suggests the person already runs Care locally. That is worth knowing when media comes up, and it is still their choice.

## Intake questions

Ask these together, in one round. Offer the remembered answer as the default where memory has one.

1. **Which Care version is this for, and which branch holds it in each repository?** Always ask, every session, even when memory has an answer, because the mapping moves as releases are cut. Show the real branches so the choice is concrete:

   ```bash
   git ls-remote --heads https://github.com/ohcnetwork/care.git | grep -E 'refs/heads/(develop|main|master|staging|[0-9]+\.[0-9x.]+)$'
   git ls-remote --heads https://github.com/ohcnetwork/care_fe.git | grep -E 'refs/heads/(develop|main|master|staging|[0-9]+\.[0-9x.]+)$'
   ```

   In November 2026, version 3.1 lived on `develop` in both repositories and 3.0 had its own `3.0` branch. Treat that as an example of the shape, not as current fact.

2. **Should I keep my own copy of the code, or read yours?** Recommend the managed copy and say why in a sentence: it is always fresh from upstream, and it leaves their clones and branches alone. If they prefer their own, ask for the paths.

3. **Does the module involve a plugin?** Some Care features live in separate plugin repositories. If they are not sure, check after the code is pinned and come back with what you found. The list of known plugins is at `https://github.com/ohcnetwork/care_apps_registry`.

4. **Which pages?** A concept page, flow pages, or both. Ask whether there are flows they already know they want.

5. **Screenshots and videos?** Only whether they want them, and whether the videos should be spoken. The questions about where to record and which voice come at the media stage, when they matter.

6. **Anything about the readers I should know?** For example, the page is mainly for front-desk staff.

Do not ask what the code can tell you. Which screens exist, what the buttons say, and who may do what are research.

Record the answers in `session.md`.

## Getting the code

Three repositories are always needed: `care` (backend), `care_fe` (frontend) and `docs` (the site you write to, on `main`; it also holds the house style). Add plugin repositories when the module needs them.

### Managed copy (recommended)

Each repository has one shared mirror, and each session gets its own checkout from it. A checkout of both Care repositories is about 30 MB, so sessions are cheap.

First time only, per repository:

```bash
M="$EZ/repos/care.git"
git init --bare --quiet "$M"
git -C "$M" remote add origin https://github.com/ohcnetwork/care.git
```

If the person has a local clone, use it to avoid a long download. This copies objects from their clone and changes nothing in it:

```bash
git -C "$M" fetch --quiet --no-tags /path/to/their/care '+refs/remotes/*:refs/seed/*'
```

Every session, fetch from upstream. This is the step that makes the research current, so never skip it:

```bash
git -C "$M" fetch --quiet --prune --tags origin
git -C "$M" for-each-ref --format='delete %(refname)' refs/seed | git -C "$M" update-ref --stdin
```

If the fetch fails because another session is fetching the same mirror, wait a few seconds and run it again.

Then pin and check out:

```bash
SHA="$(git -C "$M" rev-parse origin/develop)"          # the branch the user confirmed
git -C "$M" worktree add --quiet --detach "$S/src/care" "$SHA"
git -C "$M" log -1 --format='%H %cI %s' "$SHA"
```

Repeat for `care_fe` and `docs`. Use the HTTPS URLs; these repositories are public and need no sign-in to read.

### The user's own clone

Read it where it is. Run nothing in it that changes it: no checkout, switch, stash, pull, fetch or commit.

```bash
P=/path/to/their/care
git -C "$P" rev-parse HEAD
git -C "$P" rev-parse --abbrev-ref HEAD
git -C "$P" status --porcelain | wc -l                                   # uncommitted files
git ls-remote https://github.com/ohcnetwork/care.git refs/heads/develop  # upstream, read over the network
ln -s "$P" "$S/src/care"
```

Compare their `HEAD` with the upstream commit. If they differ, or there are uncommitted files, their clone is not the code you were asked to document. Say exactly what you found ("your clone is on branch X at commit A; `develop` upstream is at B; 3 files have uncommitted changes") and let them choose: bring the clone up to date themselves, or switch to the managed copy. Do not research a clone that differs from upstream unless they tell you to, and if they do, write that decision in `session.md` and in the pull request.

This matters in practice. On 20 November 2026 a local `care` clone was two days behind upstream, and in those two days the whole Workspaces backend had landed. Research on that clone would have concluded that Workspaces had no backend.

### Record and report the pin

Fill in the Sources table in `session.md` with the full commit hash, the commit date and the time you checked upstream. Then tell the user what you pinned, in words they can check: "`care` at c0399a943 from 20 Nov, `care_fe` at edc910ec1 from 20 Nov, both the latest on `develop`."

## Does the module exist on this branch?

Check before researching. A module can be in one version and absent from another.

```bash
for ref in 3.0 develop; do
  printf "%-8s %s files\n" "$ref" "$(git -C "$EZ/repos/care_fe.git" ls-tree -r --name-only "origin/$ref" | grep -ic workspace)"
done
```

Run it for each repository and for each branch the docs site has a version for. Try the product name and the names the code might use; they can differ between frontend and backend.

- Files on the chosen branch: continue, and tell the user where the module exists and where it does not.
- No files on the chosen branch: stop and tell the user. Either the branch is wrong, or the module has another name in the code. Ask.

The result also decides which docs versions you write to: only versions whose branch contains the module. Confirm that list with the user and record it.

With the user's own clone, the branch list comes from their remote-tracking refs, which can be stale. Check each one against `git ls-remote` and say so if it is behind.

## Resuming

Upstream may have moved since the session was pinned.

```bash
git ls-remote https://github.com/ohcnetwork/care.git refs/heads/develop
```

If the commit differs from the pin, fetch the mirror and see whether the change touches what you researched:

```bash
git -C "$M" fetch --quiet --prune --tags origin
git -C "$M" diff --name-only <pinned> origin/develop
```

Tell the user what moved and ask whether to move the pin. If they say yes:

```bash
git -C "$S/src/care" checkout --quiet --detach <new commit>
```

Then re-open every fact in `facts.md` whose file is in the changed list, correct or remove it, and update its commit. Facts whose files did not change stay valid; update their commit to the new pin.

## Cleaning up

Closed sessions keep their checkouts until removed. For a session the user agrees to delete:

```bash
git -C "$EZ/repos/care.git" worktree remove --force "$S/src/care"     # for each managed repository
[ -L "$S/src/care" ] && rm "$S/src/care"                              # a link to the user's clone: remove the link, never its target
rm -rf "$S"
```
