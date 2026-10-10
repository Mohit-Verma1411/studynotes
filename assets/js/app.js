/* ==========================================================================
 * StudyNotes — app.js
 * Renders the sidebar, index page and note page; powers search, theme,
 * bookmarks, recently viewed, progress, downloads and code highlighting.
 * ========================================================================== */
(function () {
  "use strict";

  const $ = function (s, c) { return (c || document).querySelector(s); };
  const $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  const esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  };

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function fmtDate(iso) {
    if (!iso) return "";
    const p = String(iso).split("-");
    if (p.length < 3) return iso;
    const y = parseInt(p[0], 10), m = parseInt(p[1], 10) - 1, d = parseInt(p[2], 10);
    return d + " " + MONTHS[m] + " " + y;
  }

  function unitLabel(note) {
    if (note.unit <= 0) return "Formula sheet";
    return "Unit " + note.unit;
  }

  function subjVars(color) {
    return "--subj:" + color + ";--subj-soft:" + color + "1a;--subj-bord:" + color + "40;" +
           "--sc:" + color + ";--sc-soft:" + color + "14;--sc-bord:" + color + "40;";
  }

  let toastTimer = null;
  function toast(msg) {
    const el = $("#toast");
    if (!el) return;
    el.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>' + esc(msg);
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 2200);
  }

  /* ------------------------------------------------------------------ theme */
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem("sn:theme", t); } catch (e) {}
    const btn = $("#themeToggle");
    if (btn) btn.textContent = t === "dark" ? "☀️" : "🌙";
  }
  function currentTheme() {
    try {
      const saved = localStorage.getItem("sn:theme");
      if (saved === "dark" || saved === "light") return saved;
    } catch (e) {}
    return (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
  }

  /* ------------------------------------------------------------------ sidebar */
  async function renderSidebar() {
    const nav = $("#sideNav");
    if (!nav) return;
    const isIndex = !!$("#indexRoot");
    const params = new URLSearchParams(location.search);
    const subjectParam = params.get("subject");
    const subjects = await Store.subjects();
    const counts = {};
    const all = await Store.notes({ limit: 500 });
    all.forEach(function (n) { counts[n.subject] = (counts[n.subject] || 0) + 1; });

    let html = '<div class="side-label">Subjects</div>';
    html += '<a class="side-link' + (isIndex && !subjectParam ? " active" : "") +
            '" href="index.html" style="--mark:var(--accent)"><span class="side-dot" style="background:var(--accent)"></span>All notes' +
            '<span class="side-count">' + all.length + "</span></a>";
    subjects.forEach(function (s) {
      html += '<a class="side-link' + (isIndex && subjectParam === s.id ? " active" : "") +
              '" href="index.html?subject=' + encodeURIComponent(s.id) + '"><span class="side-dot" style="background:' + s.color + '"></span>' +
              esc(s.name) + '<span class="side-count">' + (counts[s.id] || 0) + "</span></a>";
    });
    nav.innerHTML = html;

    const prog = await Store.progress();
    const bar = $("#progressMiniBar"), txt = $("#progressMiniText");
    if (bar) bar.innerHTML = "<i style='width:" + prog.pct + "%'></i>";
    if (txt) txt.textContent = prog.pct + "% complete (" + prog.done + "/" + prog.total + ")";
  }

  /* ------------------------------------------------------------------ search overlay */
  let searchTimer = null, searchResults = [], searchSel = -1;
  function openSearch(initial) {
    const ov = $("#searchOverlay");
    if (!ov) return;
    ov.classList.add("open");
    const input = $("#searchInput");
    if (input) {
      input.value = (typeof initial === "string") ? initial : "";
      input.focus();
    }
    runSearch();
  }
  function closeSearch() { const ov = $("#searchOverlay"); if (ov) ov.classList.remove("open"); }
  function runSearch() {
    const input = $("#searchInput");
    const q = input ? input.value.trim() : "";
    clearTimeout(searchTimer);
    searchTimer = setTimeout(async function () {
      searchResults = await Store.notes({ q: q, limit: 12, sort: "popular" });
      searchSel = -1;
      const box = $("#searchResults");
      if (!box) return;
      if (!searchResults.length) {
        box.innerHTML = '<div class="empty-state"><span class="big">🔍</span>No notes match “' + esc(q) + '”</div>';
        return;
      }
      box.innerHTML = searchResults.map(function (n) {
        return '<div class="sp-item" data-id="' + esc(n.id) + '">' +
               '<span class="tag" style="' + subjVars(n.color) + '">' + esc(n.subjectShort) + "</span>" +
               '<div><div class="t">' + esc(n.title) + "</div>" +
               '<div class="d">' + esc(unitLabel(n)) + " · " + esc(fmtDate(n.date)) + " · " + n.views + " views</div></div></div>";
      }).join("");
      box.querySelectorAll(".sp-item").forEach(function (el, i) {
        el.addEventListener("click", function () { goNote(searchResults[i].id); });
      });
    }, 140);
  }
  function pickSearch(delta) {
    const items = $$(".sp-item");
    if (!items.length) return;
    searchSel = (searchSel + delta + items.length) % items.length;
    items.forEach(function (el, i) { el.classList.toggle("active", i === searchSel); });
    items[searchSel].scrollIntoView({ block: "nearest" });
  }
  function submitSearch() {
    if (searchSel >= 0 && searchResults[searchSel]) { goNote(searchResults[searchSel].id); return; }
    if (searchResults.length) goNote(searchResults[0].id);
  }
  function goNote(id) { location.href = "note.html?id=" + encodeURIComponent(id); }

  /* ------------------------------------------------------------------ note cards */
  function noteCard(note) {
    const done = Store.isDone(note.id);
    const el = document.createElement("a");
    el.className = "note-card" + (done ? " is-done" : "");
    el.href = "note.html?id=" + encodeURIComponent(note.id);
    el.setAttribute("style", subjVars(note.color));
    const unit = unitLabel(note);
    el.innerHTML =
      '<span class="done-badge">✓</span>' +
      '<div class="note-card-top"><span class="tag">' + esc(note.subjectShort) + "</span>" +
      (unit !== "Formula sheet" ? '<span class="tag tag-solve">' + esc(unit) + "</span>" : "") + "</div>" +
      "<h3>" + esc(note.title) + "</h3>" +
      "<p>" + esc(note.description) + "</p>" +
      '<div class="note-card-foot">' +
      (note.date ? "<span>" + esc(fmtDate(note.date)) + "</span>" : "") +
      "<span>" + note.reading_min + " min</span>" +
      '<span class="views">👁 ' + note.views + "</span>" +
      '<span class="read-more">Read more →</span>' +
      "</div>";
    return el;
  }

  function renderGrid(containerId, notes) {
    const wrap = $("#" + containerId);
    if (!wrap) return;
    if (!notes || !notes.length) {
      wrap.innerHTML = '<div class="empty-state"><span class="big">📭</span>Nothing here yet.</div>';
      return;
    }
    wrap.innerHTML = "";
    notes.forEach(function (n) { wrap.appendChild(noteCard(n)); });
  }

  /* ------------------------------------------------------------------ index page */
  async function initIndex() {
    const all = await Store.notes({ limit: 500 });
    const subjects = await Store.subjects();
    const counts = {};
    all.forEach(function (n) { counts[n.subject] = (counts[n.subject] || 0) + 1; });

    /* hero chips */
    const chips = $("#heroChips");
    if (chips) {
      chips.innerHTML = subjects.map(function (s) {
        return '<button class="hero-chip" data-subject="' + esc(s.id) + '">' +
               s.icon + " " + esc(s.short) + " · " + (counts[s.id] || 0) + "</button>";
      }).join("");
      chips.querySelectorAll("[data-subject]").forEach(function (b) {
        b.addEventListener("click", function () {
          setBrowseFilter(b.getAttribute("data-subject"));
          $("#browseSection").scrollIntoView({ behavior: "smooth", block: "start" });
        });
      });
    }

    /* subject cards */
    const subjGrid = $("#subjectGrid");
    if (subjGrid) {
      subjGrid.innerHTML = "";
      subjects.forEach(function (s) {
        const card = document.createElement("div");
        card.className = "subject-card";
        card.setAttribute("style", subjVars(s.color));
        card.innerHTML =
          '<div class="subject-icon">' + s.icon + "</div>" +
          "<h3>" + esc(s.name) + "</h3>" +
          "<p>" + esc(s.blurb) + "</p>" +
          '<div class="meta-row"><span>' + (counts[s.id] || 0) + " notes</span><span class='go'>Explore →</span></div>";
        card.addEventListener("click", function () {
          setBrowseFilter(s.id);
          $("#browseSection").scrollIntoView({ behavior: "smooth", block: "start" });
        });
        subjGrid.appendChild(card);
      });
    }

    /* browse section */
    const browseState = { subject: null, q: "", sort: "recent" };
    function setBrowseFilter(subject) { browseState.subject = subject; renderBrowse(); }

    const chipRow = $("#browseChips");
    const sortSel = $("#browseSort");
    if (chipRow) {
      chipRow.innerHTML = "";
      const mk = function (label, val) {
        const b = document.createElement("button");
        b.className = "chip";
        b.textContent = label;
        b.addEventListener("click", function () { setBrowseFilter(val); });
        return b;
      };
      chipRow.appendChild(mk("All", null));
      subjects.forEach(function (s) {
        const b = mk(s.short, s.id);
        b.setAttribute("data-id", s.id);
        chipRow.appendChild(b);
      });
    }
    if (sortSel) sortSel.addEventListener("change", function () { browseState.sort = sortSel.value; renderBrowse(); });

    function renderBrowse() {
      let list = all.slice();
      if (browseState.subject) list = list.filter(function (n) { return n.subject === browseState.subject; });
      if (browseState.q) {
        const q = browseState.q.toLowerCase();
        list = list.filter(function (n) { return (n.title + " " + n.tags).toLowerCase().indexOf(q) !== -1; });
      }
      if (browseState.sort === "popular") list.sort(function (a, b) { return b.views - a.views; });
      else if (browseState.sort === "title") list.sort(function (a, b) { return a.title.localeCompare(b.title); });
      else list.sort(function (a, b) { return (a.date < b.date) ? 1 : (a.date > b.date ? -1 : 0); });

      const head = $("#browseTitle");
      if (head) {
        if (browseState.subject) {
          const s = subjects.find(function (x) { return x.id === browseState.subject; });
          head.textContent = s ? s.name : browseState.subject;
        } else head.textContent = "All notes";
      }
      const count = $("#browseCount");
      if (count) count.textContent = list.length + " note" + (list.length === 1 ? "" : "s");
      chipRow.querySelectorAll(".chip").forEach(function (b) {
        const bid = b.getAttribute("data-id");
        const active = bid === null ? browseState.subject === null : browseState.subject === bid;
        b.classList.toggle("active", active);
      });
      renderGrid("browseGrid", list);
    }
    renderBrowse();

    /* featured */
    renderGrid("featuredGrid", all.filter(function (n) { return n.featured; }).slice(0, 6));

    /* recently added */
    renderGrid("recentGrid", all.slice().sort(function (a, b) {
      return (a.date < b.date) ? 1 : (a.date > b.date ? -1 : 0);
    }).slice(0, 4));

    /* popular rail */
    const rail = $("#popularRail");
    if (rail) {
      const top = all.slice().sort(function (a, b) { return b.views - a.views; }).slice(0, 5);
      rail.innerHTML = top.map(function (n, i) {
        return '<a class="rail-item" href="note.html?id=' + encodeURIComponent(n.id) + '">' +
               '<span class="rank">' + (i + 1) + "</span>" +
               '<div><span class="rail-title">' + esc(n.title) + "</span>" +
               '<span class="rail-meta">' + esc(n.subjectShort) + " · " + esc(unitLabel(n)) + "</span></div></a>";
      }).join("");
    }

    /* library tabs */
    const tabBtns = $$(".tab-btn[data-panel]");
    tabBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        tabBtns.forEach(function (x) { x.classList.toggle("active", x === b); });
        $$(".tab-panel").forEach(function (p) { p.classList.toggle("active", p.id === b.getAttribute("data-panel")); });
      });
    });

    function orderByIds(ids) {
      return ids.map(function (id) { return all.find(function (x) { return x.id === id; }); })
                .filter(Boolean);
    }
    renderGrid("recentViewGrid", orderByIds(Store.recentList()));
    renderGrid("bookmarkGrid", orderByIds(Store.markList()));
    renderGrid("doneGrid", orderByIds(Store.doneList()));

    /* ?subject= deep link */
    const subj = new URLSearchParams(location.search).get("subject");
    if (subj) { browseState.subject = subj; renderBrowse(); }
  }

  /* ------------------------------------------------------------------ note page */
  async function initNote() {
    const id = new URLSearchParams(location.search).get("id");
    const body = $("#noteBody");
    if (!body) return;
    const note = await Store.note(id);

    if (!note) {
      body.innerHTML = '<div class="empty-state"><span class="big">🤔</span>Note not found.<br>' +
                       '<a href="index.html">← Back to home</a></div>';
      return;
    }

    document.title = note.title + " — StudyNotes";
    $("#noteTitle").textContent = note.title;
    const crumb = $("#noteCrumbTitle");
    if (crumb) crumb.textContent = note.title;
    const crumbTop = $("#noteCrumbTop");
    if (crumbTop) crumbTop.textContent = note.title;
    const subjectLink = $("#noteSubjectLink");
    if (subjectLink) subjectLink.innerHTML =
      '<a href="index.html?subject=' + encodeURIComponent(note.subject) + '">' + esc(note.subjectName) + "</a>";
    const tag = $("#noteTag");
    if (tag) { tag.textContent = note.subjectShort; tag.setAttribute("style", subjVars(note.color)); }
    const unit = $("#noteUnit");
    if (unit) unit.textContent = unitLabel(note);
    const date = $("#noteDate");
    if (date) date.textContent = fmtDate(note.date);
    const metaDesc = $("#noteMetaDesc");
    if (metaDesc) metaDesc.textContent = note.description;
    const reading = $("#noteReading");
    if (reading) reading.textContent = note.reading_min + " min read · " + note.words.toLocaleString() + " words";

    /* views + recent */
    await Store.addView(id);
    Store.touchRecent(id);
    const views = $("#noteViews");
    if (views) views.textContent = (note.views + 1).toLocaleString();

    /* body */
    body.innerHTML = note.body_html;
    highlightBlocks($("#noteBody"));

    /* TOC */
    const toc = $("#tocList");
    if (toc) {
      const heads = $$("#noteBody h2, #noteBody h3");
      const tocCol = $("#tocCol");
      if (!heads.length) { if (tocCol) tocCol.style.display = "none"; }
      else {
        const idMap = {};
        toc.innerHTML = heads.map(function (h, i) {
          idMap[h.id] = i;
          const level = h.tagName === "H3" ? "level-3" : "";
          return '<li class="' + level + '"><a href="#' + h.id + '" data-i="' + i + '">' +
                 esc(h.textContent.replace(/#\s*$/, "").trim()) + "</a></li>";
        }).join("");
        const links = $$("#tocList a");
        const spy = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting && idMap[en.target.id] !== undefined) {
              const idx = String(idMap[en.target.id]);
              links.forEach(function (l) {
                l.classList.toggle("active", l.getAttribute("data-i") === idx);
              });
            }
          });
        }, { rootMargin: "-15% 0px -75% 0px", threshold: 0 });
        heads.forEach(function (h) { spy.observe(h); });
        toc.addEventListener("click", function (e) {
          const a = e.target.closest("a");
          if (a) {
            e.preventDefault();
            const target = document.getElementById(a.getAttribute("href").slice(1));
            if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        });
      }
    }

    /* bookmarks & done */
    const markBtn = $("#markBtn"), doneBtn = $("#doneBtn");
    if (markBtn) {
      const refresh = function () { markBtn.classList.toggle("on", Store.isMarked(id)); };
      refresh();
      markBtn.addEventListener("click", function () {
        const on = Store.toggleMark(id);
        refresh();
        toast(on ? "Bookmarked ⭐" : "Bookmark removed");
      });
    }
    if (doneBtn) {
      const refreshDone = function () { doneBtn.classList.toggle("on", Store.isDone(id)); };
      refreshDone();
      doneBtn.addEventListener("click", function () {
        const on = Store.toggleDone(id);
        refreshDone();
        renderSidebar();
        toast(on ? "Marked complete 🎉" : "Marked incomplete");
      });
    }

    /* downloads */
    const dlHtml = $("#dlHtml"), dlMd = $("#dlMd"), copyBtn = $("#copyLink"), printBtn = $("#printBtn");
    if (dlHtml) dlHtml.addEventListener("click", function () {
      download(note.id + ".html", standaloneHtml(note), "text/html");
      toast("Downloaded HTML");
    });
    if (dlMd) dlMd.addEventListener("click", function () {
      const div = document.createElement("div");
      div.innerHTML = note.body_html;
      download(note.id + ".md", htmlToMd(div), "text/markdown");
      toast("Downloaded Markdown");
    });
    if (copyBtn) copyBtn.addEventListener("click", function () {
      const url = location.href;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () { toast("Link copied"); });
      } else { toast("Copy link: " + url); }
    });
    if (printBtn) printBtn.addEventListener("click", function () { window.print(); });

    /* pager */
    const all = await Store.notes({ limit: 500 });
    const subjectNotes = all.filter(function (n) { return n.subject === note.subject; })
                            .sort(function (a, b) { return (a.unit - b.unit) || (a.id > b.id ? 1 : -1); });
    const idx = subjectNotes.findIndex(function (x) { return x.id === id; });
    const prev = subjectNotes[idx - 1], next = subjectNotes[idx + 1];
    const prevBox = $("#prevNote"), nextBox = $("#nextNote");
    if (prevBox) {
      if (prev) {
        prevBox.href = "note.html?id=" + encodeURIComponent(prev.id);
        $(".dir", prevBox).textContent = "← Previous";
        $(".pg-title", prevBox).textContent = prev.title;
      } else prevBox.style.display = "none";
    }
    if (nextBox) {
      if (next) {
        nextBox.href = "note.html?id=" + encodeURIComponent(next.id);
        $(".dir", nextBox).textContent = "Next →";
        $(".pg-title", nextBox).textContent = next.title;
      } else nextBox.style.display = "none";
    }

    /* related */
    const related = $("#relatedGrid");
    if (related) {
      const rel = all.filter(function (n) { return n.subject === note.subject && n.id !== id; })
                     .sort(function (a, b) { return b.views - a.views; }).slice(0, 3);
      renderGrid("relatedGrid", rel);
    }

    /* reading progress bar */
    const pro = $("#progressTop");
    if (pro) {
      const onScroll = function () {
        const doc = document.documentElement;
        const max = doc.scrollHeight - window.innerHeight;
        const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
        pro.style.width = pct.toFixed(2) + "%";
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
  }

  /* ------------------------------------------------------------------ downloads */
  function download(name, content, mime) {
    const blob = new Blob([content], { type: mime + ";charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  const MINICSS =
    "body{max-width:780px;margin:2.4rem auto;padding:0 1.3rem;font-family:Georgia,'Times New Roman',serif;line-height:1.65;color:#1c2333;font-size:16px}" +
    "h1,h2,h3{line-height:1.3}h2{border-bottom:1.5px solid #dde3ef;padding-bottom:.35rem;margin-top:2.2rem}" +
    "a{color:#5b6cff}code{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.9em;background:#eef1f8;border-radius:4px;padding:.1em .35em}" +
    "pre{background:#0f1524;color:#dbe4f3;padding:1rem 1.1rem;border-radius:10px;overflow-x:auto;font-size:.9rem}" +
    "pre code{background:none;color:inherit;padding:0}" +
    "table{border-collapse:collapse;width:100%;margin:1.2rem 0}th,td{border:1px solid #dde3ef;padding:.5rem .75rem;text-align:left;font-size:.95rem}th{background:#f4f6fb}" +
    ".callout{border:1px solid #cbd5f5;border-left:4px solid #5b6cff;border-radius:10px;padding:.9rem 1.1rem;margin:1.2rem 0;background:#f6f8ff}" +
    ".callout-title{font-weight:700;margin:0 0 .35rem}.formula{text-align:center;background:#f0f3ff;border:1px dashed #5b6cff;border-left:4px solid #5b6cff;border-radius:10px;padding:1rem;margin:1.2rem 0}" +
    "mark.kw{background:#fde68a;padding:0 .15em}blockquote{border-left:4px solid #cbd5f5;margin:1.2rem 0;padding:.5rem 1rem;background:#f7f8fc}" +
    ".frac{display:inline-flex;flex-direction:column;vertical-align:middle;text-align:center;margin:0 .25em}.frac .num{border-bottom:1.5px solid currentColor;padding:0 .35em}.frac .den{padding:0 .35em}" +
    ".anchor{display:none}.code figcaption{display:none}";

  function standaloneHtml(note) {
    return "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\">" +
      "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">" +
      "<title>" + esc(note.title) + "</title><style>" + MINICSS + "</style></head><body>" +
      "<h1>" + esc(note.title) + "</h1>" +
      "<p><em>" + esc(note.subjectName) + " · " + esc(unitLabel(note)) + " · " + esc(fmtDate(note.date)) + "</em></p>" +
      note.body_html +
      "<hr><p style='color:#7a8499;font-size:.85rem'>Saved from StudyNotes</p>" +
      "</body></html>";
  }

  function textOf(el) { return (el.textContent || "").replace(/#\s*$/, "").trim(); }

  function htmlToMd(root) {
    const lines = [];
    function pushBlank() { if (lines.length && lines[lines.length - 1] !== "") lines.push(""); }
    function walk(node) {
      Array.prototype.forEach.call(node.childNodes, function (child) {
        if (child.nodeType === 3) {
          const t = child.textContent;
          if (t.trim()) lines.push(t.replace(/\s+/g, " ").trim());
          return;
        }
        if (child.nodeType !== 1) return;
        const tag = child.tagName.toLowerCase();
        if (tag === "h2") { pushBlank(); lines.push("## " + textOf(child)); pushBlank(); }
        else if (tag === "h3") { pushBlank(); lines.push("### " + textOf(child)); }
        else if (tag === "h4") { pushBlank(); lines.push("#### " + textOf(child)); }
        else if (tag === "p") { pushBlank(); walk(child); pushBlank(); }
        else if (tag === "ul" || tag === "ol") {
          $$(":scope > li", child).forEach(function (li) {
            lines.push("- " + li.textContent.replace(/\s+/g, " ").trim());
          });
          pushBlank();
        }
        else if (tag === "pre") { pushBlank(); lines.push("```"); lines.push(child.textContent.replace(/\s+$/, "")); lines.push("```"); pushBlank(); }
        else if (tag === "table") {
          pushBlank();
          $$("tr", child).forEach(function (tr) {
            const cells = $$("th, td", tr).map(function (c) { return c.textContent.trim().replace(/\|/g, "\\|"); });
            lines.push("| " + cells.join(" | ") + " |");
            if (tr.querySelector("th")) lines.push("| " + cells.map(function () { return "---"; }).join(" | ") + " |");
          });
          pushBlank();
        }
        else if (tag === "blockquote" || tag === "aside") {
          pushBlank(); lines.push("> " + child.textContent.replace(/\s+/g, " ").trim()); pushBlank();
        }
        else walk(child);
      });
    }
    walk(root);
    while (lines.length && lines[lines.length - 1] === "") lines.pop();
    return lines.join("\n");
  }

  /* ------------------------------------------------------------------ syntax highlighting */
  const HLRULES = {
    cpp: [
      [/\/\/[^\n]*|\/\*[\s\S]*?\*\//, "c-comment"],
      [/#\s*\w+/, "c-pre"],
      [/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/, "c-str"],
      [/\b(?:int|float|double|char|bool|void|long|short|unsigned|signed|const|class|struct|public|private|protected|if|else|for|while|do|switch|case|break|continue|return|new|delete|this|static|virtual|inline|namespace|using|template|typename|friend|operator|try|catch|throw|true|false|nullptr|enum|typedef|sizeof|string|vector|include)\b/, "c-kw"],
      [/\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?[uUlL]*\b/, "c-num"],
    ],
    python: [
      [/#.*/, "c-comment"],
      [/"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/, "c-str"],
      [/\b(?:def|class|return|if|elif|else|for|while|in|not|and|or|is|None|True|False|import|from|as|with|lambda|pass|break|continue|try|except|finally|raise|global|nonlocal|del|yield|assert)\b/, "c-kw"],
      [/\b(?:print|len|range|type|int|float|str|input|list|dict|set|tuple|abs|min|max|sum|round|sorted|enumerate|zip|open|isinstance)\b/, "c-blt"],
      [/\b\d+(?:\.\d+)?[jJ]?\b/, "c-num"],
    ],
    sql: [
      [/--[^\n]*/, "c-comment"],
      [/\b(?:SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|CREATE|TABLE|INDEX|PRIMARY|KEY|VALUES|INTO|SET|AND|OR|NOT|NULL|INTEGER|TEXT|REFERENCES|DEFAULT|JOIN|ON)\b/i, "c-kw"],
    ],
  };

  function hlEscape(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function highlightCode(lang, code) {
    const rules = HLRULES[lang];
    if (!rules || !rules.length) return hlEscape(code);
    // Wrap every rule in a capturing group so m[k+1] identifies which rule
    // matched. (Our rule sources only use non-capturing (?:...) groups, so the
    // group indices line up 1:1 with the rules array.)
    const re = new RegExp(rules.map(function (r) { return "(" + r[0].source + ")"; }).join("|"), "gm");
    let out = "", last = 0, m, guard = 0;
    while ((m = re.exec(code)) && guard++ < 50000) {
      out += hlEscape(code.slice(last, m.index));
      let cls = "c-num";
      for (let k = 0; k < rules.length; k++) {
        if (m[k + 1] !== undefined) { cls = rules[k][1]; break; }
      }
      out += '<span class="' + cls + '">' + hlEscape(m[0]) + "</span>";
      last = m.index + m[0].length;
      if (m[0].length === 0) re.lastIndex++;
    }
    out += hlEscape(code.slice(last));
    return out;
  }

  function highlightBlocks(root) {
    $$("pre code[class*=language-]", root).forEach(function (cb) {
      const m = cb.className.match(/language-([\w-]+)/);
      const lang = m ? m[1] : "";
      if (HLRULES[lang]) cb.innerHTML = highlightCode(lang, cb.textContent);
    });
  }

  /* ------------------------------------------------------------------ global bindings */
  function bindGlobals() {
    const themeBtn = $("#themeToggle");
    if (themeBtn) themeBtn.addEventListener("click", function () {
      const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      toast("Theme: " + (next === "dark" ? "dark 🌙" : "light ☀️"));
    });

    const burger = $("#openSidebar"), closeBtn = $("#closeSidebar"), scrim = $("#scrim");
    const openSide = function () {
      const sb = $("#sidebar"); if (sb) sb.classList.add("open");
      if (scrim) scrim.classList.add("show");
    };
    const closeSide = function () {
      const sb = $("#sidebar"); if (sb) sb.classList.remove("open");
      if (scrim) scrim.classList.remove("show");
    };
    if (burger) burger.addEventListener("click", openSide);
    if (closeBtn) closeBtn.addEventListener("click", closeSide);
    if (scrim) scrim.addEventListener("click", closeSide);

    /* copy buttons (delegated) */
    document.addEventListener("click", function (e) {
      const btn = e.target.closest(".code-copy");
      if (!btn) return;
      const fig = btn.closest("figure");
      const pre = fig && fig.querySelector("pre code");
      if (!pre) return;
      const text = pre.textContent;
      const done = function () {
        btn.classList.add("copied");
        btn.textContent = "Copied!";
        setTimeout(function () { btn.classList.remove("copied"); btn.textContent = "Copy"; }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done);
      } else {
        try {
          const ta = document.createElement("textarea");
          ta.value = text; document.body.appendChild(ta);
          ta.select(); document.execCommand("copy");
          document.body.removeChild(ta); done();
        } catch (err) {}
      }
    });

    /* search overlay */
    const searchBtn = $("#searchBtn");
    if (searchBtn) searchBtn.addEventListener("click", function () { openSearch(""); });
    const heroSearch = $("#heroSearch");
    if (heroSearch) heroSearch.addEventListener("keydown", function (e) {
      if (e.key === "Enter") openSearch(heroSearch.value.trim());
    });
    const heroSearchBtn = $("#heroSearchBtn");
    if (heroSearchBtn) heroSearchBtn.addEventListener("click", function () {
      openSearch(($("#heroSearch") || {}).value || "");
    });
    // The always-visible topbar search box launches the live search overlay.
    // (On note pages it is the only search affordance.)
    const topSearch = $(".topbar-search input");
    if (topSearch) {
      const launchTop = function () { openSearch(topSearch.value); };
      topSearch.addEventListener("focus", launchTop);
      topSearch.addEventListener("click", launchTop);
      topSearch.addEventListener("input", launchTop);
      topSearch.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); launchTop(); }
      });
    }
    const searchInput = $("#searchInput");
    if (searchInput) searchInput.addEventListener("input", runSearch);
    if (searchInput) searchInput.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeSearch();
      else if (e.key === "ArrowDown") { e.preventDefault(); pickSearch(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); pickSearch(-1); }
      else if (e.key === "Enter") { e.preventDefault(); submitSearch(); }
    });
    const overlay = $("#searchOverlay");
    if (overlay) overlay.addEventListener("click", function (e) { if (e.target === overlay) closeSearch(); });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeSearch();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openSearch(""); }
      if (e.key === "/" && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
        e.preventDefault(); openSearch("");
      }
    });
  }

  /* ========================================================================== main */
  async function main() {
    // Apply the saved theme and attach UI listeners immediately so that
    // search, the theme toggle, the sidebar and keyboard shortcuts work
    // right away — Store.init() fetches the WASM + SQLite file and can take
    // a few seconds on a cold load. Search falls back to the embedded dataset
    // until the DB is ready, then switches to SQL automatically.
    applyTheme(currentTheme());
    bindGlobals();
    await Store.init();
    renderSidebar();
    if ($("#indexRoot")) await initIndex();
    if ($("#noteRoot")) await initNote();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", main);
  else main();

  window.StudyNotes = { Store: Store, fmtDate: fmtDate, unitLabel: unitLabel, esc: esc };
})();