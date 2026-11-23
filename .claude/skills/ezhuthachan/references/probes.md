# Probes

When a fact can be settled by running something, write a small script or a Playwright test, run it, and keep the output. Do not reason your way through a question that a run would answer, and do not bounce back to the user between each try.

This is the same idea as Claude Code's experimental Code Mode (`CLAUDE_CODE_EXPERIMENTAL_CODE_MODE=1` in Claude Code 2.1.323 and later, <https://code.claude.com/docs/en/code-mode>): one piece of code does the searching, the checks and the filtering, and only the conclusion comes back. In Claude Code, turn Code Mode on for the research. In any other tool, do it by hand: write the script into the session and run it.

## What a probe is for

- A permission path you traced in code and want to see fail at the predicted gate.
- A label, error message or status you cannot find by reading.
- Two files that seem to disagree, where a call shows which one wins.
- Anything you would otherwise re-read three times.

A probe is evidence of kind `runtime`. Cite the script path and the output file in the fact.

## How to run them

Collect every open point first. Then write the probes together, run them in one pass, and read the results once. A probe that needs a fact from an earlier probe waits; the rest run together.

Put scripts in `$S/probes/` and their output in `$S/probes/out/`. Name a script after the question it answers, for example `department-workspace-as-facility-admin.py`.

Prefer the cheapest run that answers the question:

1. A script against the pinned checkout: import the function, call it, print the result. No server.
2. An HTTP call against an environment the user already approved, with the data policy from `media.md`.
3. A Playwright test, using the recording kit, when the question is about what a person sees. `EZ_SHOTS_ONLY=1` when you only need the screenshot.

A probe creates records only on an environment whose data policy allows it. It never runs against an instance that may hold real patient data. It never prints tokens, passwords or patient details; print statuses, permission names and booleans.

When a probe fails because a tool or a service is missing, say so and leave the fact unsettled. Do not invent the result the probe would have given.

## What comes back

The conversation hears the conclusion: what you asked, what the run showed, and where the output file is. It does not hear the script, the logs or the intermediate searches. Those stay in `$S/probes/`.
