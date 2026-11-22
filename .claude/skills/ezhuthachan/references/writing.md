# Writing

Stage 5. You turn confirmed facts into pages. Nothing new is learned here: if a sentence needs something that is not in `facts.md`, stop and go get it, or ask.

## House style comes from the docs repository

The docs site owns its templates and conventions, and its reviewers hold pages to them. Read these in the docs checkout before drafting:

```text
$S/src/docs/.claude/skills/care-concept-doc/SKILL.md
$S/src/docs/.claude/skills/care-concept-doc/assets/concept-template.md
$S/src/docs/.claude/skills/care-concept-doc/references/conventions.md
$S/src/docs/.claude/skills/care-flow-doc/SKILL.md
$S/src/docs/.claude/skills/care-flow-doc/assets/flow-template.md
$S/src/docs/.github/references/review-checklist.md
```

The templates set the section names and their order. The conventions cover links, MDX safety, domains and slugs. If these files are not at those paths, search the checkout for them (`grep -rl "flow-template" "$S/src/docs"`), and ask the user if you cannot find them. Do not write from a remembered template.

This skill differs from those files in three places, each on the team's instruction. Say so in the pull request, so a reviewer does not read them as mistakes:

- **Language.** Those files apply Simplified Technical English to every sentence. Here it applies where it helps and not elsewhere; see "Language" below.
- **Versions.** Those files say every version is identical and mirrored. Here a page goes only to the versions whose code has the module; see `publishing.md`.
- **Permissions.** The Permissions table covers the whole path to the action, as `permissions.md` describes, not only the final permission.

Where those files disagree with one another, follow the review checklist, because that is what the reviewer applies, and tell the user about the disagreement. One known case: the concept guide asks for permission slugs in backticks, while the checklist forbids slugs in concept and flow pages.

## Two kinds of page

- **Concept.** "What is this?" One page per thing. It gives the reader a model: what the thing represents, how it behaves over time, how it relates to its neighbours, and who can work with it.
- **Flow.** "How do I do this?" One page per user task, from where the user starts to the result.

Both are for people using Care, not for developers. They contain no code, file paths, class names, endpoints, payloads, database columns or permission slugs. They use the words on the screen.

## Drafting

Write each page to `$S/drafts/<slug>.mdx`. Set its status to `drafted` in `plan.md` when done.

- **Write from `facts.md`.** Open it beside the draft. Every statement about Care restates a fact.
- **One block per line.** Write each paragraph, list item and table row on a single line. The checks below depend on it.
- **Mark every block.** End each paragraph, list item and table row with the facts it rests on: `[[E12]]` or `[[E3,E7]]`. A block that states nothing about Care, such as "This flow describes how to create a workspace.", ends with `[[none]]`. The markers are removed at publishing. They exist so that a reviewer can check every sentence against its source, and so that a block with no support is visible.
- **Bold means a label.** Use bold only for text the user sees on screen, copied exactly from the locale file: Select **Create workspace**. For on-screen text that does not come from the locale file, such as a role name, put its fact right after it: **Facility Admin** `[[E7]]`.
- **Say what the screen says.** "In Progress", never `in_progress`. "Can Create/Update Workspaces", never the slug.
- **Write the reader's situation, not the data model.** "The patient is registered in Care", not "the patient record exists".
- **Leave gaps visible.** When a question is open, leave that part out and note it in `report.md`. Do not write around it.
- **Leave media out.** Screenshots and the video are added at the media stage.

Headings, the Related section and media embeds need no marker.

## Language

The pages will be translated, so the writing has to translate cleanly. That does not mean the same rules everywhere. Simplified Technical English (ASD-STE100) is built for procedures and warnings. Applied to an explanation of what something is, it produces stiff, choppy text that helps nobody.

**Instructions: STE rules.** Steps, prerequisites, warnings, expected outcomes, field descriptions and "what to do" tables.

- One instruction per sentence, in the command form: "Select **Save**."
- At most 20 words in a sentence.
- Present tense, active voice.
- State the condition first: "If the workspace is shared, remove the departments first."
- Use a table for a set of fields, and a list for more than two items.

**Explanation: plain, consistent English.** Overviews and concept sections.

- Natural sentences, as long as the idea needs, usually under 30 words.
- You may explain why, compare, and connect ideas. A reader should finish with a picture in their head.
- Still no idioms, no jokes, no cultural references, and no pronoun whose noun is unclear. Those do not survive translation.

**Everywhere.**

- One term for one thing, in every page. Take the term from the screen, and never alternate with a synonym: if the screen says "facility", never write "hospital".
- Simple words: "use" not "utilize", "start" not "initiate", "show" not "render".
- No "will", "simply", "easily", "seamless", "powerful", "via", "e.g.", "i.e." or "etc.".
- Labels are quoted exactly, even where they break these rules.

Keep the terms in `$S/terms.md` as you settle them: the term, what it means in one line, its label key, and the synonyms not to use. The other locale files in `care_fe/public/locale/` hold the same keys in other languages, so a translator can use the words the translated screen uses.

Do not describe the pages as STE compliant. You follow its writing rules; compliance also needs its controlled dictionary.

## Check your own draft

Run these on each draft before review. Fix what they print, or be able to explain it. `D` is the draft file.

```bash
# 1. Markers that point to no fact
grep -o '\[\[E[0-9, E]*\]\]' "$D" | grep -o 'E[0-9]*' | sort -u | while read -r e; do grep -q "^## $e\$" "$S/facts.md" || echo "no fact for $e"; done

# 2. Blocks with no marker (outside Related)
awk '/^## /{related = ($0 ~ /^## Related/)} !related' "$D" | grep -nvE '\[\[(E[0-9]|none)|^#|^$|^---|^\| ?-|^\| Permission|^:::|^ *<|^!\[|^import |^sidebar_position'

# 3. Bold text that is not a label in the pinned locale file
grep -o '\*\*[^*]*\*\*' "$D" | sed 's/\*\*//g' | sort -u | while IFS= read -r l; do grep -qF "\": \"$l\"" "$S/src/care_fe/public/locale/en.json" || echo "not in en.json: $l"; done

# 4. Codebase literals such as in_progress or can_write_x
grep -nE '(^|[^a-zA-Z_/.-])[a-z]+_[a-z_]+' "$D" | grep -v 'sidebar_position'

# 5. Things that break the MDX build, and leftover template comments
grep -nE '\{#|\{/\*|</?(content|invoke|parameter)|antml:|[{}]' "$D"

# 6. Words to avoid
grep -niE '(^|[^a-z])(will|simply|easily|seamless|powerful|utilize|via|e\.g\.|i\.e\.|etc\.)([^a-z]|$)' "$D"
```

What the output means:

- Check 1 must print nothing.
- Check 2 must print nothing. Each line it prints is a statement with no support.
- Check 3 may print on-screen text that does not come from the locale file. Each such item must be followed by its own fact marker in the draft. Anything else it prints is a wrong label or a wrong use of bold.
- Checks 4 and 6 print candidates. Read each one.
- Check 5 must print nothing except braces inside inline code.

## Review with fresh eyes

A writer reads what they meant, not what they wrote. Every draft gets a second read by a reviewer that did not write it: a subagent with a fresh context where your tool has them, otherwise you, after all drafts are finished and with `facts.md` re-read from the top.

The reviewer has the draft, `facts.md`, the template, the conventions, the review checklist and this file. For each page it does this:

1. **Every marker.** Open the fact. Does the sentence say only what the fact supports? Look for the quiet additions: "always", "any", "all roles", "automatically", a reason the fact does not give.
2. **Every `[[none]]`.** Is there really no claim about Care in that block?
3. **The permission table** against the path in `facts.md`: every gate present, each held in the place the path says, conditions stated.
4. **Labels**: exact, and the right one for that control.
5. **The template**: sections present, named and ordered as the template has them. Nothing left from the template's comments or placeholders.
6. **The docs review checklist**, item by item, read with the three differences above in mind.
7. **Language**, by the tier of each section.
8. **Across pages**: the same term for the same thing, and no page contradicting another.

The reviewer reports findings with the line and the reason. It does not repair a fact by guessing what was meant.

Then fix each finding. A sentence that cannot be supported is removed, or becomes a question. When the page is clean, set it to `reviewed` in `plan.md`.

## Redoing one page

When the user asks for one page to be redone ("redo flow 3: the second step is wrong, the button is in the header"):

1. Treat what they said as a lead. Check it at the pinned commit. If the code agrees, correct the fact. If the code disagrees with them, say what you see and ask; the screen they are looking at may be on another version.
2. Change only that page, and only what the correction needs. If the corrected fact is used by other pages, list them and correct those sentences too.
3. Run the checks and the review again for the changed page.
4. If the page has media that shows the corrected part, re-record it.

## With subagents

Use one writer per page, in parallel. A writer starts with nothing, so give it everything: the output path, the kind of page, the paths of the template and the conventions, this file, the facts for that page with their numbers, the permission path block, the terms, and the titles and slugs of the sibling pages for links. Tell it that it may use only the facts it was given and must report anything it is missing instead of filling it in.
