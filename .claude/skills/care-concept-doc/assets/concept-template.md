---
sidebar_position: {N}
---

{/*
This template is the standard for every concept doc. Match its section names and
their order exactly. Delete every comment block before you save.

The H1 is a plain Markdown heading — never centered HTML, which does not render
in MDX. The title is the resource name in sentence case.
*/}

# {Resource}

## Definition

{/*
A clear and concise definition of the resource.
- Explain what it is, its purpose, and how it fits into the overall system.
- Bold the resource name and link its FHIR R5 resource page on the first mention.
  Example: A **[patient](https://build.fhir.org/patient.html)** in Care is a person
  who receives care through your facility or program.
- Link the FHIR page, but never narrate the mapping. Do not write "as per FHIR" or
  "this maps to the FHIR X resource". The link is enough.
- 2-4 sentences. STE rules apply.
*/}

## Key Attributes

{/*
The key attributes the resource stores. Source them from the backend resource spec
(care/emr/resources/<domain>/spec.py) and the frontend form.
Use user-facing names from public/locale/en.json, never code field names.
*/}

| Components | What it captures |
| --- | --- |
| {Attribute} | {What it captures, in one plain sentence} |

{/*
Add a sub-section (###) for any attribute that needs more explanation, for example
Identifier or Tags. Keep each sub-section short.
*/}

### Status

{/*
Only include this section if the resource has statuses or states.
Describe them in user-readable form, from the en.json display labels, never the
codebase literals. Example: "In Progress", not `in_progress`.
*/}

| Status | Description |
| --- | --- |
| {Status label} | {What the status means} |

## Related

{/*
Link related documentation. Follow the link rule in the shared conventions for
extensions and translated docs. Only link files that exist, or that are being
created in the same run. Omit any line with no target.
*/}

- Flow: [{Flow name}](../../flows/{domain}/{flow-slug}.mdx)
- Concept: [{Other resource}](../{domain}/{other-slug}.mdx)
- Reference: [{Resource}](../../references/{domain}/{slug}.mdx)
