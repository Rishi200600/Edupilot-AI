"""Train the synthetic-data difficulty regressor and save its state dict."""
import csv
import random
from pathlib import Path
import torch
from torch import nn
from torch.utils.data import DataLoader, TensorDataset
try:
    from .model import DifficultyModel
except ImportError:
    from model import DifficultyModel

ROOT = Path(__file__).resolve().parent

def generate_dataset(path: Path, count: int = 1200, seed: int = 42) -> None:
    rng = random.Random(seed)
    rows = []
    for _ in range(count):
        hours, experience, complexity, duration = rng.uniform(1, 40) / 40, rng.random(), rng.random(), rng.randint(1, 52) / 52
        target = max(0.05, min(0.98, 0.15 + 0.20 * max(0, 1 - hours * 2) + 0.24 * (1 - experience) + 0.38 * complexity + 0.12 * max(0, 1 - duration * 12) + rng.gauss(0, 0.025)))
        rows.append((hours, experience, complexity, duration, target))
    with path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(["hours_per_week_normalized", "prior_experience", "goal_complexity", "duration_weeks_normalized", "difficulty_score"])
        writer.writerows([[round(value, 6) for value in row] for row in rows])

def train() -> None:
    dataset_path = ROOT / "dataset.csv"
    if not dataset_path.exists() or sum(1 for _ in dataset_path.open(encoding="utf-8")) < 201:
        generate_dataset(dataset_path)
    with dataset_path.open(encoding="utf-8") as file:
        rows = list(csv.reader(file))[1:]
    data = torch.tensor([[float(v) for v in row] for row in rows], dtype=torch.float32)
    loader = DataLoader(TensorDataset(data[:, :4], data[:, 4:]), batch_size=64, shuffle=True)
    torch.manual_seed(42)
    model = DifficultyModel()
    optimizer, loss_fn = torch.optim.AdamW(model.parameters(), lr=0.004, weight_decay=0.0005), nn.MSELoss()
    for _ in range(100):
        for features, labels in loader:
            optimizer.zero_grad()
            loss = loss_fn(model(features), labels)
            loss.backward()
            optimizer.step()
    torch.save(model.state_dict(), ROOT / "model.pth")
    print(f"Trained on {len(data)} examples. Saved {ROOT / 'model.pth'}")

if __name__ == "__main__":
    train()
