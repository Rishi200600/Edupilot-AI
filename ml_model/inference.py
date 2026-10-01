"""Standalone inference example for the trained difficulty model."""
from pathlib import Path
import torch
try:
    from .model import DifficultyModel
except ImportError:
    from model import DifficultyModel

def predict(hours_per_week: float, prior_experience: float, goal_complexity: float, duration_weeks: int) -> float:
    model = DifficultyModel()
    model.load_state_dict(torch.load(Path(__file__).resolve().parent / "model.pth", map_location="cpu", weights_only=True))
    model.eval()
    values = torch.tensor([[hours_per_week / 40, prior_experience, goal_complexity, min(duration_weeks, 52) / 52]], dtype=torch.float32)
    with torch.no_grad(): return float(model(values).item())

if __name__ == "__main__": print(f"Predicted difficulty: {predict(7, 0.15, 0.7, 8):.3f}")
