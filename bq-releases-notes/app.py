"""Flask application that fetches and serves BigQuery release notes."""

import xml.etree.ElementTree as ET

import requests
from flask import Flask, jsonify, render_template

app = Flask(__name__)

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"
ATOM_NS = "{http://www.w3.org/2005/Atom}"


def fetch_release_notes():
    """Fetch and parse the BigQuery Atom release-notes feed."""
    resp = requests.get(FEED_URL, timeout=30)
    resp.raise_for_status()

    root = ET.fromstring(resp.content)
    entries = []

    for entry in root.findall(f"{ATOM_NS}entry"):
        title = entry.findtext(f"{ATOM_NS}title", "")
        updated = entry.findtext(f"{ATOM_NS}updated", "")
        link_el = entry.find(f"{ATOM_NS}link[@rel='alternate']")
        link = link_el.get("href", "") if link_el is not None else ""
        content = entry.findtext(f"{ATOM_NS}content", "")

        entries.append(
            {
                "title": title,
                "updated": updated,
                "link": link,
                "content": content,
            }
        )

    return entries


@app.route("/")
def index():
    """Serve the main page."""
    return render_template("index.html")


@app.route("/api/notes")
def api_notes():
    """Return release notes as JSON."""
    try:
        notes = fetch_release_notes()
        return jsonify({"ok": True, "notes": notes})
    except Exception as exc:
        return jsonify({"ok": False, "error": str(exc)}), 502


if __name__ == "__main__":
    app.run(debug=True, port=5000)
