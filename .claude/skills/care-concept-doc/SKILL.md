---
name: care-concept-doc
description: >-
  Use when creating or updating a CONCEPT doc (the "What is…?" plain-language
  layer) for a Care EMR primitive in the Care docs site. Trigger when adding a
  concept page for a model/resource, when a Care change affects what a primitive
  IS or how access to it works (e.g. after merging a Care PR that adds a resource,
  changes a viewset's authorization, or alters permissions/roles), or when the
  user says "write a concept for X", "the concept is too thin / clustered",
  "explain X in plain language", or "the permissions table is wrong". Covers the
  quality bar (the patient concept), distilling the reference doc, the
  permission-table methodology (trace the viewset's real authorization), the Care
  design docs, link/MDX conventions, 3.0≡3.1 versioning, and build validation.
---

# Building Care concept docs

A **concept** answers _"What is…?"_ in plain language for **everyone** — clinicians, operators, implementers. It builds a mental model of a Care primitive. It is **not** a technical reference: do not dump fields, types, or API schemas (that is the reference layer's job).

Concepts live at `versioned_docs/version-3.0/concepts/<domain>/<slug>.mdx` (mirrored to `version-3.1`). One concept per primitive — never cluster several resources into one page.

## The quality bar

The gold standard is `versioned_docs/version-3.0/concepts/clinical/patient.mdx`. **Read it every time.** Also read `concepts/facility/organization.mdx` for a richer example (types, hierarchy, an access model). Study how a great concept:

- Opens with one sharp sentence defining the thing and the role it plays.
- Has a `## What it represents` that names the FHIR resource, gives categorized bullets, and then lands **one clarifying insight** that prevents a common misconception (patient: _"A patient is not the same as a single visit."_). This insight is what separates a real concept from a generic summary — always find it.
- Uses a few **conceptual** sections (a lifecycle diagram with real statuses, types/classification, how it connects to neighbours) that teach a model rather than list fields.
- Stays concise (~40–80 lines), plain, and confident — no spec jargon, no filler.

## Sources

1. **The matching reference doc** (`references/<domain>/<slug>.mdx`) — your factual backbone. Distill it into plain language; do not copy its tables.
2. **The Care backend** (sibling checkout, `../care` / `code/care`) — for the real status/type values and, critically, the permission model (see below).
3. **The Care design docs** (Confluence, space "Care Engineering", "EMR Implementation Docs", page id `15434108`, with a child page per resource). These hold the product intent and the _why_ — read the relevant page when available (via the Atlassian MCP `getConfluencePage`) for framing like governance hierarchies, user groups, lifecycle rationale. Treat them as design context, code as ground truth.

## Page structure

- Frontmatter: `sidebar_position: <n>`.
- `# <Title>` then a 1–2 sentence plain-language definition.
- `## What it represents` — FHIR resource + categorized bullets + the one clarifying insight.
- One to three conceptual sections drawn from the reference: **Lifecycle** (a ```` ```text ```` fenced `A → B → C` diagram using the **real** status values, then a bullet per state), **Types/Classification**, **How it connects** (relationships to patient/encounter/etc.), **Identifiers**, as fit the primitive.
- `## Permissions` — see the methodology below. This must be accurate to the code.
- `## Related` — links (always the technical reference; 2–4 closely-related concepts; a flow/playbook if relevant).
- `## FHIR reference` — one or two sentences if FHIR-aligned; else omit.

## Permissions: trace what the viewset actually authorizes

This is the part that is easy to get wrong. **Do not just dump a resource's permission enum** — a permission file often defines permissions a given viewset doesn't use, and clinical resources are gated by _patient_/_encounter_ permissions they don't own. Document what the **viewset actually checks**, using the Care backend as the single source of truth (use exactly the checkout/commit the user points to).

For each concept, build a `| Permission | Description | System Roles |` table by tracing:

1. **Find the viewset**: `care/emr/api/viewsets/<resource>.py` (may be in a subdir like `inventory/` or `scheduling/`). Read which authorization each action (create, list, retrieve, update, destroy, custom `@action`s) applies — via base viewset `authorize_*` hooks, `AuthorizationController.call("<method>", …)`, or `get_queryset` access checks.
2. **Trace each authz method to the real permission slug**: read the handler in `care/security/authorization/<resource>.py` (and `base.py`, `encounter.py`, `patient.py` for shared/`*_obj` methods). Handler methods call `check_permission_*([SomePermissions.<slug>.name])` — `<slug>` is the real permission. (E.g. `can_update_encounter_clinical_data` → checks `EncounterPermissions.can_write_encounter_clinical_data`.)
3. **Get the roles**: read the permission's definition in `care/security/permissions/<file>.py`; expand role-list constants (`ALL_ROLES`, `CLINICAL_DATA_ACCESS_ROLES`, …) by reading them. Role constants map to display names: Admin, Administrator, Doctor, Nurse, Staff, Pharmacist, Volunteer, Facility Admin, plus role-org Admin/Manager/Member.

Then write the table: one row per **real** permission slug the viewset/handler checks (slug in backticks), a concise authored Description of what it gates, and the expanded roles. Order by action (create, list/read, update, delete, then submit/questionnaire). Add one sentence on the access model (roles granted via org/facility/patient memberships; permissions cascade down the organization tree). If a resource has no permission gating (open terminology), use a short prose note instead of a table.

A `_clinical_data` split, role lists, and slug names differ between Care versions — always read the checkout in play, never assume.

## Workflow

### Creating a new concept

1. Read the patient gold (and organization) concept.
2. Read the matching reference doc + the relevant Care design page (if available).
3. Build the permission table via the viewset-tracing methodology above.
4. Write to `concepts/<domain>/<slug>.mdx`, mirror to 3.1, build.

### Updating for a Care change / PR

1. From the Care diff/PR, decide what changed: the resource's _nature_ (new fields/lifecycle/types → update the conceptual sections) or its _access_ (viewset/authz/permissions/roles changed → re-run the permission methodology for the affected concept(s)).
2. Map the change to concept page(s): a permissions/authz change can affect several concepts (anything whose viewset uses the changed permission). Grep `concepts/` for the slug or permission name.
3. Update only the affected sections; preserve the rest. Mirror to 3.1, build, and report what changed.

## Conventions (shared with reference docs)

Read `references/conventions.md` before writing for: domains & slugs, the link rule (`.mdx` everywhere except the translated `patient`/`create-patient`), MDX safety (no `{#…}` heading ids; wrap `{ }` in backticks), 3.0≡3.1 mirroring, and the `npm run build` (all locales) gate. Then return here.
