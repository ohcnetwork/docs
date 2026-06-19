# SOP image fetcher

Downloads the screenshots embedded in the Care SOP Confluence pages and saves
them into the docs repo, so they can be wired into the flow docs under
`docs/flows/`.

It pulls **two** kinds of image from each source page:

| Kind | Where it comes from | Notes |
| --- | --- | --- |
| Native attachment (`type=file`) | Confluence REST attachments API | Image uploaded directly into the page. Needs authentication. |
| External image (`type=external`) | Parsed from the page's storage body | Loom screenshot URL that 302-redirects to a public CDN. No auth needed. |

`manifest.json` maps each flow (`docs/flows/<domain>/<slug>.mdx`) to its source
Confluence page id(s). The `create-patient` flow has no source SOP and is
omitted.

## Prerequisites

- Python 3.8+ (standard library only — nothing to `pip install`).
- **No credentials required** while the SOP space is publicly viewable (the
  pages and their images load in a private/incognito window). The script runs
  anonymously by default.

### Optional credentials

Only needed if anonymous discovery is ever blocked (e.g. the space is made
private). In that case create an Atlassian API token at
<https://id.atlassian.com/manage-profile/security/api-tokens> and export:

```bash
export ATLASSIAN_EMAIL="you@example.com"        # your Atlassian account email
export ATLASSIAN_API_TOKEN="<token>"
```

The token, if set, is sent **only** to the Atlassian site host.

## Usage

```bash
# from the repo root

# see exactly what it will do, no network, no files written:
python3 scripts/sop-images/fetch_sop_images.py --dry-run

# real run (no login needed):
python3 scripts/sop-images/fetch_sop_images.py

# just one (or a few) flows:
python3 scripts/sop-images/fetch_sop_images.py --only submit-clinical-forms --only prescribe-medication
```

Options:

- `--dry-run` — list the flows/pages and target folders without touching the network.
- `--only SLUG` — process a single flow slug; repeat the flag for several.
- `--manifest PATH` — use an alternate manifest.

## Output

Images are written to:

```
static/img/flows/<domain>/<slug>/NN-<name>.<ext>
```

numbered in page order (`01-…`, `02-…`). A report of every image and its source
URL is written to `scripts/sop-images/downloaded.csv`.

Docusaurus serves `static/` at the site root, so an image saved at
`static/img/flows/clinical/create-encounter/01-foo.png` is referenced in the
`.mdx` as:

```md
![Create encounter form](/img/flows/clinical/create-encounter/01-foo.png)
```

## Credentials & safety

- The Atlassian email/token are sent **only** to the Atlassian site host.
  External (Loom/CDN) requests are made with no auth header.
- Don't commit your token. Use env vars as shown above.
- Consider adding `scripts/sop-images/downloaded.csv` and `static/img/flows/`
  to review before committing — the source screenshots are from a **staging**
  Care instance.

## After running

Once the images are in `static/img/flows/...`, ask Claude (or do it by hand) to
wire the relevant images into each flow `.mdx` at the appropriate steps. The
`downloaded.csv` report shows which images belong to which flow and the order
they appeared in the source SOP.
