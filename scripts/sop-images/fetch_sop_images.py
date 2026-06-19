#!/usr/bin/env python3
"""
Download images from the Care SOP Confluence pages into the docs repo.

For every flow listed in manifest.json this script pulls, from each source
Confluence page:

  1. Native attachments  -> via the Confluence REST attachments API
                            (these are the `type=file` images embedded directly
                             in the page; they need authentication).
  2. External images     -> parsed out of the page's storage-format body
                            (these are the `type=external` Loom screenshots;
                             they 302-redirect to a public CDN, no auth needed).

Images are written to:
    static/img/flows/<domain>/<slug>/NN-<name>.<ext>

and a report is written to:
    scripts/sop-images/downloaded.csv

Only the standard library is used (urllib) so there is nothing to install.

------------------------------------------------------------------------------
USAGE
------------------------------------------------------------------------------
  1. Create an Atlassian API token: https://id.atlassian.com/manage-profile/security/api-tokens
  2. Export credentials (the email is your Atlassian account email):

        export ATLASSIAN_EMAIL="you@example.com"
        export ATLASSIAN_API_TOKEN="<token>"

  3. From the repo root (or anywhere), run:

        python3 scripts/sop-images/fetch_sop_images.py

     Options:
        --dry-run      List what would be downloaded without writing files.
        --only SLUG    Process a single flow slug (repeatable).
        --manifest P   Use an alternate manifest path.

The Atlassian credentials are sent ONLY to the configured Atlassian site host.
External (Loom/CDN) requests are made without any auth header.
"""

import argparse
import base64
import csv
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))

EXT_BY_MIME = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
}


def log(msg):
    print(msg, flush=True)


def auth_header(email, token):
    raw = f"{email}:{token}".encode("utf-8")
    return "Basic " + base64.b64encode(raw).decode("ascii")


def http_get(url, headers=None, timeout=60):
    req = urllib.request.Request(url, headers=headers or {})
    return urllib.request.urlopen(req, timeout=timeout)


def get_json(url, email, token):
    headers = {"Accept": "application/json"}
    if email and token:
        headers["Authorization"] = auth_header(email, token)
    with http_get(url, headers) as resp:
        return json.loads(resp.read().decode("utf-8"))


def list_attachments(site, page_id, email, token):
    """Return [{title, download_url, mime}] for native page attachments."""
    out = []
    start = 0
    while True:
        url = (
            f"{site}/wiki/rest/api/content/{page_id}/child/attachment"
            f"?limit=50&start={start}&expand=extensions"
        )
        try:
            data = get_json(url, email, token)
        except urllib.error.HTTPError as e:
            log(f"    ! attachments API error for page {page_id}: {e.code} {e.reason}")
            break
        except (urllib.error.URLError, OSError) as e:
            log(f"    ! network error reaching attachments API for page {page_id}: {e}")
            break
        results = data.get("results", [])
        base = data.get("_links", {}).get("base", f"{site}/wiki")
        for r in results:
            dl = r.get("_links", {}).get("download")
            if not dl:
                continue
            full = dl if dl.startswith("http") else base + dl
            out.append({
                "title": r.get("title", "attachment"),
                "download_url": full,
                "mime": r.get("extensions", {}).get("mediaType", ""),
            })
        if len(results) < 50:
            break
        start += 50
    return out


def get_storage_body(site, page_id, email, token):
    url = f"{site}/wiki/rest/api/content/{page_id}?expand=body.storage"
    try:
        data = get_json(url, email, token)
    except urllib.error.HTTPError as e:
        log(f"    ! body API error for page {page_id}: {e.code} {e.reason}")
        return ""
    except (urllib.error.URLError, OSError) as e:
        log(f"    ! network error reaching body API for page {page_id}: {e}")
        return ""
    return data.get("body", {}).get("storage", {}).get("value", "") or ""


def external_image_urls(storage_xml):
    """Extract external image URLs from storage-format body.

    External images appear as <ri:url ri:value="..."/>. Some are Atlassian
    media wrappers that embed the real target in a `url=` query param; if so,
    we decode and use the inner URL (typically a Loom screenshot).
    """
    urls = []
    for m in re.finditer(r'ri:url\s+ri:value="([^"]+)"', storage_xml):
        raw = m.group(1).replace("&amp;", "&")
        parsed = urllib.parse.urlparse(raw)
        inner = urllib.parse.parse_qs(parsed.query).get("url", [None])[0]
        urls.append(inner if inner else raw)
    # de-dupe, preserve order
    seen, deduped = set(), []
    for u in urls:
        if u and u not in seen:
            seen.add(u)
            deduped.append(u)
    return deduped


def ext_from_response(resp, fallback="png"):
    ctype = (resp.headers.get("Content-Type") or "").split(";")[0].strip().lower()
    return EXT_BY_MIME.get(ctype, fallback)


def ext_from_name_or_mime(name, mime):
    base, dot, ext = name.rpartition(".")
    if dot and 1 <= len(ext) <= 5:
        return ext.lower()
    return EXT_BY_MIME.get((mime or "").lower(), "png")


def safe_name(title):
    stem = title.rsplit(".", 1)[0]
    stem = re.sub(r"[^A-Za-z0-9._-]+", "-", stem).strip("-").lower()
    return stem or "image"


def download(url, dest_no_ext, email, token, site_host, dry_run):
    """Download url to dest_no_ext + detected extension. Returns saved path or None."""
    is_atlassian = urllib.parse.urlparse(url).netloc.endswith(site_host)
    headers = {"User-Agent": "care-docs-sop-image-fetch/1.0"}
    if is_atlassian and email and token:
        headers["Authorization"] = auth_header(email, token)
    if dry_run:
        log(f"    [dry-run] {url}")
        return dest_no_ext + ".(pending)"
    try:
        with http_get(url, headers) as resp:
            data = resp.read()
            ext = ext_from_response(resp)
            path = dest_no_ext + "." + ext
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, "wb") as f:
                f.write(data)
            log(f"    saved {os.path.relpath(path, REPO_ROOT)} ({len(data)} bytes)")
            return path
    except urllib.error.HTTPError as e:
        log(f"    ! download failed ({e.code} {e.reason}): {url}")
    except Exception as e:  # noqa: BLE001
        log(f"    ! download error ({e}): {url}")
    return None


def main():
    ap = argparse.ArgumentParser(description="Fetch Care SOP images from Confluence.")
    ap.add_argument("--manifest", default=os.path.join(HERE, "manifest.json"))
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--only", action="append", default=[], help="Process only this slug (repeatable).")
    args = ap.parse_args()

    email = os.environ.get("ATLASSIAN_EMAIL")
    token = os.environ.get("ATLASSIAN_API_TOKEN")
    if not args.dry_run and not (email and token):
        log("NOTE: no ATLASSIAN_EMAIL / ATLASSIAN_API_TOKEN set — using anonymous access.")
        log("      This works while the SOP space is publicly viewable. If discovery")
        log("      returns 401/403, set the env vars (see README) and re-run.\n")

    with open(args.manifest, encoding="utf-8") as f:
        manifest = json.load(f)

    site = os.environ.get("CONFLUENCE_BASE", manifest.get("site")).rstrip("/")
    site_host = urllib.parse.urlparse(site).netloc

    img_root = manifest.get("img_root", "flows")
    flows = manifest["flows"]
    if args.only:
        flows = [fl for fl in flows if fl["slug"] in set(args.only)]

    report_rows = []
    total = 0
    for fl in flows:
        domain, slug, pages = fl["domain"], fl["slug"], fl["pages"]
        log(f"\n== {domain}/{slug} ({fl.get('title','')}) ==")
        out_dir = os.path.join(REPO_ROOT, "static", "img", img_root, domain, slug)
        idx = 0
        if args.dry_run:
            rel = os.path.relpath(out_dir, REPO_ROOT)
            log(f"  [dry-run] would fetch attachments + external images from page(s) "
                f"{', '.join(pages)} into {rel}/")
            for page_id in pages:
                report_rows.append([domain, slug, page_id, "(dry-run)", "", rel])
            continue
        for page_id in pages:
            log(f"  page {page_id}")
            # 1) native attachments
            for att in list_attachments(site, page_id, email, token):
                if att["mime"] and not att["mime"].lower().startswith("image/"):
                    continue
                idx += 1
                name = safe_name(att["title"])
                dest = os.path.join(out_dir, f"{idx:02d}-{name}")
                saved = download(att["download_url"], dest, email, token, site_host, args.dry_run)
                report_rows.append([domain, slug, page_id, "attachment", att["download_url"],
                                    os.path.relpath(saved, REPO_ROOT) if saved else ""])
                if saved:
                    total += 1
            # 2) external images from body
            body = get_storage_body(site, page_id, email, token) if not args.dry_run else ""
            if args.dry_run:
                log("    [dry-run] (body fetch skipped; run without --dry-run to parse Loom URLs)")
            for url in external_image_urls(body):
                idx += 1
                dest = os.path.join(out_dir, f"{idx:02d}-loom")
                saved = download(url, dest, email, token, site_host, args.dry_run)
                report_rows.append([domain, slug, page_id, "external", url,
                                    os.path.relpath(saved, REPO_ROOT) if saved else ""])
                if saved:
                    total += 1

    report_path = os.path.join(HERE, "downloaded.csv")
    with open(report_path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["domain", "slug", "page_id", "kind", "source_url", "local_path"])
        w.writerows(report_rows)

    log(f"\nDone. {total} image(s) saved. Report: {os.path.relpath(report_path, REPO_ROOT)}")
    if not args.dry_run:
        log("Next: review static/img/flows/... then wire images into the .mdx flows.")


if __name__ == "__main__":
    main()
