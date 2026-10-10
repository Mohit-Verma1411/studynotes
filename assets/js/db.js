/* ==========================================================================
 * db.js — data layer for StudyNotes.
 *
 * Two modes:
 *   1. "sql"    : real SQLite via sql.js (WASM) reading data/notes.db.
 *                 Used automatically when the page is served over HTTP.
 *   2. "fallback": the embedded window.NOTES_DATA dataset, used when the
 *                 page is opened directly from the file system (file://),
 *                 where fetching the .wasm/.db is blocked by the browser.
 *
 * Every query method returns plain objects and the rest of the app never
 * needs to know which mode is active.
 * ========================================================================== */
(function () {
  "use strict";

  const LS_VIEWS = "sn:views";    // per-note view deltas (localStorage)
  const LS_MARKS = "sn:marks";    // bookmarked note ids
  const LS_RECENT = "sn:recent";  // recently viewed note ids
  const LS_DONE = "sn:done";      // completed note ids

  let mode = "fallback";
  let db = null;                  // sql.js Database (sql mode)

  /* ----------------------------------------------------------------- read/write helpers */
  function readLS(key) {
    try { return JSON.parse(localStorage.getItem(key) || "null") || null; } catch (e) { return null; }
  }
  function writeLS(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* private mode */ }
  }

  function getViews() { return readLS(LS_VIEWS) || {}; }
  function setViews(v) { writeLS(LS_VIEWS, v); }
  function getMarks() { return Array.isArray(readLS(LS_MARKS)) ? readLS(LS_MARKS) : []; }
  function setMarks(a) { writeLS(LS_MARKS, a); }
  function getRecent() { return Array.isArray(readLS(LS_RECENT)) ? readLS(LS_RECENT) : []; }
  function setRecent(a) { writeLS(LS_RECENT, a); }
  function getDone() { return Array.isArray(readLS(LS_DONE)) ? readLS(LS_DONE) : []; }
  function setDone(a) { writeLS(LS_DONE, a); }

  /* ----------------------------------------------------------------- normalization helpers */
  function n(v) { return v == null ? 0 : v; }

  function normalizeSubjects() {
    if (mode === "sql") {
      const r = db.exec("SELECT id,name,short,icon,color,blurb,sort FROM subjects ORDER BY sort");
      if (!r.length) return [];
      return r[0].values.map(function (row) {
        return { id: row[0], name: row[1], short: row[2], icon: row[3], color: row[4],
                 blurb: row[5], sort: row[6] };
      });
    }
    return (window.NOTES_DATA.subjects || []).slice();
  }

  function normalizeNote(row) {
    // sql row order: n.id,n.title,n.subject,n.unit,n.description,n.tags,n.date,
    //                n.featured,n.views,n.words,n.reading_min,s.name,s.short,s.color,s.icon
    const localViews = getViews()[row[0]] || 0;
    return {
      id: row[0], title: row[1], subject: row[2], unit: n(row[3]),
      description: row[4] || "", tags: row[5] || "", date: row[6] || "",
      featured: n(row[7]) === 1, views: n(row[8]) + localViews,
      words: n(row[9]), reading_min: n(row[10]),
      subjectName: row[11] || row[2], subjectShort: row[12] || row[2],
      color: row[13] || "#5b6cff", icon: row[14] || "📄",
    };
  }

  function normalizeFb(note) {
    const localViews = getViews()[note.id] || 0;
    const sub = (window.NOTES_DATA.subjects || []).find(function (s) { return s.id === note.subject; }) || {};
    return {
      id: note.id, title: note.title, subject: note.subject, unit: n(note.unit),
      description: note.description || "", tags: note.tags || "", date: note.date || "",
      featured: !!note.featured, views: n(note.views) + localViews,
      words: n(note.words), reading_min: n(note.reading_min),
      subjectName: sub.name || note.subject, subjectShort: sub.short || note.subject,
      color: sub.color || "#5b6cff", icon: sub.icon || "📄",
      body_html: note.body_html || "",
    };
  }

  /* ----------------------------------------------------------------- public API */
  const Store = {
    /** Initialise. Returns a promise resolving to the active mode. */
    async init() {
      try {
        if (!window.initSqlJs) throw new Error("sql.js script not loaded");
        // Escape hatch: append ?fallback to any URL to force the embedded
        // dataset (useful for testing, or on browsers that block WASM).
        if (/[?&]fallback\b/.test(location.search)) throw new Error("fallback requested via ?fallback");
        const SQL = await initSqlJs({ locateFile: function (file) { return "assets/js/vendor/" + file; } });
        const res = await fetch("data/notes.db");
        if (!res.ok) throw new Error("notes.db fetch status " + res.status);
        const bytes = new Uint8Array(await res.arrayBuffer());
        db = new SQL.Database(bytes);
        mode = "sql";
        // Fold persisted view deltas into the in-memory DB so the "popular"
        // ORDER BY views is authoritative across reloads.
        const deltas = getViews();
        const stmt = db.prepare("UPDATE notes SET views = views + ? WHERE id = ?");
        Object.keys(deltas).forEach(function (id) {
          const d = deltas[id];
          if (d > 0) { stmt.run([d, id]); }
        });
        stmt.free();
      } catch (err) {
        console.warn("[StudyNotes] Falling back to embedded dataset:", err);
        mode = "fallback";
      }
      return mode;
    },

    mode() { return mode; },

    async subjects() { return normalizeSubjects(); },

    /** List notes with filters.
     *  opts: { subject, q, sort: "recent"|"popular"|"title", limit, ids: [] }
     */
    async notes(opts) {
      opts = opts || {};
      if (mode === "sql") {
        let sql = "SELECT n.id,n.title,n.subject,n.unit,n.description,n.tags,n.date," +
                  "n.featured,n.views,n.words,n.reading_min," +
                  "s.name,s.short,s.color,s.icon FROM notes n " +
                  "JOIN subjects s ON s.id = n.subject WHERE 1=1";
        const params = [];
        if (opts.subject) { sql += " AND n.subject = ?"; params.push(opts.subject); }
        if (opts.q) {
          const like = "%" + opts.q + "%";
          sql += " AND (n.title LIKE ? OR n.description LIKE ? OR n.tags LIKE ? OR n.body_html LIKE ?)";
          params.push(like, like, like, like);
        }
        if (Array.isArray(opts.ids) && opts.ids.length) {
          sql += " AND n.id IN (" + opts.ids.map(function () { return "?"; }).join(",") + ")";
          params.push.apply(params, opts.ids);
        }
        if (opts.sort === "title") sql += " ORDER BY n.title";
        else if (opts.sort === "popular") sql += " ORDER BY n.views DESC, n.date DESC";
        else sql += " ORDER BY n.date DESC, n.unit DESC";
        if (opts.limit) sql += " LIMIT " + parseInt(opts.limit, 10);
        const r = db.exec(sql, params);
        if (!r.length) return [];
        return r[0].values.map(normalizeNote);
      }
      // fallback
      let list = (window.NOTES_DATA.notes || []).map(normalizeFb);
      if (opts.subject) list = list.filter(function (x) { return x.subject === opts.subject; });
      if (opts.q) {
        const q = opts.q.toLowerCase();
        list = list.filter(function (x) {
          return (x.title + " " + x.description + " " + x.tags).toLowerCase().indexOf(q) !== -1;
        });
      }
      if (Array.isArray(opts.ids) && opts.ids.length) {
        const set = {};
        opts.ids.forEach(function (i) { set[i] = true; });
        list = list.filter(function (x) { return set[x.id]; });
      }
      const sorters = {
        title: function (a, b) { return a.title.localeCompare(b.title); },
        popular: function (a, b) { return (b.views - a.views) || (b.date > a.date ? 1 : -1); },
      };
      if (sorters[opts.sort]) list = list.slice().sort(sorters[opts.sort]);
      else list = list.slice().sort(function (a, b) { return (b.date > a.date ? 1 : -1); });
      if (opts.limit) list = list.slice(0, parseInt(opts.limit, 10));
      return list;
    },

    async note(id) {
      if (!id) return null;
      if (mode === "sql") {
        const r = db.exec(
          "SELECT n.id,n.title,n.subject,n.unit,n.description,n.tags,n.date," +
          "n.featured,n.views,n.words,n.reading_min,s.name,s.short,s.color,s.icon " +
          "FROM notes n JOIN subjects s ON s.id = n.subject WHERE n.id = ?", [id]);
        if (!r.length || !r[0].values.length) return null;
        const row = r[0].values[0];
        const note = normalizeNote(row);
        const body = db.exec("SELECT body_html FROM notes WHERE id = ?", [id]);
        note.body_html = body.length && body[0].values.length ? body[0].values[0][0] : "";
        return note;
      }
      const found = (window.NOTES_DATA.notes || []).find(function (x) { return x.id === id; });
      return found ? normalizeFb(found) : null;
    },

    /** Increment the view counter (sql mode updates the DB; always persists a delta). */
    async addView(id) {
      const v = getViews();
      v[id] = (v[id] || 0) + 1;
      setViews(v);
      if (mode === "sql" && db && id) {
        try { db.run("UPDATE notes SET views = views + 1 WHERE id = ?", [id]); } catch (e) { /* noop */ }
      }
    },

    /* ------------------------------------------------ bookmarks */
    isMarked(id) { return getMarks().indexOf(id) !== -1; },
    toggleMark(id) {
      let m = getMarks();
      const i = m.indexOf(id);
      if (i === -1) m.push(id); else m.splice(i, 1);
      setMarks(m);
      return m.indexOf(id) !== -1;
    },

    /* ------------------------------------------------ recently viewed */
    touchRecent(id) {
      let r = getRecent();
      r = r.filter(function (x) { return x !== id; });
      r.unshift(id);
      setRecent(r.slice(0, 8));
    },
    recentList() { return getRecent(); },
    markList() { return getMarks(); },

    /* ------------------------------------------------ completed / progress */
    isDone(id) { return getDone().indexOf(id) !== -1; },
    toggleDone(id) {
      let d = getDone();
      const i = d.indexOf(id);
      if (i === -1) d.push(id); else d.splice(i, 1);
      setDone(d);
      return d.indexOf(id) !== -1;
    },
    doneList() { return getDone(); },
    async progress() {
      const all = await this.notes({ limit: 500 });
      const done = getDone();
      const n = all.length;
      if (!n) return { done: 0, total: 0, pct: 0 };
      const completed = all.filter(function (x) { return done.indexOf(x.id) !== -1; }).length;
      return { done: completed, total: n, pct: Math.round((completed / n) * 100) };
    },
  };

  window.Store = Store;
})();