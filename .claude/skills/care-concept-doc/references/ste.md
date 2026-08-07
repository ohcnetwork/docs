# Simplified Technical English (ASD-STE100)

All authored prose in the Care docs follows ASD-STE100 Simplified Technical English.
The goal is documentation that reads the same way every time, translates cleanly into
Malayalam, and cannot be misread by a clinician in a hurry.

## Where it applies

| Layer | Applies to |
| --- | --- |
| Concept | Every sentence. Concepts are read by clinicians and operators. |
| Flow | Every sentence. Steps are the strictest case. |
| Reference | All prose, admonitions, and section intros. **Not** the field and enum tables — terse noun-phrase cells are correct there, and STE explicitly prefers tables to prose for structured data. |

## Sentence rules

- Maximum 20 words per sentence in procedures (flow steps).
- Maximum 25 words per sentence in descriptive prose.
- One instruction per sentence. Do not chain actions with "and then".
- One topic per paragraph. Maximum 6 sentences per paragraph.

## Voice and tense

- Use active voice. Write "Care creates a patient record", not "A patient record is
  created by Care".
- Use present tense. Write "Care assigns an identifier", not "Care will assign an
  identifier".
- Use the command form for instructions: "Select **Patients**.", "Enter the phone number."

## Words

- **One term for one thing, everywhere.** Take the user-facing term from
  `care_fe/public/locale/en.json` and never alternate with a synonym: pick "facility"
  and never switch to "hospital"; pick "encounter" and never switch to "visit".
- Use simple, common words: "use" not "utilize", "start" not "initiate", "show" not
  "display" or "render", "end" not "terminate", "about" not "regarding".
- No jargon, idioms, or Latin abbreviations (`i.e.`, `e.g.`, `etc.`, `via`). Write "for
  example" and "such as".
- No vague quantifiers ("some", "several", "various") where a number or a list works.
- Spell out what a pronoun refers to whenever there is any ambiguity. Prefer repeating
  the noun over writing "it".

## Structure

- Use a list for more than two items or steps.
- Use a table for field, attribute, status, and permission descriptions.
- Put the condition before the instruction, never after: "If the patient has no phone
  number, enter the emergency contact number."
- Put a note in a Docusaurus admonition (`:::note`, `:::info`, `:::warning`) rather
  than inline prose.

## Forbidden

- Future tense ("will") and conditional hedging ("should be able to", "may want to").
- Passive constructions: "can be configured" → "you can configure".
- Nominalizations: "perform the registration of" → "register".
- Marketing language: "powerful", "seamless", "simply", "easily".
- Codebase literals in user-facing text: write "In Progress", never `in_progress`;
  write "create an encounter", never `can_create_encounter`.
- Data-model phrasing where a user situation fits: write "The patient is registered in
  Care", not "The patient record exists in Care".

## Why it matters here

Only the patient docs are translated into Malayalam today, but the whole site is built
for both locales. Long sentences, chained clauses, and synonym drift are what make a
docs site expensive to translate and easy to misread. Writing to STE now keeps that
cost down and keeps the English unambiguous in the meantime.
