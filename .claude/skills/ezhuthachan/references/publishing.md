# Publishing

Stage 7, plus two jobs that start from published pages: fact-checking an existing page, and finding pages that went stale.

## The docs checkout

You publish from the session's own checkout of the docs repository, `$S/src/docs`, created in `setup.md`. Use a managed checkout for docs even when the user reads Care from their own clones: you have to write here, and their clone is not yours to write in.

Make a branch for the work:

```bash
git -C "$S/src/docs" switch -c docs/<module>-<last four characters of the session id>
```

Read `$S/src/docs/.claude/skills/care-concept-doc/references/conventions.md` again now. It governs where files go, how links are written, and what breaks the build.

## Which versions

Write a page only into the docs versions whose code you verified it against. `versions.json` in the docs checkout lists the versions the site has.

- The usual case is one version: the one the session is pinned to.
- If the module also exists on another version's branch, the page is not automatically true there. Either pin that branch too and verify each fact against it, or leave that version out and say so. Never copy a page into a version you did not verify.
- The docs conventions say that all versions are kept identical. That rule cannot hold for a module that exists in only one version. Follow this file, and say in the pull request that you did.

## Where files go

Choose the domain by the lookup in `existing-docs.md`: the folder of the existing concept this module most resembles. Ask only when two sections fit equally well. The conventions file lists the domains too, and its versioning rule is stale.

```text
versioned_docs/version-<v>/concepts/<domain>/<slug>.mdx
versioned_docs/version-<v>/flows/<domain>/<module>/<slug>.mdx
static/media/<domain>/<module>/<file>
```

A new flow folder needs a `_category_.json`. Copy the shape of a sibling folder's file: a label, a position, and a key of the form `<domain>-<module>-flows`.

If a page already exists at the target path, you are replacing it. Read the old page first. Anything it says that your facts do not cover is a lead to check, and a possible question, before it disappears.

## Copy the pages

Remove the evidence markers as you copy. They are working notes, not content.

```bash
sed -E 's/ ?\[\[(none|E[0-9]+(, ?E[0-9]+)*)\]\]//g' "$S/drafts/<slug>.mdx" > "$S/src/docs/versioned_docs/version-<v>/flows/<domain>/<module>/<slug>.mdx"
mkdir -p "$S/src/docs/static/media/<domain>/<module>"
cp "$S/media/out/<slug>".mp4 "$S/media/out/<slug>".poster.png "$S/media/out/<slug>".vtt "$S/media/out/<slug>"-*.png "$S/src/docs/static/media/<domain>/<module>/"
grep -rn '\[\[' "$S/src/docs/versioned_docs/version-<v>/flows/<domain>/<module>/"   # must print nothing
```

The `.api.json` files stay in the session. They are evidence, not content.

## The flow sidebar

Concept pages appear in the site on their own. Flow pages do not: the flow sidebar is a hand-kept list, and a flow that is missing from it builds without error and is invisible.

The file is `versioned_sidebars/version-<v>-sidebars.json`. Inside the "Flows" category there is one category per domain (key `<domain>-flows`), and inside that one per module (key `<domain>-<module>-flows`) whose `items` are document ids:

```json
{
  "type": "category",
  "label": "Workspace",
  "key": "platform-workspace-flows",
  "items": ["flows/platform/workspace/create-a-workspace", "flows/platform/workspace/share-a-workspace"]
}
```

Add the module category if it is new, and list the flows in the order of `plan.md`. Edit the file by hand, changing only the lines you need. Do not load and re-save it with a JSON tool; that reformats the whole file and buries your change.

## Validate

```bash
cd "$S/src/docs"
grep -rlE '</?(content|invoke|parameter)\b|antml:|\{#' versioned_docs --include='*.mdx'    # must print nothing
npm ci
npm run build
```

The build is the judge. It builds every language the site has and fails on broken links, broken anchors and MDX errors. Require success for every language. Fix what it reports and build again. Never open a pull request on a failing build, and never validate with a single language.

`npm ci` installs about 1 GB into the docs checkout; tell the user before the first run. The build itself takes under a minute.

## Record what each page was built from

For each published page, write `$EZ/provenance/<version>/<domain>/<module>/<slug>.md`: the session, the pinned commits, and the facts the page used, each with its claim, repository, commit, path, lines and quote. Copy them from `facts.md`. This is what makes the drift check possible later.

That folder is on this machine only. Ask the user once whether the docs repository should carry this record too, and where; that is a decision for whoever owns the docs site. Remember the answer.

## Open the pull request

This is a gate. Show the user the list of files and the summary below, and open the pull request when they say so.

```bash
cd "$S/src/docs"
git add -A && git commit -m "Add <Module> docs for <version>"
git push origin HEAD
gh pr create --draft --title "[docs] <Module> for <version>" --body-file "$S/pr-body.md"
```

If the push is refused, the user may contribute through a fork. Ask how they normally open pull requests to the docs repository and follow that.

The pull request body says:

- Which pages were added and which replaced an existing page, for which versions.
- The pinned commits of `care` and `care_fe` the pages were verified against.
- How they were verified: from code, by recording against which environment, and which permission paths were confirmed by execution.
- Where the pages differ from the house style on purpose: the language tiers, the version rule, the full permission path, and any media markup that is new.
- If the videos are narrated: that the voice is AI-generated, with which service and model, and whose voice it is (see the end of `narration.md`).
- What was left out because it could not be verified, and the questions still open.
- Suspected product bugs found on the way.

Then set the pages to `published` in `plan.md`, note the pull request in `session.md`, and go to wrap-up.

When a reviewer asks for changes on the pull request, treat each request like a redo in `writing.md`: check it against the pinned code, change only what it needs, and re-verify any fact you touch. A request that would make the page say something the code does not support is not followed; explain why in the reply.

## Verify an existing page

When the user asks you to check a page that already exists, written by a person or by an earlier session:

1. Set up a session and pin the code as usual, for the version the page belongs to.
2. Go through the page and list every statement about Care: each label, step, status, permission, role, shortcut and condition.
3. Check each one at the pinned commit, as in research. Record what you find as facts.
4. Report three lists: confirmed, wrong (with what the code says instead), and could not verify (with what you looked for).
5. Change the page only if the user asks. Then it is a redo.

## Drift

Code changes after a page is published. To find the pages that may now be wrong:

1. Start a session pinned to the current commit of the version's branch.
2. For each provenance file of that version, compare each fact's file between the old commit and the new one:

   ```bash
   git -C "$EZ/repos/care_fe.git" diff --quiet <old commit> <new commit> -- <path> || echo "changed: <path>"
   ```

3. For each changed file, open the cited lines at the new commit and compare them with the quote. The file may have changed somewhere else and left the fact intact.
4. Report per page: still supported, or affected, with the facts that changed and what they say now. List affected screenshots too: a changed label or layout means a re-shoot.
5. With the user's agreement, redo only the affected pages.

A page with no provenance file cannot be checked this way. Offer to verify it as an existing page instead.
