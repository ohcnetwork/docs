# Product issues

Record every finding in `report.md`. Filing one on GitHub is a separate step, and it happens only with the user's agreement.

## When finding issues is the job

Then the findings are what the session delivers. For each area the user named, use the screens as each role they named would, on an environment at the pinned commits. Note anything that fails, that contradicts the code, or that contradicts another screen. Reproduce each one, keep the evidence (see "Evidence"), find the cause in the code with the file and lines, and decide whether it may be filed (see "What may be filed") or stays a note. Then check what the team already knows (see "Before you file") and show the user the list. The rest of this file applies as written.

## Evidence

Keep a screenshot, or the request and the response, for each finding. When the wrong state lasts only a moment, such as an error that flashes while something loads, or a value that is wrong and then corrects itself:

- Slow the request that ends it, so the wrong state stays on screen long enough for a screenshot, and say in the finding that you did:

  ```ts
  await page.route("**/api/v1/<path>/**", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 4000));
    await route.continue();
  });
  ```

- Or, when it appeared in a 2x recording (`EZ_CAPTURE=1`), take the frames from the raw recording, which keeps every painted frame: `ffmpeg -ss <seconds> -i out/<slug>.mp4 -frames:v 1 out/<slug>-flash.png`.

The backend is what a page describes. When the frontend disagrees with it, write the page from the backend. Do not ask which side to document. Ask only when the backend itself can be read two ways.

## What may be filed

File a finding only when it is a defect on its own, with nothing left to interpret.

- A message names the wrong action.
- A translation key is missing, so the screen would show the key.
- An example or a test uses a value the product rejects.
- A screen cannot finish loading, or an action the screen offers cannot succeed, and the code shows why.

If you would put "potential" in the title, do not file it. A permission that is stricter than the button, a list that includes more than you expected, and anything you would describe as "this may be intended" stay in `report.md`. They are notes, not issues.

## Security findings stay private

A finding that lets someone see or change data they should not have access to is a security finding. It never becomes a GitHub issue, a comment, or a line in a pull request, however certain it is. `SECURITY.md` in `care` says to report such findings privately to the maintainers and not to mention them anywhere in the project.

- Write the report into the session folder, in `security/`, and tell the user. Ask how it should reach the team, and send nothing yourself unless they ask you to.
- Keep its mechanism out of every page, even when a page would only describe the code accurately: the docs repository is public.
- Never describe a security finding in this skill, in a commit message, or in a pull request body.
- In `report.md`, mark the finding as security and say where the private report is.

## Ask first

Show the user the findings you are sure of, together, before you create anything. For each one give the repository, the title, and one sentence on why it is a defect. File only the ones they approve. Leave the others in `report.md`.

Do not file an issue, and do not comment on an existing one, until they say yes for that finding.

## File with the user's GitHub CLI

```bash
gh auth status
```

They almost always have `gh` and are signed in. When they have approved a finding, file it yourself. Do not hand them a draft to paste.

If `gh` is missing or not signed in, say so and leave the approved text in `report.md`.

## Before you file

Find out whether the team already knows. Open GitHub issues are only one place:

- **GitHub:** issues and pull requests in both repositories, in any state.

  ```bash
  gh search issues --repo ohcnetwork/care --repo ohcnetwork/care_fe "<distinctive words>"
  gh search prs --repo ohcnetwork/care --repo ohcnetwork/care_fe "<distinctive words>"
  ```

  A pull request merged after your pinned commit may already fix it. Say so, and check on a newer commit if you can, before you file.
- **Jira:** the team's site, openhealthcarenetwork.atlassian.net, across all projects, with a text search (`text ~ "<words>"`) when an Atlassian connector is available.
- **Slack:** the channel where the team collects issues for the release you are testing. Ask the user which one; for 3.1 it was `#enhancements-for-care-3-1`. Without a Slack connector, read it in the built-in browser after the user signs in. Thread replies and posts that are only a screenshot are easy to miss; say what you did not read.

For each finding, note where it is already mentioned, or that it is not. A finding the team already tracks is not filed again. An existing issue gets a comment with the pinned commit and the files, not a second issue. Comment only on a finding the user approved.

## Where it goes

| Finding | Repository |
| --- | --- |
| The frontend shows, hides or mislabels something | `ohcnetwork/care_fe` |
| The backend allows, refuses or returns the wrong thing | `ohcnetwork/care` |
| The two disagree | the repository whose behaviour is the defect, and name the other side in the body |

```bash
gh issue create --repo ohcnetwork/care_fe --title "<what is wrong>" --body-file "$S/issues/<slug>.md"
```

Write the body to `$S/issues/<slug>.md` first. It says:

- what a user sees, in product words
- what the code does
- the file and lines, and the pinned commit
- the link to the other issue when a finding needs both repositories

The title states the defect. It does not say "potential".

## After

Add the issue URL under the finding in `report.md`. Never put patient data, tokens or credentials in an issue. File what you actually read or ran.
