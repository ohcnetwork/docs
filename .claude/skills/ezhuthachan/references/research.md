# Research

Stage 3. You read the pinned code and come out with four things:

- `facts.md`: every fact the pages will rest on, each with its evidence.
- The user tasks (flows) in the module, in `plan.md`.
- The permission path of each flow. That has its own guide: `permissions.md`.
- Questions, for everything you could not settle, in `questions.md`.

Read `existing-docs.md` first and find the pages the site already has for this module and for the things it touches. Those pages supply the links and the terms. They do not supply the facts. A fact still comes from the pinned code.

The code is in the session checkouts, `$S/src/care` and `$S/src/care_fe`. The tables below give paths inside each repository. The commands are run from `$S/src`, so their paths start with the repository folder: `care/care/security/...`, `care_fe/src/...`.

## First, check the code map

The table below was correct on `develop` on 20 November 2026 (`care` c0399a943, `care_fe` edc910ec1). Code moves. An earlier version of this map sent researchers to route files that had since been replaced by a different router, and nobody noticed. So check it against your pin before you rely on it:

```bash
cd "$S/src"
for p in \
  care/care/security/permissions care/care/security/roles/role.py care/care/security/authorization \
  care/care/emr/api/viewsets care/care/emr/resources care/care/emr/models \
  care/config/api_router.py care/config/settings care/plug_config.py \
  care_fe/public/locale/en.json care_fe/src/routes care_fe/src/lib/router/auth.ts \
  care_fe/src/components/ui/sidebar care_fe/src/common/Permissions.tsx \
  care_fe/src/context/PermissionContext.tsx care_fe/src/types \
  care_fe/src/config/keyboardShortcuts.json care_fe/care.config.ts care_fe/tests/setup
do [ -e "$p" ] && echo "ok       $p" || echo "MISSING  $p"; done
```

For anything missing, find where it went by searching for what it contained, and write the new location under "Code map notes" in `session.md`. If you cannot find it, that is a question for the user, not a reason to skip that kind of fact.

### Backend (`care`)

| Path | What it holds |
| --- | --- |
| `care/security/permissions/<domain>.py` | Permission definitions. Each member is `Permission(display name, description, context, roles)`. The first argument is the name users see |
| `care/security/roles/role.py` | The default roles and their display names |
| `care/security/authorization/<domain>.py` | Authorization handlers. Shared checks are in `base.py` |
| `care/emr/api/viewsets/<domain>.py` | The API for a resource: `authorize_create`, `authorize_update`, `authorize_destroy`, `get_queryset`, and `@action` methods. Shared behaviour is in `base.py` |
| `care/emr/resources/<domain>/spec.py` | Fields, required or optional, validation, enums |
| `care/emr/models/<domain>.py` | Database models |
| `config/api_router.py` | Which URL goes to which viewset |
| `config/settings/` | Settings, including flags that change behaviour |
| `plug_config.py` | Backend plugins |

### Frontend (`care_fe`)

| Path | What it holds |
| --- | --- |
| `public/locale/en.json` | Every English UI string, by key. Other languages sit beside it |
| `src/routes/` | One file per route. `_app/` is the staff application, `_patient/` the patient portal, `_public/` pages without sign-in. Guards are `beforeLoad` functions; the shared ones are in `src/lib/router/auth.ts` |
| `src/components/ui/sidebar/` | Navigation: which items exist, in what order, and when each is shown |
| `src/common/Permissions.tsx` | Permission constants and `getPermissions`, which turns them into `canX` flags |
| `src/context/PermissionContext.tsx` | `hasPermission(permission, objectPermissions?)` |
| `src/types/**/*Api.ts` | API definitions: the path and method of each call |
| `src/config/keyboardShortcuts.json` | Keyboard shortcuts by context |
| `care.config.ts` | Deployment configuration that changes what the UI shows |
| `tests/` | The product's own Playwright tests. Useful for how a screen behaves and for selectors |

## Recording facts

Write a fact to `facts.md` the moment you verify it, not at the end from memory.

```markdown
## E12

Claim: The button that opens the create form is labelled "Create workspace".
Kind: code
Source: care_fe@edc910ec1 public/locale/en.json:1187
Quote: "create_workspace": "Create workspace",
```

- Number facts E1, E2, E3 in order. Never reuse or renumber; drafts refer to these numbers.
- One claim per fact, written the way it could appear in a page.
- `Source` is the repository, the short commit, the path and the line or line range.
- `Quote` is the exact text at those lines, at most three lines. Print it to be sure the line numbers are right: `sed -n '1187p' care_fe/public/locale/en.json`.
- For a runtime fact, `Kind: runtime` and the source is the screenshot or response file you kept. For a human fact, `Kind: human` and the source is the person, the date, and the question number.

A fact you cannot give a source for is not a fact. Turn it into a question.

## What to collect

Start from the name of the module and widen from there. `grep -ril workspace care/care care/config` and the same under `care_fe/src` show you the territory.

### From the backend

- **The resource.** Fields from the spec: name, required or optional, validation rules, and every enum with its values.
- **The endpoints.** `grep -n -i <module> care/config/api_router.py`, then the viewset it names.
- **Authorization.** For every action of the viewset. This is the core of `permissions.md`:

  ```bash
  grep -nE "def authorize_|AuthorizationController.call|PermissionDenied|@action|def get_queryset|is_superuser" care/care/emr/api/viewsets/<domain>.py
  ```

- **Rules the user can hit.** Validation errors and `PermissionDenied` messages, limits, and status transitions that are refused. These become "what to do when" tables.
- **Settings that change behaviour.** `grep -rn -i <module> care/config/settings/`.

### From the frontend

- **Where the module lives.** Routes and navigation:

  ```bash
  ls care_fe/src/routes/_app | grep -i <module>
  grep -rn -i <module> care_fe/src/components/ui/sidebar
  ```

- **Each screen.** What it shows, what actions it offers (buttons, menus, row actions, dialogs), and when each action appears.
- **Each form.** Sections, fields, required or optional or conditional, defaults, and the messages for invalid input. Forms are usually a zod schema next to the component.
- **Labels.** The exact text of everything you will name. See below.
- **What the screen calls.** `grep -rnE "useQuery|useMutation|query\(|mutate\(" <component>` and the `*Api.ts` file those calls point to. You need this for the permission path.
- **Shortcuts.** Only those in `src/config/keyboardShortcuts.json` for this context.
- **Configuration.** Anything in `care.config.ts` that hides, shows or changes this module.

### Labels

Pages name things exactly as the screen does. Take every label from `care_fe/public/locale/en.json`.

```bash
grep -n -i '"[^"]*workspace[^"]*":' care_fe/public/locale/en.json      # keys that mention the module
grep -nF '": "Create workspace"' care_fe/public/locale/en.json          # does this exact label exist?
```

- Find the key in the component first (`t("create_workspace")`), then read its value. Do not go from a guessed English phrase to a key; several keys can share similar text.
- Enum values are shown through keys shaped `PREFIX__value`, for example `encounter_status__in_progress` for "In Progress". Record the label, never the raw value.
- Labels with `{{name}}` placeholders are filled in at runtime. Quote the fixed part and describe the rest.
- Record the key with the fact. Recordings find elements by key.
- Some text on screen does not come from the locale file: role names, and anything a facility configures. Cite where it does come from.

## Finding the flows

A flow is one thing a user sets out to do, from where they start to the result: "Create a workspace", "Share a workspace with a department". It becomes one page.

1. List the screens of the module from the routes and the navigation.
2. For each screen, list every action a user can take.
3. Group the actions into user goals. A goal that needs several screens is still one flow. Two goals on one screen are two flows.
4. For each flow note: where the user starts and how they get there, each step with the labels involved, what must already be true (a status, another record), the variants (the same goal reached from two places), and the result.
5. Order the flows the way a user meets them: create first, then what depends on it.

Leave out what has no screen. An endpoint that the frontend never calls is not a flow.

Put each flow in `plan.md` as described in `questions.md`, with status `proposed`.

## Findings

Reading two codebases closely turns up bugs: a button the backend will refuse, a missing permission check, an enum value with no label, a status nothing can reach, a shortcut bound to an action that is gone. Write each one in `report.md` when you see it, with the file and lines, what disagrees with what, and how sure you are. Report what you read or ran, not what you suspect about code you did not open. An empty list is a fine result.

Then settle what a run can settle, with `probes.md`. Record each finding in `report.md`. File one only when `issues.md` allows it: the user has agreed, and the defect is certain. The page follows the backend. A disagreement between the frontend and the backend is not a question about what to write.

## With subagents

Send one researcher to the backend and one to the frontend, in parallel. Give each: the module, the path of its checkout, this file and `permissions.md`, and the fact format. Ask each to return facts with sources and quotes, a list of what it could not settle, and suspected bugs.

A researcher's report is a lead until you have checked it. Open the cited lines for every permission, role and label it reports before the fact goes into `facts.md`. Spot-check the rest.

A module with several sub-modules (Definitions & Terminology has eight) researches better split by sub-module than by repository: one researcher per group of sub-modules reads both codebases and the existing pages, and checks each page claim by claim. Give each a fact-number range (E1000–E1999, E2000–E2999, …) and its own facts file, so parallel researchers never collide.

In Claude Code, subagents may write their facts file but may not write a findings file: the harness refuses it and asks for findings as text. Ask for the findings in the reply, and save them to the session yourself. Do not rename the file to get around the refusal.

## Before you leave research

- Every fact in `facts.md` has a source you opened in this session, at the pinned commit.
- Every flow has its steps, its labels and its permission path, or a question saying what is missing.
- Nothing rests on "probably" or "usually". If you catch yourself writing either word, you have a question, not a fact.
