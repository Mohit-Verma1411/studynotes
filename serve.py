#!/usr/bin/env python3
"""Simple static server for StudyNotes (use with the real SQLite mode).

Why: opening index.html directly via file:// works (the app falls back to the
embedded dataset), but the browser blocks fetching the SQLite .db and the
sql.js .wasm file under file://. Serving over HTTP unlocks the genuine
SQLite mode (real SQL queries in the browser via sql.js).

    python3 serve.py [port]
"""
import http.server
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000

MIME = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".db": "application/octet-stream",
    ".wasm": "application/wasm",
    ".md": "text/markdown; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".ico": "image/x-icon",
}


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        # sql.js is same-origin, so no COOP/COEP/CORP headers are needed;
        # keeping the response headers minimal maximises browser compatibility.
        super().end_headers()

    def guess_type(self, path):
        ext = Path(path).suffix.lower()
        return MIME.get(ext, "application/octet-stream")


if __name__ == "__main__":
    with http.server.ThreadingHTTPServer(("", PORT), Handler) as httpd:
        print(f"StudyNotes running at  http://localhost:{PORT}   (Ctrl+C to stop)")
        print(f"Serving: {ROOT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopped.")