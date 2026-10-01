"""Loads the trained difficulty model when available, with a deterministic fallback."""
from pathlib import Path
import sys
import torch

ML_DIR = Path(__file__).resolve().parents[2] / "ml_model"
if str(ML_DIR) not in sys.path:
    sys.path.insert(0, str(ML_DIR))
try:
    from model import DifficultyModel
except ImportError:
    DifficultyModel = None

_MODEL = None

def _load_model():
    global _MODEL
    if _MODEL is None and DifficultyModel and (ML_DIR / "model.pth").exists():
        model = DifficultyModel()
        model.load_state_dict(torch.load(ML_DIR / "model.pth", map_location="cpu", weights_only=True))
        model.eval()
        _MODEL = model
    return _MODEL

def _features(hours_per_week: float, prior_experience: float, goal_complexity: float, duration_weeks: int) -> torch.Tensor:
    return torch.tensor([[hours_per_week / 40, prior_experience, goal_complexity, min(duration_weeks, 52) / 52]], dtype=torch.float32)

def _fallback(hours: float, experience: float, complexity: float, weeks: int) -> float:
    return 0.15 + 0.38 * complexity + 0.24 * (1 - experience) + 0.20 * max(0, 1 - min(hours, 40) / 20) + 0.12 * max(0, 1 - min(weeks, 52) / 12)

def _explain(score: float, hours: float, experience: float) -> str:
    parts = []
    if hours < 5: parts.append("a lighter weekly time budget")
    if experience < 0.35: parts.append("limited prior experience")
    if score >= 0.68:
        return "This plan looks intensive; consider adding time or reducing scope. " + ("Contributing factors: " + " and ".join(parts) + "." if parts else "")
    if score >= 0.34:
        return "A steady pace should be manageable with regular practice. " + ("Pay attention to " + " and ".join(parts) + "." if parts else "")
    return "The requested pace appears relatively gentle for this goal."

def predict_difficulty(hours_per_week: float, prior_experience: float, goal_complexity: float, duration_weeks: int) -> dict:
    path = ML_DIR / "model.pth"
    source = "trained PyTorch model"
    try:
        if not DifficultyModel or not path.exists(): raise OSError("model artifact not found")
        model = _load_model()
        with torch.no_grad():
            value = float(model(_features(hours_per_week, prior_experience, goal_complexity, duration_weeks)).item())
    except (RuntimeError, OSError, ValueError):
        value = _fallback(hours_per_week, prior_experience, goal_complexity, duration_weeks)
        source = "rule-based fallback"
    value = max(0.05, min(0.98, value))
    label = "Gentle" if value < 0.34 else "Steady" if value < 0.68 else "Intensive"
    return {"difficulty_score": round(value, 3), "difficulty": label, "explanation": _explain(value, hours_per_week, prior_experience), "model_source": source}
