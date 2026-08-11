---
sidebar_position: {N}
---

{/*
This template is the standard for every flow doc. Match its section names and their
order exactly. Delete every comment block before you save.

The H1 is a plain Markdown heading — never centered HTML, which does not render in
MDX. Name the flow as a user task.
*/}

# How to {action}

## Overview

{/*
One or two sentences. Say what the flow does and link the concept.
Example: This flow describes how to register a new
[patient](../../concepts/clinical/patient.mdx) in Care manually.
*/}

{/*
Optional demo video, added later by the recorder agent. Writers leave this out.
See .github/references/flow-recording.md.
*/}

## Pre-requisites

{/*
What must be true before the user can start, written from the user's point of view.
Cover prior user actions, facility membership, and deployment configuration. Verify
each item in the codebase.

Write the real-world situation, not the data model:
  Good: "The patient is registered in Care, and you record the encounter for that patient."
  Bad:  "The patient record exists in Care."
  Good: "If you start the encounter from an appointment, the patient has a booked or
         checked-in appointment at the facility."
  Bad:  "For the appointment entry points, a booked or checked-in appointment exists."

Start conditional items with "If ..." so the reader knows when the item applies.
*/}

- {Pre-requisite}
- You have the permissions listed below.

## Permissions

{/*
Source permissions from the backend authorization (see
.github/references/codebase-navigation.md):
1. Find the viewset's authorize_* methods in care/emr/api/viewsets/<domain>.py.
2. Trace AuthorizationController.call("can_...") to care/security/authorization/<domain>.py.
3. Take the display name from the Permission definition in
   care/security/permissions/<domain>.py.
Use the human-readable permission name ("Can Create Patient"), never the slug.
*/}

| Permission | Access |
| --- | --- |
| {Permission name} | {What it allows} |

## Steps

### 1. {First step name}

{/*
Number each step. One instruction per sentence, in command form ("Select…", "Enter…").
- Start from where the user is, for example the facility dashboard.
- Use exact UI labels from public/locale/en.json.
- Use a table for form fields, with Components / What it captures columns.
- Note deployment configuration that changes behaviour:
  "Note: Which fields are mandatory depends on your deployment's configuration."
- Include a keyboard shortcut only when care_fe/src/config/keyboardShortcuts.json
  defines one for that action.
- No code, file paths, API endpoints or payloads. A flow is strictly user-facing;
  the technical surface belongs in the reference doc.
*/}

### {N}. {Last step name}

## Expected Outcome

{/* What the user sees, or what the system creates, once the flow completes. */}

- {Outcome}

## Related

{/*
Follow the link rule in the shared conventions for extensions and translated docs.
Omit any line with no target.
*/}

Concepts:

- [{Resource}](../../concepts/{domain}/{slug}.mdx)

Flows:

- [{Other flow}](./{other-flow-slug}.mdx)
