# Questions and the confirm gate

Stage 4, and also how to ask a question at any stage.

The examples in this file are invented to show the shape of a good question and a plan. They are not facts about Workspaces.

## Asking a question

A question is the right move whenever the code is ambiguous, two places disagree, a label or permission has more than one reading, the request can be read two ways, or you are simply not sure. Never guess to avoid asking, and never soften a guess with "typically" or "usually" to make it pass.

The person answering is busy and may not read code. Make each question answerable on its own:

- **Say what you read**, in product terms, with the file for those who want it.
- **Say what you found.**
- **Say why it is unclear.**
- **Say what each answer changes** in the pages.
- **Offer options** when the answers are discrete, with the one you think likelier first and marked as your reading, not as fact.

Weak: "Please clarify how workspaces are shared."

Strong: "A facility workspace can be shared with departments. The save call accepts a list of departments, but the form I can see only lets you pick one. Is choosing several departments meant to be possible in 3.1? If yes, I document it as a multi-select and report the form as a bug. If no, I document a single choice."

Ask in batches, not one at a time: collect what a stage raises and ask it together. Use your tool's structured question prompt when it has one.

Sort questions into two kinds:

- **Blocking.** You cannot write a sound page without the answer. Stop that page until it is answered. Other pages continue.
- **Not blocking.** You can write the rest honestly. Leave the uncertain part out of the page, and list the question in the report and the pull request.

Do not ask what you can find out, including by writing a probe and running it (`probes.md`). Each question should be one that only a person can answer: a preference, or a product decision the code does not settle.

When the frontend and the backend disagree, the backend is the source of truth for the page and the disagreement is an issue (`issues.md`). Ask about it only when the backend itself can be read two ways.

## questions.md

Every question goes into `questions.md` in the session, asked in chat or not. The user can answer in chat or by typing under "Answer" in the file; with many questions, the file is quicker.

```markdown
# Questions

Answer in chat, or type under "Answer" here and tell Ezhuthachan you are done.

## Q4 (blocking, open)

**Question:** Is choosing several departments for a facility workspace meant to be possible in 3.1?

**What I read:** The share form and the save call for facility workspaces.

**What I found:** The call accepts a list of departments. The form lets you pick one.

**Why it is unclear:** The two disagree, and either could be the intended behaviour.

**What each answer changes:** Yes: the flow shows a multi-select and I report the form as a bug. No: the flow shows a single choice.

**Affects:** share-a-workspace

**Answer:**
```

When an answer arrives:

1. Write it under "Answer" with who answered and the date, and change the heading to `answered`.
2. Add a fact to `facts.md` with `Kind: human`, citing the person, the date and the question number.
3. If the user says they answered in the file, re-read the file and do the same for each new answer.

An answer settles intent. It does not change what the code does. If someone says a button exists and you cannot find it at the pinned commit, say so and ask where it is; do not document it on their word alone. The reader will be using the code, not the intention.

At wrap-up, ask whether any answers should become standing answers in memory, so the next session does not ask again. See "Memory" in `setup.md`.

## The confirm gate

When research is done, stop and show the user what you intend to write. This is the point where a wrong direction is cheapest to fix. Do not draft anything before they confirm.

Show, in this order:

1. **The pages**, numbered in the order a reader meets them, one line each: the title, what it covers, and the existing page it updates or links to. `existing-docs.md` is how you find those.
2. **What you found that they might not expect**: a flow that exists in the code but looks unfinished, a screen behind a configuration flag, a difference between versions.
3. **Every open question**, blocking ones first.
4. **Suspected product bugs**, briefly.

Then ask them to confirm or change the page list and to answer what they can.

## plan.md

The page list lives in `plan.md`, so the user can also edit it directly.

```markdown
# Plan: Workspaces (Care 3.1)

Tick or untick a page, reorder the lines, change a title, or add a line. Then tell Ezhuthachan.

## Pages

- [x] concept | workspace | Workspace | proposed
- [x] flow | create-a-workspace | Create a workspace | proposed
  - Starts at: Facility settings, Workspaces
  - Needs: nothing
- [x] flow | share-a-workspace | Share a workspace with a department | proposed
  - Needs: create-a-workspace
  - Blocked by: Q4
- [ ] flow | set-a-default-workspace | Set your default workspace | proposed
  - Unticked by the user: out of scope for now
```

Each page line is `- [x] kind | slug | Title | status`. The kind is `concept` or `flow`. The slug is kebab-case; a flow slug is a verb phrase. Indented lines are notes.

Statuses, in order: `requested` (the user added it and you have not researched it), `proposed`, `confirmed`, `drafted`, `reviewed`, `recorded`, `published`.

After the user responds, in chat or in the file:

- Re-read `plan.md`. Respect every change: unticked pages are dropped, the order is theirs, titles are theirs.
- A line they added, with only a title, is a request. Give it a slug and status `requested`, research it like any other flow, and bring it back for confirmation.
- Set the confirmed pages to `confirmed`, note in `session.md` who confirmed and when, and move to writing.

Keep the statuses current as pages move forward. When the user asks where things stand, answer from `session.md` and `plan.md`: the stage, each page with its status, and the open questions.
