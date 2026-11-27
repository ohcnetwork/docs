"""Check that every code fact's Quote really appears at its cited lines.

Usage: python3 -I verify_facts.py "$S" "$S/facts.md" [more fact files ...]
Reads the session checkouts in $S/src/care and $S/src/care_fe. Sources look like
`care_fe@e1e1f17 public/locale/en.json:684` (several, separated by ";"); quotes may join
fragments with "...". Runtime and human facts are skipped. "## Path:" blocks are ignored.
Prints one line per failing fact and a summary. Exit 0 always.
"""
import re
import sys
from pathlib import Path

S = Path(sys.argv[1])
REPOS = {"care": S / "src" / "care", "care_fe": S / "src" / "care_fe"}

block_re = re.compile(r"^## (.+?)\s*$", re.M)  # any level-2 heading ends a fact body
fact_id_re = re.compile(r"[A-Z]+\d+")
src_re = re.compile(r"(care_fe|care)@([0-9a-f]+)\s+([^\s:;,]+):(\d+)(?:-(\d+))?")


def norm(s):
    return re.sub(r"\s+", " ", s.replace("’", "'")).strip()


def parse(path):
    text = Path(path).read_text()
    parts = block_re.split(text)
    out = []
    for i in range(1, len(parts), 2):
        fid, body = parts[i], parts[i + 1]
        if not fact_id_re.fullmatch(fid):
            continue  # e.g. "## Path: ..." blocks are not facts
        fields = {}
        cur = None
        for line in body.splitlines():
            m = re.match(r"^(Claim|Kind|Source|Quote):\s?(.*)$", line)
            if m:
                cur = m.group(1)
                fields[cur] = m.group(2)
            elif cur == "Quote":
                fields["Quote"] += "\n" + line
            elif cur and line.strip():
                fields[cur] += " " + line.strip()
        q = fields.get("Quote", "")
        q = "\n".join(l for l in q.splitlines() if not l.strip().startswith("```"))
        fields["Quote"] = q.strip()
        out.append((fid, fields))
    return out


fails = 0
total = 0
for fpath in sys.argv[2:]:
    for fid, f in parse(fpath):
        total += 1
        kind = f.get("Kind", "").strip()
        if kind != "code":
            continue
        srcs = src_re.findall(f.get("Source", ""))
        if not srcs:
            print(f"{fid}: no parsable source: {f.get('Source','')[:120]}")
            fails += 1
            continue
        window = ""
        bad = None
        for repo, sha, p, a, b in srcs:
            fp = REPOS[repo] / p
            if not fp.exists():
                bad = f"missing file {repo}/{p}"
                break
            lines = fp.read_text(errors="replace").splitlines()
            a = int(a)
            b = int(b) if b else a
            if a < 1 or b > len(lines):
                bad = f"line range {a}-{b} out of bounds in {p} ({len(lines)} lines)"
                break
            window += "\n".join(lines[a - 1 : b]) + "\n"
        if bad:
            print(f"{fid}: {bad}")
            fails += 1
            continue
        nw = norm(window)
        pieces = [norm(x) for x in re.split(r"\.\.\.|…", f["Quote"]) if norm(x)]
        pos = 0
        ok = True
        for pc in pieces:
            j = nw.find(pc, pos)
            if j < 0:
                ok = False
                break
            pos = j + len(pc)
        if not pieces or not ok:
            print(f"{fid}: quote not found at {f.get('Source','')[:100]}")
            fails += 1
print(f"checked {total} facts, {fails} failing")
