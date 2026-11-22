# Product issues

A finding from the research is filed as a GitHub issue, not left only in `report.md`. This covers suspected bugs, and every place the frontend shows, hides or allows something the backend does not.

The backend is what a page describes. When the frontend disagrees with it, write the page from the backend and file the disagreement. Do not ask the user which side to document. Ask only when the backend itself can be read two ways.

## File with the user's GitHub CLI

```bash
gh auth status
```

They almost always have `gh` and are signed in. Use it. File the issue yourself; do not hand them a draft to paste.

If `gh` is missing or not signed in, ask a subagent to do the filing once they have signed in. If that also fails, leave the issue text in `report.md` and tell them in one line.

## Before you file

Search, so you do not open a duplicate:

```bash
gh search issues --repo ohcnetwork/care --repo ohcnetwork/care_fe "<distinctive words>" --state open
```

An existing issue gets a comment with the pinned commit and the files, not a second issue.

## Where it goes

| Finding | Repository |
| --- | --- |
| The frontend shows, hides or mislabels something | `ohcnetwork/care_fe` |
| The backend allows, refuses or returns the wrong thing | `ohcnetwork/care` |
| The two disagree | the repository whose behaviour looks wrong, and name the other side in the body |

```bash
gh issue create --repo ohcnetwork/care_fe --title "<what is wrong>" --body-file "$S/issues/<slug>.md"
```

Write the body to `$S/issues/<slug>.md` first, so it is reviewable. It says:

- what a user sees, in product words
- what the backend does
- the file and lines, and the pinned commit
- how sure you are, and what you have not run
- the link to the other issue when a finding needs both repositories

Say "potential" in the title when you are sure of the behaviour and unsure it was unintended.

## After

Add the issue URL under the finding in `report.md`. Never put patient data, tokens or credentials in an issue. File what you actually read or ran. A finding you did not check stays in `report.md` until you have.
