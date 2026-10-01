"""Transparent keyword retriever over the curated resource catalog."""
import json
import re
from pathlib import Path
from typing import Any

RESOURCE_FILE = Path(__file__).resolve().parents[2] / "data" / "resources.json"
STOP_WORDS = {"the", "and", "for", "with", "from", "want", "learn", "learning", "make", "build", "into", "about", "how", "what", "days", "weeks", "months"}

def _tokens(text: str) -> set[str]:
    return {word for word in re.findall(r"[a-z0-9+#]+", text.lower()) if len(word) > 1 and word not in STOP_WORDS}

def retrieve(query: str, limit: int = 3) -> list[dict[str, Any]]:
    with RESOURCE_FILE.open(encoding="utf-8") as file:
        resources = json.load(file)
    terms = _tokens(query)
    ranked = []
    for item in resources:
        title, topic, description = (_tokens(item[field]) for field in ("title", "topic", "description"))
        score = len(terms & title) * 4 + len(terms & topic) * 2 + len(terms & description)
        if score:
            ranked.append((score, item))
    ranked.sort(key=lambda row: (-row[0], row[1]["title"]))
    return [item for _, item in ranked[:limit]]
