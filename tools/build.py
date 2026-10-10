#!/usr/bin/env python3
"""
build.py - build the StudyNotes database and JS fallback from markdown sources.

    python3 tools/build.py

Input   content/<subject>/<file>.md   with front matter:

        ---
        id: oop-u1
        title: OOP Unit 1 - C++ Fundamentals
        subject: oop
        unit: 1
        date: 2026-02-10
        featured: true
        tags: c++, classes, encapsulation
        description: One line summary shown on the card.
        ---

Supported markdown subset
-------------------------
  # Section            -> h2   (added to the on-page table of contents)
  ## Sub-section       -> h3
  ### Detail           -> h4
  - bullet              and   1. numbered   (2-space indent nests)
  > [!NOTE] ...         -> callout; also [!TIP] [!WARNING] [!EXAMPLE]
                           [!FORMULA] [!DEFINITION] [!INFO]
  | a | b |             -> table (row 2 must be the --- separator)
  ```lang  ... ```      -> code block with a copy button
  ==highlight==  **bold**  *italic*  `code`  [link](url)
  raw HTML lines are passed through untouched

Output  data/notes.db               real SQLite database (read in the browser by sql.js)
        assets/js/notes-data.js     window.NOTES_DATA fallback for file:// usage
"""

from __future__ import annotations

import json
import re
import sqlite3
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
DATA = ROOT / "data"
ASSETS_JS = ROOT / "assets" / "js"

SUBJECTS = [
    dict(id="ds", name="Data Structures", short="DS", icon="&#127794;",
         color="#5b6cff",
         blurb="Arrays, searching, sorting, stacks, queues and complexity analysis.",
         sort=1),
    dict(id="oop", name="Object Oriented Programming", short="OOP", icon="&#129513;",
         color="#ff7a59",
         blurb="C++ fundamentals, classes, inheritance, polymorphism and memory.",
         sort=2),
    dict(id="coa", name="Computer Organization & Architecture", short="COA",
         icon="&#129504;", color="#17b3a3",
         blurb="Number systems, computer arithmetic, CPU design, CISC vs RISC.",
         sort=3),
    dict(id="it", name="IT & Python Programming", short="IT", icon="&#128013;",
         color="#f0a92c",
         blurb="Python basics, data types, operators, control flow and strings.",
         sort=4),
    dict(id="ob", name="Organizational Behaviour", short="OB", icon="&#128101;",
         color="#a963d6",
         blurb="Individual behaviour, personality, emotions, perception and leadership.",
         sort=5),
    dict(id="math", name="Mathematics - Probability", short="MATH", icon="&#128208;",
         color="#2bb6dc",
         blurb="Probability, Bayes' theorem, random variables, expectation and variance.",
         sort=6),
]

CALLOUTS = {
    "NOTE": ("note", "Note"),
    "INFO": ("info", "Info"),
    "TIP": ("tip", "Tip"),
    "WARNING": ("warn", "Warning"),
    "WARN": ("warn", "Warning"),
    "EXAMPLE": ("example", "Example"),
    "FORMULA": ("formula", "Formula"),
    "DEFINITION": ("def", "Definition"),
    "DEF": ("def", "Definition"),
}


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return text or "section"


def parse_front_matter(text: str):
    meta = {}
    if text.startswith("---"):
        end = text.find("\n---", 3)
        if end != -1:
            block = text[3:end].strip("\n")
            body = text[end + 4:]
            for line in block.splitlines():
                if not line.strip() or ":" not in line:
                    continue
                key, value = line.split(":", 1)
                key, value = key.strip(), value.strip()
                if value.startswith("[") and value.endswith("]"):
                    value = [x.strip() for x in value[1:-1].split(",") if x.strip()]
                elif len(value) > 1 and value[0] == value[-1] and value[0] in "\"'":
                    value = value[1:-1]
                meta[key] = value
            return meta, body
    return meta, text


class Markdown:
    """Tiny markdown subset renderer (see module docstring)."""

    def __init__(self):
        self._used = {}

    # ------------------------------------------------------------------ inline
    def inline(self, s: str) -> str:
        codes = []

        def stash(m):
            body = (m.group(1).replace("&", "&amp;")
                    .replace("<", "&lt;").replace(">", "&gt;"))
            codes.append("<code>" + body + "</code>")
            return "\x00%d\x00" % (len(codes) - 1)

        s = re.sub(r"`([^`]+)`", stash, s)
        s = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", s)
        s = re.sub(r"(?<!\*)\*([^*\n]+?)\*(?!\*)", r"<em>\1</em>", s)
        s = re.sub(r"==(.+?)==", r'<mark class="kw">\1</mark>', s)
        s = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", r'<a href="\2">\1</a>', s)
        s = re.sub(
            r"&(?!(?:[a-zA-Z][a-zA-Z0-9]{1,10}|#\d{1,6}|#x[0-9a-fA-F]{1,6});)",
            "&amp;", s)
        for i, c in enumerate(codes):
            s = s.replace("\x00%d\x00" % i, c)
        return s

    def heading_id(self, text: str) -> str:
        base = slugify(text)
        n = self._used.get(base, 0)
        self._used[base] = n + 1
        return base if n == 0 else "%s-%d" % (base, n)

    # ------------------------------------------------------------------ blocks
    def code(self, src: str, lang: str) -> str:
        label = {"cpp": "C++", "c++": "C++", "python": "Python", "py": "Python",
                 "sql": "SQL", "text": "Output", "txt": "Output",
                 "bash": "Shell", "sh": "Shell", "java": "Java"}.get(lang, "Code")
        esc = (src.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))
        return (
            '<figure class="code" data-lang="{lang}">'
            '<figcaption><span class="lang">{label}</span>'
            '<button class="code-copy" type="button" data-copy>Copy</button>'
            '</figcaption><pre><code class="language-{lang}">{code}</code></pre>'
            '</figure>'
        ).format(lang=lang or "text", label=label, code=esc)

    def table(self, rows) -> str:
        def cells(r):
            return [c.strip() for c in r.strip().strip("|").split("|")]

        head = cells(rows[0])
        body = [cells(r) for r in rows[2:]]
        th = "".join("<th>%s</th>" % self.inline(c) for c in head)
        tb = "".join(
            "<tr>%s</tr>" % "".join("<td>%s</td>" % self.inline(c) for c in r)
            for r in body)
        return ('<div class="table-wrap"><table><thead><tr>%s</tr></thead>'
                '<tbody>%s</tbody></table></div>') % (th, tb)

    def lst(self, items) -> str:
        out, stack = [], []
        for indent, ordered, text in items:
            tag = "ol" if ordered else "ul"
            while stack and indent < stack[-1][1]:
                out.append("</%s>" % stack.pop()[0])
            if not stack:
                out.append("<%s>" % tag)
                stack.append((tag, indent))
            elif indent > stack[-1][1]:
                out.append("<%s>" % tag)
                stack.append((tag, indent))
            elif stack[-1][0] != tag:
                out.append("</%s>" % stack.pop()[0])
                out.append("<%s>" % tag)
                stack.append((tag, indent))
            out.append("<li>%s</li>" % self.inline(text))
        while stack:
            out.append("</%s>" % stack.pop()[0])
        return "\n".join(out)

    def quote(self, buf) -> str:
        first = buf[0].strip()
        m = re.match(r"^\[!(\w+)\]\s*(.*)$", first)
        if not m:
            return "<blockquote>%s</blockquote>" % self.render("\n".join(buf))
        kind, title = CALLOUTS.get(m.group(1).upper(), ("note", m.group(1).title()))
        rest = ([m.group(2).strip()] if m.group(2).strip() else []) + buf[1:]
        body = self.render("\n".join(rest)) if rest else ""
        return ('<aside class="callout callout-%s">'
                '<p class="callout-title">%s</p>'
                '<div class="callout-body">%s</div></aside>') % (kind, title, body)

    @staticmethod
    def _starts_block(line: str) -> bool:
        s = line.strip()
        if not s:
            return True
        if s.startswith("```") or s.startswith(">") or s.startswith("|"):
            return True
        if s == "---":
            return True
        if re.match(r"^#{1,4}\s", s):
            return True
        if re.match(r"^[-*]\s+", s) or re.match(r"^\d+\.\s+", s):
            return True
        return False

    def render(self, md: str) -> str:
        lines = md.replace("\r\n", "\n").split("\n")
        out, i, n = [], 0, len(lines)
        while i < n:
            line = lines[i]

            if line.startswith("```"):
                lang = line[3:].strip().lower()
                i += 1
                buf = []
                while i < n and not lines[i].startswith("```"):
                    buf.append(lines[i])
                    i += 1
                i += 1
                out.append(self.code("\n".join(buf), lang))
                continue

            if not line.strip():
                i += 1
                continue

            if line.strip() == "---":
                out.append('<hr class="sep"/>')
                i += 1
                continue

            m = re.match(r"^(#{1,4})\s+(.*)$", line)
            if m:
                level = min(len(m.group(1)) + 1, 6)
                text = m.group(2).strip()
                hid = self.heading_id(text)
                out.append(
                    '<h%d id="%s">%s<a class="anchor" href="#%s" '
                    'aria-label="Link to this section">#</a></h%d>'
                    % (level, hid, self.inline(text), hid, level))
                i += 1
                continue

            if line.lstrip().startswith(">"):
                buf = []
                while i < n and lines[i].lstrip().startswith(">"):
                    raw = lines[i].lstrip()[1:]
                    buf.append(raw[1:] if raw.startswith(" ") else raw)
                    i += 1
                out.append(self.quote(buf))
                continue

            if (line.lstrip().startswith("|") and i + 1 < n
                    and re.match(r"^\s*\|[\s:|-]+\|\s*$", lines[i + 1])):
                rows = []
                while i < n and lines[i].lstrip().startswith("|"):
                    rows.append(lines[i].strip())
                    i += 1
                out.append(self.table(rows))
                continue

            if (re.match(r"^\s*[-*]\s+", line)
                    or re.match(r"^\s*\d+\.\s+", line)):
                items = []
                while i < n and (re.match(r"^\s*[-*]\s+", lines[i])
                                 or re.match(r"^\s*\d+\.\s+", lines[i])):
                    raw = lines[i]
                    indent = len(raw) - len(raw.lstrip())
                    ordered = bool(re.match(r"^\s*\d+\.\s+", raw))
                    text = re.sub(r"^\s*(?:[-*]|\d+\.)\s+", "", raw)
                    items.append((indent, ordered, text))
                    i += 1
                out.append(self.lst(items))
                continue

            buf = []
            while i < n and not self._starts_block(lines[i]):
                buf.append(lines[i].strip())
                i += 1
            if not buf:
                buf = [lines[i].strip()]
                i += 1
            para = " ".join(buf)
            if para.lstrip().startswith("<"):
                out.append(para)
            else:
                out.append("<p>%s</p>" % self.inline(para))

        return "\n".join(out)


def load_notes():
    notes = []
    for path in sorted(CONTENT.rglob("*.md")):
        meta, body = parse_front_matter(path.read_text(encoding="utf-8"))
        if "id" not in meta:
            print("  ! skipping %s (no front matter)" % path.relative_to(ROOT))
            continue
        html = Markdown().render(body)
        plain = re.sub(r"<[^>]+>", " ", html)
        words = len(plain.split())
        tags = meta.get("tags", "")
        if isinstance(tags, list):
            tags = ", ".join(tags)
        notes.append(dict(
            id=meta["id"],
            title=meta["title"],
            subject=meta["subject"],
            unit=int(str(meta.get("unit", 0) or 0)),
            date=str(meta.get("date", "")),
            featured=1 if str(meta.get("featured", "")).lower() in
            ("1", "true", "yes") else 0,
            tags=tags,
            description=meta.get("description", ""),
            html=html,
            words=words,
            reading_min=max(1, round(words / 200)),
        ))
    notes.sort(key=lambda x: (x["subject"], x["unit"], x["id"]))
    return notes


SCHEMA = """
DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS subjects;

CREATE TABLE subjects (
    id       TEXT PRIMARY KEY,
    name     TEXT NOT NULL,
    short    TEXT NOT NULL,
    icon     TEXT,
    color    TEXT,
    blurb    TEXT,
    sort     INTEGER
);

CREATE TABLE notes (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    subject     TEXT NOT NULL REFERENCES subjects(id),
    unit        INTEGER DEFAULT 0,
    description TEXT,
    body_html   TEXT NOT NULL,
    tags        TEXT,
    date        TEXT,
    featured    INTEGER DEFAULT 0,
    views       INTEGER DEFAULT 0,
    words       INTEGER,
    reading_min INTEGER
);

CREATE INDEX idx_notes_subject ON notes(subject);
CREATE INDEX idx_notes_date    ON notes(date);
CREATE INDEX idx_notes_views   ON notes(views);
"""

# seeded popularity so the "Popular notes" rail is not empty on first visit
SEED_VIEWS = {
    "oop-u1": 412, "oop-u2": 356, "ds-u1": 388, "ds-u2": 341,
    "coa-u1": 298, "coa-u2": 264, "it-u1": 322, "it-u2": 305,
    "ob-u1": 231, "ob-u2": 208, "math-u1": 366, "math-formulas": 274,
}


def build_db(notes, dest: Path):
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists():
        dest.unlink()
    con = sqlite3.connect(dest)
    con.executescript(SCHEMA)
    con.executemany(
        "INSERT INTO subjects (id,name,short,icon,color,blurb,sort) "
        "VALUES (:id,:name,:short,:icon,:color,:blurb,:sort)", SUBJECTS)
    con.executemany(
        "INSERT INTO notes (id,title,subject,unit,description,body_html,tags,"
        "date,featured,views,words,reading_min) "
        "VALUES (:id,:title,:subject,:unit,:description,:html,:tags,:date,"
        ":featured,:views,:words,:reading_min)",
        [dict(n, views=SEED_VIEWS.get(n["id"], 0)) for n in notes])
    con.commit()
    con.close()


def build_js(notes, dest: Path):
    payload = {
        "generated": True,
        "subjects": SUBJECTS,
        "notes": [
            {k: n[k] for k in ("id", "title", "subject", "unit", "description",
                               "tags", "date", "featured", "words",
                               "reading_min")} | {"views": SEED_VIEWS.get(n["id"], 0),
                                                  "body_html": n["html"]}
            for n in notes
        ],
    }
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text("window.NOTES_DATA = "
                    + json.dumps(payload, ensure_ascii=False)
                    + ";\n", encoding="utf-8")


def main():
    notes = load_notes()
    total_words = sum(n["words"] for n in notes)
    build_db(notes, DATA / "notes.db")
    build_js(notes, ASSETS_JS / "notes-data.js")

    print("%-16s %-52s %6s %6s" % ("id", "title", "words", "min"))
    print("-" * 84)
    for n in notes:
        print("%-16s %-52s %6d %6d" % (n["id"], n["title"][:52],
                                       n["words"], n["reading_min"]))
    print("-" * 84)
    print("%d notes, %s subjects, %d words"
          % (len(notes), len(SUBJECTS), total_words))
    print("wrote %s (%.1f KB)"
          % (DATA / "notes.db", (DATA / "notes.db").stat().st_size / 1024))
    print("wrote %s (%.1f KB)"
          % (ASSETS_JS / "notes-data.js",
             (ASSETS_JS / "notes-data.js").stat().st_size / 1024))


if __name__ == "__main__":
    main()
