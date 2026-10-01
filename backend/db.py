"""Tiny SQLite persistence layer for roadmap and task progress."""
import json
import sqlite3
from pathlib import Path
from typing import Any

DB_PATH = Path(__file__).resolve().parent / "edupilot.db"

def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def initialize() -> None:
    with _connect() as db:
        db.execute("CREATE TABLE IF NOT EXISTS roadmaps (id TEXT PRIMARY KEY, goal TEXT NOT NULL, roadmap_json TEXT NOT NULL, created_at TEXT DEFAULT CURRENT_TIMESTAMP)")
        db.execute("CREATE TABLE IF NOT EXISTS task_progress (roadmap_id TEXT NOT NULL, task_id TEXT NOT NULL, completed INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (roadmap_id, task_id))")

def save_roadmap(roadmap: dict[str, Any]) -> None:
    with _connect() as db:
        db.execute("INSERT OR REPLACE INTO roadmaps (id, goal, roadmap_json) VALUES (?, ?, ?)", (roadmap["id"], roadmap["goal"], json.dumps(roadmap)))
        for week in roadmap["weeks"]:
            for day in week["days"]:
                db.execute("INSERT OR IGNORE INTO task_progress (roadmap_id, task_id, completed) VALUES (?, ?, 0)", (roadmap["id"], day["id"]))

def list_roadmaps() -> list[dict[str, Any]]:
    with _connect() as db:
        return [json.loads(row["roadmap_json"]) for row in db.execute("SELECT roadmap_json FROM roadmaps ORDER BY created_at DESC LIMIT 20").fetchall()]

def get_progress(roadmap_id: str) -> dict[str, bool] | None:
    with _connect() as db:
        if not db.execute("SELECT 1 FROM roadmaps WHERE id = ?", (roadmap_id,)).fetchone():
            return None
        rows = db.execute("SELECT task_id, completed FROM task_progress WHERE roadmap_id = ?", (roadmap_id,)).fetchall()
        return {row["task_id"]: bool(row["completed"]) for row in rows}

def set_task(roadmap_id: str, task_id: str, completed: bool) -> bool:
    with _connect() as db:
        cursor = db.execute("UPDATE task_progress SET completed = ? WHERE roadmap_id = ? AND task_id = ?", (int(completed), roadmap_id, task_id))
        return cursor.rowcount > 0
