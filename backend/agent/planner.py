"""Multi-step roadmap agent: parse goal, retrieve resources, plan, assess, persist."""
import json
import os
import re
import uuid
from datetime import date, timedelta
from typing import Any
import requests

from backend.models.predictor import predict_difficulty
from backend.rag.retriever import retrieve
from backend import db

def parse_goal(text: str, level: str | None, hours: float | None, duration: int | None) -> dict[str, Any]:
    normalized = text.strip()
    match = re.search(r"\b(\d{1,2})\s*(day|week|month)s?\b", normalized.lower())
    inferred = int(match.group(1)) * (4 if match.group(2) == "month" else 1) if match else 8
    weeks = max(1, min(24, duration or inferred))
    clean_goal = re.sub(r"\s*(in|within|over)\s+\d{1,2}\s*(days?|weeks?|months?).*", "", normalized, flags=re.I).strip(" .") or normalized
    return {"goal": clean_goal[:120], "duration_weeks": weeks, "level": level or "beginner", "hours_per_week": hours if hours is not None else 7.0}

def _llm_outline(goal: str, weeks: int, level: str, resources: list[dict]) -> list[str] | None:
    token = os.getenv("HF_TOKEN")
    if not token: return None
    model = os.getenv("HF_MODEL", "mistralai/Mistral-7B-Instruct-v0.3")
    prompt = ("Create a concise learning sequence for the goal below. Return valid JSON only with "
              'the shape {"weekly_focus":["one focus per week"]}. Return exactly N strings and avoid '
              f"claiming guaranteed outcomes. N={weeks}, level={level}, goal={goal}, "
              f"retrieved resources={[r['title'] for r in resources]}")
    try:
        response = requests.post("https://router.huggingface.co/v1/chat/completions",
                                 headers={"Authorization": f"Bearer {token}"},
                                 json={"model": model, "messages": [
                                     {"role": "system", "content": "You design practical learning plans. Return only the requested JSON object."},
                                     {"role": "user", "content": prompt},
                                 ], "max_tokens": min(900, 100 + weeks * 90), "temperature": 0.4},
                                 timeout=45)
        response.raise_for_status()
        payload = response.json()
        generated = payload["choices"][0]["message"]["content"]
        match = re.search(r"\{.*\}", generated, re.S)
        if match:
            focuses = json.loads(match.group()).get("weekly_focus", [])
            if len(focuses) >= weeks and all(isinstance(item, str) for item in focuses[:weeks]): return focuses[:weeks]
    except (requests.RequestException, ValueError, TypeError, KeyError):
        return None
    return None

def _default_focus(goal: str, week: int, count: int) -> str:
    stages = ["Set up foundations and a focused study environment", "Learn core concepts through guided examples", "Practice essential techniques with small exercises", "Build a small project that combines the fundamentals", "Study intermediate methods and compare approaches", "Complete a realistic end-to-end project", "Review weak spots and improve your project", "Present your work and plan the next learning step"]
    if count == 1: return f"Survey {goal}, learn one core concept, and complete a small practice exercise"
    return stages[min(7, int((week - 1) * 8 / count))] + f" for {goal}"

def generate_roadmap(text: str, level: str | None = None, hours_per_week: float | None = None, duration_weeks: int | None = None) -> dict[str, Any]:
    parsed = parse_goal(text, level, hours_per_week, duration_weeks)
    resources = retrieve(parsed["goal"], limit=3)
    focuses = _llm_outline(parsed["goal"], parsed["duration_weeks"], parsed["level"], resources)
    weeks = []
    today = date.today()
    for index in range(parsed["duration_weeks"]):
        focus = focuses[index] if focuses else _default_focus(parsed["goal"], index + 1, parsed["duration_weeks"])
        days = []
        for day_index in range(7):
            label = ["Learn", "Practice", "Reflect"][day_index % 3]
            title = f"{label}: {focus.lower()}" if day_index % 3 != 1 else f"{label}: apply {focus.lower()} with a short exercise"
            days.append({"id": f"w{index + 1}d{day_index + 1}", "date": (today + timedelta(days=index * 7 + day_index)).isoformat(), "title": title, "minutes": 35 if day_index < 5 else 50, "completed": False})
        weeks.append({"week": index + 1, "focus": focus, "days": days})
    complexity = min(1.0, 0.3 + len(parsed["goal"].split()) * 0.035 + (0.15 if any(term in parsed["goal"].lower() for term in ("machine learning", "deep learning", "advanced", "full stack")) else 0))
    difficulty = predict_difficulty(parsed["hours_per_week"], {"beginner": .15, "intermediate": .5, "advanced": .8}.get(parsed["level"], .15), complexity, parsed["duration_weeks"])
    roadmap = {"id": str(uuid.uuid4()), **parsed, "weeks": weeks, "resources": resources, "prediction": difficulty, "agent_steps": ["Parsed learning goal and schedule", "Retrieved relevant learning resources", "Generated weekly and daily plan", "Estimated plan difficulty"], "created_at": today.isoformat(), "llm_used": bool(focuses)}
    db.save_roadmap(roadmap)
    return roadmap
