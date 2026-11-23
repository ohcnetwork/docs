# Product issues

Record every finding in `report.md`. Filing one on GitHub is a separate step, and it happens only with the user's agreement.

The backend is what a page describes. When the frontend disagrees with it, write the page from the backend. Do not ask which side to document. Ask only when the backend itself can be read two ways.

## What may be filed

File a finding only when it is a defect on its own, with nothing left to interpret.

- A message names the wrong action.
- A translation key is missing, so the screen would show the key.
- An example or a test uses a value the product rejects.
- A screen cannot finish loading, or an action the screen offers cannot succeed, and the code shows why.

If you would put "potential" in the title, do not file it. A permission that is stricter than the button, a list that includes more than you expected, and anything you would describe as "this may be intended" stay in `report.md`. They are notes, not issues.

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

Search, so you do not open a duplicate:

```bash
gh search issues --repo ohcnetwork/care --repo ohcnetwork/care_fe "<distinctive words>" --state open
```

An existing issue gets a comment with the pinned commit and the files, not a second issue. Comment only on a finding the user approved.

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
